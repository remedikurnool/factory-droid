import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CartService } from './cart.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Cart')
@Controller('cart')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class CartController {
  constructor(private cartService: CartService) {}

  @Get()
  @ApiOperation({ summary: 'Get user cart' })
  async getCart(@CurrentUser() user: any) {
    return this.cartService.getCart(user.id);
  }

  @Post('items')
  @ApiOperation({ summary: 'Add item to cart' })
  async addItem(@CurrentUser() user: any, @Body() data: any) {
    return this.cartService.addItem(user.id, data);
  }

  @Put('items/:id')
  @ApiOperation({ summary: 'Update cart item' })
  async updateItem(@CurrentUser() user: any, @Param('id') itemId: string, @Body() data: any) {
    return this.cartService.updateItem(user.id, itemId, data.quantity);
  }

  @Delete('items/:id')
  @ApiOperation({ summary: 'Remove item from cart' })
  async removeItem(@CurrentUser() user: any, @Param('id') itemId: string) {
    return this.cartService.removeItem(user.id, itemId);
  }

  @Delete()
  @ApiOperation({ summary: 'Clear cart' })
  async clearCart(@CurrentUser() user: any) {
    return this.cartService.clearCart(user.id);
  }
}
