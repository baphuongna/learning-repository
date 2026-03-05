/**
 * DocumentsService - Xử lý logic nghiệp vụ liên quan đến tài liệu
 *
 * Chức năng:
 * - CRUD tài liệu
 * - Phân trang
 * - Tìm kiếm
 * - Lấy chi tiết
 * - Lấy breadcrumbs
 * - Move documents between folders
 * - Soft delete
 * - Get document stats
 */
import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '@/common/services/prisma.service';
import { CreateDocumentDto, UpdateDocumentDto } from './dto/create-document.dto';

// Types
interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    query?: string;
  };
}

@Injectable()
export class DocumentsService {
  constructor(private prisma: PrismaService) {}

  // ==================== CRUD Operations ====================

  /**
   * Lấy danh sách tài liệu
   */
  async findAll(
    userId: string,
    role: string,
    page: number = 1,
    limit: number = 10,
    folderId?: string | null,
  ) {
    const skip = (page - 1) * limit;

    // Build where clause based on role
    let where: any = { status: 'ACTIVE' };

    // Filter by folder if folderId is provided (including null for root folder)
    // undefined means no filter at all
    if (folderId !== undefined) {
      where.folderId = folderId;
    }

    if (role !== 'ADMIN') {
      // User sees their own documents + public ones
      where.OR = [
        { userId },
        { isPublic: true },
      ];
    }

    // Get total count and documents
    const [documents, total] = await Promise.all([
      this.prisma.document.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: {
          user: {
            select: { id: true, fullName: true, email: true },
          },
          folder: {
            select: { id: true, name: true, color: true },
          },
        },
      }),
      this.prisma.document.count({ where }),
    ]);

    return {
      data: this.parseDocumentsResponse(documents),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Lấy tài liệu của user hiện tại
   */
  async getMyDocuments(
    userId: string,
    page: number = 1,
    limit: number = 10,
    folderId?: string | null,
  ) {
    const skip = (page - 1) * limit;

    const where: any = {
      userId,
      status: 'ACTIVE',
    };

    // Filter by folderId if provided (including null for root folder)
    if (folderId !== undefined) {
      where.folderId = folderId;
    }

    const [documents, total] = await Promise.all([
      this.prisma.document.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: {
          folder: {
            select: { id: true, name: true, color: true },
          },
        },
      }),
      this.prisma.document.count({ where }),
    ]);

    return {
      data: this.parseDocumentsResponse(documents),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Lấy chi tiết tài liệu
   */
  async findOne(id: string, userId: string, role: string) {
    const doc = await this.prisma.document.findUnique({
      where: { id },
      include: {
        user: {
          select: { id: true, fullName: true, email: true },
        },
        folder: {
          select: { id: true, name: true, color: true },
        },
      },
    });

    if (!doc || doc.status === 'DELETED') {
      throw new NotFoundException('Document not found');
    }

    if (role !== 'ADMIN' && !doc.isPublic && doc.userId !== userId) {
      throw new ForbiddenException('Access denied');
    }

    return this.parseDocumentResponse(doc);
  }

  /**
   * Tạo tài liệu mới
   */
  async create(
    userId: string,
    createDocumentDto: CreateDocumentDto,
    file?: Express.Multer.File,
  ) {
    // Check folder access if needed
    if (createDocumentDto.folderId) {
      const folder = await this.prisma.folder.findUnique({
        where: { id: createDocumentDto.folderId },
      });
      if (!folder || folder.status === 'DELETED') {
        throw new NotFoundException('Folder not found');
      }
    }

    const keywords = this.parseKeywords(createDocumentDto.keywords);
    let isPublic = false;
    if (createDocumentDto.isPublic !== undefined) {
      if (typeof createDocumentDto.isPublic === 'string') {
        isPublic = createDocumentDto.isPublic === 'true';
      } else if (typeof createDocumentDto.isPublic === 'boolean') {
        isPublic = createDocumentDto.isPublic;
      }
    }

    const doc = await this.prisma.document.create({
      data: {
        title: createDocumentDto.title,
        description: createDocumentDto.description,
        author: createDocumentDto.author,
        subject: createDocumentDto.subject,
        keywords: JSON.stringify(keywords),
        folderId: createDocumentDto.folderId ?? null,
        isPublic,
        userId,
        status: 'ACTIVE',
        fileName: file?.originalname,
        filePath: file?.path,
        fileSize: file?.size,
        mimeType: file?.mimetype,
      },
      include: {
        user: {
          select: { id: true, fullName: true, email: true },
        },
        folder: {
          select: { id: true, name: true, color: true },
        },
      },
    });

    return this.parseDocumentResponse(doc);
  }

  /**
   * Cập nhật tài liệu
   */
  async update(
    id: string,
    userId: string,
    role: string,
    updateDocumentDto: UpdateDocumentDto,
  ) {
    // Check ownership
    const doc = await this.prisma.document.findUnique({
      where: { id },
    });

    if (!doc || doc.status === 'DELETED') {
      throw new NotFoundException('Document not found');
    }

    if (role !== 'ADMIN' && doc.userId !== userId) {
      throw new ForbiddenException('Access denied');
    }

    // Check folder access if changing folder
    if (updateDocumentDto.folderId !== undefined) {
      if (updateDocumentDto.folderId) {
        const folder = await this.prisma.folder.findUnique({
          where: { id: updateDocumentDto.folderId },
        });
        if (!folder || folder.status === 'DELETED') {
          throw new NotFoundException('Folder not found');
        }
      }
    }

    // Build update data
    const updateData: any = {};

    if (updateDocumentDto.title !== undefined) {
      updateData.title = updateDocumentDto.title;
    }
    if (updateDocumentDto.description !== undefined) {
      updateData.description = updateDocumentDto.description;
    }
    if (updateDocumentDto.author !== undefined) {
      updateData.author = updateDocumentDto.author;
    }
    if (updateDocumentDto.subject !== undefined) {
      updateData.subject = updateDocumentDto.subject;
    }
    if (updateDocumentDto.keywords !== undefined) {
      updateData.keywords = JSON.stringify(this.parseKeywords(updateDocumentDto.keywords));
    }
    if (updateDocumentDto.folderId !== undefined) {
      updateData.folderId = updateDocumentDto.folderId ?? null;
    }
    if (updateDocumentDto.isPublic !== undefined) {
      // Handle isPublic which can be string from form-data or boolean from JSON
      const isPublicValue = updateDocumentDto.isPublic;
      if (typeof isPublicValue === 'string') {
        updateData.isPublic = isPublicValue === 'true';
      } else if (typeof isPublicValue === 'boolean') {
        updateData.isPublic = isPublicValue;
      }
    }

    await this.prisma.document.update({
      where: { id },
      data: updateData,
    });

    const updatedDoc = await this.prisma.document.findUnique({
      where: { id },
      include: {
        user: {
          select: { id: true, fullName: true, email: true },
        },
        folder: {
          select: { id: true, name: true, color: true },
        },
      },
    });

    return this.parseDocumentResponse(updatedDoc);
  }

  /**
   * Xóa tài liệu (soft delete)
   */
  async remove(id: string, userId: string, role: string): Promise<void> {
    // Check ownership
    const doc = await this.prisma.document.findUnique({
      where: { id },
    });

    if (!doc || doc.status === 'DELETED') {
      throw new NotFoundException('Document not found');
    }

    if (role !== 'ADMIN' && doc.userId !== userId) {
      throw new ForbiddenException('Access denied');
    }

    // Soft delete
    await this.prisma.document.update({
      where: { id },
      data: { status: 'DELETED' },
    });
  }

  /**
   * Tìm kiếm tài liệu
   */
  async search(
    query: string,
    userId: string,
    role: string,
    page: number = 1,
    limit: number = 10,
  ) {
    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {
      status: 'ACTIVE',
      OR: [
        { title: { contains: query } },
        { description: { contains: query } },
        { author: { contains: query } },
        { subject: { contains: query } },
        { keywords: { contains: query } },
      ],
    };

    if (role !== 'ADMIN') {
      // User can only see their own + public
      where.AND = [
        {
          OR: [
            { userId },
            { isPublic: true },
          ],
        },
      ];
    }

    // Get total count
    const [documents, total] = await Promise.all([
      this.prisma.document.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: {
          user: {
            select: { id: true, fullName: true, email: true },
          },
          folder: {
            select: { id: true, name: true, color: true },
          },
        },
      }),
      this.prisma.document.count({ where }),
    ]);

    return {
      data: this.parseDocumentsResponse(documents),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        query,
      },
    };
  }

  // ==================== Helper Methods ====================

  /**
   * Parse keywords from string to array
   */
  private parseKeywords(keywords: string | string[] | undefined): string[] {
    if (!keywords) return [];

    if (Array.isArray(keywords)) {
      return keywords.filter((item) => item.length > 0);
    }

    try {
      return keywords
        .split(',')
        .map((item) => item.trim())
        .filter((item) => item.length > 0);
    } catch {
      console.error('Failed to parse keywords:', keywords);
      return [];
    }
  }

  /**
   * Parse document keywords from JSON string to array for response
   */
  private parseDocumentResponse(doc: any): any {
    if (!doc) return doc;

    // Parse keywords if it's a string
    if (typeof doc.keywords === 'string') {
      try {
        doc.keywords = JSON.parse(doc.keywords);
      } catch {
        doc.keywords = [];
      }
    }

    // Ensure keywords is always an array
    if (!Array.isArray(doc.keywords)) {
      doc.keywords = [];
    }

    return doc;
  }

  /**
   * Parse array of documents
   */
  private parseDocumentsResponse(docs: any[]): any[] {
    return docs.map((doc) => this.parseDocumentResponse(doc));
  }
}
