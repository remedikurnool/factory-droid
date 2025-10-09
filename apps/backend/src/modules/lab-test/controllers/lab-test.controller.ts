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
import { LabTestService } from '../services/lab-test.service';
import {
  CreateLabTestDto,
  UpdateLabTestDto,
  SearchLabTestsDto,
  LabTestResponseDto,
  PaginatedLabTestsResponseDto,
} from '../dto/lab-test.dto';

@ApiTags('Lab Tests')
@Controller('lab-tests')
export class LabTestController {
  constructor(private readonly labTestService: LabTestService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'Create a new lab test' })
  @ApiResponse({
    status: 201,
    description: 'Test created successfully',
    type: LabTestResponseDto,
  })
  async create(@Body() dto: CreateLabTestDto): Promise<LabTestResponseDto> {
    return this.labTestService.create(dto);
  }

  @Get('search')
  @ApiOperation({ summary: 'Search and filter lab tests' })
  @ApiResponse({
    status: 200,
    description: 'Tests retrieved successfully',
    type: PaginatedLabTestsResponseDto,
  })
  async search(
    @Query() dto: SearchLabTestsDto,
  ): Promise<PaginatedLabTestsResponseDto> {
    return this.labTestService.search(dto);
  }

  @Get('popular')
  @ApiOperation({ summary: 'Get popular lab tests' })
  @ApiResponse({
    status: 200,
    description: 'Popular tests retrieved successfully',
    type: [LabTestResponseDto],
  })
  async getPopular(
    @Query('limit') limit?: number,
  ): Promise<LabTestResponseDto[]> {
    return this.labTestService.getPopular(limit);
  }

  @Get('featured')
  @ApiOperation({ summary: 'Get featured lab tests' })
  @ApiResponse({
    status: 200,
    description: 'Featured tests retrieved successfully',
    type: [LabTestResponseDto],
  })
  async getFeatured(
    @Query('limit') limit?: number,
  ): Promise<LabTestResponseDto[]> {
    return this.labTestService.getFeatured(limit);
  }

  @Get('categories')
  @ApiOperation({ summary: 'Get all test categories with counts' })
  @ApiResponse({
    status: 200,
    description: 'Categories retrieved successfully',
  })
  async getCategories(): Promise<Array<{ category: string; count: number }>> {
    return this.labTestService.getCategories();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get lab test by ID' })
  @ApiResponse({
    status: 200,
    description: 'Test retrieved successfully',
    type: LabTestResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Test not found' })
  async findById(@Param('id') id: string): Promise<LabTestResponseDto> {
    return this.labTestService.findById(id);
  }

  @Get('slug/:slug')
  @ApiOperation({ summary: 'Get lab test by slug' })
  @ApiResponse({
    status: 200,
    description: 'Test retrieved successfully',
    type: LabTestResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Test not found' })
  async findBySlug(@Param('slug') slug: string): Promise<LabTestResponseDto> {
    return this.labTestService.findBySlug(slug);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'Update lab test' })
  @ApiResponse({
    status: 200,
    description: 'Test updated successfully',
    type: LabTestResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Test not found' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateLabTestDto,
  ): Promise<LabTestResponseDto> {
    return this.labTestService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete lab test' })
  @ApiResponse({ status: 204, description: 'Test deleted successfully' })
  @ApiResponse({ status: 404, description: 'Test not found' })
  async delete(@Param('id') id: string): Promise<void> {
    return this.labTestService.delete(id);
  }

  @Put(':id/toggle-status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'Toggle test active status' })
  @ApiResponse({
    status: 200,
    description: 'Test status toggled successfully',
    type: LabTestResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Test not found' })
  async toggleStatus(@Param('id') id: string): Promise<LabTestResponseDto> {
    return this.labTestService.toggleStatus(id);
  }

  @Get(':id/stats')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'Get test statistics' })
  @ApiResponse({
    status: 200,
    description: 'Statistics retrieved successfully',
  })
  @ApiResponse({ status: 404, description: 'Test not found' })
  async getStats(@Param('id') id: string): Promise<any> {
    return this.labTestService.getStats(id);
  }
}
