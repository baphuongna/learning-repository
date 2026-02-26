/**
 * News Controller - Xử lý HTTP requests cho tin tức
 *
 * Endpoints:
 * - GET    /news              - Danh sách tin tức (public)
 * - GET    /news/featured     - Tin nổi bật
 * - GET    /news/slug/:slug   - Chi tiết theo slug
 * - GET    /news/:id          - Chi tiết theo ID
 * - GET    /news/my           - Bài viết của tôi
 * - POST   /news              - Tạo bài viết
 * - PUT    /news/:id          - Cập nhật bài viết
 * - DELETE /news/:id          - Xóa bài viết
 *
 * @module NewsController
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
  ParseIntPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiQuery,
  ApiResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { Public } from '@/common/decorators/public.decorator';
import { NewsService } from './news.service';
import { CreateNewsDto, UpdateNewsDto } from './dto/create-news.dto';

@ApiTags('News')
@Controller('news')
export class NewsController {
  constructor(private readonly newsService: NewsService) {}

  /**
   * Lấy danh sách tin tức đã xuất bản (Public)
   */
  @Get()
  @Public()
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Số trang' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Số items' })
  @ApiQuery({ name: 'category', required: false, description: 'ID hoặc slug danh mục' })
  @ApiQuery({ name: 'search', required: false, description: 'Từ khóa tìm kiếm' })
  @ApiOperation({ summary: 'Danh sách tin tức (public)' })
  @ApiResponse({ status: 200, description: 'Danh sách tin tức' })
  async findAll(
    @Query('page', new ParseIntPipe({ optional: true })) page = 1,
    @Query('limit', new ParseIntPipe({ optional: true })) limit = 10,
    @Query('category') category?: string,
    @Query('search') search?: string,
  ) {
    return this.newsService.findAll(page, limit, category, search);
  }

  /**
   * Lấy tin tức nổi bật (Public)
   */
  @Get('featured')
  @Public()
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiOperation({ summary: 'Tin tức nổi bật' })
  @ApiResponse({ status: 200, description: 'Danh sách tin nổi bật' })
  async getFeatured(@Query('limit', new ParseIntPipe({ optional: true })) limit = 5) {
    return this.newsService.getFeatured(limit);
  }

  /**
   * Lấy chi tiết theo slug (Public)
   */
  @Get('slug/:slug')
  @Public()
  @ApiOperation({ summary: 'Chi tiết bài viết theo slug' })
  @ApiResponse({ status: 200, description: 'Chi tiết bài viết' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy' })
  async findBySlug(@Param('slug') slug: string) {
    return this.newsService.findBySlug(slug);
  }

  /**
   * Lấy bài viết của user hiện tại
   */
  @Get('my')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiOperation({ summary: 'Bài viết của tôi' })
  @ApiResponse({ status: 200, description: 'Danh sách bài viết của user' })
  async getMyNews(
    @CurrentUser('sub') userId: string,
    @Query('page', new ParseIntPipe({ optional: true })) page = 1,
    @Query('limit', new ParseIntPipe({ optional: true })) limit = 10,
  ) {
    return this.newsService.getMyNews(userId, page, limit);
  }

  /**
   * Lấy chi tiết theo ID (Public)
   */
  @Get(':id')
  @Public()
  @ApiOperation({ summary: 'Chi tiết bài viết theo ID' })
  @ApiResponse({ status: 200, description: 'Chi tiết bài viết' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy' })
  async findOne(@Param('id') id: string) {
    return this.newsService.findOne(id);
  }

  /**
   * Tạo bài viết mới
   */
  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Tạo bài viết mới' })
  @ApiResponse({ status: 201, description: 'Tạo thành công' })
  @ApiResponse({ status: 400, description: 'Dữ liệu không hợp lệ' })
  async create(
    @CurrentUser('sub') userId: string,
    @Body() createDto: CreateNewsDto,
  ) {
    return this.newsService.create(userId, createDto);
  }

  /**
   * Cập nhật bài viết
   */
  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Cập nhật bài viết' })
  @ApiResponse({ status: 200, description: 'Cập nhật thành công' })
  @ApiResponse({ status: 403, description: 'Không có quyền' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy' })
  async update(
    @Param('id') id: string,
    @CurrentUser('sub') userId: string,
    @CurrentUser('role') role: string,
    @Body() updateDto: UpdateNewsDto,
  ) {
    return this.newsService.update(id, userId, role, updateDto);
  }

  /**
   * Xóa bài viết (Soft delete)
   */
  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Xóa bài viết' })
  @ApiResponse({ status: 200, description: 'Xóa thành công' })
  @ApiResponse({ status: 403, description: 'Không có quyền' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy' })
  async remove(
    @Param('id') id: string,
    @CurrentUser('sub') userId: string,
    @CurrentUser('role') role: string,
  ) {
    return this.newsService.remove(id, userId, role);
  }
}
