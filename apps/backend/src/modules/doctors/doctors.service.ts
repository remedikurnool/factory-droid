import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class DoctorsService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.doctor.findMany({ where: { isActive: true }, include: { hospital: true } });
  }

  async findOne(id: string) {
    return this.prisma.doctor.findUnique({ where: { id }, include: { hospital: true } });
  }

  async bookAppointment(userId: string, appointmentData: any) {
    return this.prisma.appointment.create({ data: { ...appointmentData, userId } });
  }
}
