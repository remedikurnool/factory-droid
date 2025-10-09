import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '@/shared/guards/jwt-auth.guard';
import { RolesGuard } from '@/shared/guards/roles.guard';
import { Roles } from '@/shared/decorators/roles.decorator';
import { LabPackageService } from '../services/lab-package.service';
import {
  CreateLabPackageDto,
  UpdateLabPackageDto,
  AddTestsToPackageDto,
  RemoveTestsFromPackageDto,
  SearchLabPackagesDto,
  LabPackageResponseDto,
  PaginatedLabPackagesResponseDto,
} from '../dto/lab-package.dto';

@ApiTags('Lab Packages')
@Controller('lab-packages')
export class LabPackageController {
  constructor(private readonly labPackageService: LabPackageService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'Create a new lab package' })
  @ApiResponse({
    status: 201,
    description: 'Package created successfully',
    type: LabPackageResponseDto,
  })
  async create(
    @Body() dto: CreateLabPackageDto,
  ): Promise<LabPackageResponseDto> {
    return this.labPackageService.create(dto);
  }

  @Get('search')
  @ApiOperation({ summary: 'Search and filter lab packages' })
  @ApiResponse({
    status: 200,
    description: 'Packages retrieved successfully',
    type: PaginatedLabPackagesResponseDto,
  })
  async search(
    @Query() dto: SearchLabPackagesDto,
  ): Promise<PaginatedLabPackagesResponseDto> {
    return this.labPackageService.search(dto);
  }

  @Get('popular')
  @ApiOperation({ summary: 'Get popular lab packages' })
  @ApiResponse({
    status: 200,
    description: 'Popular packages retrieved successfully',
    type: [LabPackageResponseDto],
  })
  async getPopular(
    @Query('limit') limit?: number,
  ): Promise<LabPackageResponseDto[]> {
    return this.labPackageService.getPopular(limit);
  }

  @Get('featured')
  @ApiOperation({ summary: 'Get featured lab packages' })
  @ApiResponse({
    status: 200,
    description: 'Featured packages retrieved successfully',
    type: [LabPackageResponseDto],
  })
  async getFeatured(
    @Query('limit') limit?: number,
  ): Promise<LabPackageResponseDto[]> {
    return this.labPackageService.getFeatured(limit);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get lab package by ID' })
  @ApiResponse({
    status: 200,
    description: 'Package retrieved successfully',
    type: LabPackageResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Package not found' })
  async findById(@Param('id') id: string): Promise<LabPackageResponseDto> {
    return this.labPackageService.findById(id);
  }

  @Get('slug/:slug')
  @ApiOperation({ summary: 'Get lab package by slug' })
  @ApiResponse({
    status: 200,
    description: 'Package retrieved successfully',
    type: LabPackageResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Package not found' })
  async findBySlug(
    @Param('slug') slug: string,
  ): Promise<LabPackageResponseDto> {
    return this.labPackageService.findBySlug(slug);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'Update lab package' })
  @ApiResponse({
    status: 200,
    description: 'Package updated successfully',
    type: LabPackageResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Package not found' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateLabPackageDto,
  ): Promise<LabPackageResponseDto> {
    return this.labPackageService.update(id, dto);
  }

  @Put(':id/tests')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'Add tests to package' })
  @ApiResponse({
    status: 200,
    description: 'Tests added successfully',
    type: LabPackageResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Package not found' })
  async addTests(
    @Param('id') id: string,
    @Body() dto: AddTestsToPackageDto,
  ): Promise<LabPackageResponseDto> {
    return this.labPackageService.addTests(id, dto);
  }

  @Delete(':id/tests')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'Remove tests from package' })
  @ApiResponse({
    status: 200,
    description: 'Tests removed successfully',
    type: LabPackageResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Package not found' })
  async removeTests(
    @Param('id') id: string,
    @Body() dto: RemoveTestsFromPackageDto,
  ): Promise<LabPackageResponseDto> {
    return this.labPackageService.removeTests(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete lab package' })
  @ApiResponse({ status: 204, description: 'Package deleted successfully' })
  @ApiResponse({ status: 404, description: 'Package not found' })
  async delete(@Param('id') id: string): Promise<void> {
    return this.labPackageService.delete(id);
  }

  @Put(':id/toggle-status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'Toggle package active status' })
  @ApiResponse({
    status: 200,
    description: 'Package status toggled successfully',
    type: LabPackageResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Package not found' })
  async toggleStatus(
    @Param('id') id: string,
  ): Promise<LabPackageResponseDto> {
    return this.labPackageService.toggleStatus(id);
  }

  @Get(':id/stats')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'Get package statistics' })
  @ApiResponse({
    status: 200,
    description: 'Statistics retrieved successfully',
  })
  @ApiResponse({ status: 404, description: 'Package not found' })
  async getStats(@Param('id') id: string): Promise<any> {
    return this.labPackageService.getStats(id);
  }
}
