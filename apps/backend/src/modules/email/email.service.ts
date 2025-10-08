import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { Transporter } from 'nodemailer';
import * as fs from 'fs';
import * as path from 'path';
import * as handlebars from 'handlebars';

@Injectable()
export class EmailService {
  private transporter: Transporter;
  private readonly logger = new Logger(EmailService.name);
  private readonly templatesPath = path.join(__dirname, 'templates');

  constructor(private configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: this.configService.get('SMTP_HOST'),
      port: this.configService.get('SMTP_PORT', 587),
      secure: this.configService.get('SMTP_SECURE', false),
      auth: {
        user: this.configService.get('SMTP_USER'),
        pass: this.configService.get('SMTP_PASS'),
      },
    });

    // Verify connection
    this.verifyConnection();
  }

  private async verifyConnection() {
    try {
      await this.transporter.verify();
      this.logger.log('Email service connected successfully');
    } catch (error) {
      this.logger.error('Email service connection failed', error);
    }
  }

  private async loadTemplate(templateName: string): Promise<string> {
    try {
      const templatePath = path.join(this.templatesPath, `${templateName}.hbs`);
      return await fs.promises.readFile(templatePath, 'utf-8');
    } catch (error) {
      this.logger.error(`Failed to load template: ${templateName}`, error);
      throw new Error(`Template ${templateName} not found`);
    }
  }

  private compileTemplate(template: string, data: any): string {
    const compiledTemplate = handlebars.compile(template);
    return compiledTemplate(data);
  }

  async sendEmail(to: string, subject: string, html: string, text?: string) {
    try {
      const info = await this.transporter.sendMail({
        from: this.configService.get('SMTP_FROM', 'ONE MEDI <noreply@onemedi.com>'),
        to,
        subject,
        html,
        text: text || html.replace(/<[^>]*>/g, ''), // Strip HTML for text version
      });

      this.logger.log(`Email sent to ${to}: ${info.messageId}`);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      this.logger.error(`Failed to send email to ${to}`, error);
      throw error;
    }
  }

  async sendTemplateEmail(to: string, subject: string, templateName: string, data: any) {
    try {
      const template = await this.loadTemplate(templateName);
      const html = this.compileTemplate(template, data);
      return await this.sendEmail(to, subject, html);
    } catch (error) {
      this.logger.error(`Failed to send template email: ${templateName}`, error);
      throw error;
    }
  }

  // Welcome email
  async sendWelcomeEmail(to: string, name: string) {
    return this.sendTemplateEmail(to, 'Welcome to ONE MEDI', 'welcome', {
      name,
      year: new Date().getFullYear(),
    });
  }

  // Order confirmation email
  async sendOrderConfirmation(
    to: string,
    orderData: {
      orderNumber: string;
      customerName: string;
      items: Array<{ name: string; quantity: number; price: number }>;
      total: number;
      deliveryAddress: string;
      estimatedDelivery: string;
    }
  ) {
    return this.sendTemplateEmail(
      to,
      `Order Confirmed - #${orderData.orderNumber}`,
      'order-confirmation',
      orderData
    );
  }

  // Payment confirmation email
  async sendPaymentConfirmation(
    to: string,
    paymentData: {
      orderNumber: string;
      customerName: string;
      amount: number;
      paymentMethod: string;
      transactionId: string;
      date: string;
    }
  ) {
    return this.sendTemplateEmail(
      to,
      `Payment Received - Order #${paymentData.orderNumber}`,
      'payment-confirmation',
      paymentData
    );
  }

  // Order status update email
  async sendOrderStatusUpdate(
    to: string,
    statusData: {
      orderNumber: string;
      customerName: string;
      status: string;
      message: string;
      trackingUrl?: string;
    }
  ) {
    return this.sendTemplateEmail(
      to,
      `Order Update - #${statusData.orderNumber}`,
      'order-status',
      statusData
    );
  }

  // Delivery notification email
  async sendDeliveryNotification(
    to: string,
    deliveryData: {
      orderNumber: string;
      customerName: string;
      deliveryAgent: string;
      deliveryAgentPhone: string;
      estimatedTime: string;
      trackingUrl: string;
    }
  ) {
    return this.sendTemplateEmail(
      to,
      `Your order is out for delivery - #${deliveryData.orderNumber}`,
      'delivery-notification',
      deliveryData
    );
  }

  // Appointment confirmation email
  async sendAppointmentConfirmation(
    to: string,
    appointmentData: {
      patientName: string;
      doctorName: string;
      specialty: string;
      date: string;
      time: string;
      location: string;
      bookingId: string;
    }
  ) {
    return this.sendTemplateEmail(
      to,
      `Appointment Confirmed - ${appointmentData.doctorName}`,
      'appointment-confirmation',
      appointmentData
    );
  }

  // Appointment reminder email
  async sendAppointmentReminder(
    to: string,
    reminderData: {
      patientName: string;
      doctorName: string;
      date: string;
      time: string;
      location: string;
    }
  ) {
    return this.sendTemplateEmail(
      to,
      `Appointment Reminder - Tomorrow at ${reminderData.time}`,
      'appointment-reminder',
      reminderData
    );
  }

  // Lab test results ready email
  async sendLabResultsReady(
    to: string,
    labData: {
      patientName: string;
      testName: string;
      bookingId: string;
      downloadUrl: string;
    }
  ) {
    return this.sendTemplateEmail(to, 'Your Lab Test Results are Ready', 'lab-results', labData);
  }

  // Password reset email
  async sendPasswordReset(
    to: string,
    resetData: {
      name: string;
      resetUrl: string;
      expiresIn: string;
    }
  ) {
    return this.sendTemplateEmail(
      to,
      'Reset Your Password - ONE MEDI',
      'password-reset',
      resetData
    );
  }

  // Invoice email
  async sendInvoiceEmail(
    to: string,
    invoiceData: {
      customerName: string;
      orderNumber: string;
      invoiceNumber: string;
      amount: number;
      date: string;
      downloadUrl: string;
    }
  ) {
    return this.sendTemplateEmail(
      to,
      `Invoice #${invoiceData.invoiceNumber} - ONE MEDI`,
      'invoice',
      invoiceData
    );
  }

  // Refund confirmation email
  async sendRefundConfirmation(
    to: string,
    refundData: {
      customerName: string;
      orderNumber: string;
      amount: number;
      refundId: string;
      estimatedDays: string;
    }
  ) {
    return this.sendTemplateEmail(
      to,
      `Refund Initiated - Order #${refundData.orderNumber}`,
      'refund-confirmation',
      refundData
    );
  }
}
