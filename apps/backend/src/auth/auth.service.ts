import { Injectable, ConflictException, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto, LoginDto } from './dto/auth.dto';
import { JwtPayload } from './strategies/jwt.strategy';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async register(registerDto: RegisterDto) {
    const { email, username, password, firstName, lastName } = registerDto;

    // Check if user already exists
    const existingUser = await this.prisma.user.findFirst({
      where: {
        OR: [
          { email },
          { username },
        ],
      },
    });

    if (existingUser) {
      throw new ConflictException('User with this email or username already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const user = await this.prisma.user.create({
      data: {
        email,
        username,
        password: hashedPassword,
        firstName,
        lastName,
      },
      select: {
        id: true,
        email: true,
        username: true,
        firstName: true,
        lastName: true,
        avatar: true,
        createdAt: true,
      },
    });

    // Generate tokens
    const { accessToken, refreshToken } = await this.generateTokens(user.id, user.email, user.username);

    return {
      user,
      accessToken,
      refreshToken,
      message: 'Registration successful',
    };
  }

  async login(loginDto: LoginDto) {
    const { emailOrUsername, password } = loginDto;

    // Find user by email or username
    const user = await this.prisma.user.findFirst({
      where: {
        OR: [
          { email: emailOrUsername },
          { username: emailOrUsername },
        ],
        isActive: true,
      },
    });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Generate tokens
    const { accessToken, refreshToken } = await this.generateTokens(user.id, user.email, user.username);

    return {
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        avatar: user.avatar,
      },
      accessToken,
      refreshToken,
      message: 'Login successful',
    };
  }

  async validateUser(emailOrUsername: string, password: string) {
    const user = await this.prisma.user.findFirst({
      where: {
        OR: [
          { email: emailOrUsername },
          { username: emailOrUsername },
        ],
        isActive: true,
      },
    });

    if (user && (await bcrypt.compare(password, user.password))) {
      const { password: _, ...result } = user;
      return result;
    }
    return null;
  }

  async refreshToken(refreshToken: string) {
    if (!refreshToken) {
      throw new BadRequestException('Refresh token is required');
    }

    // Find refresh token in database
    const tokenRecord = await this.prisma.refreshToken.findUnique({
      where: { token: refreshToken },
      include: { user: true },
    });

    if (!tokenRecord || tokenRecord.expiresAt < new Date()) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    // Generate new tokens
    const { accessToken, refreshToken: newRefreshToken } = await this.generateTokens(
      tokenRecord.user.id,
      tokenRecord.user.email,
      tokenRecord.user.username,
    );

    // Delete old refresh token
    await this.prisma.refreshToken.delete({
      where: { id: tokenRecord.id },
    });

    return {
      accessToken,
      refreshToken: newRefreshToken,
    };
  }

  async logout(userId: number, refreshToken: string) {
    if (refreshToken) {
      await this.prisma.refreshToken.deleteMany({
        where: {
          token: refreshToken,
          userId,
        },
      });
    }

    return { message: 'Logout successful' };
  }

  async getProfile(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        username: true,
        firstName: true,
        lastName: true,
        avatar: true,
        createdAt: true,
        _count: {
          select: {
            favorites: true,
            teams: true,
          },
        },
      },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return user;
  }

  private async generateTokens(userId: number, email: string, username: string) {
    const payload: JwtPayload = {
      sub: userId,
      email,
      username,
    };

    // Generate access token
    const accessToken = this.jwtService.sign(payload);

    // Generate refresh token
    const refreshTokenValue = uuidv4();
    const refreshTokenExpiration = new Date();
    refreshTokenExpiration.setDate(
      refreshTokenExpiration.getDate() + 
      parseInt(this.configService.get('JWT_REFRESH_EXPIRATION', '7'), 10)
    );

    // Store refresh token in database
    await this.prisma.refreshToken.create({
      data: {
        token: refreshTokenValue,
        userId,
        expiresAt: refreshTokenExpiration,
      },
    });

    return {
      accessToken,
      refreshToken: refreshTokenValue,
    };
  }
}