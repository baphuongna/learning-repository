/**
 * DTO cho News Category
 *
 * Validation và documentation cho API tạo/cập nhật danh mục tin tức
 *
 * @module CreateCategoryDto
 */

import { IsString, IsOptional, IsInt, MaxLength, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCategoryDto {
  @ApiProperty({ example: 'Giáo dục', description: 'Tên danh mục' })
  @IsString()
  @MaxLength(100)
  name: string;

  @ApiProperty({ example: 'giao-duc', description: 'Slug URL-friendly' })
  @IsString()
  @MaxLength(100)
  slug: string;

  @ApiPropertyOptional({ example: 'Tin tức về giáo dục' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: 1, default: 0, description: 'Thứ tự sắp xếp' })
  @IsOptional()
  @IsInt()
  @Min(0)
  order?: number;

  @ApiPropertyOptional({ example: 'ACTIVE', default: 'ACTIVE', enum: ['ACTIVE', 'INACTIVE'] })
  @IsOptional()
  @IsString()
  status?: string;
}

export class UpdateCategoryDto {
  @ApiPropertyOptional({ example: 'Giáo dục mới' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  name?: string;

  @ApiPropertyOptional({ example: 'giao-duc-moi' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  slug?: string;

  @ApiPropertyOptional({ example: 'Mô tả mới' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: 2 })
  @IsOptional()
  @IsInt()
  @Min(0)
  order?: number;

  @ApiPropertyOptional({ example: 'INACTIVE' })
  @IsOptional()
  @IsString()
  status?: string;
}
