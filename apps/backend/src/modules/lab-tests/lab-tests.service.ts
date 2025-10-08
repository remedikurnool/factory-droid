import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class LabTestsService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.labTest.findMany({ where: { isActive: true }, include: { category: true } });
  }

  async findOne(id: string) {
    return this.prisma.labTest.findUnique({ where: { id }, include: { category: true } });
  }

  async bookTest(userId: string, bookingData: any) {
    return this.prisma.labBooking.create({ data: { ...bookingData, userId } });
  }
}
