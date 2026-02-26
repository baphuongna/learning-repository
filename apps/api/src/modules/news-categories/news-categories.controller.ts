/**
 * News Categories Controller - Xử lý HTTP requests cho danh mục tin tức
 *
 * Endpoints:
 * - GET    /news-categories       - Danh sách danh mục (public)
 * - GET    /news-categories/:id   - Chi tiết danh mục
 * - POST   /news-categories       - Tạo danh mục (Admin)
 * - PUT    /news-categories/:id   - Cập nhật danh mục (Admin)
 * - DELETE /news-categories/:id   - Xóa danh mục (Admin)
 *
 * @module NewsCategoriesController
 */

import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { Public } from '@/common/decorators/public.decorator';
import { NewsCategoriesService } from './news-categories.service';
import { CreateCategoryDto, UpdateCategoryDto } from './dto/create-category.dto';

@ApiTags('News Categories')
@Controller('news-categories')
export class NewsCategoriesController {
  constructor(private readonly categoriesService: NewsCategoriesService) {}

  /**
   * Lấy danh sách danh mục (Public)
   *
   * @returns Danh sách danh mục active
   */
  @Get()
  @Public()
  @ApiOperation({ summary: 'Lấy danh sách danh mục (public)' })
  @ApiResponse({ status: 200, description: 'Danh sách danh mục' })
  async findAll() {
    return this.categoriesService.findAll();
  }

  /**
   * Lấy danh sách tất cả danh mục (Admin)
   *
   * @param role - Role của user
   * @returns Danh sách tất cả danh mục
   */
  @Get('admin')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Lấy tất cả danh mục (Admin)' })
  @ApiResponse({ status: 200, description: 'Danh sách tất cả danh mục' })
  async findAllAdmin(@CurrentUser('role') role: string) {
    if (role !== 'ADMIN') {
      throw new Error('Chỉ Admin mới có quyền truy cập');
    }
    return this.categoriesService.findAllAdmin();
  }

  /**
   * Lấy chi tiết danh mục
   *
   * @param id - ID danh mục
   * @returns Chi tiết danh mục
   */
  @Get(':id')
  @Public()
  @ApiOperation({ summary: 'Chi tiết danh mục' })
  @ApiResponse({ status: 200, description: 'Chi tiết danh mục' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy' })
  async findOne(@Param('id') id: string) {
    return this.categoriesService.findOne(id);
  }

  /**
   * Tạo danh mục mới (Admin only)
   *
   * @param role - Role của user
   * @param createDto - Dữ liệu tạo danh mục
   * @returns Danh mục đã tạo
   */
  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Tạo danh mục mới (Admin)' })
  @ApiResponse({ status: 201, description: 'Tạo thành công' })
  @ApiResponse({ status: 403, description: 'Không có quyền' })
  async create(
    @CurrentUser('role') role: string,
    @Body() createDto: CreateCategoryDto,
  ) {
    if (role !== 'ADMIN') {
      throw new Error('Chỉ Admin mới có quyền tạo danh mục');
    }
    return this.categoriesService.create(createDto);
  }

  /**
   * Cập nhật danh mục (Admin only)
   *
   * @param id - ID danh mục
   * @param role - Role của user
   * @param updateDto - Dữ liệu cập nhật
   * @returns Danh mục đã cập nhật
   */
  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Cập nhật danh mục (Admin)' })
  @ApiResponse({ status: 200, description: 'Cập nhật thành công' })
  @ApiResponse({ status: 403, description: 'Không có quyền' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy' })
  async update(
    @Param('id') id: string,
    @CurrentUser('role') role: string,
    @Body() updateDto: UpdateCategoryDto,
  ) {
    if (role !== 'ADMIN') {
      throw new Error('Chỉ Admin mới có quyền cập nhật danh mục');
    }
    return this.categoriesService.update(id, updateDto);
  }

  /**
   * Xóa danh mục (Admin only)
   *
   * @param id - ID danh mục
   * @param role - Role của user
   * @returns Message xác nhận
   */
  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Xóa danh mục (Admin)' })
  @ApiResponse({ status: 200, description: 'Xóa thành công' })
  @ApiResponse({ status: 403, description: 'Không có quyền hoặc danh mục có bài viết' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy' })
  async remove(
    @Param('id') id: string,
    @CurrentUser('role') role: string,
  ) {
    if (role !== 'ADMIN') {
      throw new Error('Chỉ Admin mới có quyền xóa danh mục');
    }
    return this.categoriesService.remove(id);
  }
}
