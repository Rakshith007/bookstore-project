// backend/src/auth/jwt-auth.guard.ts
// Standard JWT Auth Guard for protecting routes

import {
  Injectable,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext) {
    // You can add custom logic here later if needed
    return super.canActivate(context);
  }

  handleRequest(err: any, user: any, info: any) {
    // This is called if authentication fails
    if (err || !user) {
      throw err || new UnauthorizedException('Invalid or missing token');
    }
    // Check role if needed (optional)
    // if (user.role !== 'ADMIN') {
    //   throw new UnauthorizedException('Access denied. Admins only.');
    // }
    return user;
  }
}