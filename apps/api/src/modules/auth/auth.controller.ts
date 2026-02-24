/**
 * Auth Controller - Xử lý các HTTP requests liên quan đến authentication
 *
 * Endpoints:
 * - POST /auth/register - Đăng ký tài khoản mới
 * - POST /auth/login - Đăng nhập
 * - GET /auth/me - Lấy thông tin user hiện tại
 *
 * @module AuthController
 */

import { Controller, Post, Get, Body, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterDto, LoginDto } from './dto/register.dto';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { Public } from '@/common/decorators/public.decorator';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * Đăng ký tài khoản mới
   *
   * Endpoint này không yêu cầu authentication (Public)
   *
   * @param dto - Thông tin đăng ký (email, fullName, password)
   * @returns Access token và thông tin user
   */
  @Public()
  @Post('register')
  @ApiOperation({ summary: 'Đăng ký tài khoản mới' })
  @ApiResponse({ status: 201, description: 'Đăng ký thành công' })
  @ApiResponse({ status: 409, description: 'Email đã tồn tại' })
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  /**
   * Đăng nhập
   *
   * Endpoint này không yêu cầu authentication (Public)
   * Trả về JWT token để sử dụng cho các requests tiếp theo
   *
   * @param dto - Thông tin đăng nhập (email, password)
   * @returns Access token và thông tin user
   */
  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK) // Trả về 200 thay vì 201
  @ApiOperation({ summary: 'Đăng nhập' })
  @ApiResponse({ status: 200, description: 'Đăng nhập thành công' })
  @ApiResponse({ status: 401, description: 'Email hoặc mật khẩu không đúng' })
  async login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  /**
   * Lấy thông tin user hiện tại
   *
   * Yêu cầu JWT token trong header
   *
   * @param userId - ID của user từ JWT token
   * @returns Thông tin chi tiết user
   */
  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Lấy thông tin user hiện tại' })
  @ApiResponse({ status: 200, description: 'Thông tin user' })
  @ApiResponse({ status: 401, description: 'Chưa đăng nhập' })
  async getProfile(@CurrentUser('sub') userId: string) {
    return this.authService.getProfile(userId);
  }
}
