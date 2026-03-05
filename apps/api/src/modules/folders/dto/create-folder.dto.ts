/**
 * DTO cho Folder creation và update request
 */
import { IsString, IsNotEmpty, IsOptional, IsBoolean } from 'class-validator';

export class CreateFolderDto {
  @IsString()
  @IsNotEmpty({ message: 'Tên thư mục không được để trống' })
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  color?: string;

  @IsString()
  @IsOptional()
  parentId?: string; // null = root folder

  @IsBoolean()
  @IsOptional()
  isPublic?: boolean;
}

export class UpdateFolderDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  color?: string;

  @IsString()
  @IsOptional()
  parentId?: string;

  @IsBoolean()
  @IsOptional()
  isPublic?: boolean;
}
