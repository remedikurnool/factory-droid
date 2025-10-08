import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class OrdersService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, orderData: any) {
    const orderNumber = `OM${Date.now()}${Math.floor(Math.random() * 1000)}`;
    return this.prisma.order.create({
      data: {
        ...orderData,
        userId,
        orderNumber,
      },
      include: {
        items: true,
        address: true,
      },
    });
  }

  async findAll(userId: string, page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;
    const [orders, total] = await Promise.all([
      this.prisma.order.findMany({
        where: { userId },
        skip,
        take: limit,
        include: { items: true, address: true },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.order.count({ where: { userId } }),
    ]);
    return { data: orders, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findOne(userId: string, orderId: string) {
    return this.prisma.order.findFirst({
      where: { id: orderId, userId },
      include: { items: true, address: true },
    });
  }

  async updateStatus(orderId: string, status: any) {
    return this.prisma.order.update({
      where: { id: orderId },
      data: { orderStatus: status },
    });
  }
}
