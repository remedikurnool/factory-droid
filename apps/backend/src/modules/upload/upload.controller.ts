import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
  Body,
  Res,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import { Response } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UploadService } from './upload.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AuditLog } from '../../common/decorators/audit-log.decorator';

@ApiTags('Uploads')
@Controller('uploads')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post('prescription')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Upload prescription' })
  @ApiConsumes('multipart/form-data')
  @AuditLog('UPLOAD_PRESCRIPTION', 'upload')
  async uploadPrescription(
    @CurrentUser() user: any,
    @Body('orderId') orderId: string,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }), // 5MB
          new FileTypeValidator({ fileType: /(jpg|jpeg|png|pdf)$/ }),
        ],
      })
    )
    file: Express.Multer.File
  ) {
    return this.uploadService.uploadPrescription(user.id, orderId, file);
  }

  @Post('lab-report')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Upload lab report' })
  @ApiConsumes('multipart/form-data')
  @AuditLog('UPLOAD_LAB_REPORT', 'upload')
  async uploadLabReport(
    @CurrentUser() user: any,
    @Body('bookingId') bookingId: string,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 10 * 1024 * 1024 }), // 10MB
          new FileTypeValidator({ fileType: /(jpg|jpeg|png|pdf)$/ }),
        ],
      })
    )
    file: Express.Multer.File
  ) {
    return this.uploadService.uploadLabReport(user.id, bookingId, file);
  }

  @Post('profile-image')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Upload profile image' })
  @ApiConsumes('multipart/form-data')
  @AuditLog('UPLOAD_PROFILE_IMAGE', 'upload')
  async uploadProfileImage(
    @CurrentUser() user: any,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 2 * 1024 * 1024 }), // 2MB
          new FileTypeValidator({ fileType: /(jpg|jpeg|png)$/ }),
        ],
      })
    )
    file: Express.Multer.File
  ) {
    return this.uploadService.uploadProfileImage(user.id, file);
  }

  @Post('document')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Upload document' })
  @ApiConsumes('multipart/form-data')
  @AuditLog('UPLOAD_DOCUMENT', 'upload')
  async uploadDocument(
    @CurrentUser() user: any,
    @Body('documentType') documentType: string,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }), // 5MB
          new FileTypeValidator({ fileType: /(jpg|jpeg|png|pdf|doc|docx)$/ }),
        ],
      })
    )
    file: Express.Multer.File
  ) {
    return this.uploadService.uploadDocument(user.id, documentType, file);
  }

  @Get('file/:folder/:filename')
  @ApiOperation({ summary: 'Get uploaded file' })
  async getFile(
    @Param('folder') folder: string,
    @Param('filename') filename: string,
    @Res() res: Response
  ) {
    const filePath = `/${folder}/${filename}`;
    const file = await this.uploadService.getFile(filePath);
    res.send(file);
  }

  @Delete(':type/:id')
  @ApiOperation({ summary: 'Delete upload' })
  @AuditLog('DELETE_UPLOAD', 'upload')
  async deleteUpload(@Param('type') type: string, @Param('id') id: string) {
    return this.uploadService.deleteUpload(id, type);
  }

  @Get('prescriptions')
  @ApiOperation({ summary: 'Get user prescriptions' })
  async getUserPrescriptions(@CurrentUser() user: any) {
    return this.uploadService.getUserPrescriptions(user.id);
  }

  @Get('documents')
  @ApiOperation({ summary: 'Get user documents' })
  async getUserDocuments(@CurrentUser() user: any) {
    return this.uploadService.getUserDocuments(user.id);
  }
}
