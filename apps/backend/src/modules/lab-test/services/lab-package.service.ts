import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '@/shared/prisma/prisma.service';
import { RedisService } from '@/shared/redis/redis.service';
import {
  CreateLabPackageDto,
  UpdateLabPackageDto,
  AddTestsToPackageDto,
  RemoveTestsFromPackageDto,
  SearchLabPackagesDto,
  LabPackageResponseDto,
  PaginatedLabPackagesResponseDto,
  LabPackageSortOption,
} from '../dto/lab-package.dto';

@Injectable()
export class LabPackageService {
  constructor(
    private prisma: PrismaService,
    private redis: RedisService,
  ) {}

  /**
   * Create a new lab package
   */
  async create(dto: CreateLabPackageDto): Promise<LabPackageResponseDto> {
    // Check if slug already exists
    const existing = await this.prisma.labPackage.findUnique({
      where: { slug: dto.slug },
    });

    if (existing) {
      throw new BadRequestException('Package with this slug already exists');
    }

    // Validate test IDs
    if (dto.testIds && dto.testIds.length > 0) {
      const tests = await this.prisma.labTest.findMany({
        where: { id: { in: dto.testIds } },
      });

      if (tests.length !== dto.testIds.length) {
        throw new BadRequestException('One or more test IDs are invalid');
      }
    }

    // Calculate regular price if not provided
    if (!dto.regularPrice && dto.testIds?.length > 0) {
      const tests = await this.prisma.labTest.findMany({
        where: { id: { in: dto.testIds } },
        select: { price: true },
      });
      dto.regularPrice = tests.reduce((sum, t) => sum + t.price, 0);
    }

    // Calculate savings
    const savings = (dto.regularPrice || 0) - dto.packagePrice;

    const pkg = await this.prisma.labPackage.create({
      data: {
        name: dto.name,
        slug: dto.slug,
        description: dto.description,
        shortDescription: dto.shortDescription,
        category: dto.category,
        packageType: dto.packageType,
        testsCount: dto.testIds?.length || 0,
        regularPrice: dto.regularPrice || 0,
        packagePrice: dto.packagePrice,
        savings,
        discountPercentage: dto.regularPrice
          ? Math.round((savings / dto.regularPrice) * 100)
          : 0,
        benefits: dto.benefits || [],
        features: dto.features || [],
        targetAudience: dto.targetAudience,
        recommendedFor: dto.recommendedFor || [],
        homeCollectionAvailable: dto.homeCollectionAvailable,
        homeCollectionFee: dto.homeCollectionFee,
        reportTime: dto.reportTime,
        reportTimeHours: dto.reportTimeHours,
        fasting: dto.fasting,
        fastingHours: dto.fastingHours,
        preparation: dto.preparation || [],
        isPopular: dto.isPopular,
        isFeatured: dto.isFeatured,
        tags: dto.tags || [],
        metaTitle: dto.metaTitle,
        metaDescription: dto.metaDescription,
        metaKeywords: dto.metaKeywords || [],
      },
    });

    // Add tests to package
    if (dto.testIds && dto.testIds.length > 0) {
      await this.addTests(pkg.id, { testIds: dto.testIds });
    }

    // Clear cache
    await this.clearCache();

    return this.findById(pkg.id);
  }

