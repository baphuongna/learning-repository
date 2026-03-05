'use client';

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
import { documentsApi } from '@/lib/api';
import { Upload, X, Loader2, Folder as FolderIcon } from 'lucide-react';
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
      // Auto-fill title from filename
      if (!watch('title')) {
        setValue('title', selectedFile.name.replace(/\.[^/.]+$/, ''));
      }
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
              currentFolderId={watch('folderId')}
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
                variant="ghost"
                size="sm"
                onClick={() => setFile(null)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </div>

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
