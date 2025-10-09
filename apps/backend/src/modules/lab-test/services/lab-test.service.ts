import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '@/shared/prisma/prisma.service';
import { RedisService } from '@/shared/redis/redis.service';
import {
  CreateLabTestDto,
  UpdateLabTestDto,
  SearchLabTestsDto,
  LabTestResponseDto,
  PaginatedLabTestsResponseDto,
  LabTestSortOption,
} from '../dto/lab-test.dto';

@Injectable()
export class LabTestService {
  constructor(
    private prisma: PrismaService,
    private redis: RedisService,
  ) {}

  /**
   * Create a new lab test
   */
  async create(dto: CreateLabTestDto): Promise<LabTestResponseDto> {
    // Check if slug already exists
    const existing = await this.prisma.labTest.findUnique({
      where: { slug: dto.slug },
    });

    if (existing) {
      throw new BadRequestException('Test with this slug already exists');
    }

    // Calculate discounted price if not provided
    if (!dto.discountedPrice && dto.discount > 0) {
      dto.discountedPrice = dto.price - (dto.price * dto.discount) / 100;
    }

    const test = await this.prisma.labTest.create({
      data: {
        ...dto,
        tags: dto.tags || [],
        metaKeywords: dto.metaKeywords || [],
      },
    });

    // Clear cache
    await this.clearCache();

    return this.mapToResponse(test);
  }

  /**
   * Search and filter lab tests
   */
  async search(dto: SearchLabTestsDto): Promise<PaginatedLabTestsResponseDto> {
    const page = dto.page || 1;
    const limit = dto.limit || 20;
    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};

    if (dto.query) {
      where.OR = [
        { name: { contains: dto.query, mode: 'insensitive' } },
        { description: { contains: dto.query, mode: 'insensitive' } },
        { category: { contains: dto.query, mode: 'insensitive' } },
        { tags: { hasSome: [dto.query] } },
      ];
    }

    if (dto.category) {
      where.category = dto.category;
    }

    if (dto.subCategory) {
      where.subCategory = dto.subCategory;
    }

    if (dto.testType) {
      where.testType = dto.testType;
    }

    if (dto.sampleType) {
      where.sampleType = dto.sampleType;
    }

    if (dto.minPrice !== undefined || dto.maxPrice !== undefined) {
      where.price = {};
      if (dto.minPrice !== undefined) where.price.gte = dto.minPrice;
      if (dto.maxPrice !== undefined) where.price.lte = dto.maxPrice;
    }

    if (dto.fasting !== undefined) {
      where.fasting = dto.fasting;
    }

    if (dto.homeCollectionAvailable !== undefined) {
      where.homeCollectionAvailable = dto.homeCollectionAvailable;
    }

    if (dto.isPopular !== undefined) {
      where.isPopular = dto.isPopular;
    }

    if (dto.isFeatured !== undefined) {
      where.isFeatured = dto.isFeatured;
    }

    where.isActive = dto.isActive !== undefined ? dto.isActive : true;

    if (dto.ageGroup) {
      where.ageGroup = dto.ageGroup;
    }

    if (dto.gender) {
      where.gender = dto.gender;
    }

    // Build orderBy
    const orderBy = this.buildOrderBy(dto.sortBy);

    // Execute query
    const [tests, total] = await Promise.all([
      this.prisma.labTest.findMany({
        where,
        orderBy,
        skip,
        take: limit,
      }),
      this.prisma.labTest.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      tests: tests.map((test) => this.mapToResponse(test)),
      total,
      page,
      limit,
      totalPages,
      hasMore: page < totalPages,
    };
  }

  /**
   * Get popular tests
   */
  async getPopular(limit: number = 10): Promise<LabTestResponseDto[]> {
    const cacheKey = `popular_tests:${limit}`;
    const cached = await this.redis.get(cacheKey);

    if (cached) {
      return JSON.parse(cached);
    }

    const tests = await this.prisma.labTest.findMany({
      where: {
        isActive: true,
        isPopular: true,
      },
      orderBy: [{ bookingsCount: 'desc' }, { viewsCount: 'desc' }],
      take: limit,
    });

    const response = tests.map((test) => this.mapToResponse(test));

    // Cache for 1 hour
    await this.redis.set(cacheKey, JSON.stringify(response), 3600);

    return response;
  }

