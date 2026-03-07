import { rustV2Api } from './client';

export const authApi = {
  register: async (data: { email: string; fullName: string; password: string }) => {
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
