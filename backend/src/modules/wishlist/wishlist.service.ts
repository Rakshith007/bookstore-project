import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class WishlistService {
  constructor(private prisma: PrismaService) {}

  // Get all wishlist items for a user
  async getWishlist(userId: number) {
    const items = await this.prisma.prisma.wishlist.findMany({
      where: { userId },
      include: {
        book: {
          include: {
            author: { select: { name: true } },
            genre: { select: { name: true } },
          },
        },
      },
      orderBy: { addedAt: 'desc' },
    });

    return {
      success: true,
      data: items,
    };
  }

  // Add book to wishlist
  async addToWishlist(userId: number, bookId: number) {
    // Check if book exists
    const book = await this.prisma.prisma.book.findUnique({
      where: { id: bookId },
      select: { id: true, status: true },
    });

    if (!book) {
      throw new NotFoundException('Book not found');
    }

    if (book.status !== 'available') {
      throw new BadRequestException('This book is currently unavailable');
    }

    // Check if already in wishlist (using composite key)
    const existing = await this.prisma.prisma.wishlist.findUnique({
      where: {
        userId_bookId: { userId, bookId },
      },
    });

    if (existing) {
      throw new BadRequestException('Book is already in your wishlist');
    }

    // Add to wishlist
    await this.prisma.prisma.wishlist.create({
      data: {
        userId,
        bookId,
      },
    });

    return { success: true, message: 'Book added to wishlist' };
  }

  // Remove book from wishlist
  async removeFromWishlist(userId: number, bookId: number) {
    // Find the wishlist entry using composite key
    const item = await this.prisma.prisma.wishlist.findUnique({
      where: {
        userId_bookId: { userId, bookId },
      },
    });

    if (!item) {
      throw new NotFoundException('Wishlist item not found');
    }

    // Delete it
    await this.prisma.prisma.wishlist.delete({
      where: {
        userId_bookId: { userId, bookId },
      },
    });

    return { success: true, message: 'Book removed from wishlist' };
  }
}