/**
 * Auth Service - Xử lý logic nghiệp vụ liên quan đến authentication
 *
 * Các chức năng chính:
 * - Đăng ký user mới
 * - Đăng nhập và tạo JWT token
 * - Lấy thông tin profile user
 *
 * @module AuthService
 */

import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '@/common/services/prisma.service';
import { RegisterDto, LoginDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  /**
   * Đăng ký tài khoản mới
   *
   * Quy trình:
   * 1. Kiểm tra email đã tồn tại chưa
   * 2. Hash password với bcrypt (10 rounds)
   * 3. Tạo user mới trong database
   * 4. Tạo JWT token
   *
   * @param dto - Dữ liệu đăng ký (email, fullName, password)
   * @returns Access token và thông tin user
   * @throws ConflictException nếu email đã tồn tại
   */
  async register(dto: RegisterDto) {
    // Kiểm tra email đã tồn tại
    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (existingUser) {
      throw new ConflictException('Email đã được sử dụng');
    }

    // Hash password với bcrypt (10 salt rounds)
    const passwordHash = await bcrypt.hash(dto.password, 10);

    // Tạo user mới
    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        fullName: dto.fullName,
        passwordHash,
      },
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
      },
    });

    // Tạo JWT token
    const accessToken = this.generateToken(user);

    return {
      accessToken,
      user,
    };
  }

  /**
   * Đăng nhập
   *
   * Quy trình:
   * 1. Tìm user theo email
   * 2. Verify password với bcrypt
   * 3. Tạo JWT token
   *
   * @param dto - Dữ liệu đăng nhập (email, password)
   * @returns Access token và thông tin user
   * @throws UnauthorizedException nếu email hoặc password không đúng
   */
  async login(dto: LoginDto) {
    // Tìm user theo email
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    // Không tìm thấy user
    if (!user) {
      throw new UnauthorizedException('Email hoặc mật khẩu không đúng');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(dto.password, user.passwordHash);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Email hoặc mật khẩu không đúng');
    }

    // Tạo JWT token
    const accessToken = this.generateToken({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    return {
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
      },
    };
  }

  /**
   * Lấy thông tin profile user
   *
   * Bao gồm số lượng tài liệu đã tạo
   *
   * @param userId - ID của user
   * @returns Thông tin chi tiết user
   * @throws UnauthorizedException nếu user không tồn tại
   */
  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        avatarUrl: true,
        createdAt: true,
        // Đếm số tài liệu đã tạo
        _count: {
          select: { documents: true },
        },
      },
    });

    if (!user) {
      throw new UnauthorizedException('Người dùng không tồn tại');
    }

    return user;
  }

  /**
   * Tạo JWT access token
   *
   * JWT payload chứa:
   * - sub: user ID
   * - email: user email
   * - role: user role (ADMIN/USER)
   *
   * @param user - Object chứa id, email, role
   * @returns JWT token string
   */
  private generateToken(user: { id: string; email: string; role: string }) {
    const payload = {
      sub: user.id,        // Subject: user ID
      email: user.email,   // Email để identify
      role: user.role,     // Role để authorization
    };

    return this.jwtService.sign(payload, {
      expiresIn: this.configService.get<string>('JWT_EXPIRES_IN') || '7d',
    });
  }
}
