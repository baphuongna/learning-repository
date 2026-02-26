/**
 * News Service - Xử lý logic nghiệp vụ cho tin tức
 *
 * Chức năng:
 * - CRUD tin tức
 * - Tìm kiếm tin tức
 * - Lọc theo danh mục
 * - Tin nổi bật
 *
 * @module NewsService
 */

import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '@/common/services/prisma.service';
import { CreateNewsDto, UpdateNewsDto } from './dto/create-news.dto';

@Injectable()
export class NewsService {
  constructor(private prisma: PrismaService) {}

  /**
   * Lấy danh sách tin tức đã xuất bản (Public)
   *
   * @param page - Số trang
   * @param limit - Số items per page
   * @param category - Lọc theo category ID hoặc slug
   * @param search - Tìm kiếm
   * @returns Danh sách tin tức với pagination
   */
  async findAll(page = 1, limit = 10, category?: string, search?: string) {
    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {
      isPublished: true,
      status: 'PUBLISHED',
    };

    // Filter by category
    if (category) {
      where.OR = [
        { categoryId: category },
        { category: { slug: category } },
      ];
    }

    // Search in title and summary
    if (search) {
      where.OR = [
        { title: { contains: search } },
        { summary: { contains: search } },
      ];
    }

    const [news, total] = await Promise.all([
      this.prisma.news.findMany({
        where,
        include: {
          category: {
            select: { id: true, name: true, slug: true },
          },
          user: {
            select: { id: true, fullName: true },
          },
        },
        orderBy: [
          { isFeatured: 'desc' },
          { publishedAt: 'desc' },
        ],
        skip,
        take: limit,
      }),
      this.prisma.news.count({ where }),
    ]);

    return {
      data: news,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Lấy tin tức nổi bật (Public)
   *
   * @param limit - Số lượng tin
   * @returns Danh sách tin nổi bật
   */
  async getFeatured(limit = 5) {
    return this.prisma.news.findMany({
      where: {
        isFeatured: true,
        isPublished: true,
        status: 'PUBLISHED',
      },
      include: {
        category: {
          select: { id: true, name: true, slug: true },
        },
        user: {
          select: { id: true, fullName: true },
        },
      },
      orderBy: { publishedAt: 'desc' },
      take: limit,
    });
  }

  /**
   * Lấy chi tiết tin theo slug (Public)
   * Tự động tăng view count
   *
   * @param slug - Slug tin tức
   * @returns Chi tiết tin tức
   */
  async findBySlug(slug: string) {
    const news = await this.prisma.news.findUnique({
      where: { slug },
      include: {
        category: true,
        user: {
          select: { id: true, fullName: true, avatarUrl: true },
        },
      },
    });

    if (!news || !news.isPublished || news.status !== 'PUBLISHED') {
      throw new NotFoundException('Không tìm thấy bài viết');
    }

    // Tăng view count
    await this.prisma.news.update({
      where: { id: news.id },
      data: { viewCount: { increment: 1 } },
    });

    return {
      ...news,
      viewCount: news.viewCount + 1,
    };
  }

  /**
   * Lấy chi tiết tin theo ID (Public)
   *
   * @param id - ID tin tức
   * @returns Chi tiết tin tức
   */
  async findOne(id: string) {
    const news = await this.prisma.news.findUnique({
      where: { id },
      include: {
        category: true,
        user: {
          select: { id: true, fullName: true, avatarUrl: true },
        },
      },
    });

    if (!news) {
      throw new NotFoundException('Không tìm thấy bài viết');
    }

    return news;
  }

  /**
   * Lấy bài viết của user hiện tại
   *
   * @param userId - ID user
   * @param page - Số trang
   * @param limit - Số items per page
   * @returns Danh sách bài viết của user
   */
  async getMyNews(userId: string, page = 1, limit = 10) {
    const skip = (page - 1) * limit;

    const [news, total] = await Promise.all([
      this.prisma.news.findMany({
        where: { userId },
        include: {
          category: {
            select: { id: true, name: true, slug: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.news.count({ where: { userId } }),
    ]);

    return {
      data: news,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Tạo bài viết mới
   *
   * @param userId - ID user tạo
   * @param createDto - Dữ liệu bài viết
   * @returns Bài viết đã tạo
   */
  async create(userId: string, createDto: CreateNewsDto) {
    // Kiểm tra slug đã tồn tại chưa
    const existing = await this.prisma.news.findUnique({
      where: { slug: createDto.slug },
    });

    if (existing) {
      throw new ConflictException('Slug đã tồn tại');
    }

    // Kiểm tra category tồn tại
    const category = await this.prisma.newsCategory.findUnique({
      where: { id: createDto.categoryId },
    });

    if (!category) {
      throw new NotFoundException('Danh mục không tồn tại');
    }

    // Prepare data
    const data: any = {
      userId,
      categoryId: createDto.categoryId,
      title: createDto.title,
      slug: createDto.slug,
      summary: createDto.summary,
      content: createDto.content,
      thumbnailUrl: createDto.thumbnailUrl,
      isFeatured: createDto.isFeatured ?? false,
      isPublished: createDto.isPublished ?? false,
      status: 'DRAFT',
    };

    // Nếu publish, set publishedAt
    if (createDto.isPublished) {
      data.publishedAt = new Date();
      data.status = 'PUBLISHED';
    }

    return this.prisma.news.create({
      data,
      include: {
        category: {
          select: { id: true, name: true, slug: true },
        },
        user: {
          select: { id: true, fullName: true },
        },
      },
    });
  }

  /**
   * Cập nhật bài viết
   *
   * @param id - ID bài viết
   * @param userId - ID user
   * @param role - Role user
   * @param updateDto - Dữ liệu cập nhật
   * @returns Bài viết đã cập nhật
   */
  async update(id: string, userId: string, role: string, updateDto: UpdateNewsDto) {
    // Kiểm tra bài viết tồn tại
    const news = await this.prisma.news.findUnique({
      where: { id },
    });

    if (!news) {
      throw new NotFoundException('Không tìm thấy bài viết');
    }

    // Kiểm tra quyền sửa
    if (role !== 'ADMIN' && news.userId !== userId) {
      throw new ForbiddenException('Bạn không có quyền sửa bài viết này');
    }

    // Kiểm tra slug mới có trùng không
    if (updateDto.slug && updateDto.slug !== news.slug) {
      const existing = await this.prisma.news.findUnique({
        where: { slug: updateDto.slug },
      });

      if (existing) {
        throw new ConflictException('Slug đã tồn tại');
      }
    }

    // Prepare update data
    const data: any = {
      title: updateDto.title,
      slug: updateDto.slug,
      summary: updateDto.summary,
      content: updateDto.content,
      thumbnailUrl: updateDto.thumbnailUrl,
      isFeatured: updateDto.isFeatured,
      categoryId: updateDto.categoryId,
    };

    // Handle publish status change
    if (updateDto.isPublished !== undefined) {
      data.isPublished = updateDto.isPublished;
      if (updateDto.isPublished && !news.isPublished) {
        // Publish lần đầu
        data.publishedAt = new Date();
        data.status = 'PUBLISHED';
      } else if (!updateDto.isPublished) {
        // Unpublish
        data.status = 'DRAFT';
      }
    }

    return this.prisma.news.update({
      where: { id },
      data,
      include: {
        category: {
          select: { id: true, name: true, slug: true },
        },
        user: {
          select: { id: true, fullName: true },
        },
      },
    });
  }

  /**
   * Xóa bài viết (Soft delete)
   *
   * @param id - ID bài viết
   * @param userId - ID user
   * @param role - Role user
   * @returns Message xác nhận
   */
  async remove(id: string, userId: string, role: string) {
    // Kiểm tra bài viết tồn tại
    const news = await this.prisma.news.findUnique({
      where: { id },
    });

    if (!news) {
      throw new NotFoundException('Không tìm thấy bài viết');
    }

    // Kiểm tra quyền xóa
    if (role !== 'ADMIN' && news.userId !== userId) {
      throw new ForbiddenException('Bạn không có quyền xóa bài viết này');
    }

    // Soft delete
    await this.prisma.news.update({
      where: { id },
      data: { status: 'ARCHIVED' },
    });

    return { message: 'Đã xóa bài viết thành công' };
  }
}
