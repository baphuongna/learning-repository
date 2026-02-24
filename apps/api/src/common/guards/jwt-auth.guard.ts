/**
 * JWT Auth Guard - Bảo vệ các routes yêu cầu authentication
 *
 * Guard này kiểm tra JWT token trong request header và validate nó.
 * Nếu token hợp lệ, user info sẽ được attach vào request object.
 *
 * Cách sử dụng:
 * - @UseGuards(JwtAuthGuard) - Áp dụng cho controller hoặc method
 * - Kết hợp với @Public() để bỏ qua auth cho một số endpoints
 *
 * @module JwtAuthGuard
 */

import {
  Injectable,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  /**
   * Kiểm tra xem request có được phép truy cập không
   *
   * Quy trình:
   * 1. Kiểm tra xem endpoint có đánh dấu @Public() không
   *    - Nếu có, bỏ qua auth check
   * 2. Nếu không, gọi passport-jwt strategy để validate token
   *
   * @param context - ExecutionContext chứa request info
   * @returns true nếu được phép, throw exception nếu không
   */
  canActivate(context: ExecutionContext) {
    // Kiểm tra @Public() decorator
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),  // Method level
      context.getClass(),    // Class level
    ]);

    // Nếu là public endpoint, bỏ qua auth
    if (isPublic) {
      return true;
    }

    // Gọi passport-jwt auth guard
    return super.canActivate(context);
  }

  /**
   * Xử lý kết quả authentication
   *
   * Được gọi sau khi passport strategy hoàn thành.
   * Override để tùy chỉnh error message.
   *
   * @param err - Error từ strategy (nếu có)
   * @param user - User info từ JWT payload
   * @returns User info nếu hợp lệ
   * @throws UnauthorizedException nếu không hợp lệ
   */
  handleRequest(err: any, user: any) {
    if (err || !user) {
      throw err || new UnauthorizedException('Bạn cần đăng nhập để truy cập');
    }
    return user;
  }
}
