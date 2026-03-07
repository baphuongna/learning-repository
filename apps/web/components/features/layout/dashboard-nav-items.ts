import { Cpu, FileText, FolderKanban, Home, Newspaper, Upload } from 'lucide-react';

export type NavigationItem = {
  title: string;
  href: string;
  icon: typeof Home;
  match: string[];
};

const baseNavItems: NavigationItem[] = [
  {
    title: 'Tổng quan',
    href: '/dashboard',
    icon: Home,
    match: ['/dashboard'],
  },
  {
    title: 'Tài liệu',
    href: '/documents',
    icon: FileText,
    match: ['/documents', '/my-documents'],
  },
  {
    title: 'Tải lên',
    href: '/documents/upload',
    icon: Upload,
    match: ['/documents/upload'],
  },
  {
    title: 'Rust Inspector',
    href: '/rust-docs',
    icon: Cpu,
    match: ['/rust-docs'],
  },
  {
    title: 'Bài viết của tôi',
    href: '/my-news',
    icon: Newspaper,
    match: ['/my-news'],
  },
];

export function getNavigationItems(role?: string): NavigationItem[] {
  return [
    ...baseNavItems,
    ...(role === 'ADMIN'
      ? [
          {
            title: 'Quản trị',
            href: '/admin/news',
            icon: FolderKanban,
            match: ['/admin/news', '/admin/categories'],
          },
        ]
      : []),
  ];
}

export function isNavigationItemActive(pathname: string, match: string[]): boolean {
  return match.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}
