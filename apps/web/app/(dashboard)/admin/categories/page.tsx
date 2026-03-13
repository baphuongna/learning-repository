'use client';

import { useEffect, useState, useMemo } from 'react';
import { NewsCategory, categoriesApi } from '@/lib/api';
import { PageHeader } from '@/components/features/layout/PageHeader';
import { ContextBar } from '@/components/features/layout/ContextBar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, Loader2, Save, X, Search, RefreshCw, FolderOpen } from 'lucide-react';
import { toast, Toaster } from 'sonner';

/**
 * Helper function để extract error message một cách an toàn
 * Tránh sử dụng `any` type assertion
 */
function getErrorMessage(err: unknown, fallback: string): string {
  if (err instanceof Error) {
    return err.message || fallback;
  }
  // Kiểm tra xem error có property response không (Axios error pattern)
  if (typeof err === 'object' && err !== null && 'response' in err) {
    const response = (err as { response?: { data?: { message?: string } } }).response;
    if (response?.data?.message) {
      return response.data.message;
    }
  }
  return fallback;
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<NewsCategory[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [saving, setSaving] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
  });

  useEffect(() => {
    void fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const data = await categoriesApi.getAllAdmin();
      setCategories(data);
    } catch (err) {
      console.error('Failed to fetch categories:', err);
      toast.error('Không thể tải danh sách danh mục');
    } finally {
      setLoading(false);
    }
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .substring(0, 50);
  };

  const handleCreate = async () => {
    if (!formData.name.trim()) {
      toast.error('Vui lòng nhập tên danh mục');
      return;
    }

    try {
      setSaving('new');
      await categoriesApi.create({
        name: formData.name,
        slug: formData.slug || generateSlug(formData.name),
        description: formData.description,
      });
      setShowCreate(false);
      setFormData({ name: '', slug: '', description: '' });
      toast.success(`Đã tạo danh mục "${formData.name}"`);
      await fetchCategories();
    } catch (err) {
      const message = getErrorMessage(err, 'Không thể tạo danh mục');
      toast.error(message);
    } finally {
      setSaving(null);
    }
  };

  const handleUpdate = async (id: string) => {
    const category = categories.find((c) => c.id === id);
    if (!category) return;

    if (!category.name.trim()) {
      toast.error('Tên danh mục không được để trống');
      return;
    }

    try {
      setSaving(id);
      await categoriesApi.update(id, {
        name: category.name,
        slug: category.slug,
        description: category.description || undefined,
      });
      setEditing(null);
      toast.success(`Đã cập nhật danh mục "${category.name}"`);
      await fetchCategories();
    } catch (err) {
      const message = getErrorMessage(err, 'Không thể cập nhật danh mục');
      toast.error(message);
    } finally {
      setSaving(null);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    try {
      setDeleting(id);
      await categoriesApi.delete(id);
      setCategories((prev) => prev.filter((c) => c.id !== id));
      toast.success(`Đã xóa danh mục "${name}"`);
    } catch (err) {
      const message = getErrorMessage(err, 'Không thể xóa danh mục');
      toast.error(message);
    } finally {
      setDeleting(null);
    }
  };

  const confirmDelete = (id: string, name: string, newsCount: number) => {
    const hasWarning = newsCount > 0;
    
    toast(
      <div className="space-y-3">
        <p className="font-medium">Xác nhận xóa danh mục?</p>
        <p className="text-sm text-muted-foreground">&ldquo;{name}&rdquo;</p>
        {hasWarning && (
          <p className="text-sm text-destructive">
            Danh mục này có {newsCount} bài viết. Xóa danh mục có thể ảnh hưởng đến các bài viết này.
          </p>
        )}
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
              void handleDelete(id, name);
            }}
          >
            Xóa
          </Button>
        </div>
      </div>,
      { duration: hasWarning ? 15000 : 10000 }
    );
  };

  const updateCategory = (id: string, field: keyof NewsCategory, value: string) => {
    setCategories(
      categories.map((c) =>
        c.id === id ? { ...c, [field]: value } : c
      )
    );
  };

  // Client-side search filter
  const filteredCategories = useMemo(() => {
    if (!searchQuery.trim()) return categories;
    const query = searchQuery.toLowerCase();
    return categories.filter(
      (item) =>
        item.name.toLowerCase().includes(query) ||
        item.slug.toLowerCase().includes(query) ||
        item.description?.toLowerCase().includes(query)
    );
  }, [categories, searchQuery]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <span className="ml-2 text-muted-foreground">Đang tải...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Toaster for notifications */}
      <Toaster position="top-right" richColors />

      {/* Page Header */}
      <PageHeader
        title="Quản lý danh mục"
        description="Quản lý các danh mục tin tức để phân loại nội dung"
        actions={
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => void fetchCategories()}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Làm mới
            </Button>
            <Button onClick={() => setShowCreate(!showCreate)}>
              {showCreate ? (
                <>
                  <X className="h-4 w-4 mr-2" />
                  Đóng
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Tạo danh mục
                </>
              )}
            </Button>
          </div>
        }
      />

      {/* Create Form */}
      {showCreate && (
        <div className="border rounded-lg p-4 bg-muted/30">
          <h3 className="font-medium mb-4">Tạo danh mục mới</h3>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <label className="text-sm font-medium">Tên danh mục</label>
              <Input
                value={formData.name}
                onChange={(e) => {
                  const name = e.target.value;
                  setFormData((prev) => ({
                    ...prev,
                    name,
                    slug: prev.slug || generateSlug(name),
                  }));
                }}
                placeholder="VD: Giáo dục"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Slug</label>
              <Input
                value={formData.slug}
                onChange={(e) => setFormData((prev) => ({ ...prev, slug: e.target.value }))}
                placeholder="giao-duc"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Mô tả</label>
              <Input
                value={formData.description}
                onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                placeholder="Mô tả ngắn"
              />
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <Button onClick={handleCreate} disabled={saving === 'new'}>
              {saving === 'new' ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              Lưu
            </Button>
            <Button variant="outline" onClick={() => setShowCreate(false)}>
              <X className="h-4 w-4 mr-2" />
              Hủy
            </Button>
          </div>
        </div>
      )}

      {/* Context Bar with Search */}
      <ContextBar
        search={
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              type="text"
              placeholder="Tìm kiếm theo tên, slug hoặc mô tả..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        }
      />

      {/* Results summary */}
      {searchQuery && (
        <div className="text-sm text-muted-foreground">
          Tìm thấy <strong className="text-foreground">{filteredCategories.length}</strong> danh mục
          {filteredCategories.length !== categories.length && (
            <span> trong số {categories.length} danh mục</span>
          )}
        </div>
      )}

      {/* Categories Table */}
      {filteredCategories.length > 0 ? (
        <div className="border rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted">
                <tr>
                  <th className="p-4 text-left font-medium text-sm">Tên</th>
                  <th className="p-4 text-left font-medium text-sm">Slug</th>
                  <th className="p-4 text-left font-medium text-sm">Mô tả</th>
                  <th className="p-4 text-left font-medium text-sm">Số bài viết</th>
                  <th className="p-4 text-left font-medium text-sm">Trạng thái</th>
                  <th className="p-4 text-right font-medium text-sm">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filteredCategories.map((category) => (
                  <tr key={category.id} className="border-t hover:bg-muted/50 transition-colors">
                    <td className="p-4">
                      {editing === category.id ? (
                        <Input
                          value={category.name}
                          onChange={(e) => updateCategory(category.id, 'name', e.target.value)}
                          className="min-w-[150px]"
                        />
                      ) : (
                        <span className="font-medium">{category.name}</span>
                      )}
                    </td>
                    <td className="p-4">
                      {editing === category.id ? (
                        <Input
                          value={category.slug}
                          onChange={(e) => updateCategory(category.id, 'slug', e.target.value)}
                          className="min-w-[120px]"
                        />
                      ) : (
                        <code className="text-sm bg-muted px-2 py-1 rounded">
                          {category.slug}
                        </code>
                      )}
                    </td>
                    <td className="p-4">
                      {editing === category.id ? (
                        <Input
                          value={category.description || ''}
                          onChange={(e) => updateCategory(category.id, 'description', e.target.value)}
                          className="min-w-[150px]"
                        />
                      ) : (
                        <span className="text-muted-foreground text-sm">
                          {category.description || '-'}
                        </span>
                      )}
                    </td>
                    <td className="p-4">
                      <Badge variant="secondary">
                        {category._count?.news || 0} bài
                      </Badge>
                    </td>
                    <td className="p-4">
                      <Badge variant={category.status === 'ACTIVE' ? 'default' : 'outline'}>
                        {category.status === 'ACTIVE' ? 'Hoạt động' : 'Vô hiệu'}
                      </Badge>
                    </td>
                    <td className="p-4">
                      <div className="flex justify-end gap-1">
                        {editing === category.id ? (
                          <>
                            <Button 
                              size="sm" 
                              onClick={() => void handleUpdate(category.id)}
                              disabled={saving === category.id}
                              title="Lưu"
                            >
                              {saving === category.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Save className="h-4 w-4" />
                              )}
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline" 
                              onClick={() => setEditing(null)}
                              title="Hủy"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </>
                        ) : (
                          <>
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              onClick={() => setEditing(category.id)}
                              title="Chỉnh sửa"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => confirmDelete(category.id, category.name, category._count?.news || 0)}
                              disabled={deleting === category.id}
                              title="Xóa"
                            >
                              {deleting === category.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Trash2 className="h-4 w-4 text-destructive" />
                              )}
                            </Button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="text-center py-16 border rounded-lg bg-muted/30">
          <FolderOpen className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
          <p className="text-muted-foreground mb-4 font-medium">
            {searchQuery ? 'Không tìm thấy danh mục nào' : 'Chưa có danh mục nào'}
          </p>
          <p className="text-sm text-muted-foreground mb-4">
            {searchQuery
              ? 'Hãy thử tìm kiếm với từ khóa khác'
              : 'Tạo danh mục đầu tiên để phân loại bài viết'}
          </p>
          {!searchQuery && (
            <Button onClick={() => setShowCreate(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Tạo danh mục đầu tiên
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
