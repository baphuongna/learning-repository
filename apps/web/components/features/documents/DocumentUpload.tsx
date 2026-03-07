'use client';

import Link from 'next/link';
import { useState, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { documentsApi, InspectFileResponse, rustDocsApi } from '@/lib/api';
import { AlertCircle, CheckCircle2, Cpu, FileSearch, Hash, Loader2, Upload, X, Folder as FolderIcon } from 'lucide-react';
import { FolderBreadcrumb } from '@/components/folders/FolderBreadcrumb';
import { toast } from 'sonner';

const schema = z.object({
  title: z.string().min(1, 'Tiêu đề không được để trống'),
  description: z.string().optional(),
  author: z.string().optional(),
  subject: z.string().optional(),
  keywords: z.string().optional(),
  isPublic: z.boolean().default(false),
  folderId: z.string().nullable().optional(),
});

type FormData = z.infer<typeof schema>;

export function DocumentUpload() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [isInspecting, setIsInspecting] = useState(false);
  const [inspectionResult, setInspectionResult] = useState<InspectFileResponse | null>(null);
  const [inspectionError, setInspectionError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      isPublic: false,
      folderId: searchParams.get('folderId') || null,
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setInspectionResult(null);
      setInspectionError(null);
      // Auto-fill title from filename
      if (!watch('title')) {
        setValue('title', selectedFile.name.replace(/\.[^/.]+$/, ''));
      }
    }
  };

  const handleInspectFile = async () => {
    if (!file) {
      setInspectionError('Vui lòng chọn file trước khi inspect');
      return;
    }

    setIsInspecting(true);
    setInspectionError(null);

    try {
      const response = await rustDocsApi.inspectFile(file);
      setInspectionResult(response);
      toast.success('Inspect file thành công qua Rust service');
    } catch (err: any) {
      console.error('Inspect error:', err);
      setInspectionResult(null);
      setInspectionError(err.response?.data?.message || 'Inspect file thất bại');
      toast.error('Inspect file thất bại');
    } finally {
      setIsInspecting(false);
    }
  };

  const onSubmit = async (data: FormData) => {
    if (!file) {
      setError('Vui lòng chọn file');
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('title', data.title);
      formData.append('description', data.description || '');
      formData.append('author', data.author || '');
      formData.append('subject', data.subject || '');
      formData.append('keywords', data.keywords || '');
      formData.append('isPublic', String(data.isPublic));
      if (data.folderId) {
        formData.append('folderId', data.folderId);
      }
      if (inspectionResult?.persisted.id) {
        formData.append('inspectionId', inspectionResult.persisted.id);
      }

      await documentsApi.create(formData);
      toast.success('Tải lên tài liệu thành công!');
      router.push('/documents');
    } catch (err: any) {
      console.error('Upload error:', err);
      setError(err.response?.data?.message || 'Upload thất bại');
      toast.error('Tải lên tài liệu thất bại');
    } finally {
      setUploading(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-2xl">
      {/* Error Message */}
      {error && (
        <div className="bg-destructive/10 text-destructive px-4 py-3 rounded-md">
          {error}
        </div>
      )}

      {/* Folder Destination - Hiển thị dạng breadcrumb, không cho thay đổi */}
      <div>
        <Label>Thư mục đích</Label>
        <div className="mt-2 flex items-center gap-2 px-3 py-2 border rounded-md bg-muted/30">
          <FolderIcon className="h-4 w-4 text-yellow-500 flex-shrink-0" />
          {watch('folderId') ? (
            <FolderBreadcrumb
              currentFolderId={watch('folderId') ?? null}
              onNavigate={() => {}} // Không làm gì cả - read-only
              className="pointer-events-none"
            />
          ) : (
            <span className="text-muted-foreground">Thư mục gốc</span>
          )}
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          File sẽ được tải lên thư mục này. Quay lại trang trước để chọn thư mục khác.
        </p>
      </div>

      {/* File Upload */}
      <div>
        <Label>File tài liệu</Label>
        <div className="mt-2">
          {!file ? (
            <>
              <label
                htmlFor="file-upload"
                className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
              >
                <Upload className="w-10 h-10 text-muted-foreground" />
                <p className="mt-2 text-sm text-muted-foreground">
                  Kéo thả file hoặc click để chọn
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Hỗ trợ: PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, MP4, MP3 (tối đa 100MB)
                </p>
              </label>
              <input
                id="file-upload"
                ref={fileInputRef}
                type="file"
                className="hidden"
                onChange={handleFileChange}
                accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.mp4,.mp3"
              />
            </>
          ) : (
            <div className="flex items-center gap-3 p-4 border rounded-lg">
              <span className="text-2xl">📄</span>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{file.name}</p>
                <p className="text-sm text-muted-foreground">
                  {formatFileSize(file.size)}
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => void handleInspectFile()}
                disabled={uploading || isInspecting}
              >
                {isInspecting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Cpu className="h-4 w-4" />}
                {isInspecting ? 'Đang inspect...' : 'Inspect bằng Rust'}
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  setFile(null);
                  setInspectionResult(null);
                  setInspectionError(null);
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          Bạn có thể inspect file trước khi upload để xem metadata và hash được xử lý bởi Rust service.
        </p>
      </div>

      {(inspectionError || inspectionResult) && (
        <div className="space-y-3 rounded-xl border bg-card/60 p-4">
          <div className="flex items-center gap-2">
            <FileSearch className="h-4 w-4 text-primary" />
            <h3 className="font-medium">Kết quả inspect trước khi upload</h3>
          </div>

          {inspectionError && (
            <div className="flex items-start gap-2 rounded-lg border border-destructive/20 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              <AlertCircle className="mt-0.5 h-4 w-4" />
              <span>{inspectionError}</span>
            </div>
          )}

          {inspectionResult && (
            <div className="grid gap-3 md:grid-cols-2">
              <InspectInfo label="Tên file" value={inspectionResult.data.filename || 'N/A'} />
              <InspectInfo label="MIME type" value={inspectionResult.data.content_type || 'N/A'} />
              <InspectInfo label="Extension" value={inspectionResult.data.extension || 'N/A'} />
              <InspectInfo label="Kích thước" value={formatFileSize(inspectionResult.data.size_bytes)} />
              <InspectInfo
                label="Content type hỗ trợ"
                value={inspectionResult.data.supported_content_type ? 'Có' : 'Không'}
                icon={inspectionResult.data.supported_content_type ? CheckCircle2 : AlertCircle}
              />
              <div className="rounded-lg border bg-muted/20 p-3">
                <div className="mb-2 text-sm font-medium">Inspection record</div>
                <Link
                  href={`/rust-docs/${inspectionResult.persisted.id}`}
                  className="break-all text-sm text-primary hover:underline"
                >
                  {inspectionResult.persisted.id}
                </Link>
              </div>
              <div className="md:col-span-2 rounded-lg border bg-muted/20 p-3">
                <div className="mb-2 flex items-center gap-2 text-sm font-medium">
                  <Hash className="h-4 w-4 text-primary" />
                  SHA-256
                </div>
                <p className="break-all font-mono text-xs text-muted-foreground">
                  {inspectionResult.data.sha256}
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Title */}
      <div>
        <Label htmlFor="title">Tiêu đề *</Label>
        <Input id="title" {...register('title')} className="mt-2" />
        {errors.title && (
          <p className="text-sm text-destructive mt-1">{errors.title.message}</p>
        )}
      </div>

      {/* Description */}
      <div>
        <Label htmlFor="description">Mô tả</Label>
        <Textarea
          id="description"
          {...register('description')}
          className="mt-2"
          rows={3}
        />
      </div>

      {/* Author & Subject */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="author">Tác giả</Label>
          <Input id="author" {...register('author')} className="mt-2" />
        </div>
        <div>
          <Label htmlFor="subject">Môn học / Chủ đề</Label>
          <Input id="subject" {...register('subject')} className="mt-2" />
        </div>
      </div>

      {/* Keywords */}
      <div>
        <Label htmlFor="keywords">Từ khóa (phân cách bằng dấu phẩy)</Label>
        <Input
          id="keywords"
          {...register('keywords')}
          className="mt-2"
          placeholder="VD: toán học, giải tích, lớp 10"
        />
      </div>

      {/* Public */}
      <div className="flex items-center gap-3">
        <Switch
          checked={watch('isPublic')}
          onCheckedChange={(checked) => setValue('isPublic', checked)}
        />
        <Label className="cursor-pointer">
          Công khai (ai cũng có thể xem)
        </Label>
      </div>

      {/* Submit */}
      <div className="flex gap-3">
        <Button type="submit" disabled={uploading}>
          {uploading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
          {uploading ? 'Đang tải lên...' : 'Tải lên'}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={uploading}
        >
          Hủy
        </Button>
      </div>
    </form>
  );
}

function InspectInfo({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon?: typeof CheckCircle2;
}) {
  return (
    <div className="rounded-lg border bg-muted/20 p-3">
      <div className="mb-2 flex items-center gap-2 text-sm font-medium">
        {Icon && <Icon className="h-4 w-4 text-primary" />}
        {label}
      </div>
      <p className="break-all text-sm text-muted-foreground">{value}</p>
    </div>
  );
}
