import { rustV2Api, RUST_V2_URL } from './client';
import { InspectFileResponse, InspectionHistory, UploadedAssetResponse } from './types';

export const rustDocsApi = {
  uploadPublicFile: async (file: File): Promise<UploadedAssetResponse> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await rustV2Api.post('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  },

  getPublicFileUrl: (filename: string): string => {
    return `${RUST_V2_URL}/upload/${filename}`;
  },

  inspectFile: async (file: File): Promise<InspectFileResponse> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await rustV2Api.post('/inspect', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  },

  listInspections: async (limit = 10): Promise<{ data: InspectionHistory[] }> => {
    const response = await rustV2Api.get('/inspections', {
      params: { limit },
    });

    return response.data;
  },

  getInspectionById: async (id: string): Promise<{ data: InspectionHistory }> => {
    const response = await rustV2Api.get(`/inspections/${id}`);
    return response.data;
  },
};
