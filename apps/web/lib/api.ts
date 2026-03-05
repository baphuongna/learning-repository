/**
 * API Client - Axios instance với interceptors
 *
 * File này cấu hình Axios client để giao tiếp với backend API:
 * - Tự động thêm JWT token vào header
 * - Xử lý lỗi authentication (401)
 * - Cung cấp các API functions cho auth và documents
 *
 * @module api
 */

import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

// API base URL từ environment variable
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

/**
 * Axios instance với config mặc định
 */
export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Request Interceptor - Tự động thêm JWT token
 *
 * Trước mỗi request:
 * 1. Lấy token từ localStorage
 * 2. Nếu có token, thêm vào Authorization header
 */
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Chỉ chạy ở client-side
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * Response Interceptor - Xử lý lỗi authentication
 *
 * Khi nhận được 401 Unauthorized:
 * 1. Xóa token và user info từ localStorage
 * 2. Redirect về trang login
 */
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Token hết hạn hoặc không hợp lệ
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// ==================== TYPES ====================

/**
 * User type - Thông tin người dùng
 */
export interface User {
  id: string;
  email: string;
  fullName: string;
  role: string;
  avatarUrl?: string;
  createdAt?: string;
}

/**
 * Document type - Thông tin tài liệu
 */
export interface Document {
  id: string;
  title: string;
  description: string | null;
  author: string | null;
  subject: string | null;
  keywords: string[];
  fileName: string;
  filePath: string | null;
  fileSize: number | null;
  mimeType: string | null;
  status: string;
  isPublic: boolean;
  folderId: string | null;
  folder?: {
    id: string;
    name: string;
    color: string;
  } | null;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    fullName: string;
    email: string;
  };
}

/**
 * Folder type - Thư mục tài liệu (Google Drive style)
 */
export interface Folder {
  id: string;
  name: string;
  description: string | null;
  color: string | null;
  parentId: string | null;
  userId: string;
  isPublic: boolean;
  status: string;
  createdAt: string;
  updatedAt: string;
  user?: {
    id: string;
    fullName: string;
  };
  children?: Folder[];
  _count?: {
    documents: number;
    children: number;
  };
}

/**
 * Paginated Response type
 */
export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

// ==================== AUTH API ====================

/**
 * Auth API - Các functions liên quan đến authentication
 */
export const authApi = {
  /**
   * Đăng ký tài khoản mới
   *
   * @param data - { email, fullName, password }
   * @returns { accessToken, user }
   */
  register: async (data: { email: string; fullName: string; password: string }) => {
    const response = await api.post('/auth/register', data);
    return response.data;
  },

  /**
   * Đăng nhập
   *
   * @param data - { email, password }
   * @returns { accessToken, user }
   */
  login: async (data: { email: string; password: string }) => {
    const response = await api.post('/auth/login', data);
    return response.data;
  },

  /**
   * Lấy thông tin profile user hiện tại
   *
   * @returns User info với số lượng documents
   */
  getProfile: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },

  /**
   * Cập nhật thông tin profile
   *
   * @param data - { fullName?, avatarUrl? }
   * @returns User info đã cập nhật
   */
  updateProfile: async (data: { fullName?: string; avatarUrl?: string }) => {
    const response = await api.put('/auth/profile', data);
    return response.data;
  },

  /**
   * Đổi mật khẩu
   *
   * @param data - { currentPassword, newPassword }
   * @returns Message xác nhận
   */
  changePassword: async (data: { currentPassword: string; newPassword: string }) => {
    const response = await api.put('/auth/change-password', data);
    return response.data;
  },
};

// ==================== DOCUMENTS API ====================

/**
 * Documents API - Các functions liên quan đến tài liệu
 */
