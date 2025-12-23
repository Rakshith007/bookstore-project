// backend/src/modules/books/inventory/inventory.service.ts
// Dedicated service for Inventory Check page operations only

import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class InventoryService {
  constructor(private prisma: PrismaService) {}

  // Transform book to match frontend format (same as in BooksService)
  private transformBook(book: any) {
    const metadata = book.metadata as any || {};
    const priceNumber = Number(book.price);

    return {
      id: book.id,
      title: book.title,
      author: book.author?.name || 'Unknown',
      category: book.genre?.name || 'Unknown',
      genre: book.genre?.name || 'Unknown',
      price: priceNumber,
      sellingPrice: priceNumber,
      mrp: metadata.mrp || priceNumber,
      stock: book.stockQuantity,
      stockQuantity: book.stockQuantity,
      status: book.status,
      coverImage: book.coverImageUrl,
      isbn: book.barcode,
      publisher: metadata.publisher,
      publishedYear: metadata.publishedYear,
      description: book.description,
      sku: book.sku,
      averageRating: Number(book.averageRating),
      totalReviews: book.totalReviews,
      restockAlertLevel: book.restockAlertLevel,
    };
  }

  // Partial update: price and/or add stock (atomic)
  async partialUpdate(
    id: number,
    updates: { price?: number; addedStock?: number },
  ) {
    const book = await this.prisma.client.book.findUnique({
      where: { id },
      include: { author: true, genre: true },
    });

    if (!book) {
      throw new NotFoundException(`Book with ID ${id} not found`);
    }

    const updateData: any = {};

    if (updates.price !== undefined) {
      if (updates.price < 0) {
        throw new BadRequestException('Price cannot be negative');
      }
      updateData.price = updates.price;
    }

    if (updates.addedStock !== undefined) {
      if (updates.addedStock < 0) {
        throw new BadRequestException('Added stock cannot be negative');
      }
      if (updates.addedStock > 0) {
        updateData.stockQuantity = { increment: updates.addedStock };
      }
    }

    if (Object.keys(updateData).length === 0) {
      return {
        success: true,
        data: this.transformBook(book),
        message: 'No changes applied',
      };
    }

    const updatedBook = await this.prisma.client.book.update({
      where: { id },
      data: updateData,
      include: { author: true, genre: true },
    });

    return {
      success: true,
      data: this.transformBook(updatedBook),
      message: 'Inventory updated successfully',
    };
  }
}