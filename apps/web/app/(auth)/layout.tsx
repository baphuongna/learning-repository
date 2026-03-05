import { ReactNode } from 'react';
import Link from 'next/link';
import { FileText } from 'lucide-react';

/**
 * Auth Layout - EduModern Design System
 *
 * Features:
 * - Full-screen gradient background
 * - Decorative shapes
 * - Centered auth card
 */

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex relative overflow-hidden">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/5" />

      {/* Decorative Shapes */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-accent/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />
      <div className="absolute top-1/2 left-1/4 w-64 h-64 bg-teal-500/5 rounded-full blur-3xl" />

      {/* Grid Pattern */}
      <div
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />

      {/* Content */}
      <div className="relative flex-1 flex flex-col">
        {/* Logo */}
        <div className="absolute top-6 left-6 z-10">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="relative">
              <div className="absolute inset-0 bg-primary/20 rounded-lg blur-md group-hover:bg-primary/30 transition-colors" />
              <div className="relative h-10 w-10 rounded-lg bg-gradient-to-br from-primary to-teal-600 flex items-center justify-center shadow-lg">
                <FileText className="h-5 w-5 text-white" />
              </div>
            </div>
            <span className="font-display font-bold text-xl text-foreground">
              Kho Học Liệu Số
            </span>
          </Link>
        </div>

        {/* Auth Card Container */}
        <div className="flex-1 flex items-center justify-center p-4 sm:p-8">
          <div className="w-full max-w-md animate-scale-in">
            {children}
          </div>
        </div>

        {/* Footer */}
        <div className="absolute bottom-6 left-0 right-0 text-center">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Kho Học Liệu Số. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}
