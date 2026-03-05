'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DocumentCard } from './DocumentCard';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Document, documentsApi, foldersApi } from '@/lib/api';
import { Search, Plus, RefreshCw, FileText, FolderPlus, X, Loader2 } from 'lucide-react';
import { FolderBreadcrumb } from '@/components/folders/FolderBreadcrumb';
import { toast } from 'sonner';

interface DocumentListProps {
  folderId?: string | null;
  onRefresh?: number;
  onFolderChange?: (folderId: string | null) => void;
}

export function DocumentList({ folderId, onRefresh, onFolderChange }: DocumentListProps) {
  const router = useRouter();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [meta, setMeta] = useState({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
  });

  // Folder creation state
  const [showCreateFolder, setShowCreateFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);

  const fetchDocuments = async (page = 1) => {
    try {
      setLoading(true);
      setError(null);
      const response = await documentsApi.getAll(page, 10, folderId ?? null);
      setDocuments(response.data);
      setMeta(response.meta);
    } catch (err) {
      console.error('Failed to fetch documents:', err);
      setError('Không thể tải danh sách tài liệu');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, [folderId, onRefresh]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      fetchDocuments();
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await documentsApi.search(searchQuery.trim());
      setDocuments(response.data);
      setMeta(response.meta);
    } catch (err) {
      console.error('Search failed:', err);
      setError('Tìm kiếm thất bại');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) {
      toast.error('Vui lòng nhập tên thư mục');
      return;
    }
    try {
      setIsCreatingFolder(true);
      await foldersApi.create({
        name: newFolderName.trim(),
        parentId: folderId ?? null,
      });
      toast.success('Tạo thư mục thành công!');
      setNewFolderName('');
      setShowCreateFolder(false);
      if (onFolderChange) {
        onFolderChange(folderId ?? null);
      }
    } catch (error) {
      console.error('Failed to create folder:', error);
      toast.error('Không thể tạo thư mục');
    } finally {
      setIsCreatingFolder(false);
    }
  };

  const handleUpload = () => {
    // Navigate to upload page with current folder context
    const uploadUrl = folderId
      ? `/documents/upload?folderId=${folderId}`
      : '/documents/upload';
    router.push(uploadUrl);
  };

  const handleNavigate = (targetFolderId: string | null) => {
    if (onFolderChange) {
      onFolderChange(targetFolderId);
    }
  };

  if (loading && documents.length === 0 && !showCreateFolder) {
    return (
      <div className="flex items-center justify-center py-20">
        <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
        <span className="ml-2 text-muted-foreground">Đang tải...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb Navigation */}
      <FolderBreadcrumb
        currentFolderId={folderId ?? null}
        onNavigate={handleNavigate}
        className="mb-4"
      />
      {/* Search & Actions Bar */}
      <div className="flex flex-col sm:flex-row gap-4">
        <form onSubmit={handleSearch} className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-5 w-5" />
          <Input
            type="text"
            placeholder="Tìm kiếm tài liệu..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </form>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setShowCreateFolder(!showCreateFolder)}
          >
            <FolderPlus className="h-4 w-4 mr-2" />
            Tạo thư mục
          </Button>
          <Button onClick={handleUpload}>
            <Plus className="h-4 w-4 mr-2" />
            Tải lên
          </Button>
        </div>
      </div>
      {/* Create Folder Dialog */}
      {showCreateFolder && (
        <div className="bg-muted/50 border rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-medium">Tạo thư mục mới</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setShowCreateFolder(false);
                setNewFolderName('');
              }}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex gap-2">
            <Input
              type="text"
              placeholder="Nhập tên thư mục..."
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleCreateFolder();
                }
              }}
              className="flex-1"
              autoFocus
            />
            <Button
              onClick={handleCreateFolder}
              disabled={isCreatingFolder || !newFolderName.trim()}
            >
              {isCreatingFolder ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              Tạo
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            {folderId
              ? 'Thư mục sẽ được tạo trong thư mục hiện tại'
              : 'Thư mục sẽ được tạo ở thư mục gốc'}
          </p>
        </div>
      )}
      {/* Error Message */}
      {error && (
        <div className="bg-destructive/10 text-destructive px-4 py-3 rounded-md">
          {error}
        </div>
      )}
      {/* Document Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {documents.map((doc) => (
          <DocumentCard key={doc.id} document={doc} />
        ))}
      </div>
      {/* Empty State */}
      {documents.length === 0 && !loading && (
        <div className="text-center py-20 text-muted-foreground">
          <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p className="text-lg font-medium">Không tìm thấy tài liệu nào</p>
          <p className="text-sm">Hãy thử tìm kiếm với từ khóa khác hoặc tải lên tài liệu mới</p>
          {!showCreateFolder && (
            <div className="flex gap-2 justify-center mt-4">
              <Button
                variant="outline"
                onClick={() => setShowCreateFolder(true)}
              >
                <FolderPlus className="h-4 w-4 mr-2" />
                Tạo thư mục mới
              </Button>
              <Button onClick={handleUpload}>
                <Plus className="h-4 w-4 mr-2" />
                Tải lên tài liệu
              </Button>
            </div>
          )}
        </div>
      )}
      {/* Pagination */}
      {meta.totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <Button
            variant="outline"
            onClick={() => fetchDocuments(meta.page - 1)}
            disabled={meta.page === 1 || loading}
          >
            Trước
          </Button>
          <span className="flex items-center px-4 text-sm text-muted-foreground">
            Trang {meta.page} / {meta.totalPages}
          </span>
          <Button
            variant="outline"
            onClick={() => fetchDocuments(meta.page + 1)}
            disabled={meta.page === meta.totalPages || loading}
          >
            Sau
          </Button>
        </div>
      )}
    </div>
  );
}
