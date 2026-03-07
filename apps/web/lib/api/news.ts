import { rustV2Api } from './client';
import { News, NewsCategory, PaginatedResponse } from './types';

export const categoriesApi = {
  getAll: async (): Promise<NewsCategory[]> => {
    const response = await rustV2Api.get('/news-categories');
    return response.data;
  },

  getAllAdmin: async (): Promise<NewsCategory[]> => {
    const response = await rustV2Api.get('/news-categories/admin');
    return response.data;
  },

  getById: async (id: string): Promise<NewsCategory> => {
    const response = await rustV2Api.get(`/news-categories/${id}`);
    return response.data;
  },

  create: async (data: Partial<NewsCategory>): Promise<NewsCategory> => {
    const response = await rustV2Api.post('/news-categories', data);
    return response.data;
  },

  update: async (id: string, data: Partial<NewsCategory>): Promise<NewsCategory> => {
    const response = await rustV2Api.put(`/news-categories/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await rustV2Api.delete(`/news-categories/${id}`);
  },
};

export const newsApi = {
  getAll: async (params?: {
    page?: number;
    limit?: number;
    category?: string;
    search?: string;
  }): Promise<PaginatedResponse<News>> => {
    const response = await rustV2Api.get('/news', { params });
    return response.data;
  },

  getFeatured: async (limit = 5): Promise<News[]> => {
    const response = await rustV2Api.get('/news/featured', { params: { limit } });
    return response.data;
  },

  getBySlug: async (slug: string): Promise<News> => {
    const response = await rustV2Api.get(`/news/slug/${slug}`);
    return response.data;
  },

  getById: async (id: string): Promise<News> => {
    const response = await rustV2Api.get(`/news/${id}`);
    return response.data;
  },

  getMy: async (page = 1, limit = 10): Promise<PaginatedResponse<News>> => {
    const response = await rustV2Api.get('/news/my', { params: { page, limit } });
    return response.data;
  },

  create: async (data: Partial<News>): Promise<News> => {
    const response = await rustV2Api.post('/news', data);
    return response.data;
  },

  update: async (id: string, data: Partial<News>): Promise<News> => {
    const response = await rustV2Api.put(`/news/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await rustV2Api.delete(`/news/${id}`);
  },
};
