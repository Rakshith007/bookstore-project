// backend/src/modules/books/inventory/inventory.controller.ts

import {
  Controller,
  Patch,
  Param,
  Body,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { JwtAuthGuard } from 'src/modules/auth/jwt-auth.guard';

@Controller('books')  // ← This makes routes /books/:id/inventory
@UseGuards(JwtAuthGuard)
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Patch(':id/inventory')
  async updateInventory(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { price?: number; addedStock?: number },
  ) {
    return this.inventoryService.partialUpdate(id, body);
  }
}