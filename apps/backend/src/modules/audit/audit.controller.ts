import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuditService } from './audit.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('Audit')
@Controller('audit')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Get()
  @Roles('ADMIN', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'Get audit logs (Admin only)' })
  async getAuditLogs(
    @Query('userId') userId?: string,
    @Query('action') action?: string,
    @Query('resource') resource?: string,
    @Query('limit') limit?: string
  ) {
    return this.auditService.getAuditLogs({
      userId,
      action,
      resource,
      limit: limit ? parseInt(limit) : 100,
    });
  }

  @Get('user/:userId')
  @Roles('ADMIN', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'Get user audit logs (Admin only)' })
  async getUserAuditLogs(@Query('userId') userId: string, @Query('limit') limit?: string) {
    return this.auditService.getUserAuditLogs(userId, limit ? parseInt(limit) : 50);
  }

  @Get('resource')
  @Roles('ADMIN', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'Get resource audit logs (Admin only)' })
  async getResourceAuditLogs(
    @Query('resource') resource: string,
    @Query('resourceId') resourceId: string,
    @Query('limit') limit?: string
  ) {
    return this.auditService.getResourceAuditLogs(
      resource,
      resourceId,
      limit ? parseInt(limit) : 50
    );
  }
}
