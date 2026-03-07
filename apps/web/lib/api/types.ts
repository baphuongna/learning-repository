export interface User {
  id: string;
  email: string;
  fullName: string;
  role: string;
  avatarUrl?: string;
  createdAt?: string;
}

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
  inspectionId?: string | null;
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
    email?: string | null;
  };
  children?: Folder[];
  _count?: {
    documents: number;
    children: number;
  };
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface InspectionHistory {
  id: string;
  filename: string | null;
  content_type: string | null;
  extension: string | null;
  size_bytes: number;
  sha256: string;
  supported_content_type: boolean;
  created_at: string;
}

export interface FileInspectionResult {
  filename: string | null;
  content_type: string | null;
  extension: string | null;
  size_bytes: number;
  sha256: string;
  supported_content_type: boolean;
}

export interface InspectFileResponse {
  data: FileInspectionResult;
  persisted: InspectionHistory;
}

export interface UploadedAssetResponse {
  message: string;
  path: string;
  filename: string;
}

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
