import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

/**
 * Button Component - EduModern Design System
 *
 * Variants:
 * - default: Emerald solid
 * - gradient: Gradient primary to teal
 * - accent: Amber solid
 * - outline: Bordered with hover effect
 * - ghost: Transparent with hover
 * - link: Text link style
 * - destructive: Red for dangerous actions
 */

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        // Primary - Emerald
        default:
          'bg-primary text-primary-foreground shadow-sm hover:bg-primary/90 hover:shadow-md active:scale-[0.98]',

        // Gradient - Emerald to Teal
        gradient:
          'bg-gradient-to-r from-primary to-teal-600 text-white shadow-md hover:shadow-lg hover:opacity-90 active:scale-[0.98] dark:from-primary dark:to-teal-500',

        // Accent - Amber
        accent:
          'bg-accent text-accent-foreground shadow-sm hover:bg-accent/90 hover:shadow-md active:scale-[0.98]',

        // Outline
        outline:
          'border border-input bg-background hover:border-primary hover:text-primary hover:bg-primary/5 active:scale-[0.98]',

        // Secondary - Warm Gray
        secondary:
          'bg-secondary text-secondary-foreground hover:bg-secondary/80 active:scale-[0.98]',

        // Ghost - Transparent
        ghost:
          'hover:bg-primary/10 hover:text-primary active:scale-[0.98]',

        // Link
        link: 'text-primary underline-offset-4 hover:underline',

        // Destructive - Red
        destructive:
          'bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90 hover:shadow-md active:scale-[0.98]',

        // Success - Green
        success:
          'bg-green-600 text-white shadow-sm hover:bg-green-700 hover:shadow-md active:scale-[0.98] dark:bg-green-700 dark:hover:bg-green-600',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 rounded-md px-3 text-xs',
        lg: 'h-11 rounded-lg px-6 text-base',
        xl: 'h-12 rounded-lg px-8 text-base',
        icon: 'h-10 w-10',
        'icon-sm': 'h-8 w-8',
        'icon-lg': 'h-12 w-12',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  /** Loading state */
  loading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, loading, children, disabled, ...props }, ref) => {
    if (asChild) {
      return (
        <Slot
          className={cn(buttonVariants({ variant, size, className }))}
          ref={ref}
          aria-disabled={disabled || loading}
          {...props}
        >
          {children}
        </Slot>
      );
    }

    const Comp = 'button';

    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <svg
            className="animate-spin h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}
        {children}
      </Comp>
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };
