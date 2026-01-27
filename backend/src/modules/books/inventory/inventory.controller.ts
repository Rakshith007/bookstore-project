// backend/src/modules/books/inventory/inventory.controller.ts
import {
  Controller,
  Patch,
  Param,
  Body,
  ParseIntPipe,
  UseGuards,
  ForbiddenException, // ← Optional: for better error messages
} from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { JwtAuthGuard } from 'src/modules/auth/jwt-auth.guard';
import { RolesGuard } from 'src/modules/auth/roles.guard'; // ← Add this import
import { Roles } from 'src/modules/auth/roles.decorator'; // ← Add this import
import { Role } from '@prisma/client'; // ← Add this import

@Controller('books')  // Routes: /books/:id/inventory
@UseGuards(JwtAuthGuard, RolesGuard)  // ← Add RolesGuard here
@Roles(Role.ADMIN)                    // ← Restrict entire controller to ADMIN only
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Patch(':id/inventory')
  async updateInventory(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { price?: number; addedStock?: number },
  ) {
    // Optional: extra safety check (though guard already enforces role)
    // if (user.role !== Role.ADMIN) {
    //   throw new ForbiddenException('Only admins can update inventory');
    // }

    return this.inventoryService.partialUpdate(id, body);
  }
}