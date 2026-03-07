'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { rustDocsApi, InspectionHistory, InspectFileResponse } from '@/lib/api';
import {
  AlertCircle,
  CheckCircle2,
  FileSearch,
  FileUp,
  Hash,
  History,
  Loader2,
  RefreshCcw,
  Server,
} from 'lucide-react';

const MAX_HISTORY_ITEMS = 8;

export function RustDocInspector() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [inspectionResult, setInspectionResult] = useState<InspectFileResponse | null>(null);
  const [inspectionHistory, setInspectionHistory] = useState<InspectionHistory[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void fetchInspectionHistory();
  }, []);

  const selectedFileSummary = useMemo(() => {
    if (!selectedFile) {
      return null;
    }

    return {
      name: selectedFile.name,
      size: formatBytes(selectedFile.size),
      type: selectedFile.type || 'unknown',
    };
  }, [selectedFile]);

  const fetchInspectionHistory = async () => {
    setIsLoadingHistory(true);

    try {
      const response = await rustDocsApi.listInspections(MAX_HISTORY_ITEMS);
      setInspectionHistory(response.data);
    } catch (err: any) {
      console.error('Failed to fetch inspection history:', err);
      setError(err.response?.data?.message || 'Không thể tải lịch sử inspect');
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const handleInspect = async () => {
    if (!selectedFile) {
      setError('Vui lòng chọn file để inspect');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await rustDocsApi.inspectFile(selectedFile);
      setInspectionResult(response);
      await fetchInspectionHistory();
    } catch (err: any) {
      console.error('Failed to inspect file:', err);
      setError(err.response?.data?.message || 'Không thể inspect file qua rust service');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(360px,0.8fr)]">
      <div className="space-y-6">
        <Card variant="gradient">
          <CardHeader>
            <div className="flex items-start justify-between gap-4">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Server className="h-5 w-5 text-primary" />
                  Rust File Inspector
                </CardTitle>
                <CardDescription>
                  Upload một file để frontend gọi trực tiếp Rust V2, service sẽ inspect và lưu lịch sử vào DB hiện tại của project.
                </CardDescription>
              </div>
              <div className="rounded-lg border border-primary/20 bg-background/70 px-3 py-2 text-xs text-muted-foreground">
                Flow: Web - Rust V2 - DB
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-5">
            <label className="block cursor-pointer rounded-2xl border border-dashed border-primary/30 bg-background/80 p-6 transition-colors hover:border-primary/50 hover:bg-primary/5">
              <input
                type="file"
                className="hidden"
                onChange={(event) => {
                  const file = event.target.files?.[0] || null;
                  setSelectedFile(file);
                  setInspectionResult(null);
                  setError(null);
                }}
              />
              <div className="flex flex-col items-center justify-center gap-3 text-center">
                <div className="rounded-2xl bg-primary/10 p-4 text-primary">
                  <FileUp className="h-7 w-7" />
                </div>
                <div>
                  <p className="font-medium">Chọn file để inspect bằng Rust service</p>
                  <p className="text-sm text-muted-foreground">
                    Hỗ trợ tốt nhất với PDF, DOC, DOCX, TXT, PNG, JPEG theo whitelist hiện tại của service.
                  </p>
                </div>
              </div>
            </label>

            {selectedFileSummary && (
              <div className="rounded-xl border bg-card/70 p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <p className="font-medium">{selectedFileSummary.name}</p>
                    <p className="text-sm text-muted-foreground">Loại: {selectedFileSummary.type}</p>
                    <p className="text-sm text-muted-foreground">Kích thước: {selectedFileSummary.size}</p>
                  </div>
                  <FileSearch className="h-5 w-5 text-primary" />
                </div>
              </div>
            )}

            {error && (
              <div className="flex items-start gap-3 rounded-xl border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                <AlertCircle className="mt-0.5 h-4 w-4" />
                <span>{error}</span>
              </div>
            )}

            <div className="flex flex-wrap gap-3">
              <Button onClick={handleInspect} disabled={!selectedFile} loading={isSubmitting}>
                Inspect qua Rust service
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setSelectedFile(null);
                  setInspectionResult(null);
                  setError(null);
                }}
                disabled={isSubmitting}
              >
                Xóa lựa chọn
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Hash className="h-5 w-5 text-primary" />
              Kết quả inspect mới nhất
            </CardTitle>
            <CardDescription>
              Dữ liệu này đến trực tiếp từ `POST /inspect` của Rust V2.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!inspectionResult ? (
              <div className="rounded-xl border border-dashed p-6 text-sm text-muted-foreground">
                Chưa có kết quả inspect nào trong phiên làm việc này. Hãy chọn file và bấm inspect.
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                <InfoItem label="Tên file" value={inspectionResult.data.filename || 'N/A'} />
                <InfoItem label="MIME type" value={inspectionResult.data.content_type || 'N/A'} />
                <InfoItem label="Extension" value={inspectionResult.data.extension || 'N/A'} />
                <InfoItem label="Kích thước" value={formatBytes(inspectionResult.data.size_bytes)} />
                <InfoItem
                  label="Hỗ trợ content type"
                  value={inspectionResult.data.supported_content_type ? 'Có' : 'Không'}
                  icon={inspectionResult.data.supported_content_type ? CheckCircle2 : AlertCircle}
                />
                <div className="rounded-xl border bg-muted/20 p-4">
                  <div className="mb-2 text-sm font-medium">Bản ghi DB</div>
                  <Link
                    href={`/rust-docs/${inspectionResult.persisted.id}`}
                    className="break-all text-sm text-primary hover:underline"
                  >
                    {inspectionResult.persisted.id}
                  </Link>
                </div>
                <div className="md:col-span-2 rounded-xl border bg-muted/20 p-4">
                  <p className="mb-2 text-sm font-medium">SHA-256</p>
                  <p className="break-all font-mono text-xs text-muted-foreground">
                    {inspectionResult.data.sha256}
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-3">
            <div>
              <CardTitle className="flex items-center gap-2 text-lg">
                <History className="h-5 w-5 text-primary" />
                Lịch sử inspect gần nhất
              </CardTitle>
              <CardDescription>
                Dữ liệu được đọc trực tiếp từ `GET /inspections` của Rust V2.
              </CardDescription>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              onClick={() => void fetchInspectionHistory()}
              disabled={isLoadingHistory}
            >
              {isLoadingHistory ? <Loader2 className="animate-spin" /> : <RefreshCcw className="h-4 w-4" />}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoadingHistory ? (
            <div className="flex items-center justify-center py-12 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin" />
            </div>
          ) : inspectionHistory.length === 0 ? (
            <div className="rounded-xl border border-dashed p-6 text-sm text-muted-foreground">
              Chưa có bản ghi inspect nào. Hãy chạy inspect đầu tiên để thấy dữ liệu ở đây.
            </div>
          ) : (
            <div className="space-y-3">
              {inspectionHistory.map((item) => (
                <div key={item.id} className="rounded-xl border bg-card/70 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 space-y-1">
                      <p className="truncate font-medium">{item.filename || 'Unknown file'}</p>
                      <p className="text-xs text-muted-foreground">
                        {item.content_type || 'unknown'} - {formatBytes(item.size_bytes)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(item.created_at).toLocaleString('vi-VN')}
                      </p>
                    </div>
                    <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
                      {item.extension || 'N/A'}
                    </span>
                  </div>
                  <p className="mt-3 break-all font-mono text-[11px] text-muted-foreground">
                    {item.sha256}
                  </p>
                  <div className="mt-3 flex justify-end">
                    <Button asChild size="sm" variant="outline">
                      <Link href={`/rust-docs/${item.id}`}>Xem chi tiết</Link>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function InfoItem({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon?: typeof CheckCircle2;
}) {
  return (
    <div className="rounded-xl border bg-muted/20 p-4">
      <div className="mb-2 flex items-center gap-2 text-sm font-medium">
        {Icon && <Icon className="h-4 w-4 text-primary" />}
        {label}
      </div>
      <p className="text-sm text-muted-foreground break-all">{value}</p>
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
