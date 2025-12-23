import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { UpdateCartDto } from './dto/update-cart.dto';

@Injectable()
export class CartService {
  constructor(private prisma: PrismaService) {}

  // Add or update item in cart
  async addToCart(userId: number, dto: AddToCartDto) {
    const { bookId } = dto;
    const quantity = dto.quantity ?? 1; // ← Fix: default to 1

    // Validate book exists and has stock
    const book = await this.prisma.prisma.book.findUnique({
      where: { id: bookId },
      select: { id: true, stockQuantity: true, price: true, status: true },
    });

    if (!book) {
      throw new NotFoundException('Book not found');
    }

    if (book.status !== 'available') {
      throw new BadRequestException('This book is currently unavailable');
    }

    if (book.stockQuantity < quantity) {
      throw new BadRequestException('Not enough stock available');
    }

    // Check if item already in cart — use findFirst since no composite key
    const existingItem = await this.prisma.prisma.cartItem.findFirst({
      where: {
        userId,
        bookId,
      },
    });

    if (existingItem) {
      // Update quantity
      const newQuantity = existingItem.quantity + quantity;
      if (book.stockQuantity < newQuantity) {
        throw new BadRequestException('Not enough stock for requested quantity');
      }

      const updated = await this.prisma.prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: newQuantity },
        include: {
          book: {
            include: {
              author: { select: { name: true } },
              genre: { select: { name: true } },
            },
          },
        },
      });

      return this.formatCartItem(updated);
    }

    // Create new cart item
    const cartItem = await this.prisma.prisma.cartItem.create({
      data: {
        userId,
        bookId,
        quantity,
      },
      include: {
        book: {
          include: {
            author: { select: { name: true } },
            genre: { select: { name: true } },
          },
        },
      },
    });

    return this.formatCartItem(cartItem);
  }

  // Get user's cart
  async getCart(userId: number) {
    const items = await this.prisma.prisma.cartItem.findMany({
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
      data: items.map(this.formatCartItem),
      count: items.length,
    };
  }

  // Update quantity
  async updateQuantity(userId: number, cartItemId: number, dto: UpdateCartDto) {
    const cartItem = await this.prisma.prisma.cartItem.findUnique({
      where: { id: cartItemId },
      include: { book: true },
    });

    if (!cartItem || cartItem.userId !== userId) {
      throw new NotFoundException('Cart item not found');
    }

    if (cartItem.book.stockQuantity < dto.quantity) {
      throw new BadRequestException('Not enough stock available');
    }

    const updated = await this.prisma.prisma.cartItem.update({
      where: { id: cartItemId },
      data: { quantity: dto.quantity },
      include: {
        book: {
          include: {
            author: { select: { name: true } },
            genre: { select: { name: true } },
          },
        },
      },
    });

    return this.formatCartItem(updated);
  }

  // Remove item
  async removeItem(userId: number, cartItemId: number) {
    const cartItem = await this.prisma.prisma.cartItem.findUnique({
      where: { id: cartItemId },
    });

    if (!cartItem || cartItem.userId !== userId) {
      throw new NotFoundException('Cart item not found');
    }

    await this.prisma.prisma.cartItem.delete({
      where: { id: cartItemId },
    });

    return { success: true, message: 'Item removed from cart' };
  }

  // Clear entire cart
  async clearCart(userId: number) {
    await this.prisma.prisma.cartItem.deleteMany({
      where: { userId },
    });

    return { success: true, message: 'Cart cleared' };
  }

  // Helper to format response
  private formatCartItem(item: any) {
    return {
      id: item.id,
      quantity: item.quantity,
      addedAt: item.addedAt,
      book: {
        id: item.book.id,
        title: item.book.title,
        author: item.book.author?.name || 'Unknown Author',
        price: Number(item.book.price),
        coverImageUrl: item.book.coverImageUrl,
        category: item.book.genre?.name,
      },
    };
  }
}