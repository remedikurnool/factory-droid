import { Module } from '@nestjs/common';
import { LabTestsService } from './lab-tests.service';
import { LabTestsController } from './lab-tests.controller';

@Module({
  providers: [LabTestsService],
  controllers: [LabTestsController],
})
export class LabTestsModule {}
