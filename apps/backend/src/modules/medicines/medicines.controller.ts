import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { MedicinesService } from './medicines.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('Medicines')
@Controller('medicines')
export class MedicinesController {
  constructor(private medicinesService: MedicinesService) {}

  @Get()
  @ApiOperation({ summary: 'Get all medicines with filters' })
  async findAll(
    @Query('categoryId') categoryId?: string,
    @Query('brandId') brandId?: string,
    @Query('search') search?: string,
    @Query('isPrescriptionRequired') isPrescriptionRequired?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number
  ) {
    const filters = { categoryId, brandId, search, isPrescriptionRequired };
    return this.medicinesService.findAll(filters, page, limit);
  }

  @Get('featured')
  @ApiOperation({ summary: 'Get featured medicines' })
  async getFeatured() {
    return this.medicinesService.getFeatured();
  }

  @Get('categories')
  @ApiOperation({ summary: 'Get all medicine categories' })
  async getCategories() {
    return this.medicinesService.getCategories();
  }

  @Get('brands')
  @ApiOperation({ summary: 'Get all brands' })
  async getBrands() {
    return this.medicinesService.getBrands();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get medicine by ID' })
  async findOne(@Param('id') id: string) {
    return this.medicinesService.findOne(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'staff')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create new medicine (Admin only)' })
  async create(@Body() data: any) {
    return this.medicinesService.create(data);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'staff')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update medicine (Admin only)' })
  async update(@Param('id') id: string, @Body() data: any) {
    return this.medicinesService.update(id, data);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete medicine (Admin only)' })
  async delete(@Param('id') id: string) {
    return this.medicinesService.delete(id);
  }
}
