/**
 * Entry point của ứng dụng NestJS
 *
 * File này khởi tạo NestJS application và cấu hình:
 * - CORS cho phép frontend truy cập
 * - Global prefix '/api' cho tất cả routes
 * - Validation pipe để validate request data
 * - Swagger UI cho API documentation
 *
 * @module main
 */

import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

/**
 * Bootstrap function - Khởi động ứng dụng
 *
 * Các bước thực hiện:
 * 1. Tạo NestJS application từ AppModule
 * 2. Cấu hình CORS
 * 3. Thiết lập global prefix '/api'
 * 4. Cấu hình validation pipe toàn cục
 * 5. Thiết lập Swagger documentation
 * 6. Khởi động server trên port được cấu hình
 */
async function bootstrap() {
  // Tạo NestJS application
  const app = await NestFactory.create(AppModule);

  // Cấu hình CORS - Cho phép frontend truy cập API
  // Trong production, nên giới hạn origins cụ thể
  app.enableCors({
    origin: process.env.CORS_ORIGINS?.split(',') || ['http://localhost:3000'],
    credentials: true, // Cho phép gửi cookies/authorization headers
  });

  // Thiết lập prefix '/api' cho tất cả routes
  // Ví dụ: /auth/login -> /api/auth/login
  app.setGlobalPrefix('api');

  // Cấu hình validation pipe toàn cục
  // Tự động validate và transform request data dựa trên DTO decorators
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Loại bỏ các properties không được định nghĩa trong DTO
      forbidNonWhitelisted: true, // Throw error nếu có properties không hợp lệ
      transform: true, // Tự động transform types
      transformOptions: {
        enableImplicitConversion: true, // Cho phép convert implicit types
      },
    }),
  );

  // Cấu hình Swagger API Documentation
  const config = new DocumentBuilder()
    .setTitle('Kho Học Liệu Số API')
    .setDescription(
      'API documentation cho hệ thống Kho Học Liệu Số\n\n' +
        '## Authentication\n' +
        'Sử dụng JWT Bearer token. Click vào nút 🔒 **Authorize** để nhập token.\n\n' +
        '## Response Format\n' +
        'Tất cả response đều theo format JSON với cấu trúc thống nhất.',
    )
    .setVersion('1.0')
    .addBearerAuth() // Thêm Bearer auth cho Swagger UI
    .build();

  const document = SwaggerModule.createDocument(app, config);

  // Thiết lập Swagger UI tại /api/docs
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true, // Giữ token khi refresh page
    },
  });

  // Lấy port từ environment variable hoặc dùng default 3001
  const port = process.env.PORT || 3001;

  // Khởi động server
  await app.listen(port);

  // Log thông tin server
  console.log(`🚀 API đang chạy tại: http://localhost:${port}/api`);
  console.log(`📚 Swagger docs: http://localhost:${port}/api/docs`);
}

// Khởi động ứng dụng
bootstrap();
