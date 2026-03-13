'use client';

import { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, CheckCircle, Info, XCircle } from 'lucide-react';

/* ============================================
   Account Section Types
   ============================================ */

export type AccountSectionProps = {
  /** Section title */
  title: string;
  /** Optional section description */
  description?: string;
  /** Section content */
  children: ReactNode;
  /** Optional icon for the section header */
  icon?: ReactNode;
  /** Card variant */
  variant?: 'default' | 'gradient' | 'outline';
  /** Additional class name */
  className?: string;
  /** Actions to display in header */
  actions?: ReactNode;
};

export type AccountAlertProps = {
  /** Alert type */
  variant: 'success' | 'error' | 'warning' | 'info';
  /** Alert message */
  children: ReactNode;
  /** Additional class name */
  className?: string;
  /** Called when dismiss button is clicked */
  onDismiss?: () => void;
};

export type ProfileSummaryProps = {
  /** User's full name */
  fullName: string;
  /** User's email */
  email: string;
  /** User's avatar URL */
  avatarUrl?: string;
  /** User's role */
  role: 'ADMIN' | 'USER';
  /** Account creation date */
  createdAt?: string;
  /** Number of documents */
  documentCount?: number;
};

/* ============================================
   Account Section Component
   ============================================ */

/**
 * AccountSection - Reusable section wrapper for account area.
 * Cung cấp cấu trúc nhất quán cho các phần trong trang account.
 */
