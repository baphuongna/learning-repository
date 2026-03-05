import * as React from 'react';
import { cn } from '@/lib/utils';

/**
 * Input Component - EduModern Design System
 *
 * Features:
 * - Focus glow animation with emerald ring
 * - Smooth transitions
 * - File input styling
 * - Error state
 * - Icon support
 */

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  /** Error state */
  error?: boolean;
  /** Left icon */
  leftIcon?: React.ReactNode;
  /** Right icon */
  rightIcon?: React.ReactNode;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, error, leftIcon, rightIcon, ...props }, ref) => {
    return (
      <div className="relative">
        {leftIcon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
            {leftIcon}
          </div>
        )}
        <input
          type={type}
          className={cn(
            'flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background transition-all duration-200',
            // File input
            'file:border-0 file:bg-transparent file:text-sm file:font-medium',
            // Placeholder
            'placeholder:text-muted-foreground',
            // Focus state - glow animation
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:border-primary focus-visible:shadow-glow-primary',
            // Error state
            error && 'border-destructive focus-visible:ring-destructive/50 focus-visible:border-destructive focus-visible:shadow-none',
            // Disabled state
            'disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-muted',
            // Left icon padding
            leftIcon && 'pl-10',
            // Right icon padding
            rightIcon && 'pr-10',
            className
          )}
          ref={ref}
          {...props}
        />
        {rightIcon && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
            {rightIcon}
          </div>
        )}
      </div>
    );
  }
);
Input.displayName = 'Input';

/* ============================================
   Additional Input Components
   ============================================ */

/** Input with label */
interface InputWithLabelProps extends InputProps {
  label: string;
  id?: string;
  helperText?: string;
}

const InputWithLabel = React.forwardRef<HTMLInputElement, InputWithLabelProps>(
  ({ label, id, helperText, error, className, ...props }, ref) => {
    const inputId = id || React.useId();

    return (
      <div className="space-y-2">
        <label
          htmlFor={inputId}
          className="text-sm font-medium text-foreground"
        >
          {label}
        </label>
        <Input
          ref={ref}
          id={inputId}
          error={error}
          className={className}
          {...props}
        />
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
);
InputWithLabel.displayName = 'InputWithLabel';

/** Search Input */
const SearchInput = React.forwardRef<
  HTMLInputElement,
  Omit<InputProps, 'leftIcon' | 'type'>
>(({ className, ...props }, ref) => (
  <Input
    ref={ref}
    type="search"
    leftIcon={
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={2}
        stroke="currentColor"
        className="h-4 w-4"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
        />
      </svg>
    }
    className={cn('pl-10', className)}
    {...props}
  />
));
SearchInput.displayName = 'SearchInput';

export { Input, InputWithLabel, SearchInput };
