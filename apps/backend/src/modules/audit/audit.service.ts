import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

export interface AuditLogData {
  userId?: string;
  action: string;
  resource: string;
  resourceId?: string;
  changes?: any;
  ipAddress?: string;
  userAgent?: string;
  metadata?: any;
}

@Injectable()
export class AuditService {
  constructor(private prisma: PrismaService) {}

  async log(data: AuditLogData) {
    try {
      await this.prisma.auditLog.create({
        data: {
          userId: data.userId,
          action: data.action,
          resource: data.resource,
          resourceId: data.resourceId,
          changes: data.changes ? JSON.stringify(data.changes) : null,
          ipAddress: data.ipAddress,
          userAgent: data.userAgent,
          metadata: data.metadata ? JSON.stringify(data.metadata) : null,
          timestamp: new Date(),
        },
      });
    } catch (error) {
      // Log error but don't throw - audit logging should not break the main flow
      console.error('Audit logging failed:', error);
    }
  }

  async getUserAuditLogs(userId: string, limit = 50) {
    return this.prisma.auditLog.findMany({
      where: { userId },
      orderBy: { timestamp: 'desc' },
      take: limit,
    });
  }

  async getResourceAuditLogs(resource: string, resourceId: string, limit = 50) {
    return this.prisma.auditLog.findMany({
      where: {
        resource,
        resourceId,
      },
      orderBy: { timestamp: 'desc' },
      take: limit,
    });
  }

  async getAuditLogs(filters: {
    userId?: string;
    action?: string;
    resource?: string;
    startDate?: Date;
    endDate?: Date;
    limit?: number;
  }) {
    const { userId, action, resource, startDate, endDate, limit = 100 } = filters;

    return this.prisma.auditLog.findMany({
      where: {
        ...(userId && { userId }),
        ...(action && { action }),
        ...(resource && { resource }),
        ...(startDate &&
          endDate && {
            timestamp: {
              gte: startDate,
              lte: endDate,
            },
          }),
      },
      orderBy: { timestamp: 'desc' },
      take: limit,
    });
  }
}
