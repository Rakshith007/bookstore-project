// backend/src/auth/auth.module.ts

import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import { JwtStrategy } from './jwt.strategy';         // ← NEW: JWT validation strategy
import { JwtAuthGuard } from './jwt-auth.guard';       // ← NEW: Guard for @UseGuards()
import { RolesGuard } from './roles.guard'; // ← ADD THIS

@Module({
  imports: [
    JwtModule.registerAsync({
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '24h' },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    PrismaService,
    JwtStrategy,      // ← Required for Passport to validate tokens
    JwtAuthGuard,     // ← Optional but recommended
    RolesGuard,           // ← ADD THIS
  ],
  exports: [
    JwtAuthGuard,     // ← IMPORTANT: Allows other modules (like BooksModule) to use the guard
    RolesGuard,           // ← ALSO EXPORT IT (good practice)
  ],
})
export class AuthModule {}