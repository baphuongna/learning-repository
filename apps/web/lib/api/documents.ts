import { rustV2Api } from './client';
import { Document, PaginatedResponse } from './types';

export const documentsApi = {
  getAll: async (page = 1, limit = 10, folderId?: string | null): Promise<PaginatedResponse<Document>> => {
    const params: Record<string, any> = { page, limit };
    if (folderId !== undefined) {
      params.folderId = folderId || 'null';
    }

    const response = await rustV2Api.get('/v2/documents', { params });
    return response.data;
  },

  getMy: async (page = 1, limit = 10): Promise<PaginatedResponse<Document>> => {
    const response = await rustV2Api.get('/v2/documents/my', { params: { page, limit } });
    return response.data;
  },

  getById: async (id: string): Promise<Document> => {
    const response = await rustV2Api.get(`/v2/documents/${id}`);
    return response.data;
  },

  create: async (data: FormData): Promise<Document> => {
    const response = await rustV2Api.post('/v2/documents', data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  update: async (id: string, data: Partial<Document>): Promise<Document> => {
    const response = await rustV2Api.put(`/v2/documents/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await rustV2Api.delete(`/v2/documents/${id}`);
  },

  download: async (id: string): Promise<Blob> => {
    const response = await rustV2Api.get(`/v2/documents/${id}/download`, {
      responseType: 'blob',
    });
    return response.data;
  },

  search: async (query: string, page = 1, limit = 10): Promise<PaginatedResponse<Document>> => {
    const response = await rustV2Api.get('/v2/documents', { params: { q: query, page, limit } });
    return response.data;
  },
};
