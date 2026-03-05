'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

/**
 * Skeleton Component
 * Loading placeholder với shimmer effect
 *
 * @example
 * <Skeleton className="h-4 w-full" />
 * <Skeleton variant="circular" className="h-12 w-12" />
 * <SkeletonCard />
 */

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Skeleton variant */
  variant?: 'text' | 'circular' | 'rectangular' | 'rounded';
  /** Animation type */
  animation?: 'shimmer' | 'pulse' | 'none';
  /** Width */
  width?: string | number;
  /** Height */
  height?: string | number;
}

const Skeleton = React.forwardRef<HTMLDivElement, SkeletonProps>(
  (
    {
      className,
      variant = 'text',
      animation = 'shimmer',
      width,
      height,
      style,
      ...props
    },
    ref
  ) => {
    const variantClasses = {
      text: 'rounded',
      circular: 'rounded-full',
      rectangular: 'rounded-none',
      rounded: 'rounded-lg',
    };

    const animationClasses = {
      shimmer: 'shimmer',
      pulse: 'animate-pulse bg-muted',
      none: 'bg-muted',
    };

    return (
      <div
        ref={ref}
        className={cn(
          'bg-muted',
          variantClasses[variant],
          animation === 'shimmer' && 'shimmer',
          animation === 'pulse' && 'animate-pulse',
          className
        )}
        style={{
          width: width,
          height: height,
          ...style,
        }}
        {...props}
      />
    );
  }
);

Skeleton.displayName = 'Skeleton';

/* ============================================
   Preset Skeleton Components
   ============================================ */

/** Skeleton cho text line */
const SkeletonText = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { lines?: number }
>(({ className, lines = 1, ...props }, ref) => (
  <div ref={ref} className={cn('space-y-2', className)} {...props}>
    {Array.from({ length: lines }).map((_, i) => (
      <Skeleton
        key={i}
        className="h-4 w-full"
        variant="text"
        animation="shimmer"
      />
    ))}
  </div>
));
SkeletonText.displayName = 'SkeletonText';

/** Skeleton cho avatar */
const SkeletonAvatar = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { size?: 'sm' | 'md' | 'lg' }
>(({ className, size = 'md', ...props }, ref) => {
  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-14 w-14',
  };

  return (
    <Skeleton
      ref={ref}
      className={cn(sizeClasses[size], className)}
      variant="circular"
      animation="shimmer"
      {...props}
    />
  );
});
SkeletonAvatar.displayName = 'SkeletonAvatar';

/** Skeleton cho card */
const SkeletonCard = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'rounded-lg border border-border bg-card p-4 space-y-4',
      className
    )}
    {...props}
  >
    <Skeleton className="h-40 w-full rounded-lg" variant="rounded" />
    <div className="space-y-2">
      <Skeleton className="h-5 w-3/4" variant="text" />
      <Skeleton className="h-4 w-full" variant="text" />
      <Skeleton className="h-4 w-2/3" variant="text" />
    </div>
    <div className="flex items-center justify-between">
      <Skeleton className="h-4 w-20" variant="text" />
      <Skeleton className="h-8 w-24 rounded-md" variant="rounded" />
    </div>
  </div>
));
SkeletonCard.displayName = 'SkeletonCard';

/** Skeleton cho document card */
const SkeletonDocumentCard = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'rounded-lg border border-border bg-card p-4 space-y-3',
      className
    )}
    {...props}
  >
    <div className="flex items-start gap-3">
      <Skeleton className="h-10 w-10 rounded" variant="rounded" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-5 w-full" variant="text" />
        <Skeleton className="h-4 w-3/4" variant="text" />
      </div>
    </div>
    <div className="flex items-center gap-2">
      <Skeleton className="h-5 w-16 rounded-full" variant="rounded" />
      <Skeleton className="h-5 w-20 rounded-full" variant="rounded" />
    </div>
    <div className="flex items-center justify-between pt-2">
      <Skeleton className="h-4 w-24" variant="text" />
      <Skeleton className="h-4 w-16" variant="text" />
    </div>
  </div>
));
SkeletonDocumentCard.displayName = 'SkeletonDocumentCard';

/** Skeleton cho news card */
const SkeletonNewsCard = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { variant?: 'default' | 'featured' }
>(({ className, variant = 'default', ...props }, ref) => {
  if (variant === 'featured') {
    return (
      <div
        ref={ref}
        className={cn(
          'rounded-xl border border-border bg-card overflow-hidden',
          className
        )}
        {...props}
      >
        <Skeleton className="h-64 w-full" variant="rectangular" />
        <div className="p-6 space-y-4">
          <div className="flex gap-2">
            <Skeleton className="h-5 w-20 rounded-full" variant="rounded" />
            <Skeleton className="h-5 w-16 rounded-full" variant="rounded" />
          </div>
          <Skeleton className="h-7 w-3/4" variant="text" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" variant="text" />
            <Skeleton className="h-4 w-full" variant="text" />
            <Skeleton className="h-4 w-2/3" variant="text" />
          </div>
          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-2">
              <Skeleton className="h-8 w-8" variant="circular" />
              <Skeleton className="h-4 w-24" variant="text" />
            </div>
            <Skeleton className="h-4 w-20" variant="text" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={ref}
      className={cn(
        'rounded-lg border border-border bg-card overflow-hidden',
        className
      )}
      {...props}
    >
      <Skeleton className="h-40 w-full" variant="rectangular" />
      <div className="p-4 space-y-3">
        <Skeleton className="h-5 w-20 rounded-full" variant="rounded" />
        <Skeleton className="h-5 w-full" variant="text" />
        <div className="space-y-1">
          <Skeleton className="h-4 w-full" variant="text" />
          <Skeleton className="h-4 w-3/4" variant="text" />
        </div>
        <div className="flex items-center justify-between pt-1">
          <Skeleton className="h-4 w-24" variant="text" />
          <Skeleton className="h-4 w-16" variant="text" />
        </div>
      </div>
    </div>
  );
});
SkeletonNewsCard.displayName = 'SkeletonNewsCard';

export {
  Skeleton,
  SkeletonText,
  SkeletonAvatar,
  SkeletonCard,
  SkeletonDocumentCard,
  SkeletonNewsCard,
};
export type { SkeletonProps };
