import {
  Controller,
  Post,
  Body,
  Get,
  Patch,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import {
  IsEmail,
  IsString,
  MinLength,
  IsOptional,
} from 'class-validator';
import { JwtAuthGuard } from './jwt-auth.guard';
import { GetUser } from './get-user.decorator';

// ===================================================================
// DTO for Customer Registration (Signup)
// ===================================================================
class RegisterDto {
  @IsString()
  @MinLength(1, { message: 'Username is required' })
  username: string;

  @IsEmail({}, { message: 'Invalid email format' })
  email: string;

  @IsString()
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  password: string;
}

// ===================================================================
// DTO for Login
// ===================================================================
class LoginDto {
  @IsString()
  email: string;

  @IsString()
  password: string;
}

// ===================================================================
// DTO for Admin Setup
// ===================================================================
class AdminSetupDto {
  @IsString()
  fullName: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;
}

// ===================================================================
// DTO for Profile Update (used in checkout)
// ===================================================================
class UpdateProfileDto {
  @IsOptional()
  @IsString()
  fullName?: string;

  @IsOptional()
  @IsString()
  phoneNumber?: string;
}

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  // ===================================================================
  // PUBLIC: Customer Registration
  // POST /auth/register
  // ===================================================================
  @Post('register')
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto.username, dto.email, dto.password);
  }

  // ===================================================================
  // PUBLIC: Customer & Admin Login
  // POST /auth/login
  // ===================================================================
  @Post('login')
  async login(@Body() dto: LoginDto) {
    return this.authService.login(dto.email, dto.password);
  }

  // ===================================================================
  // PROTECTED: Get current authenticated user profile
  // GET /auth/me
  // ===================================================================
  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getMe(@GetUser() user: any) {
    // Safety check: ensure user.sub exists (from JWT payload)
    if (!user || !user.sub) {
      throw new BadRequestException('Invalid or missing user data in token');
    }

    // Your original working response format — kept exactly as-is
    return {
      success: true,
      data: {
        id: user.sub,
        email: user.email,
        username: user.username || null,
        fullName: user.fullName || '',
        phoneNumber: user.phoneNumber || '', // will be populated after update
      },
    };
  }

  // ===================================================================
  // PROTECTED: Update current user profile (fullName & phoneNumber)
  // PATCH /auth/me
  // Called from checkout when saving address
  // ===================================================================
  @Patch('me')
  @UseGuards(JwtAuthGuard)
  async updateMe(@GetUser() user: any, @Body() dto: UpdateProfileDto) {
    // Safety check: ensure user.sub exists
    if (!user || !user.sub) {
      throw new BadRequestException('Invalid or missing user data in token');
    }

    // Call service to update in database
    return this.authService.updateProfile(user.sub, dto);
  }

  // ===================================================================
  // Check if admin exists
  // GET /auth/admin/check-exists
  // ===================================================================
  @Get('admin/check-exists')
  async checkAdminExists() {
    return this.authService.checkAdminExists();
  }

  // ===================================================================
  // One-time admin creation
  // POST /auth/admin/setup
  // ===================================================================
  @Post('admin/setup')
  async setupAdmin(@Body() dto: AdminSetupDto) {
    return this.authService.setupAdmin(dto.fullName, dto.email, dto.password);
  }
}