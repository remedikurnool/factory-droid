import { Controller, Post, Get, Param, UseGuards, Res } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Response } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { InvoiceService } from './invoice.service';
import { AuditLog } from '../../common/decorators/audit-log.decorator';

@ApiTags('Invoices')
@Controller('invoices')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class InvoiceController {
  constructor(private readonly invoiceService: InvoiceService) {}

  @Post('generate/:orderId')
  @ApiOperation({ summary: 'Generate invoice for order' })
  @AuditLog('GENERATE_INVOICE', 'invoice')
  async generateInvoice(@Param('orderId') orderId: string) {
    const filePath = await this.invoiceService.generateInvoice(orderId);
    return {
      success: true,
      filePath,
      message: 'Invoice generated successfully',
    };
  }

  @Get('order/:orderId')
  @ApiOperation({ summary: 'Get invoice by order ID' })
  async getInvoiceByOrderId(@Param('orderId') orderId: string) {
    return this.invoiceService.getInvoiceByOrderId(orderId);
  }

  @Get('download/:filename')
  @ApiOperation({ summary: 'Download invoice file' })
  async downloadInvoice(@Param('filename') filename: string, @Res() res: Response) {
    const file = await this.invoiceService.getInvoiceFile(`/${filename}`);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(file);
  }
}
