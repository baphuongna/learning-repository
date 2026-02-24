/**
 * Documents Service - Xử lý logic nghiệp vụ liên quan đến tài liệu
 *
 * Các chức năng chính:
 * - CRUD tài liệu (Create, Read, Update, Delete)
 * - Tìm kiếm tài liệu
 * - Phân quyền truy cập (Admin/User)
 *
 * Phân quyền:
 * - Admin: Xem tất cả tài liệu
 * - User: Chỉ xem tài liệu của mình và tài liệu công khai
 *
 * @module DocumentsService
 */

import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '@/common/services/prisma.service';
import { CreateDocumentDto, UpdateDocumentDto } from './dto/create-document.dto';

@Injectable()
export class DocumentsService {
  constructor(private prisma: PrismaService) {}

  /**
   * Parse keywords từ string (multipart/form-data) hoặc array
   * Input: "toán, lớp 10" -> Output: ["toán", "lớp 10"]
   */
  private parseKeywords(keywords: string | string[] | undefined): string[] {
    if (!keywords) return [];
    if (Array.isArray(keywords)) return keywords;
    if (typeof keywords === 'string') {
      return keywords
        .split(',')
        .map((item) => item.trim())
        .filter((item) => item.length > 0);
    }
    return [];
  }

  /**
   * Parse boolean từ string (multipart/form-data)
   */
  private parseBoolean(value: string | boolean | undefined): boolean {
    if (typeof value === 'boolean') return value;
    if (typeof value === 'string') return value === 'true';
    return false;
  }

  /**
   * Tạo tài liệu mới
   *
   * @param userId - ID của user tạo tài liệu
   * @param createDto - Metadata của tài liệu
   * @param file - File được upload
   * @returns Tài liệu đã tạo
   */
  async create(
    userId: string,
    createDto: CreateDocumentDto,
    file: Express.Multer.File,
  ) {
    // Kiểm tra file
    if (!file) {
      throw new Error('Vui lòng chọn file để tải lên');
    }

    const keywords = this.parseKeywords(createDto.keywords);
    const isPublic = this.parseBoolean(createDto.isPublic);

    const document = await this.prisma.document.create({
      data: {
        userId,
        title: createDto.title,
        description: createDto.description,
        author: createDto.author,
        subject: createDto.subject,
        // Lưu keywords dưới dạng JSON string (SQLite không hỗ trợ array)
        keywords: JSON.stringify(keywords),
        fileName: file.originalname,
        filePath: file.path,
        fileSize: file.size,
        mimeType: file.mimetype,
        isPublic,
        status: 'ACTIVE',
      },
      include: {
        user: {
          select: { id: true, fullName: true, email: true },
        },
      },
    });

    return this.formatDocument(document);
  }

