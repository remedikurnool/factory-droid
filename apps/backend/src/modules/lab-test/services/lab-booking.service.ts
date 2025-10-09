import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '@/shared/prisma/prisma.service';
import { NotificationService } from '@/modules/notification/notification.service';
import {
  CreateLabBookingDto,
  UpdateLabBookingDto,
  AddSampleDetailsDto,
  AddReportDto,
  CancelLabBookingDto,
  RateLabBookingDto,
  SearchLabBookingsDto,
  LabBookingResponseDto,
  PaginatedLabBookingsResponseDto,
  LabBookingStatus,
  CollectionType,
} from '../dto/lab-booking.dto';

@Injectable()
export class LabBookingService {
  constructor(
    private prisma: PrismaService,
    private notificationService: NotificationService,
  ) {}

  /**
   * Create new lab booking
   */
  async create(
    userId: string,
    dto: CreateLabBookingDto,
  ): Promise<LabBookingResponseDto> {
    // Validate test or package exists
    if (dto.testId) {
      const test = await this.prisma.labTest.findUnique({
        where: { id: dto.testId },
      });
      if (!test || !test.isActive) {
        throw new BadRequestException('Test not found or inactive');
      }
    }

    if (dto.packageId) {
      const pkg = await this.prisma.labPackage.findUnique({
        where: { id: dto.packageId },
      });
      if (!pkg || !pkg.isActive) {
        throw new BadRequestException('Package not found or inactive');
      }
    }

    if (!dto.testId && !dto.packageId) {
      throw new BadRequestException('Either testId or packageId is required');
    }

    // Validate collection details
    if (
      dto.collectionType === CollectionType.HOME_COLLECTION &&
      !dto.collectionAddress
    ) {
      throw new BadRequestException(
        'Collection address is required for home collection',
      );
    }

    // Generate booking number
    const bookingNumber = await this.generateBookingNumber();

    // Calculate prices
    const pricing = await this.calculatePricing(dto);

    // Parse collection date
    const collectionDate = new Date(dto.collectionDate);

    const booking = await this.prisma.labTestBooking.create({
      data: {
        bookingNumber,
        userId,
        testId: dto.testId,
        packageId: dto.packageId,
        bookingType: dto.bookingType,
        patientName: dto.patientName,
        patientAge: dto.patientAge,
        patientGender: dto.patientGender,
        patientPhone: dto.patientPhone,
        patientEmail: dto.patientEmail,
        collectionType: dto.collectionType,
        collectionDate,
        collectionTime: dto.collectionTime,
        collectionAddress: dto.collectionAddress,
        collectionAddressLine: dto.collectionAddressLine,
        collectionCity: dto.collectionCity,
        collectionState: dto.collectionState,
        collectionPincode: dto.collectionPincode,
        collectionLandmark: dto.collectionLandmark,
        labId: dto.labId,
        labName: dto.labName,
        labAddress: dto.labAddress,
        testPrice: pricing.testPrice,
        homeCollectionFee: pricing.homeCollectionFee,
        totalAmount: pricing.totalAmount,
        discountAmount: pricing.discountAmount,
        finalAmount: pricing.finalAmount,
        prescriptionRequired: dto.prescriptionRequired || false,
        prescriptionUrl: dto.prescriptionUrl,
        specialInstructions: dto.specialInstructions,
      },
      include: {
        test: true,
        package: true,
        user: { select: { id: true, name: true, email: true } },
      },
    });

    // Update test/package booking count
    if (dto.testId) {
      await this.prisma.labTest.update({
        where: { id: dto.testId },
        data: { bookingsCount: { increment: 1 } },
      });
    }
    if (dto.packageId) {
      await this.prisma.labPackage.update({
        where: { id: dto.packageId },
        data: { bookingsCount: { increment: 1 } },
      });
    }

    // Send confirmation notification
    await this.notificationService.sendBookingConfirmation(booking);

    return this.mapToResponse(booking);
  }

