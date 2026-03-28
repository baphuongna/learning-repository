import { rustV2Api } from './client';
import type { FolderPermission } from './types';

/**
 * API quản lý quyền truy cập thư mục
 */
export const permissionsApi = {
  /**
   * Lấy danh sách quyền của một thư mục
   */
  list: async (folderId: string): Promise<FolderPermission[]> => {
    const response = await rustV2Api.get(`/v2/folders/${folderId}/permissions`);
    return response.data;
  },

  /**
   * Cấp quyền cho một người dùng
   */
  grant: async (
    folderId: string,
    data: { userId: string; canUpload: boolean }
  ): Promise<FolderPermission> => {
    const response = await rustV2Api.post(`/v2/folders/${folderId}/permissions`, data);
    return response.data;
  },

  /**
   * Thu hồi quyền của một người dùng
   */
  revoke: async (folderId: string, permissionId: string): Promise<void> => {
    await rustV2Api.delete(`/v2/folders/${folderId}/permissions/${permissionId}`);
  },
};

/**
 * API tìm kiếm người dùng
 */
export const usersSearchApi = {
  /**
   * Tìm kiếm người dùng theo email hoặc tên
   */
  search: async (query: string): Promise<Array<{ id: string; fullName: string; email: string }>> => {
    const response = await rustV2Api.get('/v2/users/search', {
      params: { q: query },
    });
    return response.data;
  },
};


