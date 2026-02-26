/**
 * News Module
 *
 * Đăng ký controller và service cho quản lý tin tức
 *
 * @module NewsModule
 */

import { Module } from '@nestjs/common';
import { NewsController } from './news.controller';
import { NewsService } from './news.service';
import { NewsCategoriesModule } from '../news-categories/news-categories.module';

@Module({
  imports: [NewsCategoriesModule],
  controllers: [NewsController],
  providers: [NewsService],
  exports: [NewsService],
})
export class NewsModule {}
