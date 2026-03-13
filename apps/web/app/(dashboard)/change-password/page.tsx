'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { authApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PageHeader } from '@/components/features/layout/PageHeader';
import {
  AccountPageLayout,
  AccountSection,
  AccountAlert,
  FormFieldGroup,
} from '@/components/account/AccountSections';
import { Loader2, Lock, CheckCircle, ArrowLeft } from 'lucide-react';

/* ============================================
   Types
   ============================================ */

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
   Change Password Page Component
   ============================================ */

export default function ChangePasswordPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    // Validation
    if (!formData.currentPassword) {
      setError('Vui lòng nhập mật khẩu hiện tại');
      return;
    }

    if (formData.newPassword.length < 6) {
      setError('Mật khẩu mới phải có ít nhất 6 ký tự');
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setError('Mật khẩu xác nhận không khớp');
      return;
    }

    if (formData.currentPassword === formData.newPassword) {
      setError('Mật khẩu mới phải khác mật khẩu hiện tại');
      return;
    }

    setLoading(true);

    try {
      await authApi.changePassword({
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword,
      });

      setSuccess(true);
      setFormData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });

      // Redirect after 2 seconds
      setTimeout(() => {
        router.push('/profile');
      }, 2000);
    } catch (err) {
      console.error('Failed to change password:', err);
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const dismissAlert = () => {
    setError(null);
  };

  return (
    <AccountPageLayout>
      {/* Page Header */}
      <PageHeader
        title="Đổi mật khẩu"
        description="Cập nhật mật khẩu để bảo vệ tài khoản của bạn"
        actions={
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-4 w-4" />
            Quay lại
          </Button>
        }
      />

      {/* Change Password Section */}
      <AccountSection
        title="Bảo mật tài khoản"
        description="Nhập mật khẩu hiện tại và mật khẩu mới của bạn"
        icon={<Lock className="h-5 w-5" />}
      >
        {success ? (
          /* Success State */
          <div className="py-8 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
              <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="mb-2 text-lg font-semibold text-foreground">
              Đổi mật khẩu thành công!
            </h3>
            <p className="text-sm text-muted-foreground">
              Đang chuyển về trang thông tin cá nhân...
            </p>
            <div className="mt-4">
              <div className="mx-auto h-1.5 w-48 overflow-hidden rounded-full bg-muted">
                <div className="h-full animate-[shrink_2s_linear_forwards] rounded-full bg-green-500" />
              </div>
            </div>
          </div>
        ) : (
          /* Form */
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Error Alert */}
            {error && (
              <AccountAlert variant="error" onDismiss={dismissAlert}>
                {error}
              </AccountAlert>
            )}

            {/* Current Password Field */}
            <FormFieldGroup
              label="Mật khẩu hiện tại"
              id="currentPassword"
            >
              <Input
                id="currentPassword"
                type="password"
                value={formData.currentPassword}
                onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
                placeholder="••••••••"
                autoComplete="current-password"
              />
            </FormFieldGroup>

            {/* New Password Field */}
            <FormFieldGroup
              label="Mật khẩu mới"
              id="newPassword"
              helperText="Tối thiểu 6 ký tự"
            >
              <Input
                id="newPassword"
                type="password"
                value={formData.newPassword}
                onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                placeholder="••••••••"
                autoComplete="new-password"
              />
            </FormFieldGroup>

            {/* Confirm Password Field */}
            <FormFieldGroup
              label="Xác nhận mật khẩu mới"
              id="confirmPassword"
            >
              <Input
                id="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                placeholder="••••••••"
                autoComplete="new-password"
              />
            </FormFieldGroup>

            {/* Submit Button */}
            <div className="pt-4">
              <Button type="submit" variant="gradient" className="w-full sm:w-auto" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Đang xử lý...
                  </>
                ) : (
                  <>
                    <Lock className="h-4 w-4" />
                    Đổi mật khẩu
                  </>
                )}
              </Button>
            </div>
          </form>
        )}
      </AccountSection>

      {/* Security Tips */}
      <AccountSection
        title="Mẹo bảo mật"
        description="Giữ tài khoản của bạn an toàn"
        variant="outline"
      >
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li className="flex items-start gap-2">
            <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-green-500" />
            <span>Sử dụng mật khẩu có ít nhất 6 ký tự</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-green-500" />
            <span>Kết hợp chữ hoa, chữ thường, số và ký tự đặc biệt</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-green-500" />
            <span>Không sử dụng mật khẩu giống với các tài khoản khác</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-green-500" />
            <span>Thay đổi mật khẩu định kỳ để tăng cường bảo mật</span>
          </li>
        </ul>
      </AccountSection>
    </AccountPageLayout>
  );
}
