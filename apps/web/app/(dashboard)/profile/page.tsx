'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/providers';
import { authApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PageHeader } from '@/components/features/layout/PageHeader';
import {
  AccountPageLayout,
  AccountSection,
  AccountAlert,
  ProfileSummaryCard,
  FormFieldGroup,
} from '@/components/account/AccountSections';
import { Loader2, Camera, Lock, ArrowRight } from 'lucide-react';

/* ============================================
   Types
   ============================================ */

type ProfileData = {
  fullName: string;
  email: string;
  avatarUrl?: string;
  createdAt?: string;
  _count?: { documents: number };
};

type ApiError = {
  response?: {
    data?: {
      message?: string;
    };
  };
  message?: string;
};

function isApiError(error: unknown): error is ApiError {
  return (
    typeof error === 'object' &&
    error !== null &&
    ('response' in error || 'message' in error)
  );
}

function getErrorMessage(error: unknown): string {
  if (isApiError(error)) {
    return error.response?.data?.message || error.message || 'Đã xảy ra lỗi không xác định';
  }
  if (error instanceof Error) {
    return error.message;
  }
  return 'Đã xảy ra lỗi không xác định';
}

/* ============================================
   Profile Page Component
   ============================================ */

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
      setError(getErrorMessage(err));
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
    } catch (err) {
      console.error('Failed to update profile:', err);
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const dismissAlert = () => {
    setError(null);
    setSuccess(null);
  };

  // Loading state
  if (fetching) {
    return (
      <AccountPageLayout className="flex items-center justify-center py-20">
        <div className="relative">
          <div className="absolute inset-0 animate-pulse rounded-full bg-primary/20 blur-xl" />
          <Loader2 className="relative h-8 w-8 animate-spin text-primary" />
        </div>
      </AccountPageLayout>
    );
  }

  return (
    <AccountPageLayout>
      {/* Page Header */}
      <PageHeader
        title="Tài khoản"
        description="Quản lý thông tin cá nhân và bảo mật tài khoản của bạn"
      />

      {/* Profile Summary Card */}
      {user && (
        <ProfileSummaryCard
          fullName={user.fullName}
          email={user.email}
          avatarUrl={user.avatarUrl}
          role={user.role as 'ADMIN' | 'USER'}
          createdAt={profile?.createdAt}
          documentCount={profile?._count?.documents || 0}
        />
      )}

      {/* Edit Profile Section */}
      <AccountSection
        title="Thông tin cá nhân"
        description="Cập nhật họ tên và ảnh đại diện của bạn"
        icon={<Camera className="h-5 w-5" />}
      >
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Alerts */}
          {error && (
            <AccountAlert variant="error" onDismiss={dismissAlert}>
              {error}
            </AccountAlert>
          )}

          {success && (
            <AccountAlert variant="success" onDismiss={dismissAlert}>
              {success}
            </AccountAlert>
          )}

          {/* Avatar Preview */}
          {formData.avatarUrl && (
            <div className="flex items-center gap-4 rounded-lg bg-muted/50 p-4">
              <img
                src={formData.avatarUrl}
                alt="Xem trước ảnh đại diện"
                className="h-16 w-16 rounded-full object-cover ring-2 ring-primary/20"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
              <div>
                <p className="text-sm font-medium text-foreground">Xem trước ảnh đại diện</p>
                <p className="text-xs text-muted-foreground">
                  Ảnh sẽ được cập nhật sau khi lưu thay đổi
                </p>
              </div>
            </div>
          )}

          {/* Full Name Field */}
          <FormFieldGroup
            label="Họ và tên"
            id="fullName"
            helperText="Tên hiển thị của bạn trong hệ thống"
          >
            <Input
              id="fullName"
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              placeholder="Nhập họ và tên"
            />
          </FormFieldGroup>

          {/* Avatar URL Field */}
          <FormFieldGroup
            label="URL ảnh đại diện"
            id="avatarUrl"
            helperText="Nhập URL hình ảnh hoặc để trống để sử dụng avatar mặc định"
          >
            <Input
              id="avatarUrl"
              value={formData.avatarUrl}
              onChange={(e) => setFormData({ ...formData, avatarUrl: e.target.value })}
              placeholder="https://example.com/avatar.jpg"
              type="url"
            />
          </FormFieldGroup>

          {/* Action Buttons */}
          <div className="flex flex-col gap-3 pt-4 sm:flex-row">
            <Button type="submit" variant="gradient" className="flex-1" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Đang lưu...
                </>
              ) : (
                <>
                  <Camera className="h-4 w-4" />
                  Lưu thay đổi
                </>
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push('/change-password')}
              className="sm:w-auto"
            >
              <Lock className="h-4 w-4" />
              Đổi mật khẩu
              <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </div>
        </form>
      </AccountSection>

      {/* Security Quick Link */}
      <AccountSection
        title="Bảo mật"
        description="Quản lý bảo mật tài khoản của bạn"
        icon={<Lock className="h-5 w-5" />}
        variant="outline"
      >
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-foreground">Mật khẩu</p>
            <p className="text-xs text-muted-foreground">
              Thay đổi mật khẩu để bảo vệ tài khoản của bạn
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push('/change-password')}
          >
            <Lock className="h-4 w-4" />
            Đổi mật khẩu
          </Button>
        </div>
      </AccountSection>
    </AccountPageLayout>
  );
}