export const documentsApi = {
  /**
   * Lấy danh sách tất cả tài liệu
   *
   * Admin xem tất cả, User xem của mình + public
   *
   * @param page - Số trang
   * @param limit - Số items per page
   * @param folderId - Lọc theo thư mục (optional)
   * @returns Paginated list of documents
   */
  getAll: async (page = 1, limit = 10, folderId?: string | null): Promise<PaginatedResponse<Document>> => {
    const params: Record<string, any> = { page, limit };
    if (folderId) {
      params.folderId = folderId;
    }
    const response = await api.get('/documents', { params });
    return response.data;
  },

  /**
   * Lấy danh sách tài liệu của user hiện tại
   *
   * @param page - Số trang
   * @param limit - Số items per page
   * @returns Paginated list of user's documents
   */
  getMy: async (page = 1, limit = 10): Promise<PaginatedResponse<Document>> => {
    const response = await api.get('/documents/my', { params: { page, limit } });
    return response.data;
  },

  /**
   * Lấy chi tiết một tài liệu
   *
   * @param id - Document ID
   * @returns Document details
   */
  getById: async (id: string): Promise<Document> => {
    const response = await api.get(`/documents/${id}`);
    return response.data;
  },

  /**
   * Tạo tài liệu mới (với file upload)
   *
   * @param data - FormData chứa file và metadata
   * @returns Created document
   */
  create: async (data: FormData): Promise<Document> => {
    const response = await api.post('/documents', data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  /**
   * Cập nhật metadata tài liệu
   *
   * @param id - Document ID
   * @param data - Updated metadata
   * @returns Updated document
   */
  update: async (id: string, data: Partial<Document>): Promise<Document> => {
    const response = await api.put(`/documents/${id}`, data);
    return response.data;
  },

  /**
   * Xóa tài liệu (soft delete)
   *
   * @param id - Document ID
   */
  delete: async (id: string): Promise<void> => {
    await api.delete(`/documents/${id}`);
  },

  /**
   * Tìm kiếm tài liệu
   *
   * @param query - Từ khóa tìm kiếm
   * @param page - Số trang
   * @param limit - Số items per page
   * @returns Paginated search results
   */
  search: async (query: string, page = 1, limit = 10): Promise<PaginatedResponse<Document>> => {
    const response = await api.get('/search', { params: { q: query, page, limit } });
    return response.data;
  },
};

// ==================== NEWS TYPES ====================

/**
 * News Category type - Danh mục tin tức
 */
export interface NewsCategory {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  order: number;
  status: string;
  createdAt: string;
  updatedAt: string;
  _count?: { news: number };
}

/**
 * News type - Tin tức
 */
export interface News {
  id: string;
  categoryId: string;
  category: {
    id: string;
    name: string;
    slug: string;
  };
  userId: string;
  user: {
    id: string;
    fullName: string;
    avatarUrl?: string;
  };
  title: string;
  slug: string;
  summary: string;
  content: string;
  thumbnailUrl: string | null;
  isPublished: boolean;
  isFeatured: boolean;
  publishedAt: string | null;
  viewCount: number;
  status: string;
  createdAt: string;
  updatedAt: string;
}

// ==================== CATEGORIES API ====================

/**
 * Categories API - Các functions liên quan đến danh mục tin tức
 */
export const categoriesApi = {
  /**
   * Lấy danh sách danh mục (public)
   */
  getAll: async (): Promise<NewsCategory[]> => {
    const response = await api.get('/news-categories');
    return response.data;
  },

  /**
   * Lấy tất cả danh mục (Admin)
   */
  getAllAdmin: async (): Promise<NewsCategory[]> => {
    const response = await api.get('/news-categories/admin');
    return response.data;
  },

  /**
   * Lấy chi tiết danh mục
   */
  getById: async (id: string): Promise<NewsCategory> => {
    const response = await api.get(`/news-categories/${id}`);
    return response.data;
  },

  /**
   * Tạo danh mục mới (Admin)
   */
  create: async (data: Partial<NewsCategory>): Promise<NewsCategory> => {
    const response = await api.post('/news-categories', data);
    return response.data;
  },

  /**
   * Cập nhật danh mục (Admin)
   */
  update: async (id: string, data: Partial<NewsCategory>): Promise<NewsCategory> => {
    const response = await api.put(`/news-categories/${id}`, data);
    return response.data;
  },

  /**
   * Xóa danh mục (Admin)
   */
  delete: async (id: string): Promise<void> => {
    await api.delete(`/news-categories/${id}`);
  },
};

// ==================== NEWS API ====================

/**
 * News API - Các functions liên quan đến tin tức
 */
export const newsApi = {
  /**
   * Lấy danh sách tin tức đã xuất bản (public)
   */
  getAll: async (params?: {
    page?: number;
    limit?: number;
    category?: string;
    search?: string;
  }): Promise<PaginatedResponse<News>> => {
    const response = await api.get('/news', { params });
    return response.data;
  },

  /**
   * Lấy tin tức nổi bật
   */
  getFeatured: async (limit = 5): Promise<News[]> => {
    const response = await api.get('/news/featured', { params: { limit } });
    return response.data;
  },

  /**
   * Lấy chi tiết tin theo slug
   */
  getBySlug: async (slug: string): Promise<News> => {
    const response = await api.get(`/news/slug/${slug}`);
    return response.data;
  },

  /**
   * Lấy chi tiết tin theo ID
   */
  getById: async (id: string): Promise<News> => {
    const response = await api.get(`/news/${id}`);
    return response.data;
  },

  /**
   * Lấy bài viết của tôi
   */
  getMy: async (page = 1, limit = 10): Promise<PaginatedResponse<News>> => {
    const response = await api.get('/news/my', { params: { page, limit } });
    return response.data;
  },

  /**
   * Tạo bài viết mới
   */
  create: async (data: Partial<News>): Promise<News> => {
    const response = await api.post('/news', data);
    return response.data;
  },

  /**
   * Cập nhật bài viết
   */
  update: async (id: string, data: Partial<News>): Promise<News> => {
    const response = await api.put(`/news/${id}`, data);
    return response.data;
  },

  /**
   * Xóa bài viết
   */
  delete: async (id: string): Promise<void> => {
    await api.delete(`/news/${id}`);
  },
};

// ==================== Folders API ====================

/**
 * Folders API - Các hàm gọi API thư mục
 */
export const foldersApi = {
  /**
   * Lấy danh sách thư mục (flat list)
   */
  getAll: async (): Promise<Folder[]> => {
    const response = await api.get('/folders');
    return response.data;
  },

  /**
   * Lấy cây thư mục (nested structure)
   */
  getTree: async (parentId?: string | null): Promise<Folder[]> => {
    const params = parentId ? { parentId } : {};
    const response = await api.get('/folders/tree', { params });
    return response.data;
  },

  /**
   * Lấy chi tiết thư mục
   */
  getById: async (id: string): Promise<Folder> => {
    const response = await api.get(`/folders/${id}`);
    return response.data;
  },

  /**
   * Lấy breadcrumb của thư mục
   */
  getBreadcrumbs: async (id: string): Promise<Folder[]> => {
    const response = await api.get(`/folders/${id}/breadcrumbs`);
    return response.data;
  },

  /**
   * Lấy thư mục con
   */
  getChildren: async (id: string): Promise<Folder[]> => {
    const response = await api.get(`/folders/${id}/children`);
    return response.data;
  },

  /**
   * Tạo thư mục mới
   */
  create: async (data: {
    name: string;
    description?: string;
    color?: string;
    parentId?: string | null;
    isPublic?: boolean;
  }): Promise<Folder> => {
    const response = await api.post('/folders', data);
    return response.data;
  },

  /**
   * Cập nhật thư mục
   */
  update: async (id: string, data: Partial<Folder>): Promise<Folder> => {
    const response = await api.put(`/folders/${id}`, data);
    return response.data;
  },

  /**
   * Xóa thư mục
   */
  delete: async (id: string): Promise<void> => {
    await api.delete(`/folders/${id}`);
  },
};