  /**
   * Search bookings
   */
  async search(
    dto: SearchLabBookingsDto,
  ): Promise<PaginatedLabBookingsResponseDto> {
    const page = dto.page || 1;
    const limit = dto.limit || 20;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (dto.userId) where.userId = dto.userId;
    if (dto.testId) where.testId = dto.testId;
    if (dto.packageId) where.packageId = dto.packageId;
    if (dto.bookingNumber) where.bookingNumber = dto.bookingNumber;
    if (dto.bookingType) where.bookingType = dto.bookingType;
    if (dto.collectionType) where.collectionType = dto.collectionType;
    if (dto.status) where.status = dto.status;
    if (dto.paymentStatus) where.paymentStatus = dto.paymentStatus;
    if (dto.reportStatus) where.reportStatus = dto.reportStatus;

    if (dto.startDate || dto.endDate) {
      where.collectionDate = {};
      if (dto.startDate) where.collectionDate.gte = new Date(dto.startDate);
      if (dto.endDate) where.collectionDate.lte = new Date(dto.endDate);
    }

    const [bookings, total] = await Promise.all([
      this.prisma.labTestBooking.findMany({
        where,
        include: {
          test: true,
          package: true,
          user: { select: { id: true, name: true, email: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.labTestBooking.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      bookings: bookings.map((b) => this.mapToResponse(b)),
      total,
      page,
      limit,
      totalPages,
      hasMore: page < totalPages,
    };
  }

  /**
   * Get booking by ID
   */
  async findById(id: string): Promise<LabBookingResponseDto> {
    const booking = await this.prisma.labTestBooking.findUnique({
      where: { id },
      include: {
        test: true,
        package: true,
        user: { select: { id: true, name: true, email: true } },
      },
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    return this.mapToResponse(booking);
  }

  /**
   * Get booking by booking number
   */
  async findByNumber(bookingNumber: string): Promise<LabBookingResponseDto> {
    const booking = await this.prisma.labTestBooking.findUnique({
      where: { bookingNumber },
      include: {
        test: true,
        package: true,
        user: { select: { id: true, name: true, email: true } },
      },
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    return this.mapToResponse(booking);
  }

  /**
   * Update booking
   */
  async update(
    id: string,
    dto: UpdateLabBookingDto,
  ): Promise<LabBookingResponseDto> {
    const booking = await this.prisma.labTestBooking.findUnique({
      where: { id },
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    // Validate status transitions
    if (dto.status) {
      this.validateStatusTransition(booking.status as LabBookingStatus, dto.status);
    }

    const updated = await this.prisma.labTestBooking.update({
      where: { id },
      data: dto,
      include: {
        test: true,
        package: true,
        user: { select: { id: true, name: true, email: true } },
      },
    });

    // Send status update notification
    if (dto.status && dto.status !== booking.status) {
      await this.notificationService.sendBookingStatusUpdate(updated);
    }

    return this.mapToResponse(updated);
  }

  /**
   * Confirm booking
   */
  async confirm(id: string): Promise<LabBookingResponseDto> {
    const booking = await this.prisma.labTestBooking.findUnique({
      where: { id },
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    if (booking.status !== LabBookingStatus.SCHEDULED) {
      throw new BadRequestException('Can only confirm scheduled bookings');
    }

    const updated = await this.prisma.labTestBooking.update({
      where: { id },
      data: { status: LabBookingStatus.CONFIRMED },
      include: {
        test: true,
        package: true,
        user: { select: { id: true, name: true, email: true } },
      },
    });

    await this.notificationService.sendBookingConfirmed(updated);

    return this.mapToResponse(updated);
  }

  /**
   * Add sample details
   */
  async addSampleDetails(
    id: string,
    dto: AddSampleDetailsDto,
  ): Promise<LabBookingResponseDto> {
    const booking = await this.prisma.labTestBooking.findUnique({
      where: { id },
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    const updated = await this.prisma.labTestBooking.update({
      where: { id },
      data: {
        ...dto,
        sampleCollectedAt: new Date(),
        status: LabBookingStatus.SAMPLE_COLLECTED,
      },
      include: {
        test: true,
        package: true,
        user: { select: { id: true, name: true, email: true } },
      },
    });

    await this.notificationService.sendSampleCollected(updated);

    return this.mapToResponse(updated);
  }

  /**
   * Add report
   */
  async addReport(
    id: string,
    dto: AddReportDto,
  ): Promise<LabBookingResponseDto> {
    const booking = await this.prisma.labTestBooking.findUnique({
      where: { id },
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    const updated = await this.prisma.labTestBooking.update({
      where: { id },
      data: {
        ...dto,
        reportGeneratedAt: new Date(),
        reportDeliveredAt: new Date(),
        status: LabBookingStatus.REPORT_READY,
      },
      include: {
        test: true,
        package: true,
        user: { select: { id: true, name: true, email: true } },
      },
    });

    await this.notificationService.sendReportReady(updated);

    return this.mapToResponse(updated);
  }

  /**
   * Cancel booking
   */
  async cancel(
    id: string,
    userId: string,
    dto: CancelLabBookingDto,
  ): Promise<LabBookingResponseDto> {
    const booking = await this.prisma.labTestBooking.findUnique({
      where: { id },
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    if (booking.userId !== userId) {
      throw new BadRequestException('You can only cancel your own bookings');
    }

    if (
      booking.status === LabBookingStatus.CANCELLED ||
      booking.status === LabBookingStatus.COMPLETED
    ) {
      throw new BadRequestException(
        'Cannot cancel a completed or already cancelled booking',
      );
    }

    // Check if eligible for refund (e.g., cancellation before 24 hours)
    const hoursUntilCollection =
      (booking.collectionDate.getTime() - Date.now()) / (1000 * 60 * 60);
    const refundAmount = hoursUntilCollection > 24 ? booking.finalAmount : 0;

    const updated = await this.prisma.labTestBooking.update({
      where: { id },
      data: {
        status: LabBookingStatus.CANCELLED,
        cancelledAt: new Date(),
        cancellationReason: dto.cancellationReason,
        cancelledBy: dto.cancelledBy || 'USER',
        refundAmount,
        refundStatus: refundAmount > 0 ? 'PENDING' : 'NOT_APPLICABLE',
      },
      include: {
        test: true,
        package: true,
        user: { select: { id: true, name: true, email: true } },
      },
    });

    await this.notificationService.sendBookingCancelled(updated);

    return this.mapToResponse(updated);
  }

  /**
   * Rate booking
   */
  async rate(
    id: string,
    userId: string,
    dto: RateLabBookingDto,
  ): Promise<LabBookingResponseDto> {
    const booking = await this.prisma.labTestBooking.findUnique({
      where: { id },
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    if (booking.userId !== userId) {
      throw new BadRequestException('You can only rate your own bookings');
    }

    if (booking.status !== LabBookingStatus.COMPLETED) {
      throw new BadRequestException('Can only rate completed bookings');
    }

    const updated = await this.prisma.labTestBooking.update({
      where: { id },
      data: {
        rating: dto.rating,
        feedback: dto.feedback,
        ratedAt: new Date(),
      },
      include: {
        test: true,
        package: true,
        user: { select: { id: true, name: true, email: true } },
      },
    });

    return this.mapToResponse(updated);
  }

  /**
   * Get booking statistics
   */
  async getStats(filters?: any): Promise<any> {
    const where = filters || {};

    const [
      total,
      scheduled,
      confirmed,
      sampleCollected,
      processing,
      reportReady,
      completed,
      cancelled,
    ] = await Promise.all([
      this.prisma.labTestBooking.count({ where }),
      this.prisma.labTestBooking.count({
        where: { ...where, status: LabBookingStatus.SCHEDULED },
      }),
      this.prisma.labTestBooking.count({
        where: { ...where, status: LabBookingStatus.CONFIRMED },
      }),
      this.prisma.labTestBooking.count({
        where: { ...where, status: LabBookingStatus.SAMPLE_COLLECTED },
      }),
      this.prisma.labTestBooking.count({
        where: { ...where, status: LabBookingStatus.PROCESSING },
      }),
      this.prisma.labTestBooking.count({
        where: { ...where, status: LabBookingStatus.REPORT_READY },
      }),
      this.prisma.labTestBooking.count({
        where: { ...where, status: LabBookingStatus.COMPLETED },
      }),
      this.prisma.labTestBooking.count({
        where: { ...where, status: LabBookingStatus.CANCELLED },
      }),
    ]);

    const bookings = await this.prisma.labTestBooking.findMany({
      where,
      select: { finalAmount: true, paymentStatus: true },
    });

    const totalRevenue = bookings
      .filter((b) => b.paymentStatus === 'PAID')
      .reduce((sum, b) => sum + b.finalAmount, 0);

    return {
      total,
      byStatus: {
        scheduled,
        confirmed,
        sampleCollected,
        processing,
        reportReady,
        completed,
        cancelled,
      },
      totalRevenue,
      averageBookingValue: total > 0 ? totalRevenue / total : 0,
    };
  }

  /**
   * Calculate pricing for booking
   */
  private async calculatePricing(dto: CreateLabBookingDto): Promise<any> {
    let testPrice = 0;
    let homeCollectionFee = 0;

    if (dto.testId) {
      const test = await this.prisma.labTest.findUnique({
        where: { id: dto.testId },
      });
      testPrice = test.discountedPrice || test.price;
      if (dto.collectionType === CollectionType.HOME_COLLECTION) {
        homeCollectionFee = test.homeCollectionFee || 0;
      }
    }

    if (dto.packageId) {
      const pkg = await this.prisma.labPackage.findUnique({
        where: { id: dto.packageId },
      });
      testPrice = pkg.packagePrice;
      if (dto.collectionType === CollectionType.HOME_COLLECTION) {
        homeCollectionFee = pkg.homeCollectionFee || 0;
      }
    }

    const totalAmount = testPrice + homeCollectionFee;
    const discountAmount = 0; // Apply any additional discounts here
    const finalAmount = totalAmount - discountAmount;

    return {
      testPrice,
      homeCollectionFee,
      totalAmount,
      discountAmount,
      finalAmount,
    };
  }

  /**
   * Generate unique booking number
   */
  private async generateBookingNumber(): Promise<string> {
    const prefix = 'LB';
    const date = new Date();
    const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
    
    // Get count of bookings today
    const startOfDay = new Date(date.setHours(0, 0, 0, 0));
    const endOfDay = new Date(date.setHours(23, 59, 59, 999));
    
    const count = await this.prisma.labTestBooking.count({
      where: {
        createdAt: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
    });

    const sequence = (count + 1).toString().padStart(4, '0');
    return `${prefix}${dateStr}${sequence}`;
  }

  /**
   * Validate status transitions
   */
  private validateStatusTransition(
    currentStatus: LabBookingStatus,
    newStatus: LabBookingStatus,
  ): void {
    const validTransitions: Record<LabBookingStatus, LabBookingStatus[]> = {
      [LabBookingStatus.SCHEDULED]: [
        LabBookingStatus.CONFIRMED,
        LabBookingStatus.CANCELLED,
      ],
      [LabBookingStatus.CONFIRMED]: [
        LabBookingStatus.SAMPLE_COLLECTED,
        LabBookingStatus.CANCELLED,
      ],
      [LabBookingStatus.SAMPLE_COLLECTED]: [
        LabBookingStatus.SAMPLE_RECEIVED,
      ],
      [LabBookingStatus.SAMPLE_RECEIVED]: [LabBookingStatus.PROCESSING],
      [LabBookingStatus.PROCESSING]: [LabBookingStatus.REPORT_READY],
      [LabBookingStatus.REPORT_READY]: [LabBookingStatus.COMPLETED],
      [LabBookingStatus.COMPLETED]: [],
      [LabBookingStatus.CANCELLED]: [],
      [LabBookingStatus.REFUNDED]: [],
    };

    if (!validTransitions[currentStatus]?.includes(newStatus)) {
      throw new BadRequestException(
        `Cannot transition from ${currentStatus} to ${newStatus}`,
      );
    }
  }

  /**
   * Map entity to response DTO
   */
  private mapToResponse(booking: any): LabBookingResponseDto {
    return {
      id: booking.id,
      bookingNumber: booking.bookingNumber,
      userId: booking.userId,
      testId: booking.testId,
      packageId: booking.packageId,
      bookingType: booking.bookingType,
      patientName: booking.patientName,
      patientAge: booking.patientAge,
      patientGender: booking.patientGender,
      patientPhone: booking.patientPhone,
      patientEmail: booking.patientEmail,
      collectionType: booking.collectionType,
      collectionDate: booking.collectionDate,
      collectionTime: booking.collectionTime,
      collectionAddress: booking.collectionAddress,
      collectionAddressLine: booking.collectionAddressLine,
      collectionCity: booking.collectionCity,
      collectionState: booking.collectionState,
      collectionPincode: booking.collectionPincode,
      collectionLandmark: booking.collectionLandmark,
      labId: booking.labId,
      labName: booking.labName,
      labAddress: booking.labAddress,
      testPrice: booking.testPrice,
      homeCollectionFee: booking.homeCollectionFee,
      totalAmount: booking.totalAmount,
      discountAmount: booking.discountAmount,
      finalAmount: booking.finalAmount,
      paymentStatus: booking.paymentStatus,
      paymentMethod: booking.paymentMethod,
      paymentId: booking.paymentId,
      paidAt: booking.paidAt,
      status: booking.status,
      sampleCollectedAt: booking.sampleCollectedAt,
      sampleReceivedAt: booking.sampleReceivedAt,
      reportGeneratedAt: booking.reportGeneratedAt,
      reportDeliveredAt: booking.reportDeliveredAt,
      sampleId: booking.sampleId,
      sampleBarcode: booking.sampleBarcode,
      sampleType: booking.sampleType,
      sampleCollectedBy: booking.sampleCollectedBy,
      sampleCollectionNotes: booking.sampleCollectionNotes,
      reportUrl: booking.reportUrl,
      reportPdfUrl: booking.reportPdfUrl,
      reportGeneratedBy: booking.reportGeneratedBy,
      reportNotes: booking.reportNotes,
      reportStatus: booking.reportStatus,
      prescriptionRequired: booking.prescriptionRequired,
      prescriptionUrl: booking.prescriptionUrl,
      prescriptionVerified: booking.prescriptionVerified,
      specialInstructions: booking.specialInstructions,
      doctorNotes: booking.doctorNotes,
      cancelledAt: booking.cancelledAt,
      cancellationReason: booking.cancellationReason,
      cancelledBy: booking.cancelledBy,
      refundAmount: booking.refundAmount,
      refundStatus: booking.refundStatus,
      refundedAt: booking.refundedAt,
      rating: booking.rating,
      feedback: booking.feedback,
      ratedAt: booking.ratedAt,
      createdAt: booking.createdAt,
      updatedAt: booking.updatedAt,
      test: booking.test,
      package: booking.package,
      user: booking.user,
    };
  }
}
