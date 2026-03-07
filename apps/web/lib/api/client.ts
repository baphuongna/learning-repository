import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

export const RUST_V2_URL = process.env.NEXT_PUBLIC_RUST_V2_URL || 'http://localhost:4001';

export const rustV2Api = axios.create({
  baseURL: RUST_V2_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

rustV2Api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }

    return config;
  },
  (error) => Promise.reject(error)
);

rustV2Api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);
