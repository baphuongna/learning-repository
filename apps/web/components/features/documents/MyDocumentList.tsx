'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { DocumentCard } from './DocumentCard';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Document, documentsApi, foldersApi } from '@/lib/api';
import { Search, RefreshCw, Trash2, FileText, Loader2, Plus, FolderPlus } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { ContextBar } from '@/components/features/layout/ContextBar';

interface MyDocumentListProps {
  onDelete?: (id: string) => void;
  onRefresh?: number;
}

export function MyDocumentList({ onDelete, onRefresh }: MyDocumentListProps) {
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
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Folder creation state
  const [showCreateFolder, setShowCreateFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);

  const fetchDocuments = useCallback(async (page = 1) => {
    try {
      setLoading(true);
      setError(null);
      const response = await documentsApi.getMy(page, 10);
      setDocuments(response.data);
      setMeta(response.meta);
    } catch (err) {
      console.error('Failed to fetch my documents:', err);
      setError('Không thể tải danh sách tài liệu của bạn');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments, onRefresh]);

  const handleDelete = async (id: string) => {
    try {
      setDeletingId(id);
      await documentsApi.delete(id);
      // Refresh danh sách sau khi xóa
      await fetchDocuments(meta.page);
      onDelete?.(id);
      toast.success('Đã xóa tài liệu thành công');
    } catch (err) {
      console.error('Failed to delete document:', err);
      toast.error('Không thể xóa tài liệu. Vui lòng thử lại.');
    } finally {
      setDeletingId(null);
    }
  };

  const confirmDelete = (id: string, title: string) => {
    // Sử dụng toast với action thay vì confirm dialog
    toast(
      <div className="space-y-3">
        <p className="font-medium">Xác nhận xóa tài liệu?</p>
        <p className="text-sm text-muted-foreground">&ldquo;{title}&rdquo;</p>
        <div className="flex gap-2 justify-end">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => toast.dismiss()}
          >
            Hủy
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => {
              toast.dismiss();
              handleDelete(id);
            }}
          >
            Xóa
          </Button>
        </div>
      </div>,
      { duration: 10000 }
    );
  };

  // Tạo thư mục mới ở root level
  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) {
      toast.error('Vui lòng nhập tên thư mục');
      return;
    }
    try {
      setIsCreatingFolder(true);
      await foldersApi.create({
        name: newFolderName.trim(),
        parentId: null, // Root level folder
      });
      toast.success('Tạo thư mục thành công!');
      setNewFolderName('');
      setShowCreateFolder(false);
      fetchDocuments(); // Refresh danh sách sau khi tạo thư mục
      // Scroll và focus vào vùng danh sách
      setTimeout(() => {
        listRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        listRef.current?.focus();
      }, 100);
    } catch (error) {
      console.error('Failed to create folder:', error);
      toast.error('Không thể tạo thư mục');
    } finally {
      setIsCreatingFolder(false);
    }
  };

  // Điều hướng đến trang upload
  const handleUpload = () => {
    router.push('/documents/upload');
  };

  // Filter local khi search (không có API search riêng cho my documents)
  const filteredDocuments = searchQuery.trim()
    ? documents.filter(doc =>
        doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.keywords.some(k => k.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : documents;

  if (loading && documents.length === 0) {
    return (
      <div className="flex items-center justify-center py-20">
        <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
        <span className="ml-2 text-muted-foreground">Đang tải...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Context Bar - Search và Actions */}
      <ContextBar
        search={
          <form onSubmit={(e) => e.preventDefault()} className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-5 w-5" />
            <Input
              type="text"
              placeholder="Lọc trong danh sách hiện tại..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </form>
        }
        actions={
          <>
            <Button
              variant="outline"
              onClick={() => setShowCreateFolder(true)}
            >
              <FolderPlus className="h-4 w-4 mr-2" />
              Tạo thư mục
            </Button>
            <Button onClick={handleUpload}>
              <Plus className="h-4 w-4 mr-2" />
              Tải lên
            </Button>
          </>
        }
      />

      {/* Create Folder Dialog */}
      <Dialog open={showCreateFolder} onOpenChange={(open) => {
        setShowCreateFolder(open);
        if (!open) setNewFolderName('');
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tạo thư mục mới</DialogTitle>
          </DialogHeader>
          <div className="py-4">
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
              autoFocus
            />
            <p className="text-xs text-muted-foreground mt-2">
              Thư mục sẽ được tạo ở thư mục gốc
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setShowCreateFolder(false);
              setNewFolderName('');
            }}>
              Hủy
            </Button>
            <Button
              onClick={handleCreateFolder}
              disabled={isCreatingFolder || !newFolderName.trim()}
            >
              {isCreatingFolder && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Tạo
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Error Message */}
      {error && (
        <div className="bg-destructive/10 text-destructive px-4 py-3 rounded-md">
          {error}
        </div>
      )}

      {/* Document Grid */}
      <div
        ref={listRef}
        className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 transition-opacity rounded-lg focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${loading ? 'opacity-60' : ''}`}
        tabIndex={-1}
      >
        {filteredDocuments.map((doc) => (
          <div key={doc.id} className="relative">
            <DocumentCard document={doc} />
            {/* Delete Button - Luôn hiển thị, rõ ràng */}
            <Button
              variant="destructive"
              size="sm"
              className="absolute top-2 right-2 shadow-sm"
              onClick={() => confirmDelete(doc.id, doc.title)}
              disabled={deletingId === doc.id}
              title="Xóa tài liệu"
            >
              {deletingId === doc.id ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4" />
              )}
            </Button>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredDocuments.length === 0 && !loading && (
        <div className="text-center py-20 text-muted-foreground">
          <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p className="text-lg font-medium">
            {searchQuery ? 'Không tìm thấy tài liệu nào' : 'Bạn chưa có tài liệu nào'}
          </p>
          <p className="text-sm">
            {searchQuery
              ? 'Hãy thử tìm kiếm với từ khóa khác'
              : 'Hãy bắt đầu bằng cách tạo thư mục hoặc tải lên tài liệu'}
          </p>
          {!showCreateFolder && !searchQuery && (
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