export function AccountSection({
  title,
  description,
  children,
  icon,
  variant = 'default',
  className,
  actions,
}: AccountSectionProps) {
  return (
    <Card variant={variant} className={cn('relative overflow-hidden', className)}>
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            {icon && (
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                {icon}
              </div>
            )}
            <div>
              <CardTitle className="text-lg">{title}</CardTitle>
              {description && <CardDescription className="mt-1">{description}</CardDescription>}
            </div>
          </div>
          {actions && <div className="shrink-0">{actions}</div>}
        </div>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

/* ============================================
   Account Alert Component
   ============================================ */

const alertVariants = {
  success: {
    container: 'bg-green-50 border-green-200 dark:bg-green-950/30 dark:border-green-800',
    icon: 'text-green-600 dark:text-green-400',
    text: 'text-green-700 dark:text-green-300',
  },
  error: {
    container: 'bg-destructive/10 border-destructive/20',
    icon: 'text-destructive',
    text: 'text-destructive',
  },
  warning: {
    container: 'bg-amber-50 border-amber-200 dark:bg-amber-950/30 dark:border-amber-800',
    icon: 'text-amber-600 dark:text-amber-400',
    text: 'text-amber-700 dark:text-amber-300',
  },
  info: {
    container: 'bg-blue-50 border-blue-200 dark:bg-blue-950/30 dark:border-blue-800',
    icon: 'text-blue-600 dark:text-blue-400',
    text: 'text-blue-700 dark:text-blue-300',
  },
};

const alertIcons = {
  success: CheckCircle,
  error: XCircle,
  warning: AlertCircle,
  info: Info,
};

/**
 * AccountAlert - Alert component for account pages.
 * Hiển thị thông báo success/error/warning/info với style nhất quán.
 */
export function AccountAlert({ variant, children, className, onDismiss }: AccountAlertProps) {
  const Icon = alertIcons[variant];
  const styles = alertVariants[variant];

  return (
    <div
      className={cn(
        'flex items-start gap-3 rounded-lg border px-4 py-3 text-sm',
        styles.container,
        className
      )}
      role="alert"
    >
      <Icon className={cn('h-5 w-5 shrink-0 mt-0.5', styles.icon)} aria-hidden="true" />
      <div className={cn('flex-1', styles.text)}>{children}</div>
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          className={cn(
            'shrink-0 rounded-md p-1 transition-colors hover:bg-black/5 dark:hover:bg-white/10',
            styles.text
          )}
          aria-label="Đóng thông báo"
        >
          <XCircle className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}

/* ============================================
   Profile Summary Card Component
   ============================================ */

/**
 * ProfileSummaryCard - Summary card displaying user profile overview.
 * Hiển thị tóm tắt thông tin người dùng ở đầu trang profile.
 */
export function ProfileSummaryCard({
  fullName,
  email,
  avatarUrl,
  role,
  createdAt,
  documentCount = 0,
}: ProfileSummaryProps) {
  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  };

  const roleLabel = role === 'ADMIN' ? 'Quản trị viên' : 'Thành viên';

  return (
    <Card variant="gradient" className="relative overflow-hidden">
      {/* Decorative gradient */}
      <div className="absolute -top-12 -right-12 h-40 w-40 rounded-full bg-gradient-to-br from-primary/20 to-transparent blur-2xl" />

      <CardHeader>
        <div className="flex items-center gap-4">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={fullName}
              className="h-16 w-16 rounded-full object-cover ring-2 ring-primary/20"
            />
          ) : (
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-primary to-teal-600 text-white shadow-lg">
              <span className="text-xl font-bold">{fullName.charAt(0).toUpperCase()}</span>
            </div>
          )}
          <div className="min-w-0 flex-1">
            <CardTitle className="truncate text-xl">{fullName}</CardTitle>
            <CardDescription className="mt-1 flex items-center gap-2 truncate">
              <span>{email}</span>
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-lg bg-background/50 p-3 text-center">
            <div className="mx-auto mb-1 flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
              <svg
                className="h-4 w-4 text-primary"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
            <p className="text-xs text-muted-foreground">Tham gia</p>
            <p className="mt-0.5 text-sm font-medium">{createdAt ? formatDate(createdAt) : 'N/A'}</p>
          </div>

          <div className="rounded-lg bg-background/50 p-3 text-center">
            <div className="mx-auto mb-1 flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
              <svg
                className="h-4 w-4 text-primary"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <p className="text-xs text-muted-foreground">Tài liệu</p>
            <p className="mt-0.5 text-sm font-medium">{documentCount}</p>
          </div>

          <div className="rounded-lg bg-background/50 p-3 text-center">
            <div className="mx-auto mb-1 flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
              <svg
                className="h-4 w-4 text-primary"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
            </div>
            <p className="text-xs text-muted-foreground">Vai trò</p>
            <p className="mt-0.5 text-sm font-medium">{roleLabel}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/* ============================================
   Account Page Layout Component
   ============================================ */

export type AccountPageLayoutProps = {
  /** Page content */
  children: ReactNode;
  /** Additional class name */
  className?: string;
};

/**
 * AccountPageLayout - Layout wrapper for account pages.
 * Cung cấp max-width và spacing nhất quán cho các trang trong account area.
 */
export function AccountPageLayout({ children, className }: AccountPageLayoutProps) {
  return (
    <div className={cn('mx-auto max-w-2xl space-y-6', className)}>
      {children}
    </div>
  );
}

/* ============================================
   Form Field Group Component
   ============================================ */

export type FormFieldGroupProps = {
  /** Field label */
  label: string;
  /** Field ID */
  id?: string;
  /** Field content (input, select, etc.) */
  children: ReactNode;
  /** Helper text below the field */
  helperText?: string;
  /** Error state */
  error?: boolean;
  /** Additional class name */
  className?: string;
};

/**
 * FormFieldGroup - Form field wrapper with label and helper text.
 * Bọc các trường form với label và helper text nhất quán.
 */
export function FormFieldGroup({
  label,
  id,
  children,
  helperText,
  error,
  className,
}: FormFieldGroupProps) {
  return (
    <div className={cn('space-y-2', className)}>
      <label htmlFor={id} className="text-sm font-medium text-foreground">
        {label}
      </label>
      {children}
      {helperText && (
        <p
          className={cn(
            'text-xs',
            error ? 'text-destructive' : 'text-muted-foreground'
          )}
        >
          {helperText}
        </p>
      )}
    </div>
  );
}
