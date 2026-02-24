import { IsString, IsOptional, IsBoolean, MaxLength, ValidateNested, validate } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateDocumentDto {
  @ApiProperty({ example: 'Giáo trình Toán học', description: 'Tiêu đề tài liệu' })
  @IsString()
  @MaxLength(500)
  title: string;

  @ApiPropertyOptional({ example: 'Mô tả chi tiết về tài liệu...' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: 'Nguyễn Văn A' })
  @IsOptional()
  @IsString()
  author?: string;

  @ApiPropertyOptional({ example: 'Toán học' })
  @IsOptional()
  @IsString()
  subject?: string;

  @ApiPropertyOptional({
    example: 'toán, lớp 10, giáo trình',
    description: 'Từ khóa phân cách bằng dấu phẩy (multipart) hoặc array (JSON)'
  })
  @IsOptional()
  @IsString()
  keywords?: string; // Chấp nhận string từ multipart/form-data

  @ApiPropertyOptional({ example: 'false', default: false })
  @IsOptional()
  @IsString()
  isPublic?: string; // Chấp nhận string từ multipart/form-data
}

export class UpdateDocumentDto {
  @ApiPropertyOptional({ example: 'Tiêu đề mới' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  title?: string;

  @ApiPropertyOptional({ example: 'Mô tả mới' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: 'Tác giả mới' })
  @IsOptional()
  @IsString()
  author?: string;

  @ApiPropertyOptional({ example: 'Môn học mới' })
  @IsOptional()
  @IsString()
  subject?: string;

  @ApiPropertyOptional({ example: 'tag1, tag2' })
  @IsOptional()
  @IsString()
  keywords?: string;

  @ApiPropertyOptional({ example: 'true' })
  @IsOptional()
  @IsString()
  isPublic?: string;
}

export class DocumentResponseDto {
  id: string;
  title: string;
  description: string | null;
  author: string | null;
  subject: string | null;
  keywords: string[];
  language: string;
  fileName: string;
  fileSize: string | null;
  mimeType: string | null;
  status: string;
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
  user: {
    id: string;
    fullName: string;
    email: string;
  };
}
