// backend/src/modules/books/books.module.ts
import { Module } from '@nestjs/common';
import { BooksService } from './books.service';
import { BooksController } from './books.controller';
import { PrismaService } from '../../prisma/prisma.service'; // Import it
import { InventoryModule } from './inventory/inventory.module';  // ← MUST BE HERE

@Module({
  imports: [InventoryModule],  // ← This registers the /books/:id/inventory route
  providers: [BooksService, PrismaService], // Add it here
  controllers: [BooksController],
  exports: [BooksService],  // Optional, if used elsewhere
})
export class BooksModule {}