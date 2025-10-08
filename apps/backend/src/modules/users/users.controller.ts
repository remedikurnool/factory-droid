import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';

@ApiTags('Users')
@Controller('users')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get('profile')
  @ApiOperation({ summary: 'Get current user profile' })
  async getProfile(@CurrentUser() user: any) {
    return this.usersService.findById(user.id);
  }

  @Put('profile')
  @ApiOperation({ summary: 'Update current user profile' })
  async updateProfile(@CurrentUser() user: any, @Body() data: any) {
    return this.usersService.updateProfile(user.id, data);
  }

  @Get('addresses')
  @ApiOperation({ summary: 'Get user addresses' })
  async getAddresses(@CurrentUser() user: any) {
    return this.usersService.getAddresses(user.id);
  }

  @Post('addresses')
  @ApiOperation({ summary: 'Add new address' })
  async addAddress(@CurrentUser() user: any, @Body() addressData: any) {
    return this.usersService.addAddress(user.id, addressData);
  }

  @Put('addresses/:id')
  @ApiOperation({ summary: 'Update address' })
  async updateAddress(
    @CurrentUser() user: any,
    @Param('id') addressId: string,
    @Body() addressData: any
  ) {
    return this.usersService.updateAddress(user.id, addressId, addressData);
  }

  @Delete('addresses/:id')
  @ApiOperation({ summary: 'Delete address' })
  async deleteAddress(@CurrentUser() user: any, @Param('id') addressId: string) {
    return this.usersService.deleteAddress(user.id, addressId);
  }

  @Get()
  @UseGuards(RolesGuard)
  @Roles('admin', 'staff')
  @ApiOperation({ summary: 'Get all users (Admin only)' })
  async getAllUsers(@Query('page') page: number, @Query('limit') limit: number) {
    return this.usersService.findAll(page, limit);
  }
}
