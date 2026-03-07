'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { AlertCircle, ArrowLeft, CalendarClock, FileJson2, Hash, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { InspectionHistory, rustDocsApi } from '@/lib/api';

export default function RustInspectionDetailPage() {
  const params = useParams<{ id: string }>();
  const inspectionId = typeof params.id === 'string' ? params.id : '';

  const [inspection, setInspection] = useState<InspectionHistory | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchInspectionDetail = useCallback(async () => {
    if (!inspectionId) {
      setError('Thiếu inspection id');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await rustDocsApi.getInspectionById(inspectionId);
      setInspection(response.data);
    } catch (err: any) {
      console.error('Failed to fetch inspection detail:', err);
      setError(err.response?.data?.message || 'Không thể tải chi tiết inspection');
    } finally {
      setLoading(false);
    }
  }, [inspectionId]);

  useEffect(() => {
    void fetchInspectionDetail();
  }, [fetchInspectionDetail]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !inspection) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <AlertCircle className="h-5 w-5 text-destructive" />
            Không thể hiển thị inspection
          </CardTitle>
          <CardDescription>
            {error || 'Inspection bạn tìm kiếm không tồn tại hoặc đã bị xóa.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild variant="outline">
            <Link href="/rust-docs">
              <ArrowLeft className="h-4 w-4" />
              Quay lại Rust Inspector
            </Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">Chi tiết inspection</h1>
          <p className="max-w-3xl text-muted-foreground">
            Trang này hiển thị bản ghi cụ thể lấy trực tiếp từ `GET /inspections/:id` của Rust V2.
          </p>
        </div>

        <Button asChild variant="outline">
          <Link href="/rust-docs">
            <ArrowLeft className="h-4 w-4" />
            Quay lại danh sách
          </Link>
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)]">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <FileJson2 className="h-5 w-5 text-primary" />
              Metadata inspection
            </CardTitle>
            <CardDescription>
              Thông tin đầy đủ của một lần inspect file đã được lưu vào DB hiện tại của project.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <InfoItem label="ID" value={inspection.id} />
            <InfoItem label="Tên file" value={inspection.filename || 'N/A'} />
            <InfoItem label="MIME type" value={inspection.content_type || 'N/A'} />
            <InfoItem label="Extension" value={inspection.extension || 'N/A'} />
            <InfoItem label="Kích thước" value={formatBytes(inspection.size_bytes)} />
            <InfoItem
              label="Content type hỗ trợ"
              value={inspection.supported_content_type ? 'Có' : 'Không'}
            />
            <div className="md:col-span-2 rounded-xl border bg-muted/20 p-4">
              <div className="mb-2 flex items-center gap-2 text-sm font-medium">
                <Hash className="h-4 w-4 text-primary" />
                SHA-256
              </div>
              <p className="break-all font-mono text-xs text-muted-foreground">{inspection.sha256}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <CalendarClock className="h-5 w-5 text-primary" />
              Ghi chú học tập
            </CardTitle>
            <CardDescription>
               Đây là nơi tốt để quan sát cách một inspection record được tạo, lưu, rồi đọc lại trực tiếp từ Rust V2.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-muted-foreground">
            <div className="rounded-xl border bg-card/70 p-4">
              <p className="font-medium text-foreground">Thời điểm tạo</p>
              <p>{new Date(inspection.created_at).toLocaleString('vi-VN')}</p>
            </div>
            <div className="rounded-xl border bg-card/70 p-4">
              <p className="font-medium text-foreground">Flow thực thi</p>
              <p>Frontend gọi trực tiếp Rust V2, Rust service đọc/ghi SQLite hiện tại và trả dữ liệu ngược lại.</p>
            </div>
            <div className="rounded-xl border bg-card/70 p-4">
              <p className="font-medium text-foreground">Gợi ý đọc code</p>
              <p>`apps/web/lib/api.ts` - `services/rust-doc-service/src/routes/inspections.rs` - `services/rust-doc-service/src/repository.rs`</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border bg-muted/20 p-4">
      <div className="mb-2 text-sm font-medium">{label}</div>
      <p className="break-all text-sm text-muted-foreground">{value}</p>
    </div>
  );
}

function formatBytes(bytes: number) {
  if (bytes < 1024) {
    return `${bytes} B`;
  }

  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}
