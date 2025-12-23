import {
  Injectable,
  UnauthorizedException,
  Logger,
  ConflictException,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  // ===================================================================
  // PUBLIC SIGNUP (REGISTER) - For regular customers
  // ===================================================================
  async register(username: string, email: string, password: string) {
    this.logger.log(`Signup attempt - Email: ${email}, Username: ${username || '(missing)'}`);

    try {
      if (!username || username.trim() === '') {
        this.logger.warn('Signup failed: Username is required but not provided');
        throw new BadRequestException('Username is required');
      }

      const existingEmail: any[] = await this.prisma.client.$queryRaw`
        SELECT id FROM users WHERE email = ${email} LIMIT 1
      `;
      if (existingEmail.length > 0) {
        this.logger.warn(`Signup failed: Email already in use - ${email}`);
        throw new ConflictException('This email is already registered');
      }

      const existingUsername: any[] = await this.prisma.client.$queryRaw`
        SELECT id FROM users WHERE username = ${username.trim()} LIMIT 1
      `;
      if (existingUsername.length > 0) {
        this.logger.warn(`Signup failed: Username already taken - ${username}`);
        throw new ConflictException('This username is already taken');
      }

      if (!password || password.length < 6) {
        this.logger.warn('Signup failed: Password too short');
        throw new BadRequestException('Password must be at least 6 characters long');
      }

      const passwordHash = await bcrypt.hash(password, 10);
      this.logger.debug('Password hashed successfully');

      const newUserResult: any[] = await this.prisma.client.$queryRaw`
        INSERT INTO users (
          username,
          "fullName",
          email,
          "passwordHash",
          role,
          "phoneNumber",
          "createdAt",
          "updatedAt"
        ) VALUES (
          ${username.trim()},
          ${''},
          ${email},
          ${passwordHash},
          'CUSTOMER',
          NULL,
          CURRENT_TIMESTAMP,
          CURRENT_TIMESTAMP
        ) RETURNING id, email, username, "fullName", "phoneNumber", role
      `;

      const newUser = newUserResult[0];
      this.logger.log(`Signup successful! User created - ID: ${newUser.id}`);

      const payload = {
        sub: newUser.id,
        email: newUser.email,
        role: newUser.role,
        username: newUser.username,
        fullName: newUser.fullName || '',
      };
      const access_token = this.jwtService.sign(payload);

      return {
        access_token,
        role: newUser.role,
        user: {
          id: newUser.id,
          email: newUser.email,
          username: newUser.username,
          fullName: newUser.fullName || '',
          phoneNumber: newUser.phoneNumber || '',
        },
        message: 'Account created successfully',
      };
    } catch (error: any) {
      if (error instanceof ConflictException || error instanceof BadRequestException) {
        throw error;
      }
      this.logger.error(`Unexpected signup error for ${email}: ${error.message}`);
      this.logger.error('Stack trace:', error.stack);
      throw new BadRequestException('Registration failed. Please try again.');
    }
  }

  // ===================================================================
  // LOGIN
  // ===================================================================
  async login(email: string, password: string) {
    this.logger.log(`Login attempt for email: ${email}`);

    try {
      const users: any[] = await this.prisma.client.$queryRaw`
        SELECT id, email, "fullName", "phoneNumber", "passwordHash", role, username
        FROM users 
        WHERE email = ${email} 
        LIMIT 1
      `;
      
      if (users.length === 0) {
        this.logger.warn(`Login failed: No user found with email ${email}`);
        throw new UnauthorizedException('Invalid credentials');
      }
      
      const user = users[0];
      
      if (!user.passwordHash) {
        this.logger.warn(`Login failed: No password hash for user ${email}`);
        throw new UnauthorizedException('No password set for this user');
      }
      
      const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
      
      if (!isPasswordValid) {
        this.logger.warn(`Login failed: Invalid password for ${email}`);
        throw new UnauthorizedException('Invalid credentials');
      }
      
      this.logger.log(`Login successful: ${email} (ID: ${user.id}, Role: ${user.role})`);

      const payload = { 
        sub: user.id, 
        email: user.email, 
        role: user.role,
        username: user.username || null,
        fullName: user.fullName || '',
      };
      const token = this.jwtService.sign(payload);
      
      return {
        access_token: token,
        role: user.role,
        user: {
          id: user.id,
          email: user.email,
          username: user.username || null,
          fullName: user.fullName || '',
          phoneNumber: user.phoneNumber || '',
        },
        message: 'Login successful',
      };
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      this.logger.error(`Login error for ${email}: ${error.message}`);
      throw new UnauthorizedException('Login failed');
    }
  }

  // ===================================================================
  // GET CURRENT USER PROFILE (used in checkout)
  // ===================================================================
  async getProfile(userId: number) {
    this.logger.log(`Fetching profile for user ID: ${userId}`);

    const user = await this.prisma.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        username: true,
        fullName: true,
        phoneNumber: true,
      },
    });

    if (!user) {
      this.logger.warn(`Profile fetch failed: User not found - ID: ${userId}`);
      throw new NotFoundException('User not found');
    }

    return {
      success: true,
      data: {
        id: user.id,
        email: user.email,
        username: user.username || null,
        fullName: user.fullName || '',
        phoneNumber: user.phoneNumber || '',
      },
    };
  }

  // ===================================================================
  // UPDATE USER PROFILE (called when saving address in checkout)
  // ===================================================================
  async updateProfile(userId: number, dto: { fullName?: string; phoneNumber?: string }) {
    this.logger.log(`Updating profile for user ID: ${userId}`);

    const data: any = {};
    if (dto.fullName !== undefined) {
      data.fullName = dto.fullName.trim() || '';
    }
    if (dto.phoneNumber !== undefined) {
      data.phoneNumber = dto.phoneNumber.trim() || null;
    }

    // Allow empty update (no change) without throwing error
    if (Object.keys(data).length === 0) {
      this.logger.log(`No profile changes for user ID: ${userId}`);
      const currentUser = await this.prisma.prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          username: true,
          fullName: true,
          phoneNumber: true,
        },
      });

      if (!currentUser) {
        throw new NotFoundException('User not found');
      }

      return {
        success: true,
        data: {
          id: currentUser.id,
          email: currentUser.email,
          username: currentUser.username || null,
          fullName: currentUser.fullName || '',
          phoneNumber: currentUser.phoneNumber || '',
        },
      };
    }

    try {
      const updatedUser = await this.prisma.prisma.user.update({
        where: { id: userId },
        data,
        select: {
          id: true,
          email: true,
          username: true,
          fullName: true,
          phoneNumber: true,
        },
      });

      this.logger.log(`Profile updated successfully for user ID: ${userId}`);

      return {
        success: true,
        data: {
          id: updatedUser.id,
          email: updatedUser.email,
          username: updatedUser.username || null,
          fullName: updatedUser.fullName || '',
          phoneNumber: updatedUser.phoneNumber || '',
        },
      };
    } catch (error) {
      this.logger.error(`Failed to update profile for user ${userId}: ${error.message}`);
      throw new BadRequestException('Failed to update profile');
    }
  }

  // ===================================================================
  // ADMIN CHECK & SETUP (unchanged)
  // ===================================================================
  async checkAdminExists() {
    try {
      const result: any[] = await this.prisma.client.$queryRaw`
        SELECT id, email, role 
        FROM users 
        WHERE role = 'ADMIN' 
        LIMIT 1
      `;
      
      const adminExists = result.length > 0;
      this.logger.log(`Admin exists: ${adminExists}`);
      
      return {
        exists: adminExists,
        message: adminExists ? 'Admin account exists' : 'No admin account found'
      };
    } catch (error: any) {
      this.logger.error(`Error checking admin: ${error.message}`);
      return {
        exists: false,
        message: 'Error checking admin status'
      };
    }
  }

  async setupAdmin(fullName: string, email: string, password: string) {
    try {
      const existingAdmin: any[] = await this.prisma.client.$queryRaw`
        SELECT id FROM users WHERE role = 'ADMIN' LIMIT 1
      `;
      
      if (existingAdmin.length > 0) {
        throw new ConflictException('Admin account already exists');
      }
      
      const existingEmail: any[] = await this.prisma.client.$queryRaw`
        SELECT id FROM users WHERE email = ${email} LIMIT 1
      `;
      
      if (existingEmail.length > 0) {
        throw new BadRequestException('Email already registered');
      }
      
      if (password.length < 6) {
        throw new BadRequestException('Password must be at least 6 characters');
      }
      
      const username = email.split('@')[0];
      
      const existingUsername: any[] = await this.prisma.client.$queryRaw`
        SELECT id FROM users WHERE username = ${username} LIMIT 1
      `;
      
      let finalUsername = username;
      if (existingUsername.length > 0) {
        finalUsername = `${username}${Math.floor(Math.random() * 1000)}`;
      }
      
      const passwordHash = await bcrypt.hash(password, 10);
      
      const newAdmin: any[] = await this.prisma.client.$queryRaw`
        INSERT INTO users (
          username, 
          "fullName", 
          email, 
          "passwordHash", 
          role,
          "phoneNumber",
          "createdAt",
          "updatedAt"
        ) VALUES (
          ${finalUsername}, 
          ${fullName}, 
          ${email}, 
          ${passwordHash}, 
          'ADMIN',
          NULL,
          CURRENT_TIMESTAMP,
          CURRENT_TIMESTAMP
        ) RETURNING id, email, "fullName", role
      `;
      
      const admin = newAdmin[0];
      this.logger.log(`Created admin: ${email} (ID: ${admin.id})`);
      
      const payload = { 
        sub: admin.id, 
        email: admin.email, 
        role: admin.role,
        username: finalUsername,
        fullName: admin.fullName,
      };
      const token = this.jwtService.sign(payload);
      
      return {
        access_token: token,
        role: admin.role,
        user: {
          id: admin.id,
          email: admin.email,
          username: finalUsername,
          fullName: admin.fullName
        },
        message: 'Admin account created successfully'
      };
    } catch (error) {
      if (error instanceof ConflictException || error instanceof BadRequestException) {
        throw error;
      }
      this.logger.error(`Setup admin error: ${error.message}`);
      this.logger.error(`Full error:`, error);
      throw new BadRequestException('Failed to create admin account');
    }
  }
}