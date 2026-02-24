/**
 * Prisma Service - Database connection và query operations
 *
 * Service này wrap PrismaClient và quản lý lifecycle connection:
 * - Tự động kết nối khi module khởi tạo
 * - Tự động ngắt kết nối khi module destroy
 *
 * Được sử dụng bởi tất cả các services cần truy cập database.
 *
 * @module PrismaService
 */

import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  /**
   * Constructor - Khởi tạo PrismaClient với config
   *
   * Config:
   * - Development: Log queries, errors, warnings
   * - Production: Chỉ log errors
   */
  constructor() {
    super({
      log: process.env.NODE_ENV === 'development'
        ? ['query', 'error', 'warn']  // Log tất cả trong dev
        : ['error'],                   // Chỉ log error trong prod
    });
  }

  /**
   * onModuleInit - Được gọi khi module khởi tạo
   *
   * Kết nối đến database.
   * Nếu kết nối thất bại, ứng dụng sẽ crash early.
   */
  async onModuleInit() {
    await this.$connect();
    console.log('✅ Đã kết nối database');
  }

  /**
   * onModuleDestroy - Được gọi khi module destroy
   *
   * Đóng kết nối database để giải phóng resources.
   * Quan trọng để tránh connection leaks.
   */
  async onModuleDestroy() {
    await this.$disconnect();
    console.log('🔴 Đã ngắt kết nối database');
  }
}
