import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { EmailService } from './email.service';
import { AuditLog } from '../../common/decorators/audit-log.decorator';

@ApiTags('Email')
@Controller('email')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class EmailController {
  constructor(private readonly emailService: EmailService) {}

  @Post('send')
  @ApiOperation({ summary: 'Send custom email' })
  @AuditLog('SEND_EMAIL', 'email')
  async sendEmail(@Body() body: { to: string; subject: string; html: string }) {
    return this.emailService.sendEmail(body.to, body.subject, body.html);
  }

  @Post('welcome')
  @ApiOperation({ summary: 'Send welcome email' })
  @AuditLog('SEND_WELCOME_EMAIL', 'email')
  async sendWelcomeEmail(@Body() body: { to: string; name: string }) {
    return this.emailService.sendWelcomeEmail(body.to, body.name);
  }

  @Post('order-confirmation')
  @ApiOperation({ summary: 'Send order confirmation email' })
  @AuditLog('SEND_ORDER_CONFIRMATION', 'email')
  async sendOrderConfirmation(@Body() body: any) {
    return this.emailService.sendOrderConfirmation(body.to, body.orderData);
  }

  @Post('payment-confirmation')
  @ApiOperation({ summary: 'Send payment confirmation email' })
  @AuditLog('SEND_PAYMENT_CONFIRMATION', 'email')
  async sendPaymentConfirmation(@Body() body: any) {
    return this.emailService.sendPaymentConfirmation(body.to, body.paymentData);
  }

  @Post('invoice')
  @ApiOperation({ summary: 'Send invoice email' })
  @AuditLog('SEND_INVOICE_EMAIL', 'email')
  async sendInvoice(@Body() body: any) {
    return this.emailService.sendInvoiceEmail(body.to, body.invoiceData);
  }
}
