import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class MedicinesService {
  constructor(private prisma: PrismaService) {}

  async findAll(filters: any = {}, page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;
    const where: any = { isActive: true };

    if (filters.categoryId) {
      where.categoryId = filters.categoryId;
    }

    if (filters.brandId) {
      where.brandId = filters.brandId;
    }

    if (filters.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { genericName: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    if (filters.isPrescriptionRequired !== undefined) {
      where.isPrescriptionRequired = filters.isPrescriptionRequired === 'true';
    }

    const [medicines, total] = await Promise.all([
      this.prisma.medicine.findMany({
        where,
        skip,
        take: limit,
        include: {
          brand: true,
          category: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.medicine.count({ where }),
    ]);

    return {
      data: medicines,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string) {
    const medicine = await this.prisma.medicine.findUnique({
      where: { id },
      include: {
        brand: true,
        category: true,
      },
    });

    if (!medicine) {
      throw new NotFoundException('Medicine not found');
    }

    return medicine;
  }

  async getFeatured() {
    return this.prisma.medicine.findMany({
      where: { isFeatured: true, isActive: true },
      include: {
        brand: true,
        category: true,
      },
      take: 10,
    });
  }

  async getCategories() {
    return this.prisma.medicineCategory.findMany({
      where: { isActive: true },
      include: {
        _count: {
          select: { medicines: true },
        },
      },
    });
  }

  async getBrands() {
    return this.prisma.brand.findMany({
      where: { isActive: true },
      include: {
        _count: {
          select: { medicines: true },
        },
      },
    });
  }

  // Admin methods
  async create(data: any) {
    return this.prisma.medicine.create({
      data,
      include: {
        brand: true,
        category: true,
      },
    });
  }

  async update(id: string, data: any) {
    return this.prisma.medicine.update({
      where: { id },
      data,
      include: {
        brand: true,
        category: true,
      },
    });
  }

  async delete(id: string) {
    return this.prisma.medicine.delete({
      where: { id },
    });
  }

  async updateStock(id: string, quantity: number) {
    return this.prisma.medicine.update({
      where: { id },
      data: {
        stock: {
          increment: quantity,
        },
      },
    });
  }
}
