import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { RedisService } from '../redis/redis.service';
import {
  SearchMedicinesDto,
  SearchDoctorsDto,
  SearchLabTestsDto,
  UnifiedSearchDto,
  LocationSearchDto,
  SearchResultsDto,
} from './dto/search.dto';

@Injectable()
export class SearchService {
  private readonly logger = new Logger(SearchService.name);
  private readonly CACHE_TTL = 300; // 5 minutes

  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService
  ) {}

  /**
   * Search medicines with advanced filtering
   */
  async searchMedicines(dto: SearchMedicinesDto): Promise<SearchResultsDto> {
    const cacheKey = `search:medicines:${JSON.stringify(dto)}`;

    // Check cache
    const cached = await this.redis.get(cacheKey);
    if (cached) {
      this.logger.debug('Returning cached medicine search results');
      return JSON.parse(cached);
    }

    const {
      query,
      category,
      manufacturer,
      minPrice,
      maxPrice,
      prescriptionRequired,
      inStock,
      page = 1,
      limit = 20,
      sortBy = 'relevance',
      sortOrder = 'desc',
    } = dto;

    // Build where clause
    const where: any = {};

    // Text search across multiple fields
    if (query) {
      where.OR = [
        { name: { contains: query, mode: 'insensitive' } },
        { description: { contains: query, mode: 'insensitive' } },
        { genericName: { contains: query, mode: 'insensitive' } },
        { manufacturer: { contains: query, mode: 'insensitive' } },
        { category: { contains: query, mode: 'insensitive' } },
      ];
    }

    // Filters
    if (category) {
      where.category = category;
    }

    if (manufacturer) {
      where.manufacturer = { contains: manufacturer, mode: 'insensitive' };
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      where.price = {};
      if (minPrice !== undefined) where.price.gte = minPrice;
      if (maxPrice !== undefined) where.price.lte = maxPrice;
    }

    if (prescriptionRequired !== undefined) {
      where.prescriptionRequired = prescriptionRequired;
    }

    if (inStock !== undefined) {
      where.stockQuantity = inStock ? { gt: 0 } : { lte: 0 };
    }

    // Sorting
    const orderBy: any = {};
    switch (sortBy) {
      case 'price':
        orderBy.price = sortOrder;
        break;
      case 'name':
        orderBy.name = sortOrder;
        break;
      case 'popularity':
        orderBy.salesCount = sortOrder;
        break;
      case 'rating':
        orderBy.rating = sortOrder;
        break;
      case 'newest':
        orderBy.createdAt = 'desc';
        break;
      default:
        // Relevance sorting (by createdAt as fallback)
        orderBy.createdAt = 'desc';
    }

    // Execute query
    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      this.prisma.medicine.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        select: {
          id: true,
          name: true,
          genericName: true,
          description: true,
          manufacturer: true,
          category: true,
          price: true,
          discountPrice: true,
          prescriptionRequired: true,
          stockQuantity: true,
          imageUrl: true,
          rating: true,
          reviewCount: true,
        },
      }),
      this.prisma.medicine.count({ where }),
    ]);

    const result: SearchResultsDto = {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      hasMore: page * limit < total,
    };

    // Cache results
    await this.redis.set(cacheKey, JSON.stringify(result), this.CACHE_TTL);

    this.logger.log(`Medicine search completed: ${total} results for query "${query}"`);

    return result;
  }

  /**
   * Search doctors with specialty and availability filters
   */
  async searchDoctors(dto: SearchDoctorsDto): Promise<SearchResultsDto> {
    const cacheKey = `search:doctors:${JSON.stringify(dto)}`;

    const cached = await this.redis.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }

    const {
      query,
      specialty,
      experience,
      minFee,
      maxFee,
      availability,
      gender,
      languages,
      rating,
      page = 1,
      limit = 20,
      sortBy = 'relevance',
      sortOrder = 'desc',
    } = dto;

    const where: any = {};

    // Text search
    if (query) {
      where.OR = [
        { firstName: { contains: query, mode: 'insensitive' } },
        { lastName: { contains: query, mode: 'insensitive' } },
        { specialty: { contains: query, mode: 'insensitive' } },
        { qualifications: { contains: query, mode: 'insensitive' } },
      ];
    }

    // Filters
    if (specialty) {
      where.specialty = specialty;
    }

    if (experience) {
      where.experienceYears = { gte: experience };
    }

    if (minFee !== undefined || maxFee !== undefined) {
      where.consultationFee = {};
      if (minFee !== undefined) where.consultationFee.gte = minFee;
      if (maxFee !== undefined) where.consultationFee.lte = maxFee;
    }

    if (availability) {
      where.isAvailable = true;
    }

    if (gender) {
      where.gender = gender;
    }

    if (languages && languages.length > 0) {
      where.languages = {
        hasSome: languages,
      };
    }

    if (rating) {
      where.rating = { gte: rating };
    }

    // Sorting
    const orderBy: any = {};
    switch (sortBy) {
      case 'fee':
        orderBy.consultationFee = sortOrder;
        break;
      case 'experience':
        orderBy.experienceYears = sortOrder;
        break;
      case 'rating':
        orderBy.rating = sortOrder;
        break;
      case 'name':
        orderBy.firstName = sortOrder;
        break;
      default:
        orderBy.rating = 'desc';
    }

    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      this.prisma.doctor.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        select: {
          id: true,
          firstName: true,
          lastName: true,
          specialty: true,
          qualifications: true,
          experienceYears: true,
          consultationFee: true,
          rating: true,
          reviewCount: true,
          profileImage: true,
          languages: true,
          isAvailable: true,
          nextAvailableSlot: true,
        },
      }),
      this.prisma.doctor.count({ where }),
    ]);

    const result: SearchResultsDto = {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      hasMore: page * limit < total,
    };

    await this.redis.set(cacheKey, JSON.stringify(result), this.CACHE_TTL);

    this.logger.log(`Doctor search completed: ${total} results for query "${query}"`);

    return result;
  }

  /**
   * Search lab tests with category and location filters
   */
  async searchLabTests(dto: SearchLabTestsDto): Promise<SearchResultsDto> {
    const cacheKey = `search:labtests:${JSON.stringify(dto)}`;

    const cached = await this.redis.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }

    const {
      query,
      category,
      minPrice,
      maxPrice,
      homeCollection,
      reportTime,
      page = 1,
      limit = 20,
      sortBy = 'relevance',
      sortOrder = 'desc',
    } = dto;

    const where: any = {};

    // Text search
    if (query) {
      where.OR = [
        { name: { contains: query, mode: 'insensitive' } },
        { description: { contains: query, mode: 'insensitive' } },
        { category: { contains: query, mode: 'insensitive' } },
      ];
    }

    // Filters
    if (category) {
      where.category = category;
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      where.price = {};
      if (minPrice !== undefined) where.price.gte = minPrice;
      if (maxPrice !== undefined) where.price.lte = maxPrice;
    }

    if (homeCollection !== undefined) {
      where.homeCollectionAvailable = homeCollection;
    }

    if (reportTime) {
      where.reportDeliveryHours = { lte: reportTime };
    }

    // Sorting
    const orderBy: any = {};
    switch (sortBy) {
      case 'price':
        orderBy.price = sortOrder;
        break;
      case 'name':
        orderBy.name = sortOrder;
        break;
      case 'popularity':
        orderBy.bookingsCount = sortOrder;
        break;
      default:
        orderBy.createdAt = 'desc';
    }

    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      this.prisma.labTest.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        select: {
          id: true,
          name: true,
          description: true,
          category: true,
          price: true,
          discountPrice: true,
          homeCollectionAvailable: true,
          reportDeliveryHours: true,
          preparationRequired: true,
          fastingRequired: true,
        },
      }),
      this.prisma.labTest.count({ where }),
    ]);

    const result: SearchResultsDto = {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      hasMore: page * limit < total,
    };

    await this.redis.set(cacheKey, JSON.stringify(result), this.CACHE_TTL);

    this.logger.log(`Lab test search completed: ${total} results for query "${query}"`);

    return result;
  }

  /**
   * Unified search across all entities
   */
  async unifiedSearch(dto: UnifiedSearchDto): Promise<any> {
    const { query, page = 1, limit = 10 } = dto;

    const cacheKey = `search:unified:${query}:${page}:${limit}`;
    const cached = await this.redis.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }

    // Search in parallel
    const [medicines, doctors, labTests] = await Promise.all([
      this.searchMedicines({ query, page, limit }),
      this.searchDoctors({ query, page, limit }),
      this.searchLabTests({ query, page, limit }),
    ]);

    const result = {
      query,
      results: {
        medicines: {
          items: medicines.items,
          total: medicines.total,
        },
        doctors: {
          items: doctors.items,
          total: doctors.total,
        },
        labTests: {
          items: labTests.items,
          total: labTests.total,
        },
      },
      totalResults: medicines.total + doctors.total + labTests.total,
    };

    await this.redis.set(cacheKey, JSON.stringify(result), this.CACHE_TTL);

    this.logger.log(`Unified search completed for query "${query}"`);

    return result;
  }

  /**
   * Location-based search
   */
  async locationSearch(dto: LocationSearchDto): Promise<any> {
    const { latitude, longitude, radius = 5, type, page = 1, limit = 20 } = dto;

    this.logger.log(`Location search: lat=${latitude}, lng=${longitude}, radius=${radius}km`);

    // Calculate bounding box for efficient querying
    const latOffset = radius / 111; // 1 degree latitude ≈ 111 km
    const lngOffset = radius / (111 * Math.cos((latitude * Math.PI) / 180));

    const bounds = {
      minLat: latitude - latOffset,
      maxLat: latitude + latOffset,
      minLng: longitude - lngOffset,
      maxLng: longitude + lngOffset,
    };

    let results: any = {};

    // Search based on type
    if (!type || type === 'doctors') {
      const doctors = await this.prisma.doctor.findMany({
        where: {
          latitude: {
            gte: bounds.minLat,
            lte: bounds.maxLat,
          },
          longitude: {
            gte: bounds.minLng,
            lte: bounds.maxLng,
          },
        },
        take: limit,
        skip: (page - 1) * limit,
      });

      // Calculate actual distances and filter by radius
      const doctorsWithDistance = doctors
        .map((doctor) => ({
          ...doctor,
          distance: this.calculateDistance(latitude, longitude, doctor.latitude, doctor.longitude),
        }))
        .filter((doctor) => doctor.distance <= radius)
        .sort((a, b) => a.distance - b.distance);

      results.doctors = doctorsWithDistance;
    }

    if (!type || type === 'labs') {
      const labs = await this.prisma.lab.findMany({
        where: {
          latitude: {
            gte: bounds.minLat,
            lte: bounds.maxLat,
          },
          longitude: {
            gte: bounds.minLng,
            lte: bounds.maxLng,
          },
        },
        take: limit,
        skip: (page - 1) * limit,
      });

      const labsWithDistance = labs
        .map((lab) => ({
          ...lab,
          distance: this.calculateDistance(latitude, longitude, lab.latitude, lab.longitude),
        }))
        .filter((lab) => lab.distance <= radius)
        .sort((a, b) => a.distance - b.distance);

      results.labs = labsWithDistance;
    }

    if (!type || type === 'pharmacies') {
      const pharmacies = await this.prisma.pharmacy.findMany({
        where: {
          latitude: {
            gte: bounds.minLat,
            lte: bounds.maxLat,
          },
          longitude: {
            gte: bounds.minLng,
            lte: bounds.maxLng,
          },
        },
        take: limit,
        skip: (page - 1) * limit,
      });

      const pharmaciesWithDistance = pharmacies
        .map((pharmacy) => ({
          ...pharmacy,
          distance: this.calculateDistance(
            latitude,
            longitude,
            pharmacy.latitude,
            pharmacy.longitude
          ),
        }))
        .filter((pharmacy) => pharmacy.distance <= radius)
        .sort((a, b) => a.distance - b.distance);

      results.pharmacies = pharmaciesWithDistance;
    }

    return {
      location: { latitude, longitude },
      radius,
      results,
    };
  }

  /**
   * Calculate distance between two coordinates (Haversine formula)
   */
  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.toRad(lat2 - lat1);
    const dLon = this.toRad(lon2 - lon1);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(lat1)) *
        Math.cos(this.toRad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;

    return Math.round(distance * 100) / 100; // Round to 2 decimal places
  }

  private toRad(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  /**
   * Get search suggestions/autocomplete
   */
  async getSearchSuggestions(query: string, type?: string): Promise<string[]> {
    if (!query || query.length < 2) {
      return [];
    }

    const cacheKey = `search:suggestions:${type || 'all'}:${query}`;
    const cached = await this.redis.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }

    const suggestions: Set<string> = new Set();

    // Get suggestions from different sources
    if (!type || type === 'medicines') {
      const medicines = await this.prisma.medicine.findMany({
        where: {
          OR: [
            { name: { contains: query, mode: 'insensitive' } },
            { genericName: { contains: query, mode: 'insensitive' } },
          ],
        },
        take: 10,
        select: { name: true },
      });
      medicines.forEach((m) => suggestions.add(m.name));
    }

    if (!type || type === 'doctors') {
      const doctors = await this.prisma.doctor.findMany({
        where: {
          OR: [
            { firstName: { contains: query, mode: 'insensitive' } },
            { specialty: { contains: query, mode: 'insensitive' } },
          ],
        },
        take: 10,
        select: { firstName: true, lastName: true, specialty: true },
      });
      doctors.forEach((d) => {
        suggestions.add(`${d.firstName} ${d.lastName}`);
        suggestions.add(d.specialty);
      });
    }

    if (!type || type === 'labtests') {
      const labTests = await this.prisma.labTest.findMany({
        where: {
          name: { contains: query, mode: 'insensitive' },
        },
        take: 10,
        select: { name: true },
      });
      labTests.forEach((l) => suggestions.add(l.name));
    }

    const result = Array.from(suggestions).slice(0, 10);
    await this.redis.set(cacheKey, JSON.stringify(result), 600); // 10 minutes

    return result;
  }

  /**
   * Track search query for analytics
   */
  async trackSearch(
    userId: string,
    query: string,
    type: string,
    resultsCount: number
  ): Promise<void> {
    try {
      await this.prisma.searchHistory.create({
        data: {
          userId,
          query,
          searchType: type,
          resultsCount,
          timestamp: new Date(),
        },
      });

      this.logger.debug(`Search tracked: user=${userId}, query="${query}", type=${type}`);
    } catch (error) {
      this.logger.error('Failed to track search', error);
    }
  }

  /**
   * Get user's search history
   */
  async getSearchHistory(userId: string, limit = 20): Promise<any[]> {
    return this.prisma.searchHistory.findMany({
      where: { userId },
      orderBy: { timestamp: 'desc' },
      take: limit,
      select: {
        query: true,
        searchType: true,
        resultsCount: true,
        timestamp: true,
      },
    });
  }

  /**
   * Get popular searches
   */
  async getPopularSearches(type?: string, limit = 10): Promise<any[]> {
    const cacheKey = `search:popular:${type || 'all'}`;
    const cached = await this.redis.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }

    const where: any = {};
    if (type) {
      where.searchType = type;
    }

    // Get most frequent searches from last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const popularSearches = await this.prisma.searchHistory.groupBy({
      by: ['query'],
      where: {
        ...where,
        timestamp: { gte: thirtyDaysAgo },
      },
      _count: {
        query: true,
      },
      orderBy: {
        _count: {
          query: 'desc',
        },
      },
      take: limit,
    });

    const result = popularSearches.map((s) => ({
      query: s.query,
      count: s._count.query,
    }));

    await this.redis.set(cacheKey, JSON.stringify(result), 3600); // 1 hour

    return result;
  }

  /**
   * Clear search cache
   */
  async clearSearchCache(type?: string): Promise<void> {
    const pattern = type ? `search:${type}:*` : 'search:*';
    await this.redis.deleteByPattern(pattern);
    this.logger.log(`Search cache cleared: ${pattern}`);
  }
}
