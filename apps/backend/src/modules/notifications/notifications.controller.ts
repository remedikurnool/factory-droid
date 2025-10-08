import { Controller, Post, Get, Put, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { NotificationsService, NotificationPreferences } from './notifications.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AuditLog } from '../../common/decorators/audit-log.decorator';

@ApiTags('Notifications')
@Controller('notifications')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get('preferences')
  @ApiOperation({ summary: 'Get user notification preferences' })
  async getPreferences(@CurrentUser() user: any) {
    return this.notificationsService.getUserPreferences(user.id);
  }

  @Put('preferences')
  @ApiOperation({ summary: 'Update notification preferences' })
  @AuditLog('UPDATE_NOTIFICATION_PREFERENCES', 'notification')
  async updatePreferences(
    @CurrentUser() user: any,
    @Body() preferences: Partial<NotificationPreferences>
  ) {
    return this.notificationsService.updateUserPreferences(user.id, preferences);
  }

  @Get('history')
  @ApiOperation({ summary: 'Get notification history' })
  async getHistory(@CurrentUser() user: any) {
    return this.notificationsService.getNotificationHistory(user.id);
  }

  @Post('send')
  @ApiOperation({ summary: 'Send notification to user' })
  @AuditLog('SEND_NOTIFICATION', 'notification')
  async sendNotification(@Body() body: { userId: string; type: string; data: any }) {
    return this.notificationsService.sendNotification(body.userId, body.type, body.data);
  }

  @Post('batch')
  @ApiOperation({ summary: 'Send batch notifications' })
  @AuditLog('SEND_BATCH_NOTIFICATIONS', 'notification')
  async sendBatchNotifications(
    @Body()
    body: {
      notifications: Array<{ userId: string; type: string; data: any }>;
    }
  ) {
    return this.notificationsService.sendBatchNotifications(body.notifications);
  }
}
