import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { SmsService } from './sms.service';
import { AuditLog } from '../../common/decorators/audit-log.decorator';

@ApiTags('SMS')
@Controller('sms')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class SmsController {
  constructor(private readonly smsService: SmsService) {}

  @Post('send')
  @ApiOperation({ summary: 'Send SMS' })
  @AuditLog('SEND_SMS', 'sms')
  async sendSms(@Body() body: { to: string; message: string }) {
    return this.smsService.sendSms(body.to, body.message);
  }

  @Post('otp')
  @ApiOperation({ summary: 'Send OTP SMS' })
  @AuditLog('SEND_OTP_SMS', 'sms')
  async sendOtp(@Body() body: { to: string; otp: string; expiresIn: number }) {
    return this.smsService.sendOtpSms(body.to, body.otp, body.expiresIn);
  }

  @Post('order-confirmation')
  @ApiOperation({ summary: 'Send order confirmation SMS' })
  @AuditLog('SEND_ORDER_SMS', 'sms')
  async sendOrderConfirmation(@Body() body: { to: string; orderNumber: string; total: number }) {
    return this.smsService.sendOrderConfirmationSms(body.to, body.orderNumber, body.total);
  }

  @Post('appointment-confirmation')
  @ApiOperation({ summary: 'Send appointment confirmation SMS' })
  @AuditLog('SEND_APPOINTMENT_SMS', 'sms')
  async sendAppointmentConfirmation(@Body() body: any) {
    return this.smsService.sendAppointmentConfirmationSms(
      body.to,
      body.doctorName,
      body.date,
      body.time,
      body.bookingId
    );
  }
}
