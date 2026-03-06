/**
 * DocumentsController - Xử lý các HTTP requests liên quan đến tài liệu
 *
 * Endpoints:
 * - GET    /documents       - Danh sách tài liệu
 * - GET    /documents/my    - Tài liệu của tôi
 * - GET    /documents/:id   - Chi tiết tài liệu
 * - GET    /documents/:id/download - Download file
 * - POST   /documents       - Tạo tài liệu mới
 * - PUT    /documents/:id   - Cập nhật tài liệu
 * - DELETE /documents/:id   - Xóa tài liệu
 */

import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  NotFoundException,
  Res,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiQuery,
  ApiConsumes,
  ApiResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { Public } from '@/common/decorators/public.decorator';
import { DocumentsService } from './documents.service';
import { CreateDocumentDto, UpdateDocumentDto } from './dto/create-document.dto';
import { v4 as uuidv4 } from 'uuid';
import { extname } from 'path';
import { Response } from 'express';
import * as fs from 'fs';

@ApiTags('Documents')
@Controller('documents')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  /**
   * Tạo tài liệu mới với file upload
   */
  @Post()
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          const uniqueName = uuidv4() + extname(file.originalname);
          cb(null, uniqueName);
        },
      }),
    }),
  )
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Tạo tài liệu mới' })
  @ApiResponse({ status: 201, description: 'Tạo thành công' })
  async create(
    @CurrentUser('sub') userId: string,
    @Body() createDto: CreateDocumentDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.documentsService.create(userId, createDto, file);
  }

  /**
   * Lấy danh sách tài liệu
   */
  @Get()
  @ApiOperation({ summary: 'Lấy danh sách tài liệu' })
  @ApiResponse({ status: 200, description: 'Danh sách tài liệu' })
  async findAll(
    @CurrentUser('sub') userId: string,
    @CurrentUser('role') role: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('folderId') folderId?: string,
  ) {
    const numPage = parseInt(page || '1');
    const numLimit = parseInt(limit || '10');
    // Convert 'null' string to null, undefined means no filter
    const parsedFolderId = folderId === 'null' ? null : folderId;
    return this.documentsService.findAll(userId, role, numPage, numLimit, parsedFolderId);
  }

  /**
   * Lấy tài liệu của tôi
   */
  @Get('my')
  @ApiOperation({ summary: 'Lấy tài liệu của tôi' })
  @ApiResponse({ status: 200, description: 'Danh sách tài liệu của tôi' })
  async getMyDocuments(
    @CurrentUser('sub') userId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('folderId') folderId?: string,
  ) {
    const numPage = parseInt(page || '1');
    const numLimit = parseInt(limit || '10');
    // Convert 'null' string to null, undefined means no filter
    const parsedFolderId = folderId === 'null' ? null : folderId;
    return this.documentsService.getMyDocuments(userId, numPage, numLimit, parsedFolderId);
  }

  /**
   * Tìm kiếm tài liệu
   */
  @Get('search')
  @ApiOperation({ summary: 'Tìm kiếm tài liệu' })
  @ApiQuery({ name: 'q', required: true, type: String })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Kết quả tìm kiếm' })
  async search(
    @CurrentUser('sub') userId: string,
    @CurrentUser('role') role: string,
    @Query('q') query?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const numPage = parseInt(page || '1');
    const numLimit = parseInt(limit || '10');
    const keyword = (query || '').trim();

    if (!keyword) {
      return {
        data: [],
        meta: {
          total: 0,
          page: numPage,
          limit: numLimit,
          totalPages: 0,
          query: keyword,
        },
      };
    }

    return this.documentsService.search(keyword, userId, role, numPage, numLimit);
  }

  /**
   * Download file tài liệu
   */
  @Get(':id/download')
  @ApiOperation({ summary: 'Download file tài liệu' })
  @ApiResponse({ status: 200, description: 'File tài liệu' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy' })
  async download(
    @Param('id') id: string,
    @CurrentUser('sub') userId: string,
    @CurrentUser('role') role: string,
    @Res() res: Response,
  ) {
    const doc = await this.documentsService.findOne(id, userId, role);

    if (!doc || doc.status === 'DELETED') {
      throw new NotFoundException('Document not found');
    }

    if (!doc.filePath) {
      throw new NotFoundException('File not found');
    }

    const fileBuffer = fs.readFileSync(doc.filePath);

    res.setHeader('Content-Type', doc.mimeType || 'application/octet-stream');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${encodeURIComponent(doc.fileName || 'download')}"`,
    );
    res.send(fileBuffer);
  }

  /**
   * Lấy chi tiết một tài liệu
   */
  @Get(':id')
  @ApiOperation({ summary: 'Lấy chi tiết tài liệu' })
  @ApiResponse({ status: 200, description: 'Chi tiết tài liệu' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy' })
  async findOne(
    @Param('id') id: string,
    @CurrentUser('sub') userId: string,
    @CurrentUser('role') role: string,
  ) {
    return this.documentsService.findOne(id, userId, role);
  }

  /**
   * Cập nhật metadata tài liệu
   */
  @Put(':id')
  @ApiOperation({ summary: 'Cập nhật tài liệu' })
  @ApiResponse({ status: 200, description: 'Cập nhật thành công' })
  async update(
    @Param('id') id: string,
    @CurrentUser('sub') userId: string,
    @CurrentUser('role') role: string,
    @Body() updateDto: UpdateDocumentDto,
  ) {
    return this.documentsService.update(id, userId, role, updateDto);
  }

  /**
   * Xóa tài liệu (soft delete)
   */
  @Delete(':id')
  @ApiOperation({ summary: 'Xóa tài liệu (soft delete)' })
  @ApiResponse({ status: 200, description: 'Xóa thành công' })
  async remove(
    @Param('id') id: string,
    @CurrentUser('sub') userId: string,
    @CurrentUser('role') role: string,
  ) {
    return this.documentsService.remove(id, userId, role);
  }
}
