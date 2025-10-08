import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS
  app.enableCors({
    origin: [process.env.FRONTEND_URL, process.env.ADMIN_URL],
    credentials: true,
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    })
  );

  // API prefix
  app.setGlobalPrefix('api/v1');

  // Swagger documentation
  const config = new DocumentBuilder()
    .setTitle('ONE MEDI API')
    .setDescription('Healthcare E-commerce Platform API Documentation')
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('Auth', 'Authentication endpoints')
    .addTag('Users', 'User management')
    .addTag('Medicines', 'Medicine catalog')
    .addTag('Lab Tests', 'Lab tests and bookings')
    .addTag('Doctors', 'Doctors and appointments')
    .addTag('Services', 'Homecare services')
    .addTag('Emergency', 'Ambulance and blood bank')
    .addTag('Insurance', 'Insurance plans')
    .addTag('Cart', 'Shopping cart')
    .addTag('Orders', 'Order management')
    .addTag('Payments', 'Payment processing')
    .addTag('Marketing', 'Banners, offers, coupons')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT || 4000;
  await app.listen(port);

  console.log(`🚀 ONE MEDI Backend running on: http://localhost:${port}`);
  console.log(`📚 API Documentation: http://localhost:${port}/api/docs`);
}

bootstrap();
