import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { MedicinesModule } from './modules/medicines/medicines.module';
import { LabTestsModule } from './modules/lab-tests/lab-tests.module';
import { DoctorsModule } from './modules/doctors/doctors.module';
import { ServicesModule } from './modules/services/services.module';
import { EmergencyModule } from './modules/emergency/emergency.module';
import { InsuranceModule } from './modules/insurance/insurance.module';
import { CartModule } from './modules/cart/cart.module';
import { OrdersModule } from './modules/orders/orders.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { MarketingModule } from './modules/marketing/marketing.module';
import { UploadModule } from './modules/upload/upload.module';
import { WebsocketModule } from './modules/websocket/websocket.module';
import { InvoiceModule } from './modules/invoices/invoice.module';
import { HealthModule } from './modules/health/health.module';
import { AuditModule } from './modules/audit/audit.module';
import { RedisModule } from './modules/redis/redis.module';
import { DatabaseModule } from './database/database.module';
import { AllExceptionsFilter } from './common/filters/http-exception.filter';
import { AuditLogInterceptor } from './common/interceptors/audit-log.interceptor';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 100,
      },
    ]),
    DatabaseModule,
    RedisModule,
    HealthModule,
    AuditModule,
    AuthModule,
    UsersModule,
    MedicinesModule,
    LabTestsModule,
    DoctorsModule,
    ServicesModule,
    EmergencyModule,
    InsuranceModule,
    CartModule,
    OrdersModule,
    PaymentsModule,
    MarketingModule,
    UploadModule,
    InvoiceModule,
    WebsocketModule,
    EmailModule,
    SmsModule,
    NotificationsModule,
    SearchModule,
  ],
  providers: [
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: AuditLogInterceptor,
    },
  ],
})
export class AppModule {}
