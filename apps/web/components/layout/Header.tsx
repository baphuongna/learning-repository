'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/app/providers';
import { FileText, LogOut, User, Lock, Settings, ChevronDown } from 'lucide-react';

export function Header() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <header className="border-b bg-background sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <FileText className="h-6 w-6 text-primary" />
          <span className="font-bold text-xl">Kho Học Liệu Số</span>
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          <Link href="/" className="text-sm font-medium hover:text-primary transition-colors">
            Tin tức
          </Link>
          <Link href="/documents" className="text-sm font-medium hover:text-primary transition-colors">
            Tài liệu
          </Link>
          <Link href="/my-documents" className="text-sm font-medium hover:text-primary transition-colors">
            Tài liệu của tôi
          </Link>
          {user?.role === 'ADMIN' && (
            <Link href="/admin/news" className="text-sm font-medium hover:text-primary transition-colors">
              Admin
            </Link>
          )}
        </nav>

        <div className="flex items-center gap-4">
          {user ? (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 text-sm hover:bg-muted px-3 py-2 rounded-md transition-colors"
              >
                {user.avatarUrl ? (
                  <img
                    src={user.avatarUrl}
                    alt={user.fullName}
                    className="h-8 w-8 rounded-full object-cover"
                  />
                ) : (
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="h-4 w-4 text-primary" />
                  </div>
                )}
                <span className="hidden sm:inline">{user.fullName}</span>
                {user.role === 'ADMIN' && (
                  <span className="hidden md:inline bg-primary/10 text-primary px-2 py-0.5 rounded text-xs">
                    Admin
                  </span>
                )}
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              </button>

              {/* Dropdown Menu */}
              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-background border rounded-lg shadow-lg py-1 z-50">
                  {/* User Info */}
                  <div className="px-4 py-3 border-b">
                    <p className="font-medium truncate">{user.fullName}</p>
                    <p className="text-sm text-muted-foreground truncate">{user.email}</p>
                  </div>

                  {/* Menu Items */}
                  <Link
                    href="/profile"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-3 px-4 py-2 text-sm hover:bg-muted transition-colors"
                  >
                    <User className="h-4 w-4" />
                    Thông tin cá nhân
                  </Link>

                  <Link
                    href="/change-password"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-3 px-4 py-2 text-sm hover:bg-muted transition-colors"
                  >
                    <Lock className="h-4 w-4" />
                    Đổi mật khẩu
                  </Link>

                  {user.role === 'ADMIN' && (
                    <>
                      <div className="border-t my-1" />
                      <Link
                        href="/admin/news"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-3 px-4 py-2 text-sm hover:bg-muted transition-colors"
                      >
                        <Settings className="h-4 w-4" />
                        Quản trị
                      </Link>
                    </>
                  )}

                  <div className="border-t my-1" />

                  <button
                    onClick={() => {
                      setDropdownOpen(false);
                      handleLogout();
                    }}
                    className="flex items-center gap-3 px-4 py-2 text-sm hover:bg-muted transition-colors w-full text-left text-destructive"
                  >
                    <LogOut className="h-4 w-4" />
                    Đăng xuất
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link href="/login">
              <Button size="sm">Đăng nhập</Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
