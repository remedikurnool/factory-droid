import { Module } from '@nestjs/common';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';
import { DatabaseModule } from '../../database/database.module';
import { EmailModule } from '../email/email.module';
import { SmsModule } from '../sms/sms.module';

@Module({
  imports: [DatabaseModule, EmailModule, SmsModule],
  controllers: [NotificationsController],
  providers: [NotificationsService],
  exports: [NotificationsService],
})
export class NotificationsModule {}
