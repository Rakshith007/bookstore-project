// src/modules/users/users.controller.ts
import {
  Controller,
  Get,
  Delete,
  Param,
  UseGuards,
  BadRequestException,    // ← ADDED THIS IMPORT
  ForbiddenException,     // ← Optional but good to have
  NotFoundException,      // ← Optional but good to have
} from '@nestjs/common';
import { UsersService, UserDashboardView } from './users.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';           // ← Make sure this is imported
import { Roles } from '../auth/roles.decorator';            // ← Make sure this is imported
import { Role } from '@prisma/client';                      // ← Make sure this is imported
import { GetUser } from '../auth/get-user.decorator';

@Controller('users')  // Base path: /users
@UseGuards(JwtAuthGuard, RolesGuard)  // ← Protects ALL endpoints (login + role check)
@Roles(Role.ADMIN)                    // ← Restricts entire controller to ADMIN only
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // GET /users - List all users (admin only)
  @Get()
  async findAll(): Promise<UserDashboardView[]> {
    return this.usersService.findAll();
  }

  // DELETE /users/:id - Delete a user (admin only)
  @Delete(':id')
  async delete(
    @Param('id') id: string,
    @GetUser() currentUser: any,  // ← Current logged-in admin
  ) {
    // Prevent admin from deleting themselves (good security practice)
    if (currentUser?.sub === id) {
      throw new BadRequestException('Cannot delete your own account');
    }

    const deleted = await this.usersService.delete(id);

    if (!deleted) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return { 
      success: true, 
      message: `User ${id} deleted successfully` 
    };
  }
}