'use client';

import Link from 'next/link';
import { FileText } from 'lucide-react';
import { cn } from '@/lib/utils';

export type AppBrandProps = {
  href: string;
  title: string;
  subtitle?: string;
  className?: string;
  titleClassName?: string;
};

export function AppBrand({ href, title, subtitle, className, titleClassName }: AppBrandProps) {
  return (
    <Link href={href} className={cn('flex items-center gap-2.5 group', className)}>
      <div className="relative">
        <div className="absolute inset-0 rounded-lg bg-primary/20 blur-md transition-colors group-hover:bg-primary/30" />
        <div className="relative flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-teal-600 shadow-sm">
          <FileText className="h-5 w-5 text-white" />
        </div>
      </div>

      <div className="flex flex-col">
        <span className={cn('font-display font-bold text-foreground', titleClassName)}>
          {title}
        </span>
        {subtitle ? <span className="text-xs text-muted-foreground">{subtitle}</span> : null}
      </div>
    </Link>
  );
}
