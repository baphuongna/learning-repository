/**
 * FoldersModule - Module cấu hình cho thư mục
 */
import { Module } from '@nestjs/common';
import { FoldersController } from './folders.controller';
import { FoldersService } from './folders.service';
import { PrismaModule } from '@/common/services/prisma.module';

@Module({
  controllers: [FoldersController],
  providers: [FoldersService],
  imports: [PrismaModule],
})
export class FoldersModule {}
