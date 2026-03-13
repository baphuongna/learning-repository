'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Mail, CheckCircle, AlertCircle, Send, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * NewsletterBanner Component - EduModern Design System
 *
 * Features:
 * - Email subscription form with validation
 * - Inline error handling
 * - Success state with auto-reset
 * - Privacy assurance text
 * - Responsive design with gradient background
 * - col-span-full for grid layouts
 */

interface NewsletterBannerProps {
  className?: string;
}

export function NewsletterBanner({ className }: NewsletterBannerProps) {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (!email.trim()) {
      setError('Vui lòng nhập địa chỉ email');
      return;
    }

    if (!validateEmail(email)) {
      setError('Địa chỉ email không hợp lệ');
      return;
    }

    try {
      setSubmitting(true);
      // Mock API call
      await new Promise((resolve) => setTimeout(resolve, 200));
      setSuccess(true);
      setEmail('');
      // Reset success after 5 seconds
      setTimeout(() => setSuccess(false), 5000);
    } catch {
      setError('Có lỗi xảy ra. Vui lòng thử lại sau.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className={cn(
        'col-span-full rounded-2xl overflow-hidden',
        'bg-gradient-to-r from-primary/10 via-accent/5 to-teal-500/10',
        'border border-primary/20',
        className
      )}
    >
      <div className="p-6 md:p-8 flex flex-col md:flex-row items-center gap-6">
        {/* Icon */}
        <div className="flex-shrink-0">
          <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-primary to-teal-600 flex items-center justify-center shadow-lg shadow-primary/20">
            <Mail className="h-7 w-7 text-white" />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 text-center md:text-left">
          <h3 className="font-display text-lg font-semibold text-foreground mb-1">
            Đăng ký nhận tin
          </h3>
          <p className="text-sm text-muted-foreground">
            Nhận thông báo về bài viết mới và cập nhật hữu ích
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <div className="relative">
            <Input
              type="email"
              placeholder="Email của bạn..."
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={submitting || success}
              className="w-full sm:w-64 pr-10"
            />
            {success && (
              <CheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-green-500" />
            )}
          </div>
          <Button type="submit" disabled={submitting || success} className="gap-2">
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Đang gửi...
              </>
            ) : success ? (
              <>
                <CheckCircle className="h-4 w-4" />
                Đã đăng ký
              </>
            ) : (
              <>
                <Send className="h-4 w-4" />
                Đăng ký
              </>
            )}
          </Button>
        </form>
      </div>

      {/* Error Message */}
      {error && (
        <div className="px-6 pb-4 flex items-center gap-2 text-sm text-destructive">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {/* Success Message */}
      {success && (
        <div className="px-6 pb-4 flex items-center gap-2 text-sm text-green-600">
          <CheckCircle className="h-4 w-4 flex-shrink-0" />
          <p>Đăng ký thành công! Cảm ơn bạn đã theo dõi.</p>
        </div>
      )}

      {/* Privacy Text */}
      <div className="px-6 pb-4 md:pb-6">
        <p className="text-xs text-muted-foreground text-center md:text-right">
          Chúng tôi cam kết bảo mật thông tin của bạn
        </p>
      </div>
    </div>
  );
}

export default NewsletterBanner;
