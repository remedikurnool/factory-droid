import { Module } from '@nestjs/common';
import { MedicineController } from './medicine.controller';
import { MedicineService } from './services/medicine.service';
import { MedicineReviewService } from './services/medicine-review.service';
import { WishlistService } from './services/wishlist.service';
import { PrismaModule } from '../database/prisma.module';
import { RedisModule } from '../redis/redis.module';

@Module({
  imports: [PrismaModule, RedisModule],
  controllers: [MedicineController],
  providers: [MedicineService, MedicineReviewService, WishlistService],
  exports: [MedicineService, MedicineReviewService, WishlistService],
})
export class MedicineModule {}
