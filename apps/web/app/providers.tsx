/**
 * Providers - Auth Context và các providers cho ứng dụng
 *
 * File này cung cấp:
 * - AuthContext: Quản lý state authentication
 * - useAuth hook: Truy cập auth state từ bất kỳ component nào
 * - Providers component: Wrap toàn bộ app với các context providers
 *
 * @module Providers
 */

'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

// ==================== TYPES ====================

/**
 * User type - Thông tin người dùng trong context
 */
interface User {
  id: string;
  email: string;
  fullName: string;
  role: string;
}

/**
 * AuthContext type - Interface cho Auth Context
 */
interface AuthContextType {
  user: User | null;          // Current user info
  token: string | null;       // JWT token
  isLoading: boolean;         // Loading state khi khôi phục session
  login: (token: string, user: User) => void;  // Login function
  logout: () => void;         // Logout function
}

// ==================== CONTEXT ====================

/**
 * AuthContext - React Context cho authentication state
 */
const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * useAuth Hook - Truy cập Auth Context
 *
 * Sử dụng hook này để lấy auth state từ bất kỳ component nào.
 *
 * @returns AuthContextType
 * @throws Error nếu sử dụng ngoài AuthProvider
 *
 * @example
 * const { user, login, logout } = useAuth();
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth phải được sử dụng trong AuthProvider');
  }
  return context;
}

// ==================== PROVIDER ====================

/**
 * Providers Component - Root provider wrapper
 *
 * Component này wrap toàn bộ ứng dụng với các context providers:
 * - AuthProvider: Cung cấp authentication state
 *
 * @param children - Child components
 * @returns JSX with providers
 */
export function Providers({ children }: { children: ReactNode }) {
  // User state
  const [user, setUser] = useState<User | null>(null);
  // Token state
  const [token, setToken] = useState<string | null>(null);
  // Loading state (khi khôi phục session từ localStorage)
  const [isLoading, setIsLoading] = useState(true);

  /**
   * Khôi phục session từ localStorage khi mount
   *
   * Chỉ chạy một lần khi component mount.
   * Kiểm tra localStorage cho token và user info.
   */
  useEffect(() => {
    // Lấy token từ localStorage
    const storedToken = localStorage.getItem('token');
    // Lấy user info từ localStorage
    const storedUser = localStorage.getItem('user');

    // Nếu có cả token và user, khôi phục session
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }

    // Đánh dấu đã load xong
    setIsLoading(false);
  }, []);

  /**
   * Login function
   *
   * Lưu token và user info vào state và localStorage
   *
   * @param newToken - JWT token từ API
   * @param newUser - User info từ API
   */
  const login = (newToken: string, newUser: User) => {
    // Lưu vào localStorage (persist across sessions)
    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify(newUser));
    // Update state
    setToken(newToken);
    setUser(newUser);
  };

  /**
   * Logout function
   *
   * Xóa token và user info khỏi state và localStorage
   */
  const logout = () => {
    // Xóa từ localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    // Reset state
    setToken(null);
    setUser(null);
  };

  // Provide auth context to children
  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
