/**
 * FoldersController - Xử lý các HTTP requests liên quan đến thư mục
 *
 * Endpoints:
 * - GET    /folders                    - Danh sách thư mục (flat)
 * - GET    /folders/tree               - Cây thư mục (nested)
 * - GET    /folders/:id                - Chi tiết thư mục
 * - GET    /folders/:id/breadcrumbs    - Lấy breadcrumb
 * - GET    /folders/:id/children       - Lấy thư mục con
 * - POST   /folders                    - Tạo thư mục mới
 * - PUT    /folders/:id                - Cập nhật thư mục
 * - DELETE /folders/:id                - Xóa thư mục (soft delete)
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
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { FoldersService } from './folders.service';
import { CreateFolderDto, UpdateFolderDto } from './dto/create-folder.dto';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { Public } from '@/common/decorators/public.decorator';

@ApiTags('folders')
@ApiBearerAuth()
@Controller('folders')
@UseGuards(JwtAuthGuard)
export class FoldersController {
  constructor(private readonly foldersService: FoldersService) {}

  /**
   * Lấy danh sách thư mục (flat list)
   */
  @Get()
  @ApiOperation({ summary: 'Lấy danh sách thư mục' })
  @ApiResponse({ status: 200, description: 'Danh sách thư mục' })
  async findAll(@CurrentUser() user: any) {
    return this.foldersService.findAll(user.id, user.role);
  }

  /**
   * Lấy cây thư mục (nested structure)
   */
  @Get('tree')
  @ApiOperation({ summary: 'Lấy cây thư mục' })
  @ApiResponse({ status: 200, description: 'Cây thư mục lồng nhau' })
  async getTree(
    @CurrentUser() user: any,
    @Query('parentId') parentId?: string
  ) {
    return this.foldersService.getTree(user.id, user.role, parentId ?? null);
  }

  /**
   * Lấy chi tiết thư mục
   */
  @Get(':id')
  @ApiOperation({ summary: 'Lấy chi tiết thư mục' })
  @ApiResponse({ status: 200, description: 'Thông tin thư mục' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy thư mục' })
  async findOne(@Param('id') id: string, @CurrentUser() user: any) {
    return this.foldersService.findOne(id, user.id, user.role);
  }

  /**
   * Lấy breadcrumb của thư mục
   */
  @Get(':id/breadcrumbs')
  @ApiOperation({ summary: 'Lấy đường dẫn thư mục (breadcrumb)' })
  @ApiResponse({ status: 200, description: 'Danh sách thư mục từ root đến hiện tại' })
  async getBreadcrumbs(@Param('id') id: string, @CurrentUser() user: any) {
    return this.foldersService.getBreadcrumb(id, user.id, user.role);
  }

  /**
   * Lấy thư mục con trực tiếp
   */
  @Get(':id/children')
  @ApiOperation({ summary: 'Lấy thư mục con' })
  @ApiResponse({ status: 200, description: 'Danh sách thư mục con' })
  async getChildren(@Param('id') id: string, @CurrentUser() user: any) {
    return this.foldersService.getChildren(id, user.id, user.role);
  }

  /**
   * Tạo thư mục mới
   */
  @Post()
  @ApiOperation({ summary: 'Tạo thư mục mới' })
  @ApiResponse({ status: 201, description: 'Tạo thành công' })
  async create(@Body() createFolderDto: CreateFolderDto, @CurrentUser() user: any) {
    return this.foldersService.create(user.id, createFolderDto);
  }

  /**
   * Cập nhật thư mục
   */
  @Put(':id')
  @ApiOperation({ summary: 'Cập nhật thư mục' })
  @ApiResponse({ status: 200, description: 'Cập nhật thành công' })
  @ApiResponse({ status: 403, description: 'Không có quyền' })
  async update(
    @Param('id') id: string,
    @Body() updateFolderDto: UpdateFolderDto,
    @CurrentUser() user: any
  ) {
    return this.foldersService.update(id, user.id, user.role, updateFolderDto);
  }

  /**
   * Xóa thư mục (soft delete)
   */
  @Delete(':id')
  @ApiOperation({ summary: 'Xóa thư mục' })
  @ApiResponse({ status: 200, description: 'Xóa thành công' })
  @ApiResponse({ status: 403, description: 'Không có quyền' })
  async remove(@Param('id') id: string, @CurrentUser() user: any) {
    return this.foldersService.remove(id, user.id, user.role);
  }
}
