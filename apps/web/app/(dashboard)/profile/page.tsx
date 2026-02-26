'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/providers';
import { authApi, User } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Save, User as UserIcon, Mail, Calendar, FileText } from 'lucide-react';

export default function ProfilePage() {
  const router = useRouter();
  const { user, setUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    fullName: '',
    avatarUrl: '',
  });

  const [profile, setProfile] = useState<User & { _count?: { documents: number } } | null>(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setFetching(true);
      const data = await authApi.getProfile();
      setProfile(data);
      setFormData({
        fullName: data.fullName,
        avatarUrl: data.avatarUrl || '',
      });
    } catch (err) {
      console.error('Failed to fetch profile:', err);
    } finally {
      setFetching(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!formData.fullName.trim()) {
      setError('Họ tên không được để trống');
      return;
    }

    setLoading(true);

    try {
      const updated = await authApi.updateProfile({
        fullName: formData.fullName.trim(),
        avatarUrl: formData.avatarUrl.trim() || undefined,
      });

      // Update user in context
      setUser({
        ...user!,
        fullName: updated.fullName,
        avatarUrl: updated.avatarUrl,
      });

      setSuccess('Cập nhật thông tin thành công!');
    } catch (err: any) {
      console.error('Failed to update profile:', err);
      setError(err.response?.data?.message || 'Không thể cập nhật thông tin');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  };

  if (fetching) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Thông tin cá nhân</h1>
        <p className="text-muted-foreground">Quản lý thông tin tài khoản của bạn</p>
      </div>

      {/* Profile Info Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserIcon className="h-5 w-5" />
            Thông tin tài khoản
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <Mail className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">{profile?.email}</span>
          </div>
          <div className="flex items-center gap-3">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">Tham gia từ {profile?.createdAt ? formatDate(profile.createdAt) : 'N/A'}</span>
          </div>
          <div className="flex items-center gap-3">
            <FileText className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">{profile?._count?.documents || 0} tài liệu đã đăng</span>
          </div>
        </CardContent>
      </Card>

      {/* Edit Form */}
      <Card>
        <CardHeader>
          <CardTitle>Chỉnh sửa thông tin</CardTitle>
          <CardDescription>Cập nhật họ tên và ảnh đại diện</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Error */}
            {error && (
              <div className="bg-destructive/10 text-destructive px-4 py-3 rounded-md text-sm">
                {error}
              </div>
            )}

            {/* Success */}
            {success && (
              <div className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 px-4 py-3 rounded-md text-sm">
                {success}
              </div>
            )}

            {/* Avatar Preview */}
            {formData.avatarUrl && (
              <div className="flex items-center gap-4 mb-4">
                <img
                  src={formData.avatarUrl}
                  alt="Avatar preview"
                  className="h-20 w-20 rounded-full object-cover border"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
                <span className="text-sm text-muted-foreground">Xem trước ảnh đại diện</span>
              </div>
            )}

            {/* Full Name */}
            <div className="space-y-2">
              <Label htmlFor="fullName">Họ và tên</Label>
              <Input
                id="fullName"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                placeholder="Nhập họ và tên"
              />
            </div>

            {/* Avatar URL */}
            <div className="space-y-2">
              <Label htmlFor="avatarUrl">URL ảnh đại diện</Label>
              <Input
                id="avatarUrl"
                value={formData.avatarUrl}
                onChange={(e) => setFormData({ ...formData, avatarUrl: e.target.value })}
                placeholder="https://example.com/avatar.jpg"
                type="url"
              />
              <p className="text-xs text-muted-foreground">
                Nhập URL hình ảnh hoặc để trống
              </p>
            </div>

            {/* Buttons */}
            <div className="flex gap-3 pt-4">
              <Button type="submit" disabled={loading}>
                {loading ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                {loading ? 'Đang lưu...' : 'Lưu thay đổi'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push('/change-password')}
              >
                Đổi mật khẩu
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