  /**
   * Search and filter packages
   */
  async search(
    dto: SearchLabPackagesDto,
  ): Promise<PaginatedLabPackagesResponseDto> {
    const page = dto.page || 1;
    const limit = dto.limit || 20;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (dto.query) {
      where.OR = [
        { name: { contains: dto.query, mode: 'insensitive' } },
        { description: { contains: dto.query, mode: 'insensitive' } },
        { category: { contains: dto.query, mode: 'insensitive' } },
        { tags: { hasSome: [dto.query] } },
      ];
    }

    if (dto.category) where.category = dto.category;
    if (dto.packageType) where.packageType = dto.packageType;

    if (dto.minPrice !== undefined || dto.maxPrice !== undefined) {
      where.packagePrice = {};
      if (dto.minPrice !== undefined) where.packagePrice.gte = dto.minPrice;
      if (dto.maxPrice !== undefined) where.packagePrice.lte = dto.maxPrice;
    }

    if (dto.minTests !== undefined) where.testsCount = { gte: dto.minTests };
    if (dto.fasting !== undefined) where.fasting = dto.fasting;

    if (dto.homeCollectionAvailable !== undefined) {
      where.homeCollectionAvailable = dto.homeCollectionAvailable;
    }

    if (dto.isPopular !== undefined) where.isPopular = dto.isPopular;
    if (dto.isFeatured !== undefined) where.isFeatured = dto.isFeatured;

    where.isActive = dto.isActive !== undefined ? dto.isActive : true;

    const orderBy = this.buildOrderBy(dto.sortBy);

    const [packages, total] = await Promise.all([
      this.prisma.labPackage.findMany({
        where,
        include: {
          tests: {
            include: { test: true },
          },
        },
        orderBy,
        skip,
        take: limit,
      }),
      this.prisma.labPackage.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      packages: packages.map((pkg) => this.mapToResponse(pkg)),
      total,
      page,
      limit,
      totalPages,
      hasMore: page < totalPages,
    };
  }

  /**
   * Get popular packages
   */
  async getPopular(limit: number = 10): Promise<LabPackageResponseDto[]> {
    const cacheKey = `popular_packages:${limit}`;
    const cached = await this.redis.get(cacheKey);

    if (cached) {
      return JSON.parse(cached);
    }

    const packages = await this.prisma.labPackage.findMany({
      where: {
        isActive: true,
        isPopular: true,
      },
      include: {
        tests: {
          include: { test: true },
        },
      },
      orderBy: [{ bookingsCount: 'desc' }, { viewsCount: 'desc' }],
      take: limit,
    });

    const response = packages.map((pkg) => this.mapToResponse(pkg));

    // Cache for 1 hour
    await this.redis.set(cacheKey, JSON.stringify(response), 3600);

    return response;
  }

  /**
   * Get featured packages
   */
  async getFeatured(limit: number = 10): Promise<LabPackageResponseDto[]> {
    const packages = await this.prisma.labPackage.findMany({
      where: {
        isActive: true,
        isFeatured: true,
      },
      include: {
        tests: {
          include: { test: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    return packages.map((pkg) => this.mapToResponse(pkg));
  }

  /**
   * Get package by ID
   */
  async findById(id: string): Promise<LabPackageResponseDto> {
    const pkg = await this.prisma.labPackage.findUnique({
      where: { id },
      include: {
        tests: {
          include: { test: true },
        },
      },
    });

    if (!pkg) {
      throw new NotFoundException('Package not found');
    }

    // Increment view count
    await this.prisma.labPackage.update({
      where: { id },
      data: { viewsCount: { increment: 1 } },
    });

    return this.mapToResponse(pkg);
  }

  /**
   * Get package by slug
   */
  async findBySlug(slug: string): Promise<LabPackageResponseDto> {
    const pkg = await this.prisma.labPackage.findUnique({
      where: { slug },
      include: {
        tests: {
          include: { test: true },
        },
      },
    });

    if (!pkg) {
      throw new NotFoundException('Package not found');
    }

    // Increment view count
    await this.prisma.labPackage.update({
      where: { id: pkg.id },
      data: { viewsCount: { increment: 1 } },
    });

    return this.mapToResponse(pkg);
  }

  /**
   * Update package
   */
  async update(
    id: string,
    dto: UpdateLabPackageDto,
  ): Promise<LabPackageResponseDto> {
    const pkg = await this.prisma.labPackage.findUnique({
      where: { id },
    });

    if (!pkg) {
      throw new NotFoundException('Package not found');
    }

    // Check slug uniqueness if being updated
    if (dto.slug && dto.slug !== pkg.slug) {
      const existing = await this.prisma.labPackage.findUnique({
        where: { slug: dto.slug },
      });

      if (existing) {
        throw new BadRequestException('Package with this slug already exists');
      }
    }

    // Recalculate savings if price changed
    const regularPrice =
      dto.regularPrice !== undefined ? dto.regularPrice : pkg.regularPrice;
    const packagePrice =
      dto.packagePrice !== undefined ? dto.packagePrice : pkg.packagePrice;
    const savings = regularPrice - packagePrice;
    const discountPercentage = Math.round((savings / regularPrice) * 100);

    const updated = await this.prisma.labPackage.update({
      where: { id },
      data: {
        ...dto,
        savings,
        discountPercentage,
      },
    });

    // Clear cache
    await this.clearCache();

    return this.findById(updated.id);
  }

  /**
   * Add tests to package
   */
  async addTests(
    id: string,
    dto: AddTestsToPackageDto,
  ): Promise<LabPackageResponseDto> {
    const pkg = await this.prisma.labPackage.findUnique({
      where: { id },
    });

    if (!pkg) {
      throw new NotFoundException('Package not found');
    }

    // Validate test IDs
    const tests = await this.prisma.labTest.findMany({
      where: { id: { in: dto.testIds } },
    });

    if (tests.length !== dto.testIds.length) {
      throw new BadRequestException('One or more test IDs are invalid');
    }

    // Add tests
    await Promise.all(
      dto.testIds.map((testId) =>
        this.prisma.labPackageTest.create({
          data: {
            packageId: id,
            testId,
          },
        }),
      ),
    );

    // Update tests count
    await this.prisma.labPackage.update({
      where: { id },
      data: {
        testsCount: { increment: dto.testIds.length },
      },
    });

    // Clear cache
    await this.clearCache();

    return this.findById(id);
  }

  /**
   * Remove tests from package
   */
  async removeTests(
    id: string,
    dto: RemoveTestsFromPackageDto,
  ): Promise<LabPackageResponseDto> {
    const pkg = await this.prisma.labPackage.findUnique({
      where: { id },
    });

    if (!pkg) {
      throw new NotFoundException('Package not found');
    }

    // Remove tests
    await this.prisma.labPackageTest.deleteMany({
      where: {
        packageId: id,
        testId: { in: dto.testIds },
      },
    });

    // Update tests count
    await this.prisma.labPackage.update({
      where: { id },
      data: {
        testsCount: { decrement: dto.testIds.length },
      },
    });

    // Clear cache
    await this.clearCache();

    return this.findById(id);
  }

  /**
   * Delete package
   */
  async delete(id: string): Promise<void> {
    const pkg = await this.prisma.labPackage.findUnique({
      where: { id },
      include: { bookings: true },
    });

    if (!pkg) {
      throw new NotFoundException('Package not found');
    }

    if (pkg.bookings.length > 0) {
      throw new BadRequestException(
        'Cannot delete package with existing bookings. Deactivate instead.',
      );
    }

    // Delete package tests first
    await this.prisma.labPackageTest.deleteMany({
      where: { packageId: id },
    });

    // Delete package
    await this.prisma.labPackage.delete({
      where: { id },
    });

    // Clear cache
    await this.clearCache();
  }

  /**
   * Toggle package status
   */
  async toggleStatus(id: string): Promise<LabPackageResponseDto> {
    const pkg = await this.prisma.labPackage.findUnique({
      where: { id },
    });

    if (!pkg) {
      throw new NotFoundException('Package not found');
    }

    const updated = await this.prisma.labPackage.update({
      where: { id },
      data: { isActive: !pkg.isActive },
    });

    // Clear cache
    await this.clearCache();

    return this.findById(updated.id);
  }

  /**
   * Get package statistics
   */
  async getStats(id: string): Promise<any> {
    const pkg = await this.prisma.labPackage.findUnique({
      where: { id },
      include: {
        bookings: {
          select: {
            status: true,
            createdAt: true,
            finalAmount: true,
          },
        },
      },
    });

    if (!pkg) {
      throw new NotFoundException('Package not found');
    }

    const totalBookings = pkg.bookings.length;
    const completedBookings = pkg.bookings.filter(
      (b) => b.status === 'COMPLETED',
    ).length;
    const totalRevenue = pkg.bookings.reduce(
      (sum, b) => sum + b.finalAmount,
      0,
    );

    return {
      packageId: pkg.id,
      packageName: pkg.name,
      totalBookings,
      completedBookings,
      totalRevenue,
      viewsCount: pkg.viewsCount,
      conversionRate:
        pkg.viewsCount > 0
          ? ((totalBookings / pkg.viewsCount) * 100).toFixed(2)
          : 0,
    };
  }

  /**
   * Build orderBy clause
   */
  private buildOrderBy(sortBy?: LabPackageSortOption): any {
    switch (sortBy) {
      case LabPackageSortOption.PRICE_LOW_HIGH:
        return { packagePrice: 'asc' };
      case LabPackageSortOption.PRICE_HIGH_LOW:
        return { packagePrice: 'desc' };
      case LabPackageSortOption.NAME_A_Z:
        return { name: 'asc' };
      case LabPackageSortOption.NAME_Z_A:
        return { name: 'desc' };
      case LabPackageSortOption.SAVINGS:
        return { savings: 'desc' };
      case LabPackageSortOption.TESTS_COUNT:
        return { testsCount: 'desc' };
      case LabPackageSortOption.POPULARITY:
      default:
        return [{ bookingsCount: 'desc' }, { viewsCount: 'desc' }];
    }
  }

  /**
   * Map entity to response DTO
   */
  private mapToResponse(pkg: any): LabPackageResponseDto {
    return {
      id: pkg.id,
      name: pkg.name,
      slug: pkg.slug,
      description: pkg.description,
      shortDescription: pkg.shortDescription,
      category: pkg.category,
      packageType: pkg.packageType,
      tests: pkg.tests?.map((pt: any) => pt.test) || [],
      testsCount: pkg.testsCount,
      regularPrice: pkg.regularPrice,
      packagePrice: pkg.packagePrice,
      savings: pkg.savings,
      discountPercentage: pkg.discountPercentage,
      benefits: pkg.benefits,
      features: pkg.features,
      targetAudience: pkg.targetAudience,
      recommendedFor: pkg.recommendedFor,
      homeCollectionAvailable: pkg.homeCollectionAvailable,
      homeCollectionFee: pkg.homeCollectionFee,
      reportTime: pkg.reportTime,
      reportTimeHours: pkg.reportTimeHours,
      fasting: pkg.fasting,
      fastingHours: pkg.fastingHours,
      preparation: pkg.preparation,
      isPopular: pkg.isPopular,
      isFeatured: pkg.isFeatured,
      isActive: pkg.isActive,
      tags: pkg.tags,
      metaTitle: pkg.metaTitle,
      metaDescription: pkg.metaDescription,
      metaKeywords: pkg.metaKeywords,
      bookingsCount: pkg.bookingsCount,
      viewsCount: pkg.viewsCount,
      createdAt: pkg.createdAt,
      updatedAt: pkg.updatedAt,
    };
  }

  /**
   * Clear all package-related cache
   */
  private async clearCache(): Promise<void> {
    const patterns = [
      'popular_packages:*',
      'featured_packages:*',
      'package_categories',
    ];
    for (const pattern of patterns) {
      await this.redis.deleteByPattern(pattern);
    }
  }
}
