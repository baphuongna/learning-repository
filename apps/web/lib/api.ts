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
  language: string;
  fileName: string;
  filePath: string | null;
  fileSize: string | null;
  mimeType: string | null;
  status: string;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    fullName: string;
    email: string;
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
   * @returns Paginated list of documents
   */
  getAll: async (page = 1, limit = 10): Promise<PaginatedResponse<Document>> => {
    const response = await api.get('/documents', { params: { page, limit } });
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
