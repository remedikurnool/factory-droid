import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '@/shared/guards/jwt-auth.guard';
import { RolesGuard } from '@/shared/guards/roles.guard';
import { Roles } from '@/shared/decorators/roles.decorator';
import { LabBookingService } from '../services/lab-booking.service';
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
} from '../dto/lab-booking.dto';

@ApiTags('Lab Bookings')
@Controller('lab-bookings')
@ApiBearerAuth()
export class LabBookingController {
  constructor(private readonly labBookingService: LabBookingService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Create a new lab booking' })
  @ApiResponse({
    status: 201,
    description: 'Booking created successfully',
    type: LabBookingResponseDto,
  })
  async create(
    @Request() req: any,
    @Body() dto: CreateLabBookingDto,
  ): Promise<LabBookingResponseDto> {
    return this.labBookingService.create(req.user.id, dto);
  }

  @Get('search')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Search bookings' })
  @ApiResponse({
    status: 200,
    description: 'Bookings retrieved successfully',
    type: PaginatedLabBookingsResponseDto,
  })
  async search(
    @Query() dto: SearchLabBookingsDto,
  ): Promise<PaginatedLabBookingsResponseDto> {
    return this.labBookingService.search(dto);
  }

  @Get('my-bookings')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get current user bookings' })
  @ApiResponse({
    status: 200,
    description: 'User bookings retrieved successfully',
    type: PaginatedLabBookingsResponseDto,
  })
  async getMyBookings(
    @Request() req: any,
    @Query() dto: SearchLabBookingsDto,
  ): Promise<PaginatedLabBookingsResponseDto> {
    return this.labBookingService.search({
      ...dto,
      userId: req.user.id,
    });
  }

  @Get('stats')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN', 'LAB_TECHNICIAN')
  @ApiOperation({ summary: 'Get booking statistics' })
  @ApiResponse({
    status: 200,
    description: 'Statistics retrieved successfully',
  })
  async getStats(@Query() filters: any): Promise<any> {
    return this.labBookingService.getStats(filters);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get booking by ID' })
  @ApiResponse({
    status: 200,
    description: 'Booking retrieved successfully',
    type: LabBookingResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Booking not found' })
  async findById(@Param('id') id: string): Promise<LabBookingResponseDto> {
    return this.labBookingService.findById(id);
  }

  @Get('number/:bookingNumber')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get booking by booking number' })
  @ApiResponse({
    status: 200,
    description: 'Booking retrieved successfully',
    type: LabBookingResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Booking not found' })
  async findByNumber(
    @Param('bookingNumber') bookingNumber: string,
  ): Promise<LabBookingResponseDto> {
    return this.labBookingService.findByNumber(bookingNumber);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN', 'LAB_TECHNICIAN')
  @ApiOperation({ summary: 'Update booking' })
  @ApiResponse({
    status: 200,
    description: 'Booking updated successfully',
    type: LabBookingResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Booking not found' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateLabBookingDto,
  ): Promise<LabBookingResponseDto> {
    return this.labBookingService.update(id, dto);
  }

  @Put(':id/confirm')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN', 'LAB_TECHNICIAN')
  @ApiOperation({ summary: 'Confirm booking' })
  @ApiResponse({
    status: 200,
    description: 'Booking confirmed successfully',
    type: LabBookingResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Booking not found' })
  async confirm(@Param('id') id: string): Promise<LabBookingResponseDto> {
    return this.labBookingService.confirm(id);
  }

  @Put(':id/sample')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN', 'LAB_TECHNICIAN')
  @ApiOperation({ summary: 'Add sample details' })
  @ApiResponse({
    status: 200,
    description: 'Sample details added successfully',
    type: LabBookingResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Booking not found' })
  async addSampleDetails(
    @Param('id') id: string,
    @Body() dto: AddSampleDetailsDto,
  ): Promise<LabBookingResponseDto> {
    return this.labBookingService.addSampleDetails(id, dto);
  }

  @Put(':id/report')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN', 'LAB_TECHNICIAN', 'DOCTOR')
  @ApiOperation({ summary: 'Add report' })
  @ApiResponse({
    status: 200,
    description: 'Report added successfully',
    type: LabBookingResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Booking not found' })
  async addReport(
    @Param('id') id: string,
    @Body() dto: AddReportDto,
  ): Promise<LabBookingResponseDto> {
    return this.labBookingService.addReport(id, dto);
  }

  @Put(':id/cancel')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Cancel booking' })
  @ApiResponse({
    status: 200,
    description: 'Booking cancelled successfully',
    type: LabBookingResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Booking not found' })
  async cancel(
    @Request() req: any,
    @Param('id') id: string,
    @Body() dto: CancelLabBookingDto,
  ): Promise<LabBookingResponseDto> {
    return this.labBookingService.cancel(id, req.user.id, dto);
  }

  @Put(':id/rate')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Rate booking' })
  @ApiResponse({
    status: 200,
    description: 'Booking rated successfully',
    type: LabBookingResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Booking not found' })
  async rate(
    @Request() req: any,
    @Param('id') id: string,
    @Body() dto: RateLabBookingDto,
  ): Promise<LabBookingResponseDto> {
    return this.labBookingService.rate(id, req.user.id, dto);
  }
}
