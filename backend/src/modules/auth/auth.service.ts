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
import * as crypto from 'crypto';
// Add these imports for email service
import { Resend } from 'resend';
import { Role } from '@prisma/client'; // Add this import

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private resend: Resend;

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {
    // Initialize Resend email service if API key exists
    if (process.env.RESEND_API_KEY) {
      this.resend = new Resend(process.env.RESEND_API_KEY);
    }
  }

  // ===================================================================
  // Helper: Generate Verification Token
  // ===================================================================
  private generateVerificationToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  // ===================================================================
  // Helper: Send Verification Email
  // ===================================================================
  private async sendVerificationEmail(email: string, token: string): Promise<void> {
    try {
      const frontendUrl = process.env.APP_FRONTEND_URL || 'http://localhost:3000';
      const verificationLink = `${frontendUrl}/verify-email?token=${token}`;
      
      // 1. ALWAYS LOG TO CONSOLE FIRST
      console.log('\n════════════════════════════════════════════════════════════');
      console.log('📧 VERIFICATION EMAIL DEBUG');
      console.log('════════════════════════════════════════════════════════════');
      console.log(`To: ${email}`);
      console.log(`Link: ${verificationLink}`);
      console.log(`Token: ${token.substring(0, 20)}...`);
      console.log('════════════════════════════════════════════════════════════\n');
      
      const { SMTP_HOST, SMTP_USER, SMTP_PASS, SMTP_PORT } = process.env;
      
      // 2. Debug SMTP configuration
      console.log('🔧 SMTP CONFIGURATION:');
      console.log(`Host: ${SMTP_HOST || 'NOT SET'}`);
      console.log(`Port: ${SMTP_PORT || 'NOT SET'}`);
      console.log(`User: ${SMTP_USER || 'NOT SET'}`);
      console.log(`Pass: ${SMTP_PASS ? '***SET***' : 'NOT SET'}`);
      if (SMTP_PASS) {
        console.log(`Pass length: ${SMTP_PASS.length} characters`);
        console.log(`Has spaces: ${SMTP_PASS.includes(' ') ? 'YES ❌' : 'NO ✅'}`);
      }
      console.log('════════════════════════════════════════════════════════════\n');
      
      // 3. If no SMTP config, stop here
      if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
        console.log('❌ SMTP not configured - only console logging');
        console.log(`🔗 Verification link: ${verificationLink}`);
        return;
      }
      
      // 4. Check for spaces in password
      if (SMTP_PASS.includes(' ')) {
        console.log('❌ ERROR: Password contains spaces! Remove spaces.');
        console.log(`   Your password: "${SMTP_PASS}"`);
        console.log(`   Should be: "${SMTP_PASS.replace(/\s/g, '')}"`);
        console.log('🔗 Verification link (for testing):', verificationLink);
        return;
      }
      
      // 5. Try to send email
      console.log('🚀 Attempting to send email via Gmail SMTP...');
      
      const nodemailer = require('nodemailer');
      
      const transporter = nodemailer.createTransport({
        host: SMTP_HOST,
        port: parseInt(SMTP_PORT || '587'),
        secure: false,
        auth: {
          user: SMTP_USER,
          pass: SMTP_PASS,
        },
        tls: {
          rejectUnauthorized: false,
        },
      });
      
      // Test connection
      try {
        await transporter.verify();
        console.log('✅ SMTP connection successful!');
      } catch (verifyError) {
        console.log('❌ SMTP connection failed:', verifyError.message);
        console.log('🔗 Verification link (for testing):', verificationLink);
        return;
      }
      
      const mailOptions = {
        from: process.env.EMAIL_FROM || 'Bookstore <noreply@bookstore.com>',
        to: email,
        subject: 'Verify Your Email - Bookstore',
        text: `Verify your email: ${verificationLink}`,
        html: `<p>Verify your email: <a href="${verificationLink}">Click here</a></p>`,
      };
      
      await transporter.sendMail(mailOptions);
      console.log(`✅ Email sent successfully to ${email}!`);
      console.log('📫 Check your Gmail inbox.');
      
    } catch (error) {
      console.log('❌ ERROR in sendVerificationEmail:', error.message);
      
      // Still show the link for testing
      const frontendUrl = process.env.APP_FRONTEND_URL || 'http://localhost:3000';
      const verificationLink = `${frontendUrl}/verify-email?token=${token}`;
      console.log(`🔗 Verification link (for testing): ${verificationLink}`);
    }
  }

  // ===================================================================
  // PUBLIC SIGNUP (REGISTER) - UPDATED WITH EMAIL VERIFICATION
  // ===================================================================
  async register(username: string, email: string, password: string) {
    this.logger.log(`Signup attempt - Email: ${email}, Username: ${username || '(missing)'}`);

    try {
      if (!username || username.trim() === '') {
        this.logger.warn('Signup failed: Username is required but not provided');
        throw new BadRequestException('Username is required');
      }

      // Check if email already exists (including unverified)
      const existingEmail: any[] = await this.prisma.client.$queryRaw`
        SELECT id, "emailVerified" FROM users WHERE email = ${email} LIMIT 1
      `;
      
      if (existingEmail.length > 0) {
        const existingUser = existingEmail[0];
        
        // If email is already verified, reject
        if (existingUser.emailVerified) {
          this.logger.warn(`Signup failed: Email already in use - ${email}`);
          throw new ConflictException('This email is already registered');
        }
        
        // If email exists but not verified, allow re-registration (update existing)
        this.logger.log(`Re-registering unverified email: ${email}`);
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

      // Generate verification token
      const verificationToken = this.generateVerificationToken();
      const verificationTokenExpires = new Date();
      verificationTokenExpires.setHours(verificationTokenExpires.getHours() + 24); // 24 hours

      // Check if we're updating an existing unverified user or creating new
      if (existingEmail.length > 0 && !existingEmail[0].emailVerified) {
        // Update existing unverified user
        const updatedUserResult: any[] = await this.prisma.client.$queryRaw`
          UPDATE users 
          SET 
            username = ${username.trim()},
            "passwordHash" = ${passwordHash},
            "verificationToken" = ${verificationToken},
            "verificationTokenExpires" = ${verificationTokenExpires},
            "updatedAt" = CURRENT_TIMESTAMP
          WHERE email = ${email}
          RETURNING id, email, username, "fullName", "phoneNumber", role, "emailVerified"
        `;
        
        const updatedUser = updatedUserResult[0];
        this.logger.log(`Updated unverified user - ID: ${updatedUser.id}`);
      } else {
        // Create new user
        const newUserResult: any[] = await this.prisma.client.$queryRaw`
          INSERT INTO users (
            username,
            "fullName",
            email,
            "passwordHash",
            role,
            "phoneNumber",
            "emailVerified",
            "verificationToken",
            "verificationTokenExpires",
            "createdAt",
            "updatedAt"
          ) VALUES (
            ${username.trim()},
            ${''},
            ${email},
            ${passwordHash},
            'CUSTOMER',
            NULL,
            FALSE,
            ${verificationToken},
            ${verificationTokenExpires},
            CURRENT_TIMESTAMP,
            CURRENT_TIMESTAMP
          ) RETURNING id, email, username, "fullName", "phoneNumber", role, "emailVerified"
        `;

        const newUser = newUserResult[0];
        this.logger.log(`Signup successful! User created - ID: ${newUser.id}`);
      }

      // Send verification email
      await this.sendVerificationEmail(email, verificationToken);

      return {
        success: true,
        message: 'Account created! Please check your email to verify your account.',
        requiresVerification: true,
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
  // VERIFY EMAIL TOKEN
  // ===================================================================
  async verifyEmail(token: string) {
    this.logger.log(`Email verification attempt for token: ${token.substring(0, 10)}...`);

    try {
      const users: any[] = await this.prisma.client.$queryRaw`
        SELECT id, email, "verificationTokenExpires", "emailVerified"
        FROM users 
        WHERE "verificationToken" = ${token} 
        LIMIT 1
      `;
      
      if (users.length === 0) {
        this.logger.warn(`Verification failed: Invalid token`);
        throw new BadRequestException('Invalid or expired verification token');
      }
      
      const user = users[0];
      
      // Check if already verified
      if (user.emailVerified) {
        this.logger.log(`Email already verified for: ${user.email}`);
        return {
          success: true,
          message: 'Email is already verified. You can login now.',
          email: user.email,
        };
      }
      
      // Check token expiration
      const tokenExpires = new Date(user.verificationTokenExpires);
      if (tokenExpires < new Date()) {
        this.logger.warn(`Verification failed: Token expired for ${user.email}`);
        throw new BadRequestException('Verification token has expired. Please request a new one.');
      }
      
      // Verify the email
      await this.prisma.client.$queryRaw`
        UPDATE users 
        SET 
          "emailVerified" = TRUE,
          "verifiedAt" = CURRENT_TIMESTAMP,
          "verificationToken" = NULL,
          "verificationTokenExpires" = NULL,
          "updatedAt" = CURRENT_TIMESTAMP
        WHERE id = ${user.id}
      `;
      
      this.logger.log(`Email verified successfully for: ${user.email}`);
      
      return {
        success: true,
        message: 'Email verified successfully! You can now login.',
        email: user.email,
      };
    } catch (error: any) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      this.logger.error(`Email verification error: ${error.message}`);
      throw new BadRequestException('Failed to verify email');
    }
  }

  // ===================================================================
  // RESEND VERIFICATION EMAIL
  // ===================================================================
  async resendVerification(email: string) {
    this.logger.log(`Resend verification request for: ${email}`);

    try {
      const users: any[] = await this.prisma.client.$queryRaw`
        SELECT id, "emailVerified", "verificationTokenExpires"
        FROM users 
        WHERE email = ${email} 
        LIMIT 1
      `;
      
      if (users.length === 0) {
        this.logger.warn(`Resend failed: User not found - ${email}`);
        throw new NotFoundException('User not found');
      }
      
      const user = users[0];
      
      // Check if already verified
      if (user.emailVerified) {
        this.logger.log(`Email already verified for: ${email}`);
        throw new BadRequestException('Email is already verified');
      }
      
      // Check if recent token exists and hasn't expired
      if (user.verificationTokenExpires) {
        const tokenExpires = new Date(user.verificationTokenExpires);
        const now = new Date();
        const timeDiff = tokenExpires.getTime() - now.getTime();
        const minutesDiff = timeDiff / (1000 * 60);
        
        // If token is still valid for more than 5 minutes, don't send new one
        if (minutesDiff > 5) {
          this.logger.log(`Recent verification token still valid for ${email}`);
          return {
            success: true,
            message: 'A verification email was recently sent. Please check your inbox.',
          };
        }
      }
      
      // Generate new token
      const verificationToken = this.generateVerificationToken();
      const verificationTokenExpires = new Date();
      verificationTokenExpires.setHours(verificationTokenExpires.getHours() + 24);
      
      // Update user with new token
      await this.prisma.client.$queryRaw`
        UPDATE users 
        SET 
          "verificationToken" = ${verificationToken},
          "verificationTokenExpires" = ${verificationTokenExpires},
          "updatedAt" = CURRENT_TIMESTAMP
        WHERE id = ${user.id}
      `;
      
      // Send new verification email
      await this.sendVerificationEmail(email, verificationToken);
      
      this.logger.log(`New verification email sent to: ${email}`);
      
      return {
        success: true,
        message: 'Verification email resent successfully. Please check your inbox.',
      };
    } catch (error: any) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      this.logger.error(`Resend verification error for ${email}: ${error.message}`);
      throw new BadRequestException('Failed to resend verification email');
    }
  }

  // ===================================================================
  // LOGIN - UPDATED TO CHECK EMAIL VERIFICATION
  // ===================================================================
  async login(email: string, password: string) {
    this.logger.log(`Login attempt for email: ${email}`);

    try {
      const users: any[] = await this.prisma.client.$queryRaw`
        SELECT id, email, "fullName", "phoneNumber", "passwordHash", role, username, "emailVerified"
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

      // CHECK EMAIL VERIFICATION
      if (!user.emailVerified) {
        this.logger.warn(`Login blocked: Email not verified for ${email}`);
        throw new UnauthorizedException('Please verify your email before logging in');
      }
      
      this.logger.log(`Login successful: ${email} (ID: ${user.id}, Role: ${user.role})`);

      const payload = { 
        sub: user.id, 
        email: user.email, 
        role: user.role,
        username: user.username || null,
        fullName: user.fullName || '',
        phoneNumber: user.phoneNumber || null,
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
          emailVerified: user.emailVerified, // Include verification status
        },
        message: 'Login successful',
      };
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        // Check if error is due to unverified email
        if (error.message.includes('verify your email')) {
          throw new UnauthorizedException('EMAIL_NOT_VERIFIED');
        }
        throw error;
      }
      this.logger.error(`Login error for ${email}: ${error.message}`);
      throw new UnauthorizedException('Login failed');
    }
  }

  // ===================================================================
  // GET CURRENT USER PROFILE (fresh from DB) - UPDATED
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
        role: true,
        emailVerified: true, // Include verification status
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
        role: user.role,
        emailVerified: user.emailVerified,
      },
    };
  }

  // ===================================================================
  // ADMIN CHECK & SETUP - NO EMAIL VERIFICATION NEEDED
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
      
      // Admin accounts don't need email verification
      const newAdmin: any[] = await this.prisma.client.$queryRaw`
        INSERT INTO users (
          username, 
          "fullName", 
          email, 
          "passwordHash", 
          role,
          "phoneNumber",
          "emailVerified",  # Admin accounts are auto-verified
          "createdAt",
          "updatedAt"
        ) VALUES (
          ${finalUsername}, 
          ${fullName}, 
          ${email}, 
          ${passwordHash}, 
          'ADMIN',
          NULL,
          TRUE,  # Auto-verify admin
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
        phoneNumber: null,
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

  // ===================================================================
  // UPDATE USER PROFILE (unchanged)
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
          emailVerified: true,
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
          emailVerified: currentUser.emailVerified,
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
          emailVerified: true,
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
          emailVerified: updatedUser.emailVerified,
        },
      };
    } catch (error) {
      this.logger.error(`Failed to update profile for user ${userId}: ${error.message}`);
      throw new BadRequestException('Failed to update profile');
    }
  }

  // ===================================================================
  // NEW METHODS FOR ADMIN MANAGEMENT
  // ===================================================================

  // ===================================================================
  // GET ADMIN PROFILE (admin only)
  // ===================================================================
  async getAdminProfile(userId: number) {
    this.logger.log(`Fetching admin profile for user ID: ${userId}`);

    const user = await this.prisma.prisma.user.findUnique({
      where: { 
        id: userId,
        role: Role.ADMIN // Ensure only admin can access
      },
      select: {
        id: true,
        email: true,
        username: true,
        fullName: true,
        phoneNumber: true,
        role: true,
        emailVerified: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      this.logger.warn(`Admin profile fetch failed: Admin not found - ID: ${userId}`);
      throw new NotFoundException('Admin not found');
    }

    return {
      success: true,
      data: {
        id: user.id,
        email: user.email,
        username: user.username || null,
        name: user.fullName || '',
        phoneNumber: user.phoneNumber || '',
        role: user.role,
        emailVerified: user.emailVerified,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    };
  }

  // ===================================================================
  // UPDATE ADMIN PROFILE (admin only)
  // ===================================================================
  async updateAdminProfile(
    userId: number,
    dto: { name?: string; email?: string },
  ) {
    this.logger.log(`Updating admin profile for user ID: ${userId}`);

    const admin = await this.prisma.prisma.user.findUnique({
      where: { 
        id: userId,
        role: Role.ADMIN 
      },
    });

    if (!admin) {
      this.logger.warn(`Update admin failed: Admin not found - ID: ${userId}`);
      throw new NotFoundException('Admin not found');
    }

    const data: any = {};
    
    // Check if email is being changed
    if (dto.email && dto.email !== admin.email) {
      // Check if new email is already taken
      const existingEmail = await this.prisma.prisma.user.findUnique({
        where: { email: dto.email },
      });
      
      if (existingEmail && existingEmail.id !== userId) {
        throw new ConflictException('Email already in use');
      }
      data.email = dto.email;
    }
    
    if (dto.name !== undefined) {
      data.fullName = dto.name.trim() || '';
    }

    if (Object.keys(data).length === 0) {
      return this.getAdminProfile(userId);
    }

    try {
      const updatedAdmin = await this.prisma.prisma.user.update({
        where: { 
          id: userId,
          role: Role.ADMIN 
        },
        data,
        select: {
          id: true,
          email: true,
          username: true,
          fullName: true,
          phoneNumber: true,
          role: true,
          emailVerified: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      this.logger.log(`Admin profile updated successfully for user ID: ${userId}`);

      return {
        success: true,
        data: {
          id: updatedAdmin.id,
          email: updatedAdmin.email,
          username: updatedAdmin.username || null,
          name: updatedAdmin.fullName || '',
          phoneNumber: updatedAdmin.phoneNumber || '',
          role: updatedAdmin.role,
          emailVerified: updatedAdmin.emailVerified,
          createdAt: updatedAdmin.createdAt,
          updatedAt: updatedAdmin.updatedAt,
        },
        message: 'Profile updated successfully',
      };
    } catch (error) {
      this.logger.error(`Failed to update admin profile for user ${userId}: ${error.message}`);
      throw new BadRequestException('Failed to update profile');
    }
  }

  // ===================================================================
  // CHANGE ADMIN PASSWORD (admin only)
  // ===================================================================
  async changeAdminPassword(
    userId: number,
    currentPassword: string,
    newPassword: string,
  ) {
    this.logger.log(`Changing password for admin ID: ${userId}`);

    const admin = await this.prisma.prisma.user.findUnique({
      where: { 
        id: userId,
        role: Role.ADMIN 
      },
      select: {
        id: true,
        email: true,
        passwordHash: true,
      },
    });

    if (!admin) {
      this.logger.warn(`Change password failed: Admin not found - ID: ${userId}`);
      throw new NotFoundException('Admin not found');
    }

    if (!admin.passwordHash) {
      this.logger.warn(`Change password failed: No password hash for admin ${admin.email}`);
      throw new BadRequestException('Password not set for this account');
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(
      currentPassword,
      admin.passwordHash,
    );

    if (!isCurrentPasswordValid) {
      this.logger.warn(`Change password failed: Current password incorrect for admin ${admin.email}`);
      throw new UnauthorizedException('Current password is incorrect');
    }

    // Validate new password strength
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(newPassword)) {
      throw new BadRequestException(
        'New password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
      );
    }

    // Hash new password
    const newPasswordHash = await bcrypt.hash(newPassword, 10);

    try {
      await this.prisma.prisma.user.update({
        where: { 
          id: userId,
          role: Role.ADMIN 
        },
        data: {
          passwordHash: newPasswordHash,
          updatedAt: new Date(),
        },
      });

      this.logger.log(`Password changed successfully for admin: ${admin.email}`);

      return {
        success: true,
        message: 'Password changed successfully',
      };
    } catch (error) {
      this.logger.error(`Failed to change password for admin ${admin.email}: ${error.message}`);
      throw new BadRequestException('Failed to change password');
    }
  }

  // ===================================================================
  // CREATE NEW ADMIN (admin only)
  // ===================================================================
  async createAdmin(name: string, email: string, password: string) {
    this.logger.log(`Creating new admin by existing admin: ${email}`);

    try {
      // Check if email already exists
      const existingEmail: any[] = await this.prisma.client.$queryRaw`
        SELECT id FROM users WHERE email = ${email} LIMIT 1
      `;
      
      if (existingEmail.length > 0) {
        throw new ConflictException('Email already registered');
      }
      
      if (password.length < 8) {
        throw new BadRequestException('Password must be at least 8 characters');
      }
      
      // Validate password strength
      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
      if (!passwordRegex.test(password)) {
        throw new BadRequestException(
          'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
        );
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
      
      // Create new admin (auto-verified)
      const newAdmin: any[] = await this.prisma.client.$queryRaw`
        INSERT INTO users (
          username, 
          "fullName", 
          email, 
          "passwordHash", 
          role,
          "phoneNumber",
          "emailVerified",
          "createdAt",
          "updatedAt"
        ) VALUES (
          ${finalUsername}, 
          ${name}, 
          ${email}, 
          ${passwordHash}, 
          'ADMIN',
          NULL,
          TRUE,
          CURRENT_TIMESTAMP,
          CURRENT_TIMESTAMP
        ) RETURNING id, email, "fullName", role, "createdAt"
      `;
      
      const admin = newAdmin[0];
      this.logger.log(`New admin created: ${email} (ID: ${admin.id})`);
      
      return {
        success: true,
        data: {
          id: admin.id,
          email: admin.email,
          username: finalUsername,
          name: admin.fullName,
          role: admin.role,
          createdAt: admin.createdAt,
        },
        message: 'New admin created successfully',
      };
    } catch (error) {
      if (error instanceof ConflictException || error instanceof BadRequestException) {
        throw error;
      }
      this.logger.error(`Create admin error: ${error.message}`);
      throw new BadRequestException('Failed to create admin account');
    }
  }
}