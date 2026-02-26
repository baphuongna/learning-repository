/**
 * News Categories Service - Xử lý logic nghiệp vụ cho danh mục tin tức
 *
 * Chức năng:
 * - CRUD danh mục tin tức
 * - Chỉ Admin mới có quyền tạo/sửa/xóa
 *
 * @module NewsCategoriesService
 */

import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '@/common/services/prisma.service';
import { CreateCategoryDto, UpdateCategoryDto } from './dto/create-category.dto';

@Injectable()
export class NewsCategoriesService {
  constructor(private prisma: PrismaService) {}

  /**
   * Lấy danh sách danh mục (Public - chỉ lấy ACTIVE)
   *
   * @returns Danh sách danh mục active
   */
  async findAll() {
    return this.prisma.newsCategory.findMany({
      where: { status: 'ACTIVE' },
      orderBy: { order: 'asc' },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        order: true,
        createdAt: true,
      },
    });
  }

  /**
   * Lấy danh sách tất cả danh mục (Admin - bao gồm INACTIVE)
   *
   * @returns Danh sách tất cả danh mục với số lượng tin
   */
  async findAllAdmin() {
    return this.prisma.newsCategory.findMany({
      orderBy: { order: 'asc' },
      include: {
        _count: {
          select: { news: true },
        },
      },
    });
  }

  /**
   * Lấy chi tiết một danh mục
   *
   * @param id - ID danh mục
   * @returns Chi tiết danh mục
   */
  async findOne(id: string) {
    const category = await this.prisma.newsCategory.findUnique({
      where: { id },
      include: {
        _count: {
          select: { news: true },
        },
      },
    });

    if (!category) {
      throw new NotFoundException('Không tìm thấy danh mục');
    }

    return category;
  }

  /**
   * Lấy danh mục theo slug
   *
   * @param slug - Slug danh mục
   * @returns Chi tiết danh mục
   */
  async findBySlug(slug: string) {
    const category = await this.prisma.newsCategory.findUnique({
      where: { slug },
    });

    if (!category || category.status !== 'ACTIVE') {
      throw new NotFoundException('Không tìm thấy danh mục');
    }

    return category;
  }

  /**
   * Tạo danh mục mới (Admin only)
   *
   * @param createDto - Dữ liệu tạo danh mục
   * @returns Danh mục đã tạo
   */
  async create(createDto: CreateCategoryDto) {
    // Kiểm tra slug đã tồn tại chưa
    const existing = await this.prisma.newsCategory.findUnique({
      where: { slug: createDto.slug },
    });

    if (existing) {
      throw new ConflictException('Slug đã tồn tại');
    }

    return this.prisma.newsCategory.create({
      data: {
        name: createDto.name,
        slug: createDto.slug,
        description: createDto.description,
        order: createDto.order ?? 0,
        status: createDto.status ?? 'ACTIVE',
      },
    });
  }

  /**
   * Cập nhật danh mục (Admin only)
   *
   * @param id - ID danh mục
   * @param updateDto - Dữ liệu cập nhật
   * @returns Danh mục đã cập nhật
   */
  async update(id: string, updateDto: UpdateCategoryDto) {
    // Kiểm tra danh mục tồn tại
    const category = await this.prisma.newsCategory.findUnique({
      where: { id },
    });

    if (!category) {
      throw new NotFoundException('Không tìm thấy danh mục');
    }

    // Kiểm tra slug mới có trùng với danh mục khác không
    if (updateDto.slug && updateDto.slug !== category.slug) {
      const existing = await this.prisma.newsCategory.findUnique({
        where: { slug: updateDto.slug },
      });

      if (existing) {
        throw new ConflictException('Slug đã tồn tại');
      }
    }

    return this.prisma.newsCategory.update({
      where: { id },
      data: {
        name: updateDto.name,
        slug: updateDto.slug,
        description: updateDto.description,
        order: updateDto.order,
        status: updateDto.status,
      },
    });
  }

  /**
   * Xóa danh mục (Admin only - Soft delete)
   *
   * @param id - ID danh mục
   * @returns Message xác nhận
   */
  async remove(id: string) {
    // Kiểm tra danh mục tồn tại
    const category = await this.prisma.newsCategory.findUnique({
      where: { id },
      include: {
        _count: {
          select: { news: true },
        },
      },
    });

    if (!category) {
      throw new NotFoundException('Không tìm thấy danh mục');
    }

    // Kiểm tra xem có tin tức trong danh mục không
    if (category._count.news > 0) {
      throw new ForbiddenException(
        `Không thể xóa danh mục đang có ${category._count.news} bài viết`,
      );
    }

    // Soft delete
    await this.prisma.newsCategory.update({
      where: { id },
      data: { status: 'INACTIVE' },
    });

    return { message: 'Đã xóa danh mục thành công' };
  }
}
