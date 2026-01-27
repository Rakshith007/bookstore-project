// src/auth/roles.guard.ts
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '@prisma/client';
import { ROLES_KEY } from './roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // Get the required roles from the @Roles() decorator
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // If no @Roles() decorator is present → allow access
    if (!requiredRoles) {
      return true;
    }

    // Get the user from request (set by JwtStrategy)
    const { user } = context.switchToHttp().getRequest();

    // If no user or no role → deny
    if (!user || !user.role) {
      return false;
    }

    // Check if user's role is in the allowed list
    return requiredRoles.includes(user.role);
  }
}