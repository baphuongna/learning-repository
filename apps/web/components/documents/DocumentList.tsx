'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { DocumentCard } from './DocumentCard';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Document, documentsApi } from '@/lib/api';
import { Search, Plus, RefreshCw } from 'lucide-react';

export function DocumentList() {
  const router = useRouter();
  const searchParams = useSearchParams();
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

  const fetchDocuments = async (page = 1) => {
    try {
      setLoading(true);
      setError(null);
      const response = await documentsApi.getAll(page, 10);
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
  }, []);

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
        <Button onClick={() => router.push('/documents/upload')}>
          <Plus className="h-4 w-4 mr-2" />
          Tải lên
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
