import type { Metadata } from 'next';
import { DM_Serif_Display, Source_Sans_3, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';

/* ============================================
   Typography Setup - EduModern Design System
   - Display: DM Serif Display (editorial, scholarly)
   - Body: Source Sans 3 (clean, readable)
   - Code: JetBrains Mono (for code snippets)
   ============================================ */

const fontDisplay = DM_Serif_Display({
  subsets: ['latin'],
  weight: ['400'],
  variable: '--font-display',
  display: 'swap',
});

const fontSans = Source_Sans_3({
  subsets: ['latin', 'vietnamese'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-sans',
  display: 'swap',
});

const fontMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Kho Học Liệu Số',
  description: 'Hệ thống quản lý tài liệu học tập - Nơi lưu trữ và chia sẻ kiến thức',
  keywords: ['học liệu', 'tài liệu', 'giáo dục', 'kho học liệu số', 'learning repository'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <body
        className={`${fontDisplay.variable} ${fontSans.variable} ${fontMono.variable} font-sans antialiased`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
