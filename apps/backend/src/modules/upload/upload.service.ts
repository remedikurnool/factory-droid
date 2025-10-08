import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../database/prisma.service';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class UploadService {
  private readonly logger = new Logger(UploadService.name);
  private readonly uploadPath: string;
  private readonly maxFileSize: number;

  constructor(
    private prisma: PrismaService,
    private configService: ConfigService
  ) {
    this.uploadPath = this.configService.get('UPLOAD_PATH', './uploads');
    this.maxFileSize = this.configService.get('MAX_FILE_SIZE', 5242880); // 5MB default

    // Ensure upload directories exist
    this.ensureUploadDirectories();
  }

  private ensureUploadDirectories() {
    const dirs = ['prescriptions', 'reports', 'profiles', 'documents'];

    dirs.forEach((dir) => {
      const dirPath = path.join(this.uploadPath, dir);
      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
      }
    });
  }

  async uploadPrescription(userId: string, orderId: string, file: Express.Multer.File) {
    try {
      const filePath = await this.saveFile(file, 'prescriptions');

      const prescription = await this.prisma.prescription.create({
        data: {
          userId,
          orderId,
          filePath,
          fileName: file.originalname,
          fileSize: file.size,
          mimeType: file.mimetype,
          uploadedAt: new Date(),
        },
      });

      return prescription;
    } catch (error) {
      this.logger.error('Error uploading prescription', error);
      throw new BadRequestException('Failed to upload prescription');
    }
  }

  async uploadLabReport(userId: string, bookingId: string, file: Express.Multer.File) {
    try {
      const filePath = await this.saveFile(file, 'reports');

      const report = await this.prisma.labReport.create({
        data: {
          userId,
          bookingId,
          filePath,
          fileName: file.originalname,
          fileSize: file.size,
          mimeType: file.mimetype,
          uploadedAt: new Date(),
        },
      });

      return report;
    } catch (error) {
      this.logger.error('Error uploading lab report', error);
      throw new BadRequestException('Failed to upload lab report');
    }
  }

  async uploadProfileImage(userId: string, file: Express.Multer.File) {
    try {
      // Delete old profile image if exists
      const existingUser = await this.prisma.user.findUnique({
        where: { id: userId },
      });

      if (existingUser?.profileImage) {
        await this.deleteFile(existingUser.profileImage);
      }

      const filePath = await this.saveFile(file, 'profiles');

      await this.prisma.user.update({
        where: { id: userId },
        data: { profileImage: filePath },
      });

      return { filePath };
    } catch (error) {
      this.logger.error('Error uploading profile image', error);
      throw new BadRequestException('Failed to upload profile image');
    }
  }

  async uploadDocument(userId: string, documentType: string, file: Express.Multer.File) {
    try {
      const filePath = await this.saveFile(file, 'documents');

      const document = await this.prisma.document.create({
        data: {
          userId,
          type: documentType,
          filePath,
          fileName: file.originalname,
          fileSize: file.size,
          mimeType: file.mimetype,
          uploadedAt: new Date(),
        },
      });

      return document;
    } catch (error) {
      this.logger.error('Error uploading document', error);
      throw new BadRequestException('Failed to upload document');
    }
  }

  private async saveFile(file: Express.Multer.File, folder: string): Promise<string> {
    const fileName = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}${path.extname(file.originalname)}`;
    const filePath = path.join(this.uploadPath, folder, fileName);

    await fs.promises.writeFile(filePath, file.buffer);

    return `/${folder}/${fileName}`;
  }

  private async deleteFile(filePath: string): Promise<void> {
    try {
      const fullPath = path.join(this.uploadPath, filePath);
      if (fs.existsSync(fullPath)) {
        await fs.promises.unlink(fullPath);
      }
    } catch (error) {
      this.logger.warn(`Failed to delete file: ${filePath}`, error);
    }
  }

  async getFile(filePath: string): Promise<Buffer> {
    try {
      const fullPath = path.join(this.uploadPath, filePath);
      return await fs.promises.readFile(fullPath);
    } catch (error) {
      this.logger.error('Error reading file', error);
      throw new BadRequestException('File not found');
    }
  }

  async deleteUpload(uploadId: string, type: string) {
    try {
      let filePath: string | null = null;

      switch (type) {
        case 'prescription':
          const prescription = await this.prisma.prescription.findUnique({
            where: { id: uploadId },
          });
          filePath = prescription?.filePath;
          await this.prisma.prescription.delete({ where: { id: uploadId } });
          break;

        case 'report':
          const report = await this.prisma.labReport.findUnique({
            where: { id: uploadId },
          });
          filePath = report?.filePath;
          await this.prisma.labReport.delete({ where: { id: uploadId } });
          break;

        case 'document':
          const document = await this.prisma.document.findUnique({
            where: { id: uploadId },
          });
          filePath = document?.filePath;
          await this.prisma.document.delete({ where: { id: uploadId } });
          break;

        default:
          throw new BadRequestException('Invalid upload type');
      }

      if (filePath) {
        await this.deleteFile(filePath);
      }

      return { success: true };
    } catch (error) {
      this.logger.error('Error deleting upload', error);
      throw new BadRequestException('Failed to delete upload');
    }
  }

  async getUserPrescriptions(userId: string) {
    return this.prisma.prescription.findMany({
      where: { userId },
      orderBy: { uploadedAt: 'desc' },
      include: {
        order: {
          select: { id: true, orderNumber: true, status: true },
        },
      },
    });
  }

  async getUserDocuments(userId: string) {
    return this.prisma.document.findMany({
      where: { userId },
      orderBy: { uploadedAt: 'desc' },
    });
  }
}
