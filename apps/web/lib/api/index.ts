export { RUST_V2_URL, rustV2Api } from './client';
export { authApi, usersApi } from './auth';
export { documentsApi } from './documents';
export { foldersApi } from './folders';
export { categoriesApi, newsApi } from './news';
export { rustDocsApi } from './rust-docs';
export { permissionsApi, usersSearchApi } from './permissions';

export type {
  User,
  Document,
  Folder,
  FolderPermission,
  PaginatedResponse,
  InspectionHistory,
  FileInspectionResult,
  InspectFileResponse,
  UploadedAssetResponse,
  NewsCategory,
  News,
  UserApprovalStatus,
  AdminUser,
  RegisterResponse,
  GetUsersParams,
} from './types';

/**
 * Helper function để extract error message từ API response
 * Backend format: { error: { code: string, message: string } }
 * 
 * @param err - Error object từ catch block
 * @param fallback - Fallback message nếu không extract được
 * @returns Error message string
 */
export function getErrorMessage(err: unknown, fallback: string): string {
  // Check for Axios error with backend error envelope
  if (typeof err === 'object' && err !== null && 'response' in err) {
    const response = (err as { response?: { data?: { error?: { message?: string } } } }).response;
    if (response?.data?.error?.message) {
      return response.data.error.message;
    }
  }
  
  // Check for standard Error
  if (err instanceof Error) {
    return err.message || fallback;
  }
  
  return fallback;
}

/**
 * Helper function để detect approval-related errors
 * Backend returns specific messages for pending/rejected users
 * 
 * @param err - Error object từ catch block
 * @returns 'pending' | 'rejected' | null
 */
export function getApprovalErrorType(err: unknown): 'pending' | 'rejected' | null {
  if (typeof err === 'object' && err !== null && 'response' in err) {
    const response = (err as { response?: { data?: { error?: { message?: string } } } }).response;
    const message = response?.data?.error?.message?.toLowerCase() || '';
    
    // Backend messages for pending users
    if (message.includes('chờ phê duyệt') || message.includes('pending')) {
      return 'pending';
    }
    // Backend messages for rejected users
    if (message.includes('chưa được phê duyệt') || message.includes('rejected') || message.includes('bị chặn')) {
      return 'rejected';
    }
  }
  return null;
}
