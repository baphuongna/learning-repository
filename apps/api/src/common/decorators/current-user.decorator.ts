/**
 * Current User Decorator - Lấy thông tin user từ JWT token
 *
 * Decorator này extract user info từ request object (được attach bởi JwtAuthGuard).
 * Có thể lấy toàn bộ user object hoặc một field cụ thể.
 *
 * Cách sử dụng:
 * - @CurrentUser() user - Lấy toàn bộ user object
 * - @CurrentUser('sub') userId - Lấy chỉ user ID
 * - @CurrentUser('email') email - Lấy chỉ email
 * - @CurrentUser('role') role - Lấy chỉ role
 *
 * @module CurrentUser
 */

import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * Interface cho JWT payload
 */
export interface JwtPayload {
  sub: string;      // User ID
  email: string;    // Email
  role: string;     // Role (ADMIN/USER)
  iat?: number;     // Issued at timestamp
  exp?: number;     // Expiration timestamp
}

/**
 * CurrentUser Decorator
 *
 * @param data - Field name để extract (optional)
 *               Nếu không truyền, trả về toàn bộ payload
 * @param ctx - ExecutionContext
 * @returns User info hoặc field cụ thể
 *
 * @example
 * // Lấy toàn bộ user
 * @CurrentUser() user: JwtPayload
 *
 * @example
 * // Lấy chỉ user ID
 * @CurrentUser('sub') userId: string
 */
export const CurrentUser = createParamDecorator(
  (data: keyof JwtPayload | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user as JwtPayload;

    // Nếu không có user (route không có guard), trả về null
    if (!user) {
      return null;
    }

    // Nếu chỉ định field, trả về field đó
    // Nếu không, trả về toàn bộ user object
    return data ? user[data] : user;
  },
);
