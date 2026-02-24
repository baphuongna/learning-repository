'use client';

import { useState, useEffect } from 'react';
import { DocumentCard } from './DocumentCard';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Document, documentsApi } from '@/lib/api';
import { Search, RefreshCw, Trash2, FileText } from 'lucide-react';

interface MyDocumentListProps {
  onDelete?: (id: string) => void;
}

export function MyDocumentList({ onDelete }: MyDocumentListProps) {
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

  const fetchDocuments = async (page = 1) => {
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
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const handleDelete = async (id: string) => {
    // Confirm trước khi xóa
    if (!confirm('Bạn có chắc muốn xóa tài liệu này?')) {
      return;
    }

    try {
      setDeletingId(id);
      await documentsApi.delete(id);
      // Refresh danh sách sau khi xóa
      await fetchDocuments(meta.page);
      onDelete?.(id);
    } catch (err) {
      console.error('Failed to delete document:', err);
      alert('Không thể xóa tài liệu. Vui lòng thử lại.');
    } finally {
      setDeletingId(null);
    }
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
      {/* Search Bar */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-5 w-5" />
          <Input
            type="text"
            placeholder="Tìm kiếm trong tài liệu của bạn..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button variant="outline" onClick={() => fetchDocuments()}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Làm mới
        </Button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-destructive/10 text-destructive px-4 py-3 rounded-md">
          {error}
        </div>
      )}

      {/* Document Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredDocuments.map((doc) => (
          <div key={doc.id} className="relative group">
            <DocumentCard document={doc} />
            {/* Delete Button */}
            <Button
              variant="destructive"
              size="sm"
              className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={() => handleDelete(doc.id)}
              disabled={deletingId === doc.id}
            >
              {deletingId === doc.id ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
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
              : 'Hãy tải lên tài liệu đầu tiên của bạn'}
          </p>
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
