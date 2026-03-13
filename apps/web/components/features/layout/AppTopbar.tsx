'use client';

import { ReactNode, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Menu, Search, Sun, Moon, User, LogOut, Settings, ChevronDown } from 'lucide-react';
import { useAuth } from '@/app/providers';
import { DashboardBreadcrumb } from './DashboardBreadcrumb';
import { Input } from '@/components/shared/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  getUserMenuItems,
  getAdminMenuItem,
} from './dashboard-nav-items';

/**
 * AppTopbar - Utility topbar cho authenticated area
 *
 * Responsibilities theo spec:
 * - Breadcrumb / current context
 * - Theme switch
 * - User menu
 * - Mobile menu trigger
 *
 * Topbar is utility-oriented, not navigation-heavy
 */

export type AppTopbarProps = {
  onMenuClick: () => void;
  action?: ReactNode;
  searchPlaceholder?: string;
};

export function AppTopbar({ onMenuClick, action, searchPlaceholder = 'Tìm nhanh trong khu vực làm việc...' }: AppTopbarProps) {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [darkMode, setDarkMode] = useState(false);

  // Initialize dark mode from localStorage
  useEffect(() => {
    const isDark =
      localStorage.getItem('darkMode') === 'true' ||
      (!localStorage.getItem('darkMode') &&
        window.matchMedia('(prefers-color-scheme: dark)').matches);
    setDarkMode(isDark);
    document.documentElement.classList.toggle('dark', isDark);
  }, []);

  // Toggle dark mode
  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem('darkMode', String(newMode));
    document.documentElement.classList.toggle('dark', newMode);
  };

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const userMenuItems = getUserMenuItems();
  const adminMenuItem = user?.role === 'ADMIN' ? getAdminMenuItem() : null;

  return (
    <header className="sticky top-0 z-30 h-16 border-b border-border/40 bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-full items-center justify-between gap-4 px-4">
        {/* Left side: Mobile menu + breadcrumb + search */}
        <div className="flex min-w-0 flex-1 items-center gap-3">
          {/* Mobile menu trigger */}
          <button
            onClick={onMenuClick}
            className="lg:hidden h-9 w-9 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors shrink-0"
            aria-label="Mở menu"
          >
            <Menu className="h-5 w-5" />
          </button>

          {/* Breadcrumb */}
          <div className="min-w-0 shrink-0">
            <DashboardBreadcrumb />
          </div>

          {/* Global search entry point */}
          <div className="hidden min-w-0 max-w-md flex-1 xl:block">
            <Input
              type="search"
              placeholder={searchPlaceholder}
              leftIcon={<Search className="h-4 w-4" />}
              aria-label="Tìm kiếm nhanh"
              className="h-10 border-border/60 bg-background/70"
            />
          </div>
        </div>

        {/* Right side: contextual action + theme toggle + user menu */}
        <div className="flex items-center gap-2">
          {action ? <div className="hidden items-center gap-2 md:flex">{action}</div> : null}

          {/* Theme toggle */}
          <button
            onClick={toggleDarkMode}
            className="h-9 w-9 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
            aria-label={darkMode ? 'Bật chế độ sáng' : 'Bật chế độ tối'}
          >
            {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>

          {/* User menu */}
          {user && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 h-9 px-2 rounded-lg hover:bg-muted/50 transition-colors">
                  {user.avatarUrl ? (
                    <img
                      src={user.avatarUrl}
                      alt={user.fullName}
                      className="h-7 w-7 rounded-full object-cover ring-2 ring-border"
                    />
                  ) : (
                    <div className="h-7 w-7 rounded-full bg-gradient-to-br from-primary to-teal-600 flex items-center justify-center shadow-sm">
                      <User className="h-3.5 w-3.5 text-white" />
                    </div>
                  )}
                  <span className="hidden sm:inline text-sm font-medium text-foreground truncate max-w-[120px]">
                    {user.fullName}
                  </span>
                  {user.role === 'ADMIN' && (
                    <span className="hidden md:inline bg-accent/10 text-accent px-1.5 py-0.5 rounded text-xs font-semibold">
                      Admin
                    </span>
                  )}
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                </button>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end" className="w-56">
                {/* User info header */}
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user.fullName}</p>
                    <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                  </div>
                </DropdownMenuLabel>

                <DropdownMenuSeparator />

                {/* User menu items */}
                {userMenuItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <DropdownMenuItem key={item.href} asChild>
                      <Link href={item.href} className="flex items-center gap-3 cursor-pointer">
                        <Icon className="h-4 w-4 text-muted-foreground" />
                        {item.title}
                      </Link>
                    </DropdownMenuItem>
                  );
                })}

                {/* Admin section */}
                {adminMenuItem && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href={adminMenuItem.href} className="flex items-center gap-3 cursor-pointer">
                        <Settings className="h-4 w-4 text-muted-foreground" />
                        {adminMenuItem.title}
                      </Link>
                    </DropdownMenuItem>
                  </>
                )}

                <DropdownMenuSeparator />

                {/* Logout */}
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="flex items-center gap-3 text-destructive focus:text-destructive cursor-pointer"
                >
                  <LogOut className="h-4 w-4" />
                  Đăng xuất
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </header>
  );
}
