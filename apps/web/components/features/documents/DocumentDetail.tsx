'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Document, documentsApi } from '@/lib/api';
import { useAuth } from '@/app/providers';
import {
  ArrowLeft,
  Download,
  Edit,
  Trash2,
  User,
  Calendar,
  Cpu,
  FileText,
  Globe,
  Lock,
  Loader2,
} from 'lucide-react';

export function DocumentDetail() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [document, setDocument] = useState<Document | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchDocument = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const doc = await documentsApi.getById(params.id as string);
      setDocument(doc);
    } catch (err: any) {
      console.error('Failed to fetch document:', err);
      setError(err.response?.data?.message || 'Không thể tải tài liệu');
    } finally {
      setLoading(false);
    }
  }, [params.id]);

  useEffect(() => {
    void fetchDocument();
  }, [fetchDocument]);

  const handleDelete = async () => {
    if (!document || !confirm('Bạn có chắc muốn xóa tài liệu này?')) return;

    try {
      setDeleting(true);
      await documentsApi.delete(document.id);
      router.push('/documents');
    } catch (err: any) {
      console.error('Delete error:', err);
      alert(err.response?.data?.message || 'Xóa thất bại');
    } finally {
      setDeleting(false);
    }
  };

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return 'N/A';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const isOwner = user && document && user.id === document.user.id;
  const isAdmin = user && user.role === 'ADMIN';

  const handleDownload = async () => {
    if (!document?.id) {
      alert('Tài liệu không tồn tại');
      return;
    }

    try {
      const docId = document.id;
      const docFileName = document.fileName;

      const blob = await documentsApi.download(docId);
      const url = window.URL.createObjectURL(blob);
      const a = window.document.createElement('a');
      a.href = url;
      a.download = docFileName;
      window.document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      window.document.body.removeChild(a);
    } catch (err) {
      console.error('Download error:', err);
      alert('Không thể tải file');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <span className="ml-2 text-muted-foreground">Đang tải...</span>
      </div>
    );
  }

  if (error || !document) {
    return (
      <div className="text-center py-20">
        <p className="text-destructive mb-4">{error || 'Không tìm thấy tài liệu'}</p>
        <Button variant="outline" onClick={() => router.back()}>
          Quay lại
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">{document.title}</h1>
          <p className="text-muted-foreground">{document.fileName}</p>
        </div>
        {(isOwner || isAdmin) && (
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleDelete} disabled={deleting}>
              {deleting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4" />
              )}
            </Button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Thông tin tài liệu</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-medium mb-1">Mô tả</h4>
              <p className="text-muted-foreground">
                {document.description || 'Không có mô tả'}
              </p>
            </div>

            <div>
              <h4 className="font-medium mb-2">Từ khóa</h4>
              <div className="flex flex-wrap gap-1">
                {Array.isArray(document.keywords) && document.keywords.length > 0 ? (
                  document.keywords.map((keyword, index) => (
                    <Badge key={index} variant="secondary">
                      {keyword}
                    </Badge>
                  ))
                ) : (
                  <span className="text-muted-foreground">Không có từ khóa</span>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium mb-1">Tác giả</h4>
                <p className="text-muted-foreground">{document.author || 'N/A'}</p>
              </div>
              <div>
                <h4 className="font-medium mb-1">Môn học / Chủ đề</h4>
                <p className="text-muted-foreground">{document.subject || 'N/A'}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Sidebar */}
        <div className="space-y-4">
          <Card>
            <CardContent className="pt-6 space-y-4">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <span>{formatFileSize(document.fileSize)}</span>
              </div>
              <div className="flex items-center gap-2">
                {document.isPublic ? (
                  <>
                    <Globe className="h-4 w-4 text-green-500" />
                    <span className="text-green-600">Công khai</span>
                  </>
                ) : (
                  <>
                    <Lock className="h-4 w-4 text-orange-500" />
                    <span className="text-orange-600">Riêng tư</span>
                  </>
                )}
              </div>
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <span>{document.user.fullName}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>{new Date(document.createdAt).toLocaleDateString('vi-VN')}</span>
              </div>
              {document.inspectionId && (
                <div className="rounded-lg border bg-primary/5 p-3">
                  <div className="mb-2 flex items-center gap-2 text-sm font-medium">
                    <Cpu className="h-4 w-4 text-primary" />
                    Rust inspection trace
                  </div>
                  <p className="mb-2 break-all text-xs text-muted-foreground">
                    {document.inspectionId}
                  </p>
                  <Link
                    href={`/rust-docs/${document.inspectionId}`}
                    className="text-sm font-medium text-primary hover:underline"
                  >
                    Xem inspection chi tiết
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>

          <Button className="w-full" onClick={handleDownload}>
            <Download className="h-4 w-4 mr-2" />
            Tải xuống
          </Button>
        </div>
      </div>
    </div>
  );
}
