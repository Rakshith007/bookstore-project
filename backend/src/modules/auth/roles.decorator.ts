// src/auth/roles.decorator.ts
import { SetMetadata } from '@nestjs/common';
import { Role } from '@prisma/client'; // ← This gives us Role.ADMIN, Role.WAREHOUSE, etc.

export const ROLES_KEY = 'roles';
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);