// backend/src/auth/jwt-auth.guard.ts
import {
  Injectable,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext) {
    return super.canActivate(context);
  }

  handleRequest(err: any, user: any, info: any) {
    // If there's an error or no user, throw a clear message
    if (err || !user) {
      // More specific messages based on the info object from Passport
      if (info?.name === 'TokenExpiredError') {
        throw new UnauthorizedException('Token expired');
      }
      if (info?.name === 'JsonWebTokenError') {
        throw new UnauthorizedException('Invalid token');
      }
      if (info?.message === 'No auth token') {
        throw new UnauthorizedException('Missing token');
      }

      // Fallback for any other case
      throw err || new UnauthorizedException('Invalid or missing token');
    }

    return user;
  }
}