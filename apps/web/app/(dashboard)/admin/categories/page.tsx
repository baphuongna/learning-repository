'use client';

import { useEffect, useState } from 'react';
import { NewsCategory, categoriesApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, Loader2, Save, X } from 'lucide-react';

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<NewsCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const data = await categoriesApi.getAllAdmin();
      setCategories(data);
    } catch (err) {
      console.error('Failed to fetch categories:', err);
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
    if (!formData.name.trim()) return;

    try {
      await categoriesApi.create({
        name: formData.name,
        slug: formData.slug || generateSlug(formData.name),
        description: formData.description,
      });
      setShowCreate(false);
      setFormData({ name: '', slug: '', description: '' });
      fetchCategories();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Không thể tạo danh mục');
    }
  };

  const handleUpdate = async (id: string) => {
    const category = categories.find((c) => c.id === id);
    if (!category) return;

    try {
      await categoriesApi.update(id, {
        name: category.name,
        slug: category.slug,
        description: category.description || undefined,
      });
      setEditing(null);
      fetchCategories();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Không thể cập nhật danh mục');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bạn có chắc muốn xóa danh mục này?')) return;

    try {
      setDeleting(id);
      await categoriesApi.delete(id);
      setCategories(categories.filter((c) => c.id !== id));
    } catch (err: any) {
      alert(err.response?.data?.message || 'Không thể xóa danh mục');
    } finally {
      setDeleting(null);
    }
  };

  const updateCategory = (id: string, field: keyof NewsCategory, value: string) => {
    setCategories(
      categories.map((c) =>
        c.id === id ? { ...c, [field]: value } : c
      )
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Quản lý danh mục</h1>
          <p className="text-muted-foreground">Quản lý các danh mục tin tức</p>
        </div>
        <Button onClick={() => setShowCreate(!showCreate)}>
          <Plus className="h-4 w-4 mr-2" />
          Tạo danh mục
        </Button>
      </div>

      {/* Create Form */}
      {showCreate && (
        <div className="border rounded-lg p-4 bg-muted/50">
          <h3 className="font-medium mb-4">Tạo danh mục mới</h3>
          <div className="grid gap-4 md:grid-cols-3">
            <div>
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
            <div>
              <label className="text-sm font-medium">Slug</label>
              <Input
                value={formData.slug}
                onChange={(e) => setFormData((prev) => ({ ...prev, slug: e.target.value }))}
                placeholder="giao-duc"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Mô tả</label>
              <Input
                value={formData.description}
                onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                placeholder="Mô tả ngắn"
              />
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <Button onClick={handleCreate}>
              <Save className="h-4 w-4 mr-2" />
              Lưu
            </Button>
            <Button variant="outline" onClick={() => setShowCreate(false)}>
              <X className="h-4 w-4 mr-2" />
              Hủy
            </Button>
          </div>
        </div>
      )}

      {/* Categories Table */}
      {categories.length > 0 ? (
        <div className="border rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-muted">
              <tr>
                <th className="p-4 text-left font-medium">Tên</th>
                <th className="p-4 text-left font-medium">Slug</th>
                <th className="p-4 text-left font-medium">Mô tả</th>
                <th className="p-4 text-left font-medium">Số bài viết</th>
                <th className="p-4 text-left font-medium">Trạng thái</th>
                <th className="p-4 text-right font-medium">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((category) => (
                <tr key={category.id} className="border-t hover:bg-muted/50">
                  <td className="p-4">
                    {editing === category.id ? (
                      <Input
                        value={category.name}
                        onChange={(e) => updateCategory(category.id, 'name', e.target.value)}
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
                      />
                    ) : (
                      <span className="text-muted-foreground">
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
                  <td className="p-4 text-right">
                    <div className="flex justify-end gap-2">
                      {editing === category.id ? (
                        <>
                          <Button size="sm" onClick={() => handleUpdate(category.id)}>
                            <Save className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => setEditing(null)}>
                            <X className="h-4 w-4" />
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button size="sm" variant="ghost" onClick={() => setEditing(category.id)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDelete(category.id)}
                            disabled={deleting === category.id}
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
      ) : (
        <div className="text-center py-12 border rounded-lg">
          <p className="text-muted-foreground mb-4">Chưa có danh mục nào</p>
          <Button onClick={() => setShowCreate(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Tạo danh mục đầu tiên
          </Button>
        </div>
      )}
    </div>
  );
}
