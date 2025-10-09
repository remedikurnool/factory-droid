import { Module } from '@nestjs/common';
import { PrismaModule } from '@/shared/prisma/prisma.module';
import { RedisModule } from '@/shared/redis/redis.module';
import { NotificationModule } from '@/modules/notification/notification.module';

// Services
import { LabTestService } from './services/lab-test.service';
import { LabPackageService } from './services/lab-package.service';
import { LabBookingService } from './services/lab-booking.service';

// Controllers
import { LabTestController } from './controllers/lab-test.controller';
import { LabPackageController } from './controllers/lab-package.controller';
import { LabBookingController } from './controllers/lab-booking.controller';

@Module({
  imports: [PrismaModule, RedisModule, NotificationModule],
  controllers: [
    LabTestController,
    LabPackageController,
    LabBookingController,
  ],
  providers: [LabTestService, LabPackageService, LabBookingService],
  exports: [LabTestService, LabPackageService, LabBookingService],
})
export class LabTestModule {}
