'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { authApi, getApprovalErrorType, getErrorMessage } from '@/lib/api';
import { useAuth } from '@/app/providers';
import { Loader2, ArrowLeft, Mail, Lock, LogIn, AlertTriangle, Clock, XCircle } from 'lucide-react';

const schema = z.object({
  email: z.string().email('Email không hợp lệ'),
  password: z.string().min(1, 'Vui lòng nhập mật khẩu'),
});

type FormData = z.infer<typeof schema>;

/**
 * Login Page - EduModern Design System
 *
 * Features:
 * - Clean auth card design
 * - Icon inputs
 * - Gradient button
 * - Smooth animations
 * - Hiển thị blocked-login messages cho pending/rejected users
 */

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [approvalErrorType, setApprovalErrorType] = useState<'pending' | 'rejected' | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    try {
      setLoading(true);
      setError(null);
      setApprovalErrorType(null);
      const response = await authApi.login(data);
      if (!response.accessToken) {
        throw new Error('Không nhận được token đăng nhập hợp lệ');
      }
      login(response.accessToken, response.user);
      router.push('/dashboard');
    } catch (err) {
      console.error('Login error:', err);
      const approvalType = getApprovalErrorType(err);
      setApprovalErrorType(approvalType);
      setError(getErrorMessage(err, 'Đăng nhập thất bại'));
    } finally {
      setLoading(false);
    }
  };

  // Render approval-specific error message
  const renderApprovalError = () => {
    if (approvalErrorType === 'pending') {
      return (
        <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-200 px-4 py-4 rounded-lg text-sm">
          <div className="flex items-start gap-3">
            <Clock className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
            <div className="space-y-2">
              <p className="font-medium">Tài khoản đang chờ phê duyệt</p>
              <p className="text-amber-700 dark:text-amber-300">
                Tài khoản của bạn đã được tạo nhưng chưa được quản trị viên phê duyệt. 
                Vui lòng đợi được kích hoạt.
              </p>
            </div>
          </div>
        </div>
      );
    }
    
    if (approvalErrorType === 'rejected') {
      return (
        <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-4 rounded-lg text-sm">
          <div className="flex items-start gap-3">
            <XCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
            <div className="space-y-2">
              <p className="font-medium">Tài khoản bị từ chối</p>
              <p>
                Yêu cầu đăng ký của bạn đã bị từ chối. Vui lòng liên hệ quản trị viên để biết thêm thông tin.
              </p>
            </div>
          </div>
        </div>
      );
    }
    
    return null;
  };

  return (
    <Card variant="elevated" className="border-0 shadow-2xl">
      <CardHeader className="text-center pb-2">
        <CardTitle className="font-display text-2xl">
          Đăng nhập
        </CardTitle>
        <CardDescription className="text-base">
          Chào mừng bạn quay trở lại
        </CardDescription>
      </CardHeader>

      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-5 pt-4">
          {/* Approval-specific Error Alert */}
          {approvalErrorType && renderApprovalError()}
          
          {/* Generic Error Alert */}
          {error && !approvalErrorType && (
            <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-lg text-sm flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 flex-shrink-0" />
              {error}
            </div>
          )}

          {/* Email Input */}
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="email@example.com"
              leftIcon={<Mail className="h-4 w-4" />}
              error={!!errors.email}
              {...register('email')}
            />
            {errors.email && (
              <p className="text-sm text-destructive flex items-center gap-1">
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01" />
                </svg>
                {errors.email.message}
              </p>
            )}
          </div>

          {/* Password Input */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password" className="text-sm font-medium">
                Mật khẩu
              </Label>
            </div>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              leftIcon={<Lock className="h-4 w-4" />}
              error={!!errors.password}
              {...register('password')}
            />
            {errors.password && (
              <p className="text-sm text-destructive flex items-center gap-1">
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01" />
                </svg>
                {errors.password.message}
              </p>
            )}
          </div>
        </CardContent>

        <CardFooter className="flex flex-col gap-4 pt-4">
          {/* Submit Button */}
          <Button
            type="submit"
            variant="gradient"
            className="w-full h-11 text-base"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Đang đăng nhập...
              </>
            ) : (
              <>
                <LogIn className="h-4 w-4" />
                Đăng nhập
              </>
            )}
          </Button>

          {/* Register Link */}
          <p className="text-sm text-muted-foreground text-center">
            Chưa có tài khoản?{' '}
            <Link href="/register" className="text-primary font-medium hover:underline">
              Đăng ký ngay
            </Link>
          </p>

          {/* Back Link */}
          <Link href="/" className="w-full">
            <Button type="button" variant="ghost" className="w-full gap-2">
              <ArrowLeft className="h-4 w-4" />
              Quay lại trang chủ
            </Button>
          </Link>
        </CardFooter>
      </form>
    </Card>
  );
}
