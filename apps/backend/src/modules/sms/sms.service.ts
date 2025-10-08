import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Twilio } from 'twilio';

@Injectable()
export class SmsService {
  private client: Twilio;
  private readonly logger = new Logger(SmsService.name);
  private readonly fromNumber: string;

  constructor(private configService: ConfigService) {
    const accountSid = this.configService.get('TWILIO_ACCOUNT_SID');
    const authToken = this.configService.get('TWILIO_AUTH_TOKEN');
    this.fromNumber = this.configService.get('TWILIO_PHONE_NUMBER');

    if (accountSid && authToken) {
      this.client = new Twilio(accountSid, authToken);
      this.logger.log('Twilio SMS service initialized');
    } else {
      this.logger.warn('Twilio credentials not configured');
    }
  }

  async sendSms(to: string, message: string) {
    try {
      if (!this.client) {
        throw new Error('Twilio client not initialized');
      }

      const result = await this.client.messages.create({
        body: message,
        from: this.fromNumber,
        to,
      });

      this.logger.log(`SMS sent to ${to}: ${result.sid}`);
      return { success: true, sid: result.sid, status: result.status };
    } catch (error) {
      this.logger.error(`Failed to send SMS to ${to}`, error);
      throw error;
    }
  }

  // Order confirmation SMS
  async sendOrderConfirmationSms(to: string, orderNumber: string, total: number) {
    const message = `ONE MEDI: Your order #${orderNumber} has been confirmed! Total: ₹${total}. Track your order at https://onemedi.com/orders/${orderNumber}`;
    return this.sendSms(to, message);
  }

  // Payment confirmation SMS
  async sendPaymentConfirmationSms(
    to: string,
    orderNumber: string,
    amount: number,
    transactionId: string
  ) {
    const message = `ONE MEDI: Payment of ₹${amount} received for order #${orderNumber}. Transaction ID: ${transactionId}`;
    return this.sendSms(to, message);
  }

  // Order status update SMS
  async sendOrderStatusSms(to: string, orderNumber: string, status: string) {
    const statusMessages = {
      CONFIRMED: 'confirmed and is being processed',
      PROCESSING: 'being prepared',
      SHIPPED: 'shipped and on its way',
      OUT_FOR_DELIVERY: 'out for delivery',
      DELIVERED: 'delivered successfully',
      CANCELLED: 'cancelled',
    };

    const message = `ONE MEDI: Your order #${orderNumber} is ${statusMessages[status] || status}. Track at https://onemedi.com/orders/${orderNumber}`;
    return this.sendSms(to, message);
  }

  // Delivery notification SMS
  async sendDeliveryNotificationSms(
    to: string,
    orderNumber: string,
    agentName: string,
    agentPhone: string,
    estimatedTime: string
  ) {
    const message = `ONE MEDI: Your order #${orderNumber} is out for delivery! Delivery agent: ${agentName} (${agentPhone}). ETA: ${estimatedTime}`;
    return this.sendSms(to, message);
  }

  // Appointment confirmation SMS
  async sendAppointmentConfirmationSms(
    to: string,
    doctorName: string,
    date: string,
    time: string,
    bookingId: string
  ) {
    const message = `ONE MEDI: Appointment confirmed with Dr. ${doctorName} on ${date} at ${time}. Booking ID: ${bookingId}`;
    return this.sendSms(to, message);
  }

  // Appointment reminder SMS
  async sendAppointmentReminderSms(to: string, doctorName: string, time: string, location: string) {
    const message = `ONE MEDI: Reminder - Your appointment with Dr. ${doctorName} is tomorrow at ${time}. Location: ${location}`;
    return this.sendSms(to, message);
  }

  // OTP SMS
  async sendOtpSms(to: string, otp: string, expiresIn: number) {
    const message = `ONE MEDI: Your OTP is ${otp}. Valid for ${expiresIn} minutes. Do not share this code with anyone.`;
    return this.sendSms(to, message);
  }

  // Password reset SMS
  async sendPasswordResetSms(to: string, resetCode: string) {
    const message = `ONE MEDI: Your password reset code is ${resetCode}. Valid for 15 minutes.`;
    return this.sendSms(to, message);
  }

  // Lab results ready SMS
  async sendLabResultsReadySms(to: string, testName: string, bookingId: string) {
    const message = `ONE MEDI: Your ${testName} results are ready! View them at https://onemedi.com/lab-results/${bookingId}`;
    return this.sendSms(to, message);
  }

  // Refund confirmation SMS
  async sendRefundConfirmationSms(
    to: string,
    orderNumber: string,
    amount: number,
    estimatedDays: string
  ) {
    const message = `ONE MEDI: Refund of ₹${amount} initiated for order #${orderNumber}. Amount will be credited in ${estimatedDays}.`;
    return this.sendSms(to, message);
  }

  // Prescription reminder SMS
  async sendPrescriptionReminderSms(to: string, medicineName: string, frequency: string) {
    const message = `ONE MEDI: Reminder to take your medicine - ${medicineName}. Schedule: ${frequency}. Stay healthy!`;
    return this.sendSms(to, message);
  }
}
