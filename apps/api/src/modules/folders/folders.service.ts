/**
 * FoldersService - Xử lý logic nghiệp vụ liên quan đến thư mục
 *
 * Chức năng:
 * - CRUD thư mục
 * - Build tree (đệ quy)
 * - Get breadcrumbs
 * - Get children
 * - Move documents between folders
 * - Soft delete
 */
import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '@/common/services/prisma.service';
import { CreateFolderDto, UpdateFolderDto } from './dto/create-folder.dto';

@Injectable()
export class FoldersService {
  constructor(private prisma: PrismaService) {}

  // ==================== CRUD Operations ====================

  /**
   * Lấy danh sách thư mục (Admin thấy tất cả, User thấy của mình + public)
   */
  async findAll(userId: string, role: string) {
    if (role === 'ADMIN') {
      return this.prisma.folder.findMany({
        where: { status: 'ACTIVE' },
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: { id: true, fullName: true, email: true },
          },
          _count: {
            select: { documents: true, children: true },
          },
        },
      });
    }

    return this.prisma.folder.findMany({
      where: {
        status: 'ACTIVE',
        OR: [{ userId }, { isPublic: true }],
      },
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: { id: true, fullName: true, email: true },
        },
        _count: {
          select: { documents: true, children: true },
        },
      },
    });
  }

  /**
   * Lấy cây thư mục (đệ quy) - returns nested folder structure
   */
  async getTree(userId: string, role: string, parentId: string | null = null): Promise<any[]> {
    // Build where clause
    const where: any = {
      parentId,
      status: 'ACTIVE',
    };

    if (role !== 'ADMIN') {
      where.OR = [{ userId }, { isPublic: true }];
    }

    const folders = await this.prisma.folder.findMany({
      where,
      orderBy: { name: 'asc' },
      select: {
        id: true,
        name: true,
        description: true,
        color: true,
        isPublic: true,
        createdAt: true,
        updatedAt: true,
        user: {
          select: { id: true, fullName: true },
        },
        _count: {
          select: { documents: true, children: true },
        },
      },
    });

    // Recursively get children for each folder
    const foldersWithChildren = await Promise.all(
      folders.map(async (folder) => ({
        ...folder,
        children: await this.getTree(userId, role, folder.id),
      }))
    );

    return foldersWithChildren;
  }

  /**
   * Lấy thông tin chi tiết thư mục
   */
  async findOne(id: string, userId: string, role: string) {
    const folder = await this.prisma.folder.findUnique({
      where: { id },
      include: {
        user: {
          select: { id: true, fullName: true, email: true },
        },
        _count: {
          select: { documents: true, children: true },
        },
      },
    });

    if (!folder || folder.status === 'DELETED') {
      throw new NotFoundException('Không tìm thấy thư mục');
    }

    // Check permission
    if (role !== 'ADMIN' && folder.userId !== userId && !folder.isPublic) {
      throw new ForbiddenException('Bạn không có quyền xem thư mục này');
    }

    return folder;
  }

  /**
   * Lấy breadcrumb (đường dẫn từ root đến thư mục hiện tại)
   */
  async getBreadcrumb(folderId: string, userId: string, role: string) {
    const breadcrumbs: any[] = [];
    let currentId: string | null = folderId;

    type FolderBreadcrumb = { id: string; name: string; parentId: string | null };

    while (currentId) {
      const folder: FolderBreadcrumb | null = await this.prisma.folder.findUnique({
        where: { id: currentId },
        select: {
          id: true,
          name: true,
          parentId: true,
        },
      });

      if (!folder) break;

      // Check permission
      if (role !== 'ADMIN') {
        const fullFolder = await this.prisma.folder.findUnique({
          where: { id: folder.id },
        });
        if (fullFolder && fullFolder.userId !== userId && !fullFolder.isPublic) {
          throw new ForbiddenException('Bạn không có quyền truy cập thư mục này');
        }
      }

      breadcrumbs.unshift(folder);
      currentId = folder.parentId;
    }

    return breadcrumbs;
  }

  /**
   * Lấy danh sách con trực tiếp của thư mục
   */
  async getChildren(parentId: string | null, userId: string, role: string) {
    const where: any = {
      parentId,
      status: 'ACTIVE',
    };

    if (role !== 'ADMIN') {
      where.OR = [{ userId }, { isPublic: true }];
    }

    return this.prisma.folder.findMany({
      where,
      orderBy: { name: 'asc' },
      include: {
        user: {
          select: { id: true, fullName: true },
        },
        _count: {
          select: { documents: true, children: true },
        },
      },
    });
  }

  /**
   * Tạo thư mục mới
   */
  async create(userId: string, createFolderDto: CreateFolderDto) {
    // Validate parent folder if specified
    if (createFolderDto.parentId) {
      const parent = await this.prisma.folder.findUnique({
        where: { id: createFolderDto.parentId },
      });
      if (!parent || parent.status === 'DELETED') {
        throw new NotFoundException('Thư mục cha không tồn tại');
      }
    }

    return this.prisma.folder.create({
      data: {
        name: createFolderDto.name,
        description: createFolderDto.description,
        color: createFolderDto.color ?? '#3B82F6',
        parentId: createFolderDto.parentId ?? null,
        isPublic: createFolderDto.isPublic ?? false,
        userId,
      },
      include: {
        user: {
          select: { id: true, fullName: true, email: true },
        },
      },
    });
  }

  /**
   * Cập nhật thư mục
   */
  async update(id: string, userId: string, role: string, updateFolderDto: UpdateFolderDto) {
    // Check ownership
    const folder = await this.prisma.folder.findUnique({
      where: { id },
    });

    if (!folder || folder.status === 'DELETED') {
      throw new NotFoundException('Không tìm thấy thư mục');
    }

    if (role !== 'ADMIN' && folder.userId !== userId) {
      throw new ForbiddenException('Bạn không có quyền sửa thư mục này');
    }

    // Validate parent folder if changing
    if (updateFolderDto.parentId !== undefined) {
      // Prevent setting parent to self or descendant
      if (updateFolderDto.parentId === id) {
        throw new ForbiddenException('Không thể đặt thư mục cha là chính nó');
      }

      if (updateFolderDto.parentId) {
        const parent = await this.prisma.folder.findUnique({
          where: { id: updateFolderDto.parentId },
        });
        if (!parent || parent.status === 'DELETED') {
          throw new NotFoundException('Thư mục cha không tồn tại');
        }

        // Check if new parent is a descendant (would create cycle)
        const isDescendant = await this.isDescendant(id, updateFolderDto.parentId);
        if (isDescendant) {
          throw new ForbiddenException('Không thể di chuyển thư mục vào thư mục con của nó');
        }
      }
    }

    return this.prisma.folder.update({
      where: { id },
      data: updateFolderDto,
      include: {
        user: {
          select: { id: true, fullName: true, email: true },
        },
      },
    });
  }

  /**
   * Xóa thư mục (soft delete)
   */
  async remove(id: string, userId: string, role: string) {
    // Check ownership
    const folder = await this.prisma.folder.findUnique({
      where: { id },
    });

    if (!folder || folder.status === 'DELETED') {
      throw new NotFoundException('Không tìm thấy thư mục');
    }

    if (role !== 'ADMIN' && folder.userId !== userId) {
      throw new ForbiddenException('Bạn không có quyền xóa thư mục này');
    }

    // Soft delete
    return this.prisma.folder.update({
      where: { id },
      data: { status: 'DELETED' },
    });
  }

  // ==================== Helper Methods ====================

  /**
   * Check if targetId is a descendant of folderId
   */
  private async isDescendant(folderId: string, targetId: string): Promise<boolean> {
    let current = await this.prisma.folder.findUnique({
      where: { id: targetId },
      select: { parentId: true },
    });

    while (current?.parentId) {
      if (current.parentId === folderId) {
        return true;
      }
      current = await this.prisma.folder.findUnique({
        where: { id: current.parentId },
        select: { parentId: true },
      });
    }

    return false;
  }
}
