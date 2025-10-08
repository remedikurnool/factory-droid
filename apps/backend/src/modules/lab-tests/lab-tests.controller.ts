import { Controller, Get, Post, Param, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { LabTestsService } from './lab-tests.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Lab Tests')
@Controller('lab-tests')
export class LabTestsController {
  constructor(private labTestsService: LabTestsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all lab tests' })
  async findAll() {
    return this.labTestsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get lab test by ID' })
  async findOne(@Param('id') id: string) {
    return this.labTestsService.findOne(id);
  }

  @Post('book')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Book lab test' })
  async bookTest(@CurrentUser() user: any, @Body() bookingData: any) {
    return this.labTestsService.bookTest(user.id, bookingData);
  }
}
