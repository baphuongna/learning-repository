'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

/**
 * GradientText Component
 * Hiển thị text với gradient effect - phù hợp cho headings và text quan trọng
 *
 * @example
 * <GradientText variant="primary">Chào mừng</GradientText>
 * <GradientText variant="accent" as="h1">Tiêu đề</GradientText>
 */

interface GradientTextProps extends React.HTMLAttributes<HTMLElement> {
  /** Gradient variant */
  variant?: 'primary' | 'accent' | 'custom';
  /** HTML element to render */
  as?: 'span' | 'p' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
  /** Custom gradient (only used when variant='custom') */
  customGradient?: string;
  /** Children */
  children: React.ReactNode;
}

const GradientText = React.forwardRef<HTMLElement, GradientTextProps>(
  (
    {
      className,
      variant = 'primary',
      as: Component = 'span',
      customGradient,
      children,
      ...props
    },
    ref
  ) => {
    const gradientClasses = {
      primary: 'text-gradient-primary',
      accent: 'text-gradient-accent',
      custom: '',
    };

    const style = variant === 'custom' && customGradient ? {
      background: customGradient,
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      backgroundClip: 'text',
    } : undefined;

    return (
      <Component
        ref={ref}
        className={cn(
          variant !== 'custom' && gradientClasses[variant],
          className
        )}
        style={style}
        {...props}
      >
        {children}
      </Component>
    );
  }
);

GradientText.displayName = 'GradientText';

export { GradientText };
export type { GradientTextProps };
