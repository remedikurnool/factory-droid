import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        addresses: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async findAll(page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        skip,
        take: limit,
        select: {
          id: true,
          email: true,
          phone: true,
          firstName: true,
          lastName: true,
          role: true,
          isVerified: true,
          walletBalance: true,
          loyaltyPoints: true,
          createdAt: true,
        },
      }),
      this.prisma.user.count(),
    ]);

    return {
      data: users,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async updateProfile(userId: string, data: any) {
    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data,
    });

    const { password, ...userWithoutPassword } = updatedUser;
    return userWithoutPassword;
  }

  async addAddress(userId: string, addressData: any) {
    return this.prisma.address.create({
      data: {
        ...addressData,
        userId,
      },
    });
  }

  async updateAddress(userId: string, addressId: string, addressData: any) {
    // Verify address belongs to user
    const address = await this.prisma.address.findFirst({
      where: { id: addressId, userId },
    });

    if (!address) {
      throw new NotFoundException('Address not found');
    }

    return this.prisma.address.update({
      where: { id: addressId },
      data: addressData,
    });
  }

  async deleteAddress(userId: string, addressId: string) {
    // Verify address belongs to user
    const address = await this.prisma.address.findFirst({
      where: { id: addressId, userId },
    });

    if (!address) {
      throw new NotFoundException('Address not found');
    }

    return this.prisma.address.delete({
      where: { id: addressId },
    });
  }

  async getAddresses(userId: string) {
    return this.prisma.address.findMany({
      where: { userId },
      orderBy: { isDefault: 'desc' },
    });
  }
}
