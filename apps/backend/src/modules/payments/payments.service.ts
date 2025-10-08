import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../database/prisma.service';
import Razorpay from 'razorpay';
import * as crypto from 'crypto';

@Injectable()
export class PaymentsService {
  private razorpay: Razorpay;
  private readonly logger = new Logger(PaymentsService.name);

  constructor(
    private prisma: PrismaService,
    private configService: ConfigService
  ) {
    this.razorpay = new Razorpay({
      key_id: this.configService.get('RAZORPAY_KEY_ID'),
      key_secret: this.configService.get('RAZORPAY_KEY_SECRET'),
    });
  }

  async createOrder(userId: string, orderId: string, amount: number) {
    try {
      // Create Razorpay order
      const razorpayOrder = await this.razorpay.orders.create({
        amount: amount * 100, // Convert to paise
        currency: 'INR',
        receipt: `order_${orderId}`,
        notes: {
          userId,
          orderId,
        },
      });

      // Create payment record in database
      const payment = await this.prisma.payment.create({
        data: {
          orderId,
          userId,
          amount,
          method: 'RAZORPAY',
          status: 'PENDING',
          razorpayOrderId: razorpayOrder.id,
          currency: 'INR',
        },
      });

      return {
        payment,
        razorpayOrder: {
          id: razorpayOrder.id,
          amount: razorpayOrder.amount,
          currency: razorpayOrder.currency,
        },
      };
    } catch (error) {
      this.logger.error('Error creating Razorpay order', error);
      throw new BadRequestException('Failed to create payment order');
    }
  }

  async verifyPayment(
    razorpayOrderId: string,
    razorpayPaymentId: string,
    razorpaySignature: string
  ) {
    try {
      // Verify signature
      const text = `${razorpayOrderId}|${razorpayPaymentId}`;
      const secret = this.configService.get('RAZORPAY_KEY_SECRET');
      const generatedSignature = crypto.createHmac('sha256', secret).update(text).digest('hex');

      if (generatedSignature !== razorpaySignature) {
        throw new BadRequestException('Invalid payment signature');
      }

      // Update payment status
      const payment = await this.prisma.payment.update({
        where: { razorpayOrderId },
        data: {
          status: 'COMPLETED',
          razorpayPaymentId,
          razorpaySignature,
          paidAt: new Date(),
        },
      });

      // Update order status
      await this.prisma.order.update({
        where: { id: payment.orderId },
        data: { status: 'CONFIRMED' },
      });

      return payment;
    } catch (error) {
      this.logger.error('Error verifying payment', error);
      throw new BadRequestException('Payment verification failed');
    }
  }

  async handleWebhook(payload: any, signature: string) {
    try {
      // Verify webhook signature
      const secret = this.configService.get('RAZORPAY_WEBHOOK_SECRET');
      const expectedSignature = crypto
        .createHmac('sha256', secret)
        .update(JSON.stringify(payload))
        .digest('hex');

      if (expectedSignature !== signature) {
        throw new BadRequestException('Invalid webhook signature');
      }

      const event = payload.event;
      const paymentEntity = payload.payload.payment.entity;

      switch (event) {
        case 'payment.captured':
          await this.handlePaymentCaptured(paymentEntity);
          break;
        case 'payment.failed':
          await this.handlePaymentFailed(paymentEntity);
          break;
        default:
          this.logger.log(`Unhandled webhook event: ${event}`);
      }

      return { success: true };
    } catch (error) {
      this.logger.error('Error handling webhook', error);
      throw new BadRequestException('Webhook processing failed');
    }
  }

  private async handlePaymentCaptured(paymentEntity: any) {
    await this.prisma.payment.update({
      where: { razorpayPaymentId: paymentEntity.id },
      data: {
        status: 'COMPLETED',
        paidAt: new Date(paymentEntity.created_at * 1000),
      },
    });
  }

  private async handlePaymentFailed(paymentEntity: any) {
    await this.prisma.payment.update({
      where: { razorpayPaymentId: paymentEntity.id },
      data: {
        status: 'FAILED',
        failureReason: paymentEntity.error_description,
      },
    });
  }

  async getPaymentById(paymentId: string) {
    return this.prisma.payment.findUnique({
      where: { id: paymentId },
      include: {
        order: true,
        user: {
          select: { id: true, name: true, email: true },
        },
      },
    });
  }

  async getUserPayments(userId: string) {
    return this.prisma.payment.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        order: true,
      },
    });
  }

  async initiateRefund(paymentId: string, amount?: number) {
    try {
      const payment = await this.prisma.payment.findUnique({
        where: { id: paymentId },
      });

      if (!payment || payment.status !== 'COMPLETED') {
        throw new BadRequestException('Invalid payment for refund');
      }

      const refundAmount = amount || payment.amount;

      const refund = await this.razorpay.payments.refund(payment.razorpayPaymentId, {
        amount: refundAmount * 100, // Convert to paise
      });

      // Update payment status
      await this.prisma.payment.update({
        where: { id: paymentId },
        data: {
          status: 'REFUNDED',
          refundAmount,
          refundId: refund.id,
        },
      });

      return refund;
    } catch (error) {
      this.logger.error('Error initiating refund', error);
      throw new BadRequestException('Refund initiation failed');
    }
  }
}
