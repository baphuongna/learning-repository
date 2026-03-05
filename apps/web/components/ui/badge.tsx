import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

/**
 * Badge Component - EduModern Design System
 *
 * Variants:
 * - default: Primary emerald
 * - secondary: Warm gray
 * - accent: Amber
 * - outline: Bordered
 * - success: Green
 * - warning: Yellow
 * - destructive: Red
 * - info: Blue
 */

const badgeVariants = cva(
  'inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
  {
    variants: {
      variant: {
        // Primary - Emerald
        default:
          'border-transparent bg-primary text-primary-foreground shadow-sm',

        // Secondary - Warm Gray
        secondary:
          'border-transparent bg-secondary text-secondary-foreground',

        // Accent - Amber
        accent:
          'border-transparent bg-accent text-accent-foreground shadow-sm',

        // Outline
        outline: 'border-border text-foreground bg-background',

        // Success - Green
        success:
          'border-transparent bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',

        // Warning - Yellow
        warning:
          'border-transparent bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',

        // Destructive - Red
        destructive:
          'border-transparent bg-destructive/10 text-destructive dark:bg-destructive/20',

        // Info - Blue
        info:
          'border-transparent bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',

        // Soft primary
        soft:
          'border-transparent bg-primary/10 text-primary dark:bg-primary/20',

        // Soft accent
        'soft-accent':
          'border-transparent bg-accent/10 text-amber-700 dark:bg-accent/20 dark:text-amber-400',
      },
      size: {
        default: 'px-2.5 py-0.5 text-xs',
        sm: 'px-2 py-0.5 text-[10px]',
        lg: 'px-3 py-1 text-sm',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  /** Icon to display before text */
  icon?: React.ReactNode;
  /** Dismissible badge */
  onDismiss?: () => void;
}

function Badge({ className, variant, size, icon, onDismiss, children, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant, size }), className)} {...props}>
      {icon && <span className="shrink-0">{icon}</span>}
      {children}
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          className="ml-1 -mr-1 inline-flex h-3.5 w-3.5 items-center justify-center rounded-full hover:bg-black/10 dark:hover:bg-white/10"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2.5}
            stroke="currentColor"
            className="h-3 w-3"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
          <span className="sr-only">Remove</span>
        </button>
      )}
    </div>
  );
}

/* ============================================
   Preset Badge Components
   ============================================ */

/** Document type badge */
const DocumentTypeBadge = ({
  type,
  className,
}: {
  type: 'pdf' | 'doc' | 'xls' | 'ppt' | 'video' | 'audio' | 'image' | 'other';
  className?: string;
}) => {
  const variants: Record<string, { variant: typeof badgeVariants; label: string }> = {
    pdf: { variant: 'destructive', label: 'PDF' },
    doc: { variant: 'info', label: 'Word' },
    xls: { variant: 'success', label: 'Excel' },
    ppt: { variant: 'warning', label: 'PowerPoint' },
    video: { variant: 'accent', label: 'Video' },
    audio: { variant: 'soft', label: 'Audio' },
    image: { variant: 'soft-accent', label: 'Image' },
    other: { variant: 'secondary', label: 'File' },
  };

  const config = variants[type] || variants.other;

  return (
    <Badge variant={config.variant} className={className}>
      {config.label}
    </Badge>
  );
};

/** Status badge */
const StatusBadge = ({
  status,
  className,
}: {
  status: 'active' | 'inactive' | 'pending' | 'deleted';
  className?: string;
}) => {
  const variants: Record<string, { variant: typeof badgeVariants; label: string }> = {
    active: { variant: 'success', label: 'Hoạt động' },
    inactive: { variant: 'secondary', label: 'Không hoạt động' },
    pending: { variant: 'warning', label: 'Chờ xử lý' },
    deleted: { variant: 'destructive', label: 'Đã xóa' },
  };

  const config = variants[status] || variants.inactive;

  return (
    <Badge variant={config.variant} className={className}>
      {config.label}
    </Badge>
  );
};

/** Role badge */
const RoleBadge = ({
  role,
  className,
}: {
  role: 'admin' | 'user';
  className?: string;
}) => {
  const config = role === 'admin'
    ? { variant: 'accent' as const, label: 'Quản trị viên' }
    : { variant: 'secondary' as const, label: 'Người dùng' };

  return (
    <Badge variant={config.variant} className={className}>
      {config.label}
    </Badge>
  );
};

export { Badge, badgeVariants, DocumentTypeBadge, StatusBadge, RoleBadge };
