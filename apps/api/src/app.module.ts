/**
 * Root Module của ứng dụng NestJS
 *
 * Module này là điểm khởi đầu của ứng dụng, import và kết nối tất cả
 * các feature modules khác.
 *
 * @module AppModule
 */

import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './modules/auth/auth.module';
import { DocumentsModule } from './modules/documents/documents.module';
import { UploadModule } from './modules/upload/upload.module';
import { NewsCategoriesModule } from './modules/news-categories/news-categories.module';
import { NewsModule } from './modules/news/news.module';
import { PrismaModule } from './common/services/prisma.module';

@Module({
  imports: [
    // ConfigModule - Quản lý biến môi trường
    // isGlobal: true - Cho phép sử dụng ConfigService ở mọi nơi
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // PrismaModule - Database connection (Global module)
    // Được sử dụng bởi tất cả modules cần truy cập database
    PrismaModule,

    // Feature Modules
    AuthModule,           // Xử lý authentication (login, register, JWT)
    DocumentsModule,      // CRUD tài liệu
    UploadModule,         // Upload/Download files
    NewsCategoriesModule, // Quản lý danh mục tin tức
    NewsModule,           // CRUD tin tức
  ],
})
export class AppModule {}
