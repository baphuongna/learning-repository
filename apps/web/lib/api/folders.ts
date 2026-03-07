import { rustV2Api } from './client';
import { Folder } from './types';

export const foldersApi = {
  getAll: async (): Promise<Folder[]> => {
    const response = await rustV2Api.get('/v2/folders');
    return response.data;
  },

  getTree: async (parentId?: string | null): Promise<Folder[]> => {
    const params = parentId ? { parentId } : {};
    const response = await rustV2Api.get('/v2/folders/tree', { params });
    return response.data;
  },

  getById: async (id: string): Promise<Folder> => {
    const response = await rustV2Api.get(`/v2/folders/${id}`);
    return response.data;
  },

  getBreadcrumbs: async (id: string): Promise<Folder[]> => {
    const response = await rustV2Api.get(`/v2/folders/${id}/breadcrumbs`);
    return response.data;
  },

  getChildren: async (id: string): Promise<Folder[]> => {
    const response = await rustV2Api.get(`/v2/folders/${id}/children`);
    return response.data;
  },

  create: async (data: {
    name: string;
    description?: string;
    color?: string;
    parentId?: string | null;
    isPublic?: boolean;
  }): Promise<Folder> => {
    const response = await rustV2Api.post('/v2/folders', data);
    return response.data;
  },

  update: async (id: string, data: Partial<Folder>): Promise<Folder> => {
    const response = await rustV2Api.put(`/v2/folders/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await rustV2Api.delete(`/v2/folders/${id}`);
  },
};
