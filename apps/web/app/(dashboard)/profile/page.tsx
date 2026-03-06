'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/providers';
import { authApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, User as UserIcon, Mail, Calendar, FileText, Camera } from 'lucide-react';

type ProfileData = {
  fullName: string;
  email: string;
  avatarUrl?: string;
  createdAt?: string;
  _count?: { documents: number };
};

export default function ProfilePage() {
  const router = useRouter();
  const { user, setUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [profile, setProfile] = useState<ProfileData | null>(null);

  const [formData, setFormData] = useState({
    fullName: '',
    avatarUrl: '',
  });

  // Fetch profile on mount
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
        <div className="relative">
          <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl animate-pulse" />
          <Loader2 className="relative h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-display text-2xl font-bold text-foreground">Thông tin cá nhân</h1>
        <p className="text-muted-foreground">Quản lý thông tin tài khoản của bạn</p>
      </div>

      {/* Profile Info Card */}
      <Card variant="gradient" className="overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary/10 to-transparent rounded-blur-xl" />
        <CardHeader>
          <div className="flex items-center gap-4">
            {user?.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt={user.fullName}
                className="h-16 w-16 rounded-full object-cover ring-2 ring-primary/20"
              />
            ) : (
              <div className="h-16 w-16 rounded-full bg-gradient-to-br from-primary to-teal-600 flex items-center justify-center shadow-lg">
                <UserIcon className="h-8 w-8 text-white" />
              </div>
            )}
            <div>
              <CardTitle className="text-xl">{user?.fullName}</CardTitle>
              <CardDescription className="flex items-center gap-2">
                <Mail className="h-3.5 w-3.5" />
                {user?.email}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="grid grid-cols-3 gap-4 pt-4">
          <div className="text-center p-3 rounded-lg bg-background/50">
            <Calendar className="h-5 w-5 mx-auto text-primary mb-1" />
            <p className="text-xs text-muted-foreground">Tham gia</p>
            <p className="text-sm font-medium">{profile?.createdAt ? formatDate(profile.createdAt) : 'N/A'}</p>
          </div>
          <div className="text-center p-3 rounded-lg bg-background/50">
            <FileText className="h-5 w-5 mx-auto text-primary mb-1" />
            <p className="text-xs text-muted-foreground">Tài liệu</p>
            <p className="text-sm font-medium">{profile?._count?.documents || 0}</p>
          </div>
          <div className="text-center p-3 rounded-lg bg-background/50">
            <UserIcon className="h-5 w-5 mx-auto text-primary mb-1" />
            <p className="text-xs text-muted-foreground">Vai trò</p>
            <p className="text-sm font-medium">
              {user?.role === 'ADMIN' ? 'Quản trị viên' : 'Thành viên'}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Edit Form Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Camera className="h-5 w-5 text-primary" />
            Chỉnh sửa thông tin
          </CardTitle>
          <CardDescription>
            Cập nhật họ tên và ảnh đại diện
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Error */}
            {error && (
              <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-lg text-sm flex items-center gap-2">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-1.964-1.333-2.732 0L3.732 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                {error}
              </div>
            )}

            {/* Success */}
            {success && (
              <div className="bg-green-100/50 border border-green-200 text-green-700 dark:bg-green-900/30 dark:text-green-400 px-4 py-3 rounded-lg text-sm flex items-center gap-2">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 2 0 4.7 1.3.1 7.5 3.5v3.5m0 4.5m0 4.5v3.5m0 4.5m0 4.5v-3.5m0-4.5v3.5m-4.5v-3.5m0-4.5v3.5m0 4.5v3.5m0 4.5v-3.5m0-4.5v3.5m0 4.5v3.5m0 4.5v-3.5m0-4.5v3.5m0 4.5v3.5m0 4.5v-3.5m0-4.5v3.5m0 4.5v3.5m0 4.5v-3.5m0-4.5v3.5m0 4.5v3.5m0 4.5z" />
                </svg>
                {success}
              </div>
            )}

            {/* Avatar Preview */}
            {formData.avatarUrl && (
              <div className="flex items-center gap-4 mb-4">
                <img
                  src={formData.avatarUrl}
                  alt="Avatar preview"
                  className="h-20 w-20 rounded-full object-cover border-2 border-primary/20"
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
                Nhập URL hình ảnh hoặc để trống để sử dụng avatar mặc định
              </p>
            </div>

            {/* Buttons */}
            <div className="flex gap-3 pt-4">
              <Button type="submit" variant="gradient" className="flex-1" disabled={loading}>
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Camera className="h-4 w-4" />
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
