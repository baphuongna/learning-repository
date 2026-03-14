import { RUST_V2_URL, rustV2Api } from './client';
import { Document, PaginatedResponse } from './types';

const fetchUploadDebug = (label: string, payload?: Record<string, unknown>) => {
  if (typeof window === 'undefined') {
    return;
  }

  console.info(`[documentsApi.create] ${label}`, payload ?? {});
};

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
    const clientRequestId = crypto.randomUUID();
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

    fetchUploadDebug('request-start', {
      url: `${RUST_V2_URL}/v2/documents`,
      clientRequestId,
      hasToken: Boolean(token),
      formDataEntries: Array.from(data.entries()).map(([key, value]) => {
        if (value instanceof File) {
          return {
            key,
            kind: 'file',
            name: value.name,
            size: value.size,
            type: value.type,
            lastModified: value.lastModified,
          };
        }

        return {
          key,
          kind: 'text',
          value,
        };
      }),
    });

    const response = await fetch(`${RUST_V2_URL}/v2/documents`, {
      method: 'POST',
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        'x-client-request-id': clientRequestId,
      },
      body: data,
    });

    const responseText = await response.text();

    fetchUploadDebug(response.ok ? 'response-success' : 'response-failed', {
      clientRequestId,
      status: response.status,
      statusText: response.statusText,
      bodyPreview: responseText.slice(0, 500),
    });

    if (response.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
      throw new Error('Unauthorized');
    }

    if (!response.ok) {
      let message = 'Upload thất bại';

      try {
        const parsed = JSON.parse(responseText) as { error?: { message?: string } };
        message = parsed.error?.message || message;
      } catch {
        if (responseText.trim()) {
          message = responseText.trim();
        }
      }

      throw new Error(message);
    }

    return JSON.parse(responseText) as Document;
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
