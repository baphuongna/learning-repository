/**
 * DTO cho News
 *
 * Validation và documentation cho API tạo/cập nhật tin tức
 *
 * @module CreateNewsDto
 */

import {
  IsString,
  IsOptional,
  IsBoolean,
  IsUUID,
  MaxLength,
  IsUrl,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateNewsDto {
  @ApiProperty({ example: 'uuid-category', description: 'ID danh mục' })
  @IsUUID()
  categoryId: string;

  @ApiProperty({ example: 'Tiêu đề bài viết', description: 'Tiêu đề tin tức' })
  @IsString()
  @MaxLength(255)
  title: string;

  @ApiProperty({ example: 'tieu-de-bai-viet', description: 'Slug URL-friendly' })
  @IsString()
  @MaxLength(255)
  slug: string;

  @ApiProperty({ example: 'Tóm tắt ngắn gọn về bài viết...', description: 'Tóm tắt' })
  @IsString()
  summary: string;

  @ApiProperty({
    example: '<p>Nội dung đầy đủ của bài viết...</p>',
    description: 'Nội dung HTML',
  })
  @IsString()
  content: string;

  @ApiPropertyOptional({
    example: 'https://example.com/image.jpg',
    description: 'URL hình ảnh thumbnail',
  })
  @IsOptional()
  @IsString()
  thumbnailUrl?: string;

  @ApiPropertyOptional({
    example: false,
    default: false,
    description: 'Tin nổi bật',
  })
  @IsOptional()
  isFeatured?: boolean;

  @ApiPropertyOptional({
    example: false,
    default: false,
    description: 'Xuất bản ngay',
  })
  @IsOptional()
  isPublished?: boolean;
}

export class UpdateNewsDto {
  @ApiPropertyOptional({ example: 'uuid-category' })
  @IsOptional()
  @IsUUID()
  categoryId?: string;

  @ApiPropertyOptional({ example: 'Tiêu đề mới' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  title?: string;

  @ApiPropertyOptional({ example: 'tieu-de-moi' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  slug?: string;

  @ApiPropertyOptional({ example: 'Tóm tắt mới' })
  @IsOptional()
  @IsString()
  summary?: string;

  @ApiPropertyOptional({ example: '<p>Nội dung mới...</p>' })
  @IsOptional()
  @IsString()
  content?: string;

  @ApiPropertyOptional({ example: 'https://example.com/new-image.jpg' })
  @IsOptional()
  @IsString()
  thumbnailUrl?: string;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  isFeatured?: boolean;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  isPublished?: boolean;
}
