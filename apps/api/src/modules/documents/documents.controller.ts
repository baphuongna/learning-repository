/**
 * Documents Controller - Xử lý các HTTP requests liên quan đến tài liệu
 *
 * Endpoints:
 * - GET    /documents       - Danh sách tài liệu
 * - GET    /documents/my    - Tài liệu của tôi
 * - GET    /documents/:id   - Chi tiết tài liệu
 * - POST   /documents       - Tạo tài liệu mới
 * - PUT    /documents/:id   - Cập nhật tài liệu
 * - DELETE /documents/:id   - Xóa tài liệu
 *
 * @module DocumentsController
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
  ParseIntPipe,
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
import { extname, basename } from 'path';
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
   *
   * Sử dụng multipart/form-data để upload file cùng với metadata
   *
   * @param userId - ID user từ JWT
   * @param createDto - Metadata tài liệu
   * @param file - File được upload
   * @returns Tài liệu đã tạo
   */
  @Post()
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, callback) => {
          const uniqueName = uuidv4() + extname(file.originalname);
          callback(null, uniqueName);
        },
      }),
      limits: {
        fileSize: 50 * 1024 * 1024, // 50MB
      },
    }),
  )
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Tạo tài liệu mới (với file)' })
  @ApiResponse({ status: 201, description: 'Tạo thành công' })
  async create(
    @CurrentUser('sub') userId: string,
    @Body() createDto: CreateDocumentDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.documentsService.create(userId, createDto, file);
  }

  /**
   * Lấy danh sách tất cả tài liệu
   *
   * Admin xem tất cả, User chỉ xem của mình và public
   * Hỗ trợ phân trang
   *
   * @param userId - ID user từ JWT
   * @param role - Role từ JWT
   * @param page - Số trang
   * @param limit - Số items per page
   * @returns Danh sách tài liệu với pagination
   */
  @Get()
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Số trang' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Số items per page' })
  @ApiOperation({ summary: 'Lấy danh sách tài liệu' })
  @ApiResponse({ status: 200, description: 'Danh sách tài liệu' })
  async findAll(
    @CurrentUser('sub') userId: string,
    @CurrentUser('role') role: string,
    @Query('page', new ParseIntPipe({ optional: true })) page = 1,
    @Query('limit', new ParseIntPipe({ optional: true })) limit = 10,
  ) {
    return this.documentsService.findAll(userId, role, page, limit);
  }

  /**
   * Lấy danh sách tài liệu của user hiện tại
   *
   * @param userId - ID user từ JWT
   * @param page - Số trang
   * @param limit - Số items per page
   * @returns Danh sách tài liệu của user
   */
  @Get('my')
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiOperation({ summary: 'Lấy danh sách tài liệu của tôi' })
  async getMyDocuments(
    @CurrentUser('sub') userId: string,
    @Query('page', new ParseIntPipe({ optional: true })) page = 1,
    @Query('limit', new ParseIntPipe({ optional: true })) limit = 10,
  ) {
    return this.documentsService.getMyDocuments(userId, page, limit);
  }

  /**
   * Download file tài liệu
   *
   * @param id - ID tài liệu
   * @param userId - ID user từ JWT
   * @param role - Role từ JWT
   * @param res - Response object
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

    if (!doc.filePath || !fs.existsSync(doc.filePath)) {
      throw new Error('File không tồn tại');
    }

    const fileBuffer = fs.readFileSync(doc.filePath);

    res.setHeader('Content-Type', doc.mimeType || 'application/octet-stream');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${encodeURIComponent(doc.fileName)}"`,
    );
    res.send(fileBuffer);
  }

  /**
   * Lấy chi tiết một tài liệu
   *
   * @param id - ID tài liệu
   * @param userId - ID user từ JWT
   * @param role - Role từ JWT
   * @returns Chi tiết tài liệu
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
   *
   * @param id - ID tài liệu
   * @param userId - ID user từ JWT
   * @param role - Role từ JWT
   * @param updateDto - Dữ liệu cập nhật
   * @returns Tài liệu đã cập nhật
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
   *
   * @param id - ID tài liệu
   * @param userId - ID user từ JWT
   * @param role - Role từ JWT
   * @returns Message xác nhận
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

/**
 * Search Controller - Xử lý tìm kiếm tài liệu
 *
 * @module SearchController
 */
@ApiTags('Search')
@Controller('search')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class SearchController {
  constructor(private readonly documentsService: DocumentsService) {}

  /**
   * Tìm kiếm tài liệu theo từ khóa
   *
   * Tìm trong: title, description, author, subject
   *
   * @param query - Từ khóa tìm kiếm
   * @param userId - ID user từ JWT
   * @param role - Role từ JWT
   * @param page - Số trang
   * @param limit - Số items per page
   * @returns Kết quả tìm kiếm
   */
  @Get()
  @ApiQuery({ name: 'q', required: true, description: 'Từ khóa tìm kiếm' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiOperation({ summary: 'Tìm kiếm tài liệu' })
  async search(
    @Query('q') query: string,
    @CurrentUser('sub') userId: string,
    @CurrentUser('role') role: string,
    @Query('page', new ParseIntPipe({ optional: true })) page = 1,
    @Query('limit', new ParseIntPipe({ optional: true })) limit = 10,
  ) {
    return this.documentsService.search(query, userId, role, page, limit);
  }
}
