import { rustV2Api } from './client';
import type { RegisterResponse, AdminUser, GetUsersParams } from './types';

export const authApi = {
  register: async (data: { email: string; fullName: string; password: string }): Promise<RegisterResponse> => {
    const response = await rustV2Api.post('/auth/register', data);
    return response.data;
  },

  login: async (data: { email: string; password: string }) => {
    const response = await rustV2Api.post('/auth/login', data);
    return response.data;
  },

  getProfile: async () => {
    const response = await rustV2Api.get('/auth/me');
    return response.data;
  },

  updateProfile: async (data: { fullName?: string; avatarUrl?: string }) => {
    const response = await rustV2Api.put('/auth/profile', data);
    return response.data;
  },

  changePassword: async (data: { currentPassword: string; newPassword: string }) => {
    const response = await rustV2Api.put('/auth/change-password', data);
    return response.data;
  },
};

/**
 * API cho quản lý người dùng (admin/moderation)
 * Backend endpoints:
 * - GET /admin/users?status=PENDING|ACTIVE|REJECTED&search=... -> AdminUser[]
 * - PATCH /admin/users/:id/approve -> AdminUser
 * - PATCH /admin/users/:id/reject { reason?: string } -> AdminUser
 */
export const usersApi = {
  /**
   * Lấy danh sách users với filter (trả về plain array từ backend)
   */
  getUsers: async (params?: GetUsersParams): Promise<AdminUser[]> => {
    const response = await rustV2Api.get<AdminUser[]>('/admin/users', { params });
    return response.data;
  },

  /**
   * Phê duyệt user (trả về user đã cập nhật)
   */
  approveUser: async (userId: string): Promise<AdminUser> => {
    const response = await rustV2Api.patch<AdminUser>(`/admin/users/${userId}/approve`);
    return response.data;
  },

  /**
   * Từ chối user với optional reason (trả về user đã cập nhật)
   */
  rejectUser: async (userId: string, reason?: string): Promise<AdminUser> => {
    const response = await rustV2Api.patch<AdminUser>(`/admin/users/${userId}/reject`, { reason });
    return response.data;
  },
};
