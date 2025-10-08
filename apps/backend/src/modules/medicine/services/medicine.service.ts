import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { RedisService } from '../../redis/redis.service';
import {
  CreateMedicineDto,
  UpdateMedicineDto,
  FilterMedicinesDto,
  MedicineSortBy,
  UpdateStockDto,
  UpdatePriceDto,
  BulkUpdateStockDto,
  PaginatedMedicinesResponseDto,
  MedicineResponseDto,
} from '../dto/medicine.dto';

@Injectable()
export class MedicineService {
  private readonly logger = new Logger(MedicineService.name);
  private readonly CACHE_TTL = 3600; // 1 hour
  private readonly CACHE_PREFIX = 'medicine:';

  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {}

  /**
   * Create a new medicine
   */
  async create(
    createMedicineDto: CreateMedicineDto,
    createdBy?: string,
  ): Promise<MedicineResponseDto> {
    this.logger.log(`Creating medicine: ${createMedicineDto.name}`);

    // Generate slug from name
    const slug = this.generateSlug(createMedicineDto.name);

    // Check if slug already exists
    const existing = await this.prisma.medicine.findUnique({
      where: { slug },
    });

    if (existing) {
      throw new BadRequestException('Medicine with this name already exists');
    }

    // Verify brand and category exist
    const [brand, category] = await Promise.all([
      this.prisma.brand.findUnique({ where: { id: createMedicineDto.brandId } }),
      this.prisma.medicineCategory.findUnique({
        where: { id: createMedicineDto.categoryId },
      }),
    ]);

    if (!brand) {
      throw new NotFoundException('Brand not found');
    }
    if (!category) {
      throw new NotFoundException('Category not found');
    }

    // Calculate discount percentage
    const discountPercentage = createMedicineDto.discountPrice
      ? ((createMedicineDto.mrp - createMedicineDto.discountPrice) /
          createMedicineDto.mrp) *
        100
      : null;

    // Create medicine
    const medicine = await this.prisma.medicine.create({
      data: {
        ...createMedicineDto,
        slug,
        discountPercentage,
        images: createMedicineDto.images || [],
        keywords: createMedicineDto.keywords || [],
      },
      include: {
        brand: {
          select: { id: true, name: true, logo: true },
        },
        category: {
          select: { id: true, name: true, slug: true },
        },
      },
    });

    // Record initial stock history
    if (createMedicineDto.stockQuantity > 0) {
      await this.prisma.stockHistory.create({
        data: {
          medicineId: medicine.id,
          type: 'PURCHASE',
          quantity: createMedicineDto.stockQuantity,
          previousStock: 0,
          newStock: createMedicineDto.stockQuantity,
          notes: 'Initial stock',
          createdBy,
        },
      });
    }

    // Clear cache
    await this.clearMedicineCache();

    this.logger.log(`Medicine created successfully: ${medicine.id}`);
    return this.formatMedicineResponse(medicine);
  }

