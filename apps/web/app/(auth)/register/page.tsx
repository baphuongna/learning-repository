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
import { authApi, getErrorMessage } from '@/lib/api';
import { Loader2, ArrowLeft, User, Mail, Lock, UserPlus, CheckCircle2, Clock } from 'lucide-react';

const schema = z.object({
  email: z.string().email('Email không hợp lệ'),
  fullName: z.string().min(2, 'Họ tên phải có ít nhất 2 ký tự'),
  password: z.string().min(6, 'Mật khẩu phải có ít nhất 6 ký tự'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Mật khẩu không khớp',
  path: ['confirmPassword'],
});

type FormData = z.infer<typeof schema>;

/**
 * Register Page - EduModern Design System
 *
 * Features:
 * - Clean auth card design matching login
 * - Icon inputs
 * - Gradient button
 * - Form validation
 * - Pending approval feedback (không auto-login)
 */

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState('');

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
      await authApi.register({
        email: data.email,
        fullName: data.fullName,
        password: data.password,
      });
      
      // Đăng ký thành công - không auto-login, hiển thị thông báo chờ phê duyệt
      setRegisteredEmail(data.email);
      setSuccess(true);
    } catch (err) {
      console.error('Register error:', err);
      setError(getErrorMessage(err, 'Đăng ký thất bại'));
    } finally {
      setLoading(false);
    }
  };

  // Hiển thị màn hình thành công khi đã đăng ký
  if (success) {
    return (
      <Card variant="elevated" className="border-0 shadow-2xl">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-gradient-to-br from-primary/20 to-teal-500/20 flex items-center justify-center">
            <Clock className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="font-display text-2xl text-primary">
            Đăng ký thành công!
          </CardTitle>
          <CardDescription className="text-base">
            Tài khoản của bạn đang chờ phê duyệt
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4 pt-4">
          <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 space-y-3">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
              <div className="text-sm space-y-2">
                <p className="font-medium text-foreground">
                  Cảm ơn bạn đã đăng ký!
                </p>
                <p className="text-muted-foreground">
                  Tài khoản <strong className="text-foreground">{registeredEmail}</strong> đã được tạo thành công 
                  và đang chờ quản trị viên phê duyệt.
                </p>
                <p className="text-muted-foreground">
                  Sau khi được phê duyệt, bạn có thể quay lại màn hình đăng nhập để truy cập hệ thống.
                </p>
              </div>
            </div>
          </div>
        </CardContent>

        <CardFooter className="flex flex-col gap-4 pt-4">
          <Link href="/login" className="w-full">
            <Button variant="gradient" className="w-full h-11 text-base">
              Đăng nhập
            </Button>
          </Link>

          <Link href="/" className="w-full">
            <Button type="button" variant="ghost" className="w-full gap-2">
              <ArrowLeft className="h-4 w-4" />
              Quay lại trang chủ
            </Button>
          </Link>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card variant="elevated" className="border-0 shadow-2xl">
      <CardHeader className="text-center pb-2">
        <CardTitle className="font-display text-2xl">
          Đăng ký
        </CardTitle>
        <CardDescription className="text-base">
          Tạo tài khoản mới để bắt đầu
        </CardDescription>
      </CardHeader>

      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-4 pt-4">
          {/* Error Alert */}
          {error && (
            <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-lg text-sm flex items-center gap-2">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-1.964-1.333-2.732 0L3.732 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              {error}
            </div>
          )}

          {/* Full Name Input */}
          <div className="space-y-2">
            <Label htmlFor="fullName" className="text-sm font-medium">
              Họ và tên
            </Label>
            <Input
              id="fullName"
              type="text"
              placeholder="Nguyễn Văn A"
              leftIcon={<User className="h-4 w-4" />}
              error={!!errors.fullName}
              {...register('fullName')}
            />
            {errors.fullName && (
              <p className="text-sm text-destructive flex items-center gap-1">
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01" />
                </svg>
                {errors.fullName.message}
              </p>
            )}
          </div>

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
            <Label htmlFor="password" className="text-sm font-medium">
              Mật khẩu
            </Label>
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

          {/* Confirm Password Input */}
          <div className="space-y-2">
            <Label htmlFor="confirmPassword" className="text-sm font-medium">
              Xác nhận mật khẩu
            </Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="••••••••"
              leftIcon={<Lock className="h-4 w-4" />}
              error={!!errors.confirmPassword}
              {...register('confirmPassword')}
            />
            {errors.confirmPassword && (
              <p className="text-sm text-destructive flex items-center gap-1">
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01" />
                </svg>
                {errors.confirmPassword.message}
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
                Đang đăng ký...
              </>
            ) : (
              <>
                <UserPlus className="h-4 w-4" />
                Đăng ký
              </>
            )}
          </Button>

          {/* Login Link */}
          <p className="text-sm text-muted-foreground text-center">
            Đã có tài khoản?{' '}
            <Link href="/login" className="text-primary font-medium hover:underline">
              Đăng nhập
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
