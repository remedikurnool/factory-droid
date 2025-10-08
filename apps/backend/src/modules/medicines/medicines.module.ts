import { Module } from '@nestjs/common';
import { MedicinesService } from './medicines.service';
import { MedicinesController } from './medicines.controller';

@Module({
  providers: [MedicinesService],
  controllers: [MedicinesController],
  exports: [MedicinesService],
})
export class MedicinesModule {}
