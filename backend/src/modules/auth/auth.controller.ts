import {
  Controller,
  Post,
  Body,
  Get,
  Patch,
  Query,
  UseGuards,
  BadRequestException,
  UnauthorizedException,
  NotFoundException,
  Put,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import {
  IsEmail,
  IsString,
  MinLength,
  IsOptional,
  Matches,
} from 'class-validator';
import { JwtAuthGuard } from './jwt-auth.guard';
import { RolesGuard } from './roles.guard';
import { Roles } from './roles.decorator';
import { GetUser } from './get-user.decorator';
import { Role } from '@prisma/client';

// ===================================================================
// DTOs (updated with new DTOs)
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

class LoginDto {
  @IsString()
  email: string;

  @IsString()
  password: string;
}

class AdminSetupDto {
  @IsString()
  fullName: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;
}

class UpdateProfileDto {
  @IsOptional()
  @IsString()
  fullName?: string;

  @IsOptional()
  @IsString()
  phoneNumber?: string;
}

// NEW DTO for admin profile update
class UpdateAdminProfileDto {
  @IsOptional()
  @IsString()
  @MinLength(2, { message: 'Name must be at least 2 characters' })
  name?: string;

  @IsOptional()
  @IsEmail({}, { message: 'Invalid email format' })
  email?: string;
}

// NEW DTO for admin password change
class ChangePasswordDto {
  @IsString()
  @MinLength(6, { message: 'Current password is required' })
  currentPassword: string;

  @IsString()
  @MinLength(8, { message: 'New password must be at least 8 characters' })
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
    {
      message:
        'New password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
    },
  )
  newPassword: string;
}

// NEW DTO for creating new admin
class CreateAdminDto {
  @IsString()
  @MinLength(2, { message: 'Name must be at least 2 characters' })
  name: string;

  @IsEmail({}, { message: 'Invalid email format' })
  email: string;

  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters' })
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
    {
      message:
        'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
    },
  )
  password: string;
}

class ResendVerificationDto {
  @IsEmail({}, { message: 'Invalid email format' })
  email: string;
}

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  // ===================================================================
  // PUBLIC: Customer Registration (UPDATED)
  // ===================================================================
  @Post('register')
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto.username, dto.email, dto.password);
  }

  // ===================================================================
  // PUBLIC: Email Verification Endpoints (NEW)
  // ===================================================================
  @Get('verify-email')
  async verifyEmail(@Query('token') token: string) {
    if (!token) {
      throw new BadRequestException('Verification token is required');
    }
    return this.authService.verifyEmail(token);
  }

  @Post('resend-verification')
  async resendVerification(@Body() dto: ResendVerificationDto) {
    return this.authService.resendVerification(dto.email);
  }

  // ===================================================================
  // PUBLIC: Login (used by customer frontend) - UPDATED to handle verification
  // ===================================================================
  @Post('login')
  async login(@Body() dto: LoginDto) {
    return this.authService.login(dto.email, dto.password);
  }

  // ===================================================================
  // ADMIN-ONLY: Admin login (separate endpoint) - NO VERIFICATION NEEDED
  // ===================================================================
  @Post('admin/login')
  async adminLogin(@Body() dto: LoginDto) {
    const result = await this.authService.login(dto.email, dto.password);

    if (result.role !== Role.ADMIN) {
      throw new UnauthorizedException('Invalid admin credentials');
    }

    return result;
  }

  // ===================================================================
  // PROTECTED: Get current authenticated user profile (any logged-in user)
  // ===================================================================
  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getMe(@GetUser() user: any) {
    if (!user || !user.sub) {
      throw new BadRequestException('Invalid or missing user data in token');
    }

    return this.authService.getProfile(user.sub);
  }

  // ===================================================================
  // PROTECTED: Update current user profile (any logged-in user)
  // ===================================================================
  @Patch('me')
  @UseGuards(JwtAuthGuard)
  async updateMe(@GetUser() user: any, @Body() dto: UpdateProfileDto) {
    if (!user || !user.sub) {
      throw new BadRequestException('Invalid or missing user data in token');
    }

    return this.authService.updateProfile(user.sub, dto);
  }

  // ===================================================================
  // ADMIN-ONLY ROUTES (protected by Jwt + RolesGuard)
  // ===================================================================

  // Check if admin exists (public for setup, but can be restricted if needed)
  @Get('admin/check-exists')
  async checkAdminExists() {
    return this.authService.checkAdminExists();
  }

  // One-time admin creation (should be restricted or removed after first use)
  @Post('admin/setup')
  async setupAdmin(@Body() dto: AdminSetupDto) {
    return this.authService.setupAdmin(dto.fullName, dto.email, dto.password);
  }

  // ===================================================================
  // NEW ADMIN-SPECIFIC ENDPOINTS
  // ===================================================================

  // Get admin profile (admin only)
  @Get('admin/profile')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async getAdminProfile(@GetUser() user: any) {
    if (!user || !user.sub) {
      throw new BadRequestException('Invalid or missing user data in token');
    }

    return this.authService.getAdminProfile(user.sub);
  }

  // Update admin profile (admin only)
  @Put('admin/profile')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async updateAdminProfile(
    @GetUser() user: any,
    @Body() dto: UpdateAdminProfileDto,
  ) {
    if (!user || !user.sub) {
      throw new BadRequestException('Invalid or missing user data in token');
    }

    return this.authService.updateAdminProfile(user.sub, dto);
  }

  // Change admin password (admin only)
  @Put('admin/change-password')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async changeAdminPassword(
    @GetUser() user: any,
    @Body() dto: ChangePasswordDto,
  ) {
    if (!user || !user.sub) {
      throw new BadRequestException('Invalid or missing user data in token');
    }

    return this.authService.changeAdminPassword(
      user.sub,
      dto.currentPassword,
      dto.newPassword,
    );
  }

  // Create new admin (admin only)
  @Post('admin/create')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async createAdmin(@Body() dto: CreateAdminDto) {
    return this.authService.createAdmin(dto.name, dto.email, dto.password);
  }
}