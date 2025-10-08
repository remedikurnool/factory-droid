import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { EmailService } from '../email/email.service';
import { SmsService } from '../sms/sms.service';

export interface NotificationPreferences {
  email: boolean;
  sms: boolean;
  push: boolean;
  orderUpdates: boolean;
  appointmentReminders: boolean;
  promotions: boolean;
  labResults: boolean;
}

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    private prisma: PrismaService,
    private emailService: EmailService,
    private smsService: SmsService
  ) {}

  // Get user notification preferences
  async getUserPreferences(userId: string): Promise<NotificationPreferences> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { notificationPreferences: true },
    });

    return (
      user?.notificationPreferences || {
        email: true,
        sms: true,
        push: false,
        orderUpdates: true,
        appointmentReminders: true,
        promotions: false,
        labResults: true,
      }
    );
  }

  // Update user notification preferences
  async updateUserPreferences(userId: string, preferences: Partial<NotificationPreferences>) {
    return this.prisma.user.update({
      where: { id: userId },
      data: {
        notificationPreferences: preferences,
      },
    });
  }

  // Send multi-channel notification
  async sendNotification(userId: string, type: string, data: any) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        throw new Error('User not found');
      }

      const preferences = await this.getUserPreferences(userId);
      const results = {
        email: null,
        sms: null,
        push: null,
      };

      // Send email if enabled
      if (preferences.email) {
        results.email = await this.sendEmailNotification(user.email, type, data);
      }

      // Send SMS if enabled
      if (preferences.sms && user.phone) {
        results.sms = await this.sendSmsNotification(user.phone, type, data);
      }

      // Log notification
      await this.logNotification(userId, type, results);

      return results;
    } catch (error) {
      this.logger.error(`Failed to send notification to user ${userId}`, error);
      throw error;
    }
  }

  private async sendEmailNotification(email: string, type: string, data: any) {
    switch (type) {
      case 'ORDER_CONFIRMATION':
        return this.emailService.sendOrderConfirmation(email, data);
      case 'PAYMENT_CONFIRMATION':
        return this.emailService.sendPaymentConfirmation(email, data);
      case 'ORDER_STATUS':
        return this.emailService.sendOrderStatusUpdate(email, data);
      case 'DELIVERY_NOTIFICATION':
        return this.emailService.sendDeliveryNotification(email, data);
      case 'APPOINTMENT_CONFIRMATION':
        return this.emailService.sendAppointmentConfirmation(email, data);
      case 'APPOINTMENT_REMINDER':
        return this.emailService.sendAppointmentReminder(email, data);
      case 'LAB_RESULTS':
        return this.emailService.sendLabResultsReady(email, data);
      case 'INVOICE':
        return this.emailService.sendInvoiceEmail(email, data);
      case 'REFUND':
        return this.emailService.sendRefundConfirmation(email, data);
      case 'WELCOME':
        return this.emailService.sendWelcomeEmail(email, data.name);
      default:
        this.logger.warn(`Unknown email notification type: ${type}`);
        return null;
    }
  }

  private async sendSmsNotification(phone: string, type: string, data: any) {
    switch (type) {
      case 'ORDER_CONFIRMATION':
        return this.smsService.sendOrderConfirmationSms(phone, data.orderNumber, data.total);
      case 'PAYMENT_CONFIRMATION':
        return this.smsService.sendPaymentConfirmationSms(
          phone,
          data.orderNumber,
          data.amount,
          data.transactionId
        );
      case 'ORDER_STATUS':
        return this.smsService.sendOrderStatusSms(phone, data.orderNumber, data.status);
      case 'DELIVERY_NOTIFICATION':
        return this.smsService.sendDeliveryNotificationSms(
          phone,
          data.orderNumber,
          data.deliveryAgent,
          data.deliveryAgentPhone,
          data.estimatedTime
        );
      case 'APPOINTMENT_CONFIRMATION':
        return this.smsService.sendAppointmentConfirmationSms(
          phone,
          data.doctorName,
          data.date,
          data.time,
          data.bookingId
        );
      case 'APPOINTMENT_REMINDER':
        return this.smsService.sendAppointmentReminderSms(
          phone,
          data.doctorName,
          data.time,
          data.location
        );
      case 'LAB_RESULTS':
        return this.smsService.sendLabResultsReadySms(phone, data.testName, data.bookingId);
      case 'REFUND':
        return this.smsService.sendRefundConfirmationSms(
          phone,
          data.orderNumber,
          data.amount,
          data.estimatedDays
        );
      default:
        this.logger.warn(`Unknown SMS notification type: ${type}`);
        return null;
    }
  }

  private async logNotification(userId: string, type: string, results: any) {
    try {
      await this.prisma.notificationLog.create({
        data: {
          userId,
          type,
          channels: Object.keys(results).filter((k) => results[k] !== null),
          status: 'SENT',
          metadata: results,
          sentAt: new Date(),
        },
      });
    } catch (error) {
      this.logger.error('Failed to log notification', error);
    }
  }

  // Get user notification history
  async getNotificationHistory(userId: string, limit = 50) {
    return this.prisma.notificationLog.findMany({
      where: { userId },
      orderBy: { sentAt: 'desc' },
      take: limit,
    });
  }

  // Batch send notifications
  async sendBatchNotifications(
    notifications: Array<{
      userId: string;
      type: string;
      data: any;
    }>
  ) {
    const results = await Promise.allSettled(
      notifications.map((notif) => this.sendNotification(notif.userId, notif.type, notif.data))
    );

    return {
      total: notifications.length,
      successful: results.filter((r) => r.status === 'fulfilled').length,
      failed: results.filter((r) => r.status === 'rejected').length,
      results,
    };
  }
}
