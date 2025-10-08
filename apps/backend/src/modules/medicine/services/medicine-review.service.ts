import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import {
  CreateMedicineReviewDto,
  UpdateMedicineReviewDto,
  MedicineReviewResponseDto,
} from '../dto/medicine.dto';

@Injectable()
export class MedicineReviewService {
  private readonly logger = new Logger(MedicineReviewService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Create a medicine review
   */
  async create(
    userId: string,
    createReviewDto: CreateMedicineReviewDto,
  ): Promise<MedicineReviewResponseDto> {
    this.logger.log(
      `Creating review for medicine: ${createReviewDto.medicineId} by user: ${userId}`,
    );

    // Check if medicine exists
    const medicine = await this.prisma.medicine.findUnique({
      where: { id: createReviewDto.medicineId, isDeleted: false },
    });

    if (!medicine) {
      throw new NotFoundException('Medicine not found');
    }

    // Check if user already reviewed this medicine
    const existingReview = await this.prisma.medicineReview.findUnique({
      where: {
        medicineId_userId: {
          medicineId: createReviewDto.medicineId,
          userId,
        },
      },
    });

    if (existingReview) {
      throw new BadRequestException(
        'You have already reviewed this medicine. Please update your existing review.',
      );
    }

    // Check if user has purchased this medicine (for verified review)
    const hasPurchased = await this.hasUserPurchasedMedicine(
      userId,
      createReviewDto.medicineId,
    );

    // Create review
    const review = await this.prisma.medicineReview.create({
      data: {
        ...createReviewDto,
        userId,
        isVerified: hasPurchased,
      },
      include: {
        medicine: {
          select: { id: true, name: true },
        },
        user: {
          select: { id: true, firstName: true, lastName: true },
        },
      },
    });

    // Update medicine rating and review count
    await this.updateMedicineRating(createReviewDto.medicineId);

    this.logger.log(`Review created successfully: ${review.id}`);
    return this.formatReviewResponse(review);
  }

  /**
   * Get all reviews for a medicine
   */
  async findByMedicine(
    medicineId: string,
    page = 1,
    limit = 20,
    onlyApproved = true,
  ): Promise<{
    data: MedicineReviewResponseDto[];
    meta: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  }> {
    const where: any = { medicineId };
    if (onlyApproved) {
      where.isApproved = true;
    }

    const skip = (page - 1) * limit;

    const [reviews, total] = await Promise.all([
      this.prisma.medicineReview.findMany({
        where,
        include: {
          medicine: {
            select: { id: true, name: true },
          },
          user: {
            select: { id: true, firstName: true, lastName: true },
          },
        },
        orderBy: [{ isVerified: 'desc' }, { createdAt: 'desc' }],
        skip,
        take: limit,
      }),
      this.prisma.medicineReview.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data: reviews.map(this.formatReviewResponse),
      meta: {
        total,
        page,
        limit,
        totalPages,
      },
    };
  }

  /**
   * Get user's reviews
   */
  async findByUser(
    userId: string,
    page = 1,
    limit = 20,
  ): Promise<{
    data: MedicineReviewResponseDto[];
    meta: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  }> {
    const skip = (page - 1) * limit;

    const [reviews, total] = await Promise.all([
      this.prisma.medicineReview.findMany({
        where: { userId },
        include: {
          medicine: {
            select: { id: true, name: true },
          },
          user: {
            select: { id: true, firstName: true, lastName: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.medicineReview.count({ where: { userId } }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data: reviews.map(this.formatReviewResponse),
      meta: {
        total,
        page,
        limit,
        totalPages,
      },
    };
  }

  /**
   * Get a single review
   */
  async findOne(id: string): Promise<MedicineReviewResponseDto> {
    const review = await this.prisma.medicineReview.findUnique({
      where: { id },
      include: {
        medicine: {
          select: { id: true, name: true },
        },
        user: {
          select: { id: true, firstName: true, lastName: true },
        },
      },
    });

    if (!review) {
      throw new NotFoundException('Review not found');
    }

    return this.formatReviewResponse(review);
  }

  /**
   * Update a review
   */
  async update(
    id: string,
    userId: string,
    updateReviewDto: UpdateMedicineReviewDto,
  ): Promise<MedicineReviewResponseDto> {
    this.logger.log(`Updating review: ${id} by user: ${userId}`);

    // Check if review exists and belongs to user
    const existing = await this.prisma.medicineReview.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException('Review not found');
    }

    if (existing.userId !== userId) {
      throw new ForbiddenException('You can only update your own reviews');
    }

    // Update review
    const review = await this.prisma.medicineReview.update({
      where: { id },
      data: {
        ...updateReviewDto,
        isApproved: false, // Re-approve needed after update
      },
      include: {
        medicine: {
          select: { id: true, name: true },
        },
        user: {
          select: { id: true, firstName: true, lastName: true },
        },
      },
    });

    // Update medicine rating if rating changed
    if (updateReviewDto.rating !== undefined) {
      await this.updateMedicineRating(existing.medicineId);
    }

    this.logger.log(`Review updated successfully: ${id}`);
    return this.formatReviewResponse(review);
  }

  /**
   * Delete a review
   */
  async remove(id: string, userId: string, isAdmin = false): Promise<void> {
    this.logger.log(`Deleting review: ${id} by user: ${userId}`);

    const review = await this.prisma.medicineReview.findUnique({
      where: { id },
    });

    if (!review) {
      throw new NotFoundException('Review not found');
    }

    if (!isAdmin && review.userId !== userId) {
      throw new ForbiddenException('You can only delete your own reviews');
    }

    // Delete review
    await this.prisma.medicineReview.delete({
      where: { id },
    });

    // Update medicine rating and review count
    await this.updateMedicineRating(review.medicineId);

    this.logger.log(`Review deleted successfully: ${id}`);
  }

  /**
   * Approve a review (Admin only)
   */
  async approve(id: string): Promise<MedicineReviewResponseDto> {
    this.logger.log(`Approving review: ${id}`);

    const review = await this.prisma.medicineReview.update({
      where: { id },
      data: { isApproved: true },
      include: {
        medicine: {
          select: { id: true, name: true },
        },
        user: {
          select: { id: true, firstName: true, lastName: true },
        },
      },
    });

    this.logger.log(`Review approved successfully: ${id}`);
    return this.formatReviewResponse(review);
  }

  /**
   * Mark review as helpful
   */
  async markHelpful(id: string): Promise<MedicineReviewResponseDto> {
    const review = await this.prisma.medicineReview.update({
      where: { id },
      data: { helpfulCount: { increment: 1 } },
      include: {
        medicine: {
          select: { id: true, name: true },
        },
        user: {
          select: { id: true, firstName: true, lastName: true },
        },
      },
    });

    return this.formatReviewResponse(review);
  }

  /**
   * Get medicine rating statistics
   */
  async getRatingStats(medicineId: string): Promise<{
    averageRating: number;
    totalReviews: number;
    ratingDistribution: { rating: number; count: number }[];
  }> {
    const reviews = await this.prisma.medicineReview.findMany({
      where: { medicineId, isApproved: true },
      select: { rating: true },
    });

    const totalReviews = reviews.length;
    const averageRating =
      totalReviews > 0
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews
        : 0;

    // Calculate rating distribution
    const distribution = [1, 2, 3, 4, 5].map((rating) => ({
      rating,
      count: reviews.filter((r) => r.rating === rating).length,
    }));

    return {
      averageRating: Math.round(averageRating * 10) / 10,
      totalReviews,
      ratingDistribution: distribution,
    };
  }

  /**
   * Helper: Check if user has purchased medicine
   */
  private async hasUserPurchasedMedicine(
    userId: string,
    medicineId: string,
  ): Promise<boolean> {
    const purchase = await this.prisma.orderItem.findFirst({
      where: {
        medicineId,
        order: {
          userId,
          status: 'DELIVERED',
        },
      },
    });

    return !!purchase;
  }

  /**
   * Helper: Update medicine rating and review count
   */
  private async updateMedicineRating(medicineId: string): Promise<void> {
    const stats = await this.getRatingStats(medicineId);

    await this.prisma.medicine.update({
      where: { id: medicineId },
      data: {
        rating: stats.averageRating,
        reviewCount: stats.totalReviews,
      },
    });
  }

  /**
   * Helper: Format review response
   */
  private formatReviewResponse(review: any): MedicineReviewResponseDto {
    return {
      id: review.id,
      medicine: review.medicine,
      user: review.user,
      rating: review.rating,
      title: review.title,
      comment: review.comment,
      isVerified: review.isVerified,
      helpfulCount: review.helpfulCount,
      isApproved: review.isApproved,
      createdAt: review.createdAt,
      updatedAt: review.updatedAt,
    };
  }
}