  /**
   * Get featured tests
   */
  async getFeatured(limit: number = 10): Promise<LabTestResponseDto[]> {
    const tests = await this.prisma.labTest.findMany({
      where: {
        isActive: true,
        isFeatured: true,
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    return tests.map((test) => this.mapToResponse(test));
  }

  /**
   * Get test categories
   */
  async getCategories(): Promise<Array<{ category: string; count: number }>> {
    const cacheKey = 'test_categories';
    const cached = await this.redis.get(cacheKey);

    if (cached) {
      return JSON.parse(cached);
    }

    const categories = await this.prisma.labTest.groupBy({
      by: ['category'],
      where: { isActive: true },
      _count: true,
      orderBy: { _count: { category: 'desc' } },
    });

    const result = categories.map((cat) => ({
      category: cat.category,
      count: cat._count,
    }));

    // Cache for 1 hour
    await this.redis.set(cacheKey, JSON.stringify(result), 3600);

    return result;
  }

  /**
   * Get test by ID
   */
  async findById(id: string): Promise<LabTestResponseDto> {
    const test = await this.prisma.labTest.findUnique({
      where: { id },
    });

    if (!test) {
      throw new NotFoundException('Lab test not found');
    }

    // Increment view count
    await this.prisma.labTest.update({
      where: { id },
      data: { viewsCount: { increment: 1 } },
    });

    return this.mapToResponse(test);
  }

  /**
   * Get test by slug
   */
  async findBySlug(slug: string): Promise<LabTestResponseDto> {
    const test = await this.prisma.labTest.findUnique({
      where: { slug },
    });

    if (!test) {
      throw new NotFoundException('Lab test not found');
    }

    // Increment view count
    await this.prisma.labTest.update({
      where: { id: test.id },
      data: { viewsCount: { increment: 1 } },
    });

    return this.mapToResponse(test);
  }

  /**
   * Update lab test
   */
  async update(id: string, dto: UpdateLabTestDto): Promise<LabTestResponseDto> {
    const test = await this.prisma.labTest.findUnique({
      where: { id },
    });

    if (!test) {
      throw new NotFoundException('Lab test not found');
    }

    // Check slug uniqueness if being updated
    if (dto.slug && dto.slug !== test.slug) {
      const existing = await this.prisma.labTest.findUnique({
        where: { slug: dto.slug },
      });

      if (existing) {
        throw new BadRequestException('Test with this slug already exists');
      }
    }

    // Recalculate discounted price if price or discount changed
    if (dto.price !== undefined || dto.discount !== undefined) {
      const price = dto.price !== undefined ? dto.price : test.price;
      const discount = dto.discount !== undefined ? dto.discount : test.discount;
      
      if (discount > 0) {
        dto.discountedPrice = price - (price * discount) / 100;
      }
    }

    const updated = await this.prisma.labTest.update({
      where: { id },
      data: dto,
    });

    // Clear cache
    await this.clearCache();

    return this.mapToResponse(updated);
  }

  /**
   * Delete lab test
   */
  async delete(id: string): Promise<void> {
    const test = await this.prisma.labTest.findUnique({
      where: { id },
      include: { bookings: true },
    });

    if (!test) {
      throw new NotFoundException('Lab test not found');
    }

    if (test.bookings.length > 0) {
      throw new BadRequestException(
        'Cannot delete test with existing bookings. Deactivate instead.',
      );
    }

    await this.prisma.labTest.delete({
      where: { id },
    });

    // Clear cache
    await this.clearCache();
  }

  /**
   * Toggle test active status
   */
  async toggleStatus(id: string): Promise<LabTestResponseDto> {
    const test = await this.prisma.labTest.findUnique({
      where: { id },
    });

    if (!test) {
      throw new NotFoundException('Lab test not found');
    }

    const updated = await this.prisma.labTest.update({
      where: { id },
      data: { isActive: !test.isActive },
    });

    // Clear cache
    await this.clearCache();

    return this.mapToResponse(updated);
  }

  /**
   * Get test statistics
   */
  async getStats(id: string): Promise<any> {
    const test = await this.prisma.labTest.findUnique({
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

    if (!test) {
      throw new NotFoundException('Lab test not found');
    }

    const totalBookings = test.bookings.length;
    const completedBookings = test.bookings.filter(
      (b) => b.status === 'COMPLETED',
    ).length;
    const totalRevenue = test.bookings.reduce(
      (sum, b) => sum + b.finalAmount,
      0,
    );

    return {
      testId: test.id,
      testName: test.name,
      totalBookings,
      completedBookings,
      totalRevenue,
      viewsCount: test.viewsCount,
      conversionRate:
        test.viewsCount > 0
          ? ((totalBookings / test.viewsCount) * 100).toFixed(2)
          : 0,
    };
  }

  /**
   * Build orderBy clause
   */
  private buildOrderBy(sortBy?: LabTestSortOption): any {
    switch (sortBy) {
      case LabTestSortOption.PRICE_LOW_HIGH:
        return { price: 'asc' };
      case LabTestSortOption.PRICE_HIGH_LOW:
        return { price: 'desc' };
      case LabTestSortOption.NAME_A_Z:
        return { name: 'asc' };
      case LabTestSortOption.NAME_Z_A:
        return { name: 'desc' };
      case LabTestSortOption.REPORT_TIME:
        return { reportTimeHours: 'asc' };
      case LabTestSortOption.POPULARITY:
      default:
        return [{ bookingsCount: 'desc' }, { viewsCount: 'desc' }];
    }
  }

  /**
   * Map entity to response DTO
   */
  private mapToResponse(test: any): LabTestResponseDto {
    return {
      id: test.id,
      name: test.name,
      slug: test.slug,
      description: test.description,
      shortDescription: test.shortDescription,
      category: test.category,
      subCategory: test.subCategory,
      price: test.price,
      discountedPrice: test.discountedPrice,
      discount: test.discount,
      testType: test.testType,
      sampleType: test.sampleType,
      reportTime: test.reportTime,
      reportTimeHours: test.reportTimeHours,
      fasting: test.fasting,
      fastingHours: test.fastingHours,
      parameters: test.parameters,
      parametersCount: test.parametersCount,
      preparation: test.preparation,
      specialInstructions: test.specialInstructions,
      homeCollectionAvailable: test.homeCollectionAvailable,
      homeCollectionFee: test.homeCollectionFee,
      isPopular: test.isPopular,
      isFeatured: test.isFeatured,
      isActive: test.isActive,
      ageGroup: test.ageGroup,
      gender: test.gender,
      tags: test.tags,
      metaTitle: test.metaTitle,
      metaDescription: test.metaDescription,
      metaKeywords: test.metaKeywords,
      bookingsCount: test.bookingsCount,
      viewsCount: test.viewsCount,
      createdAt: test.createdAt,
      updatedAt: test.updatedAt,
    };
  }

  /**
   * Clear all test-related cache
   */
  private async clearCache(): Promise<void> {
    const patterns = ['popular_tests:*', 'test_categories', 'featured_tests:*'];
    for (const pattern of patterns) {
      await this.redis.deleteByPattern(pattern);
    }
  }
}
