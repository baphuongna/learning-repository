/**
 * Public Decorator - Đánh dấu endpoint không yêu cầu authentication
 *
 * Sử dụng decorator này để bỏ qua JWT authentication cho các endpoints công khai.
 * Thường dùng cho: login, register, public APIs...
 *
 * @module Public
 */

import { SetMetadata } from '@nestjs/common';

/**
 * Metadata key để đánh dấu endpoint là public
 */
export const IS_PUBLIC_KEY = 'isPublic';

/**
 * Public Decorator
 *
 * Đánh dấu method hoặc controller là public (không cần auth)
 *
 * @example
 * // Method level
 * @Public()
 * @Post('login')
 * login() {}
 *
 * @example
 * // Controller level (tất cả methods trong controller đều public)
 * @Public()
 * @Controller('public')
 * class PublicController {}
 */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
