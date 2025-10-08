import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class CartService {
  constructor(private prisma: PrismaService) {}

  async getCart(userId: string) {
    return this.prisma.cartItem.findMany({
      where: { userId },
      include: { medicine: { include: { brand: true, category: true } } },
    });
  }

  async addItem(userId: string, data: any) {
    const existing = await this.prisma.cartItem.findFirst({
      where: { userId, productId: data.productId, productType: data.productType },
    });

    if (existing) {
      return this.prisma.cartItem.update({
        where: { id: existing.id },
        data: { quantity: existing.quantity + (data.quantity || 1) },
      });
    }

    return this.prisma.cartItem.create({
      data: { ...data, userId },
    });
  }

  async updateItem(userId: string, itemId: string, quantity: number) {
    return this.prisma.cartItem.update({
      where: { id: itemId, userId },
      data: { quantity },
    });
  }

  async removeItem(userId: string, itemId: string) {
    return this.prisma.cartItem.delete({
      where: { id: itemId, userId },
    });
  }

  async clearCart(userId: string) {
    return this.prisma.cartItem.deleteMany({
      where: { userId },
    });
  }
}
