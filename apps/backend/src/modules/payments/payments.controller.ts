import { Controller, Post, Body, Get, Param, UseGuards, Headers, HttpCode } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PaymentsService } from './payments.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AuditLog } from '../../common/decorators/audit-log.decorator';

@ApiTags('Payments')
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('create-order')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create Razorpay payment order' })
  @AuditLog('CREATE_PAYMENT_ORDER', 'payment')
  async createOrder(@CurrentUser() user: any, @Body() body: { orderId: string; amount: number }) {
    return this.paymentsService.createOrder(user.id, body.orderId, body.amount);
  }

  @Post('verify')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Verify Razorpay payment' })
  @AuditLog('VERIFY_PAYMENT', 'payment')
  async verifyPayment(
    @Body()
    body: {
      razorpayOrderId: string;
      razorpayPaymentId: string;
      razorpaySignature: string;
    }
  ) {
    return this.paymentsService.verifyPayment(
      body.razorpayOrderId,
      body.razorpayPaymentId,
      body.razorpaySignature
    );
  }

  @Post('webhook')
  @HttpCode(200)
  @ApiOperation({ summary: 'Razorpay webhook handler' })
  async handleWebhook(@Body() payload: any, @Headers('x-razorpay-signature') signature: string) {
    return this.paymentsService.handleWebhook(payload, signature);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get payment by ID' })
  async getPayment(@Param('id') id: string) {
    return this.paymentsService.getPaymentById(id);
  }

  @Get('user/history')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get user payment history' })
  async getUserPayments(@CurrentUser() user: any) {
    return this.paymentsService.getUserPayments(user.id);
  }

  @Post('refund/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Initiate refund' })
  @AuditLog('INITIATE_REFUND', 'payment')
  async initiateRefund(@Param('id') paymentId: string, @Body() body?: { amount?: number }) {
    return this.paymentsService.initiateRefund(paymentId, body?.amount);
  }
}
