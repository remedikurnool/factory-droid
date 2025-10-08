import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { AddToWishlistDto, MedicineResponseDto } from '../dto/medicine.dto';

@Injectable()
export class WishlistService {
  private readonly logger = new Logger(WishlistService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Add medicine to wishlist
   */
  async add(
    userId: string,
    addToWishlistDto: AddToWishlistDto,
  ): Promise<{ success: boolean; message: string }> {
    this.logger.log(
      `Adding medicine ${addToWishlistDto.medicineId} to wishlist for user: ${userId}`,
    );

    // Check if medicine exists
    const medicine = await this.prisma.medicine.findUnique({
      where: { id: addToWishlistDto.medicineId, isDeleted: false },
    });

    if (!medicine) {
      throw new NotFoundException('Medicine not found');
    }

    // Check if already in wishlist
    const existing = await this.prisma.wishlistItem.findUnique({
      where: {
        userId_medicineId: {
          userId,
          medicineId: addToWishlistDto.medicineId,
        },
      },
    });

    if (existing) {
      throw new BadRequestException('Medicine already in wishlist');
    }

    // Add to wishlist
    await this.prisma.$transaction([
      this.prisma.wishlistItem.create({
        data: {
          userId,
          medicineId: addToWishlistDto.medicineId,
        },
      }),
      this.prisma.medicine.update({
        where: { id: addToWishlistDto.medicineId },
        data: { wishlistCount: { increment: 1 } },
      }),
    ]);

    this.logger.log(
      `Medicine added to wishlist successfully: ${addToWishlistDto.medicineId}`,
    );
    return { success: true, message: 'Medicine added to wishlist' };
  }

  /**
   * Remove medicine from wishlist
   */
  async remove(
    userId: string,
    medicineId: string,
  ): Promise<{ success: boolean; message: string }> {
    this.logger.log(
      `Removing medicine ${medicineId} from wishlist for user: ${userId}`,
    );

    // Check if item exists
    const item = await this.prisma.wishlistItem.findUnique({
      where: {
        userId_medicineId: {
          userId,
          medicineId,
        },
      },
    });

    if (!item) {
      throw new NotFoundException('Medicine not in wishlist');
    }

    // Remove from wishlist
    await this.prisma.$transaction([
      this.prisma.wishlistItem.delete({
        where: {
          userId_medicineId: {
            userId,
            medicineId,
          },
        },
      }),
      this.prisma.medicine.update({
        where: { id: medicineId },
        data: { wishlistCount: { decrement: 1 } },
      }),
    ]);

    this.logger.log(`Medicine removed from wishlist successfully: ${medicineId}`);
    return { success: true, message: 'Medicine removed from wishlist' };
  }

  /**
   * Get user's wishlist
   */
  async findAll(
    userId: string,
    page = 1,
    limit = 20,
  ): Promise<{
    data: MedicineResponseDto[];
    meta: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  }> {
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      this.prisma.wishlistItem.findMany({
        where: { userId },
        include: {
          medicine: {
            where: { isDeleted: false },
            include: {
              brand: {
                select: { id: true, name: true, logo: true },
              },
              category: {
                select: { id: true, name: true, slug: true },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.wishlistItem.count({
        where: {
          userId,
          medicine: { isDeleted: false },
        },
      }),
    ]);

    const totalPages = Math.ceil(total / limit);

    const medicines = items
      .filter((item) => item.medicine) // Filter out deleted medicines
      .map((item) => this.formatMedicineResponse(item.medicine));

    return {
      data: medicines,
      meta: {
        total,
        page,
        limit,
        totalPages,
      },
    };
  }

  /**
   * Check if medicine is in user's wishlist
   */
  async isInWishlist(userId: string, medicineId: string): Promise<boolean> {
    const item = await this.prisma.wishlistItem.findUnique({
      where: {
        userId_medicineId: {
          userId,
          medicineId,
        },
      },
    });

    return !!item;
  }

  /**
   * Clear user's wishlist
   */
  async clear(userId: string): Promise<{ success: boolean; message: string }> {
    this.logger.log(`Clearing wishlist for user: ${userId}`);

    const items = await this.prisma.wishlistItem.findMany({
      where: { userId },
      select: { medicineId: true },
    });

    if (items.length === 0) {
      return { success: true, message: 'Wishlist already empty' };
    }

    // Remove all items and update medicine wishlist counts
    await this.prisma.$transaction([
      this.prisma.wishlistItem.deleteMany({
        where: { userId },
      }),
      ...items.map((item) =>
        this.prisma.medicine.update({
          where: { id: item.medicineId },
          data: { wishlistCount: { decrement: 1 } },
        }),
      ),
    ]);

    this.logger.log(`Wishlist cleared successfully for user: ${userId}`);
    return { success: true, message: 'Wishlist cleared' };
  }

  /**
   * Get wishlist count for user
   */
  async getCount(userId: string): Promise<number> {
    return this.prisma.wishlistItem.count({
      where: {
        userId,
        medicine: { isDeleted: false },
      },
    });
  }

  /**
   * Move wishlist items to cart
   */
  async moveToCart(
    userId: string,
    medicineIds?: string[],
  ): Promise<{ success: boolean; moved: number; message: string }> {
    this.logger.log(`Moving wishlist items to cart for user: ${userId}`);

    const where: any = { userId };
    if (medicineIds && medicineIds.length > 0) {
      where.medicineId = { in: medicineIds };
    }

    const items = await this.prisma.wishlistItem.findMany({
      where,
      include: {
        medicine: {
          where: { isDeleted: false, isActive: true, stockQuantity: { gt: 0 } },
        },
      },
    });

    let moved = 0;

    for (const item of items) {
      if (!item.medicine) continue;

      try {
        // Check if already in cart
        const existingCartItem = await this.prisma.cartItem.findUnique({
          where: {
            userId_medicineId: {
              userId,
              medicineId: item.medicineId,
            },
          },
        });

        if (existingCartItem) {
          // Update quantity
          await this.prisma.cartItem.update({
            where: {
              userId_medicineId: {
                userId,
                medicineId: item.medicineId,
              },
            },
            data: { quantity: { increment: 1 } },
          });
        } else {
          // Add to cart
          await this.prisma.cartItem.create({
            data: {
              userId,
              medicineId: item.medicineId,
              quantity: 1,
            },
          });
        }

        // Remove from wishlist
        await this.remove(userId, item.medicineId);
        moved++;
      } catch (error) {
        this.logger.error(
          `Failed to move item ${item.medicineId} to cart: ${error.message}`,
        );
      }
    }

    this.logger.log(`Moved ${moved} items to cart for user: ${userId}`);
    return {
      success: true,
      moved,
      message: `${moved} item(s) moved to cart`,
    };
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
}
