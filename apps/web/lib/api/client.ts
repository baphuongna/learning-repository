import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

export const RUST_V2_URL = process.env.NEXT_PUBLIC_RUST_V2_URL || 'http://localhost:4001';

const apiDebug = (label: string, payload?: Record<string, unknown>) => {
  if (typeof window === 'undefined') {
    return;
  }

  console.info(`[rustV2Api] ${label}`, payload ?? {});
};

export const rustV2Api = axios.create({
  baseURL: RUST_V2_URL,
});

rustV2Api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const clientRequestId = config.headers?.['x-client-request-id'];

    if (config.data instanceof FormData && config.headers) {
      delete config.headers['Content-Type'];

      apiDebug('request-formdata', {
        method: config.method,
        url: `${config.baseURL ?? ''}${config.url ?? ''}`,
        clientRequestId,
        formDataEntries: Array.from(config.data.entries()).map(([key, value]) => {
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
    }

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
  (response) => {
    apiDebug('response-success', {
      method: response.config.method,
      url: `${response.config.baseURL ?? ''}${response.config.url ?? ''}`,
      status: response.status,
      clientRequestId: response.config.headers?.['x-client-request-id'],
    });

    return response;
  },
  (error: AxiosError) => {
    apiDebug('response-failed', {
      method: error.config?.method,
      url: `${error.config?.baseURL ?? ''}${error.config?.url ?? ''}`,
      message: error.message,
      code: error.code,
      status: error.response?.status,
      clientRequestId: error.config?.headers?.['x-client-request-id'],
    });

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
