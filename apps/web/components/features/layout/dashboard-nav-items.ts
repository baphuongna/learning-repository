import {
  Cpu,
  FileText,
  FolderKanban,
  Home,
  Lock,
  Newspaper,
  Settings,
  Upload,
  User,
  type LucideIcon,
} from 'lucide-react';

/**
 * Navigation Types - EduModern Design System
 *
 * Navigation được nhóm theo nhiệm vụ thay vì phản chiếu route kỹ thuật.
 */

export type NavigationItem = {
  title: string;
  href: string;
  icon: LucideIcon;
  match: string[];
};

export type NavigationGroup = {
  title: string;
  items: NavigationItem[];
};

/**
 * Sidebar navigation groups cho authenticated area
 *
 * Cấu trúc theo spec:
 * - Tổng quan: Dashboard
 * - Tài liệu: Tất cả tài liệu, Tài liệu của tôi, Tải lên
 * - Nội dung: Bài viết của tôi
 * - Công cụ: Rust Inspector
 * - Quản trị (admin only): Quản lý tin tức, Quản lý danh mục
 */
const baseNavigationGroups: NavigationGroup[] = [
  {
    title: 'Tổng quan',
    items: [
      {
        title: 'Dashboard',
        href: '/dashboard',
        icon: Home,
        match: ['/dashboard'],
      },
    ],
  },
  {
    title: 'Tài liệu',
    items: [
      {
        title: 'Tất cả tài liệu',
        href: '/documents',
        icon: FileText,
        match: ['/documents'],
      },
      {
        title: 'Tài liệu của tôi',
        href: '/my-documents',
        icon: FileText,
        match: ['/my-documents'],
      },
      {
        title: 'Tải lên',
        href: '/documents/upload',
        icon: Upload,
        match: ['/documents/upload'],
      },
    ],
  },
  {
    title: 'Nội dung',
    items: [
      {
        title: 'Bài viết của tôi',
        href: '/my-news',
        icon: Newspaper,
        match: ['/my-news'],
      },
    ],
  },
  {
    title: 'Công cụ',
    items: [
      {
        title: 'Rust Inspector',
        href: '/rust-docs',
        icon: Cpu,
        match: ['/rust-docs'],
      },
    ],
  },
  {
    title: 'Tài khoản',
    items: [
      {
        title: 'Hồ sơ cá nhân',
        href: '/profile',
        icon: User,
        match: ['/profile'],
      },
      {
        title: 'Đổi mật khẩu',
        href: '/change-password',
        icon: Lock,
        match: ['/change-password'],
      },
    ],
  },
];

/**
 * Admin-only navigation group
 */
const adminNavigationGroup: NavigationGroup = {
  title: 'Quản trị',
  items: [
    {
      title: 'Quản lý tin tức',
      href: '/admin/news',
      icon: Newspaper,
      match: ['/admin/news'],
    },
    {
      title: 'Quản lý danh mục',
      href: '/admin/categories',
      icon: FolderKanban,
      match: ['/admin/categories'],
    },
  ],
};

/**
 * Lấy navigation groups cho sidebar
 *
 * @param role - User role (ADMIN, USER)
 * @returns Array of navigation groups
 */
export function getNavigationGroups(role?: string): NavigationGroup[] {
  const groups = [...baseNavigationGroups];

  if (role === 'ADMIN') {
    groups.push(adminNavigationGroup);
  }

  return groups;
}

/**
 * Lấy flat navigation items (backward compatibility)
 *
 * @deprecated Use getNavigationGroups instead for grouped navigation
 * @param role - User role (ADMIN, USER)
 * @returns Array of navigation items
 */
export function getNavigationItems(role?: string): NavigationItem[] {
  return getNavigationGroups(role).flatMap((group) => group.items);
}

/**
 * User menu items (đặt trong topbar dropdown)
 */
export type UserMenuItem = {
  title: string;
  href: string;
  icon: LucideIcon;
};

export function getUserMenuItems(): UserMenuItem[] {
  return [
    {
      title: 'Thông tin cá nhân',
      href: '/profile',
      icon: User,
    },
    {
      title: 'Đổi mật khẩu',
      href: '/change-password',
      icon: Lock,
    },
  ];
}

export function getAdminMenuItem(): UserMenuItem {
  return {
    title: 'Quản trị hệ thống',
    href: '/admin/news',
    icon: Settings,
  };
}

/**
 * Check if a navigation item is active based on current pathname
 *
 * @param pathname - Current route pathname
 * @param match - Array of paths to match against
 * @returns boolean indicating if item is active
 */
export function isNavigationItemActive(pathname: string, match: string[]): boolean {
  return match.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}
