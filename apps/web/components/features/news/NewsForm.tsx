'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { News, NewsCategory, newsApi, categoriesApi, rustDocsApi } from '@/lib/api';
import { Loader2, Save, Upload, X, Image as ImageIcon } from 'lucide-react';

// Dynamic import React Quill to avoid SSR issues
const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });
import 'react-quill/dist/quill.snow.css';

interface NewsFormProps {
  news?: News; // Nếu có, là edit mode
}

export function NewsForm({ news }: NewsFormProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [categories, setCategories] = useState<NewsCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: news?.title || '',
    slug: news?.slug || '',
    summary: news?.summary || '',
    content: news?.content || '',
    categoryId: news?.categoryId || '',
    thumbnailUrl: news?.thumbnailUrl || '',
    isFeatured: news?.isFeatured || false,
    isPublished: news?.isPublished || false,
  });

  // Fetch categories on mount
  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const data = await categoriesApi.getAll();
      setCategories(data);
    } catch (err) {
      console.error('Failed to fetch categories:', err);
    }
  };

  // Auto-generate slug from title
  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd')
      .replace(/Đ/g, 'D')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .substring(0, 100);
  };

  const handleTitleChange = (title: string) => {
    setFormData((prev) => ({
      ...prev,
      title,
      // Auto-generate slug only for new news
      slug: news ? prev.slug : generateSlug(title),
    }));
  };

  // Handle file upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setError('Chỉ chấp nhận file hình ảnh (JPG, PNG, GIF, WebP)');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Kích thước file không được vượt quá 5MB');
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const response = await rustDocsApi.uploadPublicFile(file);
      const imageUrl = rustDocsApi.getPublicFileUrl(response.filename);

      setFormData((prev) => ({
        ...prev,
        thumbnailUrl: imageUrl,
      }));
    } catch (err: any) {
      console.error('Upload failed:', err);
      setError(err.response?.data?.message || 'Không thể tải lên hình ảnh');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!formData.title.trim()) {
      setError('Tiêu đề không được để trống');
      return;
    }
    if (!formData.slug.trim()) {
      setError('Slug không được để trống');
      return;
    }
    if (!formData.categoryId) {
      setError('Vui lòng chọn danh mục');
      return;
    }
    if (!formData.summary.trim()) {
      setError('Tóm tắt không được để trống');
      return;
    }
    if (!formData.content.trim()) {
      setError('Nội dung không được để trống');
      return;
    }

    setLoading(true);

    try {
      if (news) {
        // Update existing news
        await newsApi.update(news.id, formData);
        router.push('/my-news');
      } else {
        // Create new news
        await newsApi.create(formData);
        router.push('/my-news');
      }
    } catch (err: any) {
      console.error('Failed to save news:', err);
      setError(err.response?.data?.message || 'Không thể lưu bài viết');
    } finally {
      setLoading(false);
    }
  };

  // Quill editor modules and formats
  const modules = {
    toolbar: [
      [{ header: [1, 2, 3, 4, 5, 6, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ list: 'ordered' }, { list: 'bullet' }],
      [{ color: [] }, { background: [] }],
      ['link', 'image'],
      ['clean'],
    ],
  };

  const formats = [
    'header',
    'bold',
    'italic',
    'underline',
    'strike',
    'list',
    'bullet',
    'color',
    'background',
    'link',
    'image',
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl">
      {/* Error Message */}
      {error && (
        <div className="bg-destructive/10 text-destructive px-4 py-3 rounded-md">
          {error}
        </div>
      )}

      {/* Title */}
      <div>
        <Label htmlFor="title">Tiêu đề *</Label>
        <Input
          id="title"
          value={formData.title}
          onChange={(e) => handleTitleChange(e.target.value)}
          className="mt-2"
          placeholder="Nhập tiêu đề bài viết"
          required
        />
      </div>

      {/* Slug */}
      <div>
        <Label htmlFor="slug">Slug (URL) *</Label>
        <Input
          id="slug"
          value={formData.slug}
          onChange={(e) => setFormData((prev) => ({ ...prev, slug: e.target.value }))}
          className="mt-2"
          placeholder="tieu-de-bai-viet"
          required
        />
        <p className="text-xs text-muted-foreground mt-1">
          URL: /news/{formData.slug}
        </p>
      </div>

      {/* Category */}
      <div>
        <Label htmlFor="category">Danh mục *</Label>
        <select
          id="category"
          value={formData.categoryId}
          onChange={(e) => setFormData((prev) => ({ ...prev, categoryId: e.target.value }))}
          className="mt-2 w-full p-2 border rounded-md bg-background"
          required
        >
          <option value="">Chọn danh mục</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
      </div>

      {/* Summary */}
      <div>
        <Label htmlFor="summary">Tóm tắt *</Label>
        <Textarea
          id="summary"
          value={formData.summary}
          onChange={(e) => setFormData((prev) => ({ ...prev, summary: e.target.value }))}
          className="mt-2"
          rows={3}
          placeholder="Tóm tắt ngắn gọn về bài viết"
          required
        />
      </div>

      {/* Content - Rich Text Editor */}
      <div>
        <Label>Nội dung *</Label>
        <div className="mt-2 bg-background">
          <ReactQuill
            theme="snow"
            value={formData.content}
            onChange={(content) => setFormData((prev) => ({ ...prev, content }))}
            modules={modules}
            formats={formats}
            className="min-h-[300px]"
            placeholder="Viết nội dung bài viết..."
          />
        </div>
      </div>

      {/* Thumbnail Upload */}
      <div>
        <Label>Hình ảnh đại diện</Label>
        <div className="mt-2 space-y-4">
          {/* Upload button */}
          <div className="flex gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/gif,image/webp"
              onChange={handleFileUpload}
              className="hidden"
            />
            <Button
              type="button"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
            >
              {uploading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Upload className="h-4 w-4 mr-2" />
              )}
              {uploading ? 'Đang tải...' : 'Tải ảnh lên'}
            </Button>
          </div>

          {/* Preview */}
          {formData.thumbnailUrl ? (
            <div className="relative inline-block">
              <img
                src={formData.thumbnailUrl}
                alt="Thumbnail preview"
                className="h-48 w-auto rounded-lg object-cover border"
              />
              <Button
                type="button"
                variant="destructive"
                size="sm"
                className="absolute top-2 right-2"
                onClick={() => setFormData((prev) => ({ ...prev, thumbnailUrl: '' }))}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="flex items-center justify-center h-32 w-48 border-2 border-dashed rounded-lg bg-muted/50">
              <div className="text-center text-muted-foreground">
                <ImageIcon className="h-8 w-8 mx-auto mb-2" />
                <p className="text-xs">Chưa có hình ảnh</p>
              </div>
            </div>
          )}

          {/* URL input (alternative) */}
          <div>
            <Label className="text-sm text-muted-foreground">Hoặc nhập URL hình ảnh:</Label>
            <Input
              value={formData.thumbnailUrl}
              onChange={(e) => setFormData((prev) => ({ ...prev, thumbnailUrl: e.target.value }))}
              className="mt-1"
              type="url"
              placeholder="https://example.com/image.jpg"
            />
          </div>
        </div>
      </div>

      {/* Switches */}
      <div className="flex flex-wrap gap-6">
        <div className="flex items-center gap-2">
          <Switch
            checked={formData.isFeatured}
            onCheckedChange={(checked) =>
              setFormData((prev) => ({ ...prev, isFeatured: checked }))
            }
          />
          <Label className="cursor-pointer">Tin nổi bật</Label>
        </div>
        <div className="flex items-center gap-2">
          <Switch
            checked={formData.isPublished}
            onCheckedChange={(checked) =>
              setFormData((prev) => ({ ...prev, isPublished: checked }))
            }
          />
          <Label className="cursor-pointer">Xuất bản ngay</Label>
        </div>
      </div>

      {/* Submit */}
      <div className="flex gap-4">
        <Button type="submit" disabled={loading || uploading}>
          {loading ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Save className="h-4 w-4 mr-2" />
          )}
          {loading ? 'Đang lưu...' : news ? 'Cập nhật' : 'Đăng bài'}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={loading}
        >
          Hủy
        </Button>
      </div>
    </form>
  );
}