  /**
   * Get all medicines with filtering, sorting, and pagination
   */
  async findAll(
    filters: FilterMedicinesDto,
  ): Promise<PaginatedMedicinesResponseDto> {
    const {
      search,
      categoryId,
      brandId,
      minPrice,
      maxPrice,
      isPrescriptionRequired,
      inStockOnly,
      isFeatured,
      isBestSeller,
      isNewArrival,
      dosageForm,
      therapeuticClass,
      minRating,
      sortBy = MedicineSortBy.NAME,
      page = 1,
      limit = 20,
    } = filters;

    // Build where clause
    const where: any = {
      isActive: true,
      isDeleted: false,
    };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { genericName: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { composition: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (categoryId) where.categoryId = categoryId;
    if (brandId) where.brandId = brandId;
    if (isPrescriptionRequired !== undefined)
      where.isPrescriptionRequired = isPrescriptionRequired;
    if (inStockOnly) where.stockQuantity = { gt: 0 };
    if (isFeatured) where.isFeatured = true;
    if (isBestSeller) where.isBestSeller = true;
    if (isNewArrival) where.isNewArrival = true;
    if (dosageForm) where.dosageForm = dosageForm;
    if (therapeuticClass) where.therapeuticClass = therapeuticClass;
    if (minRating) where.rating = { gte: minRating };

    if (minPrice !== undefined || maxPrice !== undefined) {
      where.price = {};
      if (minPrice !== undefined) where.price.gte = minPrice;
      if (maxPrice !== undefined) where.price.lte = maxPrice;
    }

    // Build order by clause
    const orderBy = this.buildOrderBy(sortBy);

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Execute queries
    const [medicines, total] = await Promise.all([
      this.prisma.medicine.findMany({
        where,
        include: {
          brand: {
            select: { id: true, name: true, logo: true },
          },
          category: {
            select: { id: true, name: true, slug: true },
          },
        },
        orderBy,
        skip,
        take: limit,
      }),
      this.prisma.medicine.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data: medicines.map(this.formatMedicineResponse),
      meta: {
        total,
        page,
        limit,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    };
  }

  /**
   * Get medicine by ID
   */
  async findOne(id: string): Promise<MedicineResponseDto> {
    // Try cache first
    const cacheKey = `${this.CACHE_PREFIX}${id}`;
    const cached = await this.redis.get(cacheKey);
    if (cached) {
      this.logger.debug(`Cache hit for medicine: ${id}`);
      return JSON.parse(cached);
    }

    const medicine = await this.prisma.medicine.findUnique({
      where: { id, isDeleted: false },
      include: {
        brand: {
          select: { id: true, name: true, logo: true },
        },
        category: {
          select: { id: true, name: true, slug: true },
        },
      },
    });

    if (!medicine) {
      throw new NotFoundException('Medicine not found');
    }

    // Increment view count asynchronously
    this.prisma.medicine
      .update({
        where: { id },
        data: { viewCount: { increment: 1 } },
      })
      .catch((error) =>
        this.logger.error(`Failed to increment view count: ${error.message}`),
      );

    const response = this.formatMedicineResponse(medicine);

    // Cache the result
    await this.redis.set(cacheKey, JSON.stringify(response), this.CACHE_TTL);

    return response;
  }

  /**
   * Get medicine by slug
   */
  async findBySlug(slug: string): Promise<MedicineResponseDto> {
    const medicine = await this.prisma.medicine.findUnique({
      where: { slug, isDeleted: false },
      include: {
        brand: {
          select: { id: true, name: true, logo: true },
        },
        category: {
          select: { id: true, name: true, slug: true },
        },
      },
    });

    if (!medicine) {
      throw new NotFoundException('Medicine not found');
    }

    // Increment view count asynchronously
    this.prisma.medicine
      .update({
        where: { id: medicine.id },
        data: { viewCount: { increment: 1 } },
      })
      .catch((error) =>
        this.logger.error(`Failed to increment view count: ${error.message}`),
      );

    return this.formatMedicineResponse(medicine);
  }

  /**
   * Update medicine
   */
  async update(
    id: string,
    updateMedicineDto: UpdateMedicineDto,
    updatedBy?: string,
  ): Promise<MedicineResponseDto> {
    this.logger.log(`Updating medicine: ${id}`);

    // Check if medicine exists
    const existing = await this.prisma.medicine.findUnique({
      where: { id, isDeleted: false },
    });

    if (!existing) {
      throw new NotFoundException('Medicine not found');
    }

    // Handle slug update if name changed
    let slug = existing.slug;
    if (updateMedicineDto.name && updateMedicineDto.name !== existing.name) {
      slug = this.generateSlug(updateMedicineDto.name);

      const slugExists = await this.prisma.medicine.findFirst({
        where: { slug, id: { not: id } },
      });

      if (slugExists) {
        throw new BadRequestException('Medicine with this name already exists');
      }
    }

    // Calculate discount percentage if price changed
    const price = updateMedicineDto.price ?? existing.price;
    const mrp = updateMedicineDto.mrp ?? existing.mrp;
    const discountPrice =
      updateMedicineDto.discountPrice ?? existing.discountPrice;

    const discountPercentage = discountPrice
      ? ((mrp - discountPrice) / mrp) * 100
      : null;

    // Track price changes
    if (
      updateMedicineDto.price !== undefined ||
      updateMedicineDto.mrp !== undefined ||
      updateMedicineDto.discountPrice !== undefined
    ) {
      await this.prisma.priceHistory.create({
        data: {
          medicineId: id,
          oldPrice: existing.price,
          newPrice: price,
          oldMrp: existing.mrp,
          newMrp: mrp,
          reason: 'Manual update',
          createdBy: updatedBy,
        },
      });
    }

    // Update medicine
    const medicine = await this.prisma.medicine.update({
      where: { id },
      data: {
        ...updateMedicineDto,
        slug,
        discountPercentage,
        images: updateMedicineDto.images ?? undefined,
        keywords: updateMedicineDto.keywords ?? undefined,
      },
      include: {
        brand: {
          select: { id: true, name: true, logo: true },
        },
        category: {
          select: { id: true, name: true, slug: true },
        },
      },
    });

    // Clear cache
    await this.clearMedicineCache(id);

    this.logger.log(`Medicine updated successfully: ${id}`);
    return this.formatMedicineResponse(medicine);
  }

  /**
   * Soft delete medicine
   */
  async remove(id: string): Promise<void> {
    this.logger.log(`Deleting medicine: ${id}`);

    const medicine = await this.prisma.medicine.findUnique({
      where: { id, isDeleted: false },
    });

    if (!medicine) {
      throw new NotFoundException('Medicine not found');
    }

    // Soft delete
    await this.prisma.medicine.update({
      where: { id },
      data: { isDeleted: true, isActive: false },
    });

    // Clear cache
    await this.clearMedicineCache(id);

    this.logger.log(`Medicine deleted successfully: ${id}`);
  }

  /**
   * Update stock with history tracking
   */
  async updateStock(
    id: string,
    updateStockDto: UpdateStockDto,
    updatedBy?: string,
  ): Promise<{ success: boolean; newStock: number }> {
    this.logger.log(`Updating stock for medicine: ${id}`);

    const medicine = await this.prisma.medicine.findUnique({
      where: { id, isDeleted: false },
    });

    if (!medicine) {
      throw new NotFoundException('Medicine not found');
    }

    const newStock = medicine.stockQuantity + updateStockDto.quantity;

    if (newStock < 0) {
      throw new BadRequestException('Insufficient stock');
    }

    // Update stock in transaction
    await this.prisma.$transaction(async (tx) => {
      // Update medicine stock
      await tx.medicine.update({
        where: { id },
        data: { stockQuantity: newStock },
      });

      // Record stock history
      await tx.stockHistory.create({
        data: {
          medicineId: id,
          type: updateStockDto.type,
          quantity: updateStockDto.quantity,
          reference: updateStockDto.reference,
          notes: updateStockDto.notes,
          previousStock: medicine.stockQuantity,
          newStock,
          createdBy: updatedBy,
        },
      });
    });

    // Clear cache
    await this.clearMedicineCache(id);

    this.logger.log(`Stock updated successfully for medicine: ${id}`);
    return { success: true, newStock };
  }

  /**
   * Update price with history tracking
   */
  async updatePrice(
    id: string,
    updatePriceDto: UpdatePriceDto,
    updatedBy?: string,
  ): Promise<MedicineResponseDto> {
    this.logger.log(`Updating price for medicine: ${id}`);

    const medicine = await this.prisma.medicine.findUnique({
      where: { id, isDeleted: false },
    });

    if (!medicine) {
      throw new NotFoundException('Medicine not found');
    }

    const newMrp = updatePriceDto.mrp ?? medicine.mrp;
    const newPrice = updatePriceDto.price;
    const newDiscountPrice = updatePriceDto.discountPrice;

    // Calculate discount percentage
    const discountPercentage = newDiscountPrice
      ? ((newMrp - newDiscountPrice) / newMrp) * 100
      : null;

    // Update in transaction
    const updated = await this.prisma.$transaction(async (tx) => {
      // Record price history
      await tx.priceHistory.create({
        data: {
          medicineId: id,
          oldPrice: medicine.price,
          newPrice,
          oldMrp: medicine.mrp,
          newMrp,
          reason: updatePriceDto.reason || 'Price update',
          createdBy: updatedBy,
        },
      });

      // Update medicine
      return tx.medicine.update({
        where: { id },
        data: {
          price: newPrice,
          mrp: newMrp,
          discountPrice: newDiscountPrice,
          discountPercentage,
        },
        include: {
          brand: {
            select: { id: true, name: true, logo: true },
          },
          category: {
            select: { id: true, name: true, slug: true },
          },
        },
      });
    });

    // Clear cache
    await this.clearMedicineCache(id);

    this.logger.log(`Price updated successfully for medicine: ${id}`);
    return this.formatMedicineResponse(updated);
  }

  /**
   * Bulk update stock
   */
  async bulkUpdateStock(
    bulkUpdateDto: BulkUpdateStockDto,
    updatedBy?: string,
  ): Promise<{ success: boolean; updated: number }> {
    this.logger.log(`Bulk updating stock for ${bulkUpdateDto.items.length} medicines`);

    let updated = 0;

    for (const item of bulkUpdateDto.items) {
      try {
        await this.updateStock(
          item.medicineId,
          {
            type: 'ADJUSTMENT',
            quantity: item.quantity,
            notes: 'Bulk update',
          },
          updatedBy,
        );
        updated++;
      } catch (error) {
        this.logger.error(
          `Failed to update stock for medicine ${item.medicineId}: ${error.message}`,
        );
      }
    }

    this.logger.log(`Bulk stock update completed: ${updated}/${bulkUpdateDto.items.length}`);
    return { success: true, updated };
  }

  /**
   * Get featured medicines
   */
  async getFeatured(limit = 10): Promise<MedicineResponseDto[]> {
    const medicines = await this.prisma.medicine.findMany({
      where: {
        isFeatured: true,
        isActive: true,
        isDeleted: false,
        stockQuantity: { gt: 0 },
      },
      include: {
        brand: {
          select: { id: true, name: true, logo: true },
        },
        category: {
          select: { id: true, name: true, slug: true },
        },
      },
      orderBy: [{ rating: 'desc' }, { salesCount: 'desc' }],
      take: limit,
    });

    return medicines.map(this.formatMedicineResponse);
  }

  /**
   * Get best sellers
   */
  async getBestSellers(limit = 10): Promise<MedicineResponseDto[]> {
    const medicines = await this.prisma.medicine.findMany({
      where: {
        isBestSeller: true,
        isActive: true,
        isDeleted: false,
        stockQuantity: { gt: 0 },
      },
      include: {
        brand: {
          select: { id: true, name: true, logo: true },
        },
        category: {
          select: { id: true, name: true, slug: true },
        },
      },
      orderBy: { salesCount: 'desc' },
      take: limit,
    });

    return medicines.map(this.formatMedicineResponse);
  }

  /**
   * Get new arrivals
   */
  async getNewArrivals(limit = 10): Promise<MedicineResponseDto[]> {
    const medicines = await this.prisma.medicine.findMany({
      where: {
        isNewArrival: true,
        isActive: true,
        isDeleted: false,
        stockQuantity: { gt: 0 },
      },
      include: {
        brand: {
          select: { id: true, name: true, logo: true },
        },
        category: {
          select: { id: true, name: true, slug: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    return medicines.map(this.formatMedicineResponse);
  }

  /**
   * Get low stock medicines
   */
  async getLowStock(): Promise<MedicineResponseDto[]> {
    const medicines = await this.prisma.medicine.findMany({
      where: {
        isActive: true,
        isDeleted: false,
        stockQuantity: {
          lte: this.prisma.medicine.fields.minStockLevel,
        },
      },
      include: {
        brand: {
          select: { id: true, name: true, logo: true },
        },
        category: {
          select: { id: true, name: true, slug: true },
        },
      },
      orderBy: { stockQuantity: 'asc' },
    });

    return medicines.map(this.formatMedicineResponse);
  }

  /**
   * Helper: Generate slug from name
   */
  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  /**
   * Helper: Build order by clause based on sort option
   */
  private buildOrderBy(sortBy: MedicineSortBy): any {
    switch (sortBy) {
      case MedicineSortBy.PRICE_LOW:
        return { price: 'asc' };
      case MedicineSortBy.PRICE_HIGH:
        return { price: 'desc' };
      case MedicineSortBy.RATING:
        return { rating: 'desc' };
      case MedicineSortBy.POPULARITY:
        return { salesCount: 'desc' };
      case MedicineSortBy.NEWEST:
        return { createdAt: 'desc' };
      case MedicineSortBy.DISCOUNT:
        return { discountPercentage: 'desc' };
      default:
        return { name: 'asc' };
    }
  }

  /**
   * Helper: Format medicine response
   */
  private formatMedicineResponse(medicine: any): MedicineResponseDto {
    return {
      id: medicine.id,
      name: medicine.name,
      slug: medicine.slug,
      genericName: medicine.genericName,
      brand: medicine.brand,
      category: medicine.category,
      description: medicine.description,
      composition: medicine.composition,
      manufacturer: medicine.manufacturer,
      isPrescriptionRequired: medicine.isPrescriptionRequired,
      price: medicine.price,
      discountPrice: medicine.discountPrice,
      discountPercentage: medicine.discountPercentage,
      mrp: medicine.mrp,
      stockQuantity: medicine.stockQuantity,
      unit: medicine.unit,
      unitSize: medicine.unitSize,
      packagingType: medicine.packagingType,
      primaryImage: medicine.primaryImage,
      images: medicine.images,
      isFeatured: medicine.isFeatured,
      isBestSeller: medicine.isBestSeller,
      isNewArrival: medicine.isNewArrival,
      dosageForm: medicine.dosageForm,
      strength: medicine.strength,
      rating: medicine.rating,
      reviewCount: medicine.reviewCount,
      viewCount: medicine.viewCount,
      salesCount: medicine.salesCount,
      wishlistCount: medicine.wishlistCount,
      isActive: medicine.isActive,
      createdAt: medicine.createdAt,
      updatedAt: medicine.updatedAt,
    };
  }

  /**
   * Helper: Clear medicine cache
   */
  private async clearMedicineCache(id?: string): Promise<void> {
    try {
      if (id) {
        await this.redis.del(`${this.CACHE_PREFIX}${id}`);
      }
      // Clear list caches
      await this.redis.deleteByPattern(`${this.CACHE_PREFIX}list:*`);
    } catch (error) {
      this.logger.error(`Failed to clear cache: ${error.message}`);
    }
  }
}