  /**
   * Lấy danh sách tài liệu
   *
   * Phân quyền:
   * - Admin: Xem tất cả tài liệu ACTIVE
   * - User: Xem tài liệu của mình + tài liệu công khai
   *
   * @param userId - ID của user hiện tại
   * @param role - Role của user (ADMIN/USER)
   * @param page - Số trang (pagination)
   * @param limit - Số items per page
   * @returns Danh sách tài liệu với metadata pagination
   */
  async findAll(userId: string, role: string, page = 1, limit = 10) {
    const skip = (page - 1) * limit;

    // Xây dựng where clause dựa trên role
    const where =
      role === 'ADMIN'
        ? { status: 'ACTIVE' }
        : {
            OR: [{ userId }, { isPublic: true }],
            status: 'ACTIVE',
          };

    // Query song song để tối ưu performance
    const [documents, total] = await Promise.all([
      this.prisma.document.findMany({
        where,
        include: {
          user: {
            select: { id: true, fullName: true, email: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.document.count({ where }),
    ]);

    return {
      data: documents.map((doc) => this.formatDocument(doc)),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Lấy chi tiết một tài liệu
   *
   * Kiểm tra quyền truy cập:
   * - Admin: Xem được tất cả
   * - Owner: Xem được tài liệu của mình
   * - Public: Ai cũng xem được tài liệu công khai
   *
   * @param id - ID của tài liệu
   * @param userId - ID của user hiện tại
   * @param role - Role của user
   * @returns Chi tiết tài liệu
   * @throws NotFoundException nếu không tìm thấy
   * @throws ForbiddenException nếu không có quyền xem
   */
  async findOne(id: string, userId: string, role: string) {
    const doc = await this.prisma.document.findUnique({
      where: { id },
      include: {
        user: {
          select: { id: true, fullName: true, email: true },
        },
      },
    });

    // Kiểm tra tài liệu tồn tại và chưa bị xóa
    if (!doc || doc.status === 'DELETED') {
      throw new NotFoundException('Không tìm thấy tài liệu');
    }

    // Kiểm tra quyền truy cập
    if (role !== 'ADMIN' && doc.userId !== userId && !doc.isPublic) {
      throw new ForbiddenException('Bạn không có quyền xem tài liệu này');
    }

    return this.formatDocument(doc);
  }

  /**
   * Cập nhật metadata tài liệu
   *
   * Chỉ owner hoặc admin mới có quyền sửa
   * Không thay đổi file, chỉ cập nhật metadata
   *
   * @param id - ID của tài liệu
   * @param userId - ID của user hiện tại
   * @param role - Role của user
   * @param updateDto - Dữ liệu cập nhật
   * @returns Tài liệu đã cập nhật
   */
  async update(id: string, userId: string, role: string, updateDto: UpdateDocumentDto) {
    // Kiểm tra quyền sửa
    const doc = await this.prisma.document.findUnique({
      where: { id },
      select: { userId: true, status: true },
    });

    if (!doc || doc.status === 'DELETED') {
      throw new NotFoundException('Không tìm thấy tài liệu');
    }

    if (role !== 'ADMIN' && doc.userId !== userId) {
      throw new ForbiddenException('Bạn không có quyền sửa tài liệu này');
    }

    // Parse keywords và isPublic
    const keywords = updateDto.keywords !== undefined
      ? this.parseKeywords(updateDto.keywords)
      : undefined;
    const isPublic = updateDto.isPublic !== undefined
      ? this.parseBoolean(updateDto.isPublic)
      : undefined;

    // Cập nhật
    const updated = await this.prisma.document.update({
      where: { id },
      data: {
        title: updateDto.title,
        description: updateDto.description,
        author: updateDto.author,
        subject: updateDto.subject,
        keywords: keywords !== undefined ? JSON.stringify(keywords) : undefined,
        isPublic,
      },
      include: {
        user: {
          select: { id: true, fullName: true, email: true },
        },
      },
    });

    return this.formatDocument(updated);
  }

  /**
   * Xóa tài liệu (Soft Delete)
   *
   * Chỉ owner hoặc admin mới có quyền xóa
   * Không xóa thực sự, chỉ đổi status thành DELETED
   *
   * @param id - ID của tài liệu
   * @param userId - ID của user hiện tại
   * @param role - Role của user
   * @returns Message xác nhận
   */
  async remove(id: string, userId: string, role: string) {
    // Kiểm tra quyền xóa
    const doc = await this.prisma.document.findUnique({
      where: { id },
      select: { userId: true, status: true },
    });

    if (!doc || doc.status === 'DELETED') {
      throw new NotFoundException('Không tìm thấy tài liệu');
    }

    if (role !== 'ADMIN' && doc.userId !== userId) {
      throw new ForbiddenException('Bạn không có quyền xóa tài liệu này');
    }

    // Soft delete - chỉ đổi status
    await this.prisma.document.update({
      where: { id },
      data: { status: 'DELETED' },
    });

    return { message: 'Đã xóa tài liệu thành công' };
  }

  /**
   * Tìm kiếm tài liệu
   *
   * Tìm kiếm trong các trường: title, description, author, subject
   *
   * @param query - Từ khóa tìm kiếm
   * @param userId - ID của user hiện tại
   * @param role - Role của user
   * @param page - Số trang
   * @param limit - Số items per page
   * @returns Kết quả tìm kiếm
   */
  async search(query: string, userId: string, role: string, page = 1, limit = 10) {
    const skip = (page - 1) * limit;

    // Tìm kiếm trong nhiều trường
    const where: any = {
      status: 'ACTIVE',
      OR: [
        { title: { contains: query } },
        { description: { contains: query } },
        { author: { contains: query } },
        { subject: { contains: query } },
      ],
    };

    const [documents, total] = await Promise.all([
      this.prisma.document.findMany({
        where,
        include: {
          user: {
            select: { id: true, fullName: true, email: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.document.count({ where }),
    ]);

    return {
      data: documents.map((doc) => this.formatDocument(doc)),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        query,
      },
    };
  }

  /**
   * Lấy danh sách tài liệu của user hiện tại
   *
   * @param userId - ID của user
   * @param page - Số trang
   * @param limit - Số items per page
   * @returns Danh sách tài liệu của user
   */
  async getMyDocuments(userId: string, page = 1, limit = 10) {
    const skip = (page - 1) * limit;

    const [documents, total] = await Promise.all([
      this.prisma.document.findMany({
        where: {
          userId,
          status: 'ACTIVE',
        },
        include: {
          user: {
            select: { id: true, fullName: true, email: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.document.count({
        where: { userId, status: 'ACTIVE' },
      }),
    ]);

    return {
      data: documents.map((doc) => this.formatDocument(doc)),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Format document để trả về API
   *
   * - Parse keywords từ JSON string thành array
   * - Convert fileSize sang string (để tránh BigInt issues)
   *
   * @param doc - Document từ database
   * @returns Document đã format
   */
  private formatDocument(doc: any) {
    let keywords: string[] = [];
    try {
      keywords = doc.keywords ? JSON.parse(doc.keywords) : [];
    } catch {
      keywords = [];
    }

    return {
      ...doc,
      keywords,
      fileSize: doc.fileSize ? doc.fileSize.toString() : null,
    };
  }
}
