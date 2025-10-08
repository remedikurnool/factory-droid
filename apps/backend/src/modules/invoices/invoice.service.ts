import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import * as PDFDocument from 'pdfkit';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class InvoiceService {
  private readonly logger = new Logger(InvoiceService.name);
  private readonly invoicesPath = './invoices';

  constructor(private prisma: PrismaService) {
    // Ensure invoices directory exists
    if (!fs.existsSync(this.invoicesPath)) {
      fs.mkdirSync(this.invoicesPath, { recursive: true });
    }
  }

  async generateInvoice(orderId: string): Promise<string> {
    try {
      // Fetch order with all details
      const order = await this.prisma.order.findUnique({
        where: { id: orderId },
        include: {
          user: true,
          items: {
            include: {
              medicine: true,
            },
          },
          address: true,
          payment: true,
        },
      });

      if (!order) {
        throw new BadRequestException('Order not found');
      }

      const invoiceNumber = `INV-${order.orderNumber}`;
      const fileName = `${invoiceNumber}.pdf`;
      const filePath = path.join(this.invoicesPath, fileName);

      // Create PDF
      const doc = new PDFDocument({ margin: 50 });
      const stream = fs.createWriteStream(filePath);
      doc.pipe(stream);

      // Header
      this.addHeader(doc);

      // Invoice details
      this.addInvoiceDetails(doc, order, invoiceNumber);

      // Billing details
      this.addBillingDetails(doc, order);

      // Items table
      this.addItemsTable(doc, order);

      // Totals
      this.addTotals(doc, order);

      // Footer
      this.addFooter(doc);

      doc.end();

      // Wait for PDF generation to complete
      await new Promise((resolve, reject) => {
        stream.on('finish', resolve);
        stream.on('error', reject);
      });

      // Save invoice record in database
      await this.prisma.invoice.create({
        data: {
          orderId,
          invoiceNumber,
          filePath: `/invoices/${fileName}`,
          generatedAt: new Date(),
        },
      });

      return `/invoices/${fileName}`;
    } catch (error) {
      this.logger.error('Error generating invoice', error);
      throw new BadRequestException('Failed to generate invoice');
    }
  }

  private addHeader(doc: PDFKit.PDFDocument) {
    doc
      .fontSize(20)
      .text('ONE MEDI', 50, 50)
      .fontSize(10)
      .text('Your Healthcare Partner', 50, 75)
      .text('Email: contact@onemedi.com', 50, 90)
      .text('Phone: +91 1234567890', 50, 105)
      .moveDown(2);
  }

  private addInvoiceDetails(doc: PDFKit.PDFDocument, order: any, invoiceNumber: string) {
    doc
      .fontSize(16)
      .text('INVOICE', 400, 50)
      .fontSize(10)
      .text(`Invoice #: ${invoiceNumber}`, 400, 75)
      .text(`Order #: ${order.orderNumber}`, 400, 90)
      .text(`Date: ${order.createdAt.toLocaleDateString()}`, 400, 105)
      .text(`Status: ${order.status}`, 400, 120)
      .moveDown(2);
  }

  private addBillingDetails(doc: PDFKit.PDFDocument, order: any) {
    doc
      .fontSize(12)
      .text('Bill To:', 50, 160)
      .fontSize(10)
      .text(order.user.name, 50, 180)
      .text(order.user.email, 50, 195)
      .text(order.user.phone, 50, 210);

    if (order.address) {
      doc
        .text(order.address.street, 50, 225)
        .text(`${order.address.city}, ${order.address.state} ${order.address.pincode}`, 50, 240);
    }

    doc.moveDown(2);
  }

  private addItemsTable(doc: PDFKit.PDFDocument, order: any) {
    const tableTop = 300;
    const itemCodeX = 50;
    const descriptionX = 150;
    const quantityX = 350;
    const priceX = 420;
    const amountX = 490;

    // Table header
    doc
      .fontSize(10)
      .font('Helvetica-Bold')
      .text('Item', itemCodeX, tableTop)
      .text('Description', descriptionX, tableTop)
      .text('Qty', quantityX, tableTop)
      .text('Price', priceX, tableTop)
      .text('Amount', amountX, tableTop);

    doc
      .moveTo(50, tableTop + 15)
      .lineTo(550, tableTop + 15)
      .stroke();

    // Table rows
    let y = tableTop + 25;
    doc.font('Helvetica');

    order.items.forEach((item: any) => {
      doc
        .text(item.medicine.name.substring(0, 15), itemCodeX, y)
        .text(item.medicine.name, descriptionX, y, { width: 180 })
        .text(item.quantity.toString(), quantityX, y)
        .text(`₹${item.price.toFixed(2)}`, priceX, y)
        .text(`₹${(item.quantity * item.price).toFixed(2)}`, amountX, y);

      y += 25;
    });

    doc.moveTo(50, y).lineTo(550, y).stroke();

    return y + 10;
  }

  private addTotals(doc: PDFKit.PDFDocument, order: any) {
    const y = 550;

    doc
      .fontSize(10)
      .text('Subtotal:', 400, y)
      .text(`₹${order.subtotal.toFixed(2)}`, 490, y);

    if (order.discount > 0) {
      doc.text('Discount:', 400, y + 20).text(`-₹${order.discount.toFixed(2)}`, 490, y + 20);
    }

    if (order.deliveryCharge > 0) {
      doc
        .text('Delivery Charge:', 400, y + 40)
        .text(`₹${order.deliveryCharge.toFixed(2)}`, 490, y + 40);
    }

    doc
      .font('Helvetica-Bold')
      .fontSize(12)
      .text('Total Amount:', 400, y + 60)
      .text(`₹${order.total.toFixed(2)}`, 490, y + 60);

    doc.font('Helvetica').fontSize(10);

    // Payment status
    if (order.payment) {
      doc.text('Payment Status:', 400, y + 85).text(order.payment.status, 490, y + 85);
    }
  }

  private addFooter(doc: PDFKit.PDFDocument) {
    doc
      .fontSize(10)
      .text('Thank you for your business!', 50, 700, { align: 'center', width: 500 })
      .text('For any queries, contact us at support@onemedi.com', 50, 720, {
        align: 'center',
        width: 500,
      });
  }

  async getInvoiceByOrderId(orderId: string) {
    return this.prisma.invoice.findFirst({
      where: { orderId },
      include: {
        order: {
          include: {
            user: {
              select: { id: true, name: true, email: true },
            },
          },
        },
      },
    });
  }

  async getInvoiceFile(filePath: string): Promise<Buffer> {
    try {
      const fullPath = path.join(this.invoicesPath, path.basename(filePath));
      return await fs.promises.readFile(fullPath);
    } catch (error) {
      this.logger.error('Error reading invoice file', error);
      throw new BadRequestException('Invoice file not found');
    }
  }
}
