// src/modules/orders/orders.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class OrdersService {
  constructor(private prisma: PrismaService) {}

  // Helper to enrich order items with archived book data if needed
  private async enrichOrderItems(orderItems: any[]) {
    // Collect unique originalBookIds where book is null
    const missingBookIds = new Set<number>();
    orderItems.forEach(item => {
      if (!item.book && item.originalBookId) {
        missingBookIds.add(item.originalBookId);
      }
    });

    if (missingBookIds.size === 0) return orderItems;

    // Batch fetch archived books
    const archivedBooks = await this.prisma.prisma.archivedBook.findMany({
      where: {
        originalId: { in: Array.from(missingBookIds) },
      },
    });

    const archivedMap = new Map(archivedBooks.map(ab => [ab.originalId, ab]));

    // Enrich items
    return orderItems.map(item => {
      if (!item.book && item.originalBookId) {
        const archived = archivedMap.get(item.originalBookId);
        if (archived) {
          item.book = {
            id: archived.originalId, // Use original ID for reference
            title: archived.title,
            author: archived.author ? { name: archived.author } : null,
            coverImageUrl: archived.coverImageUrl,
            // Add other fields if needed in frontend (e.g., price, etc.)
          };
        }
      }
      return item;
    });
  }

  // Get all orders for a user (used for list pages)
  async getUserOrders(userId: number) {
    let orders = await this.prisma.prisma.order.findMany({
      where: { userId },
      include: {
        orderItems: {
          include: {
            book: {
              include: {
                author: true,
              },
            },
          },
        },
      },
      orderBy: { orderDate: 'desc' }, // newest first
    });

    // Enrich all orders' items with archived data if needed
    for (let i = 0; i < orders.length; i++) {
      orders[i].orderItems = await this.enrichOrderItems(orders[i].orderItems);
    }

    // Filter out orders where all items have no book data (even from archive)
    orders = orders.filter(order => 
      order.orderItems.some(item => !!item.book)
    );

    return {
      success: true,
      data: orders,
    };
  }

  // Get single order by orderNumber
  async getOrderByNumber(userId: number, orderNumber: string) {
    let order = await this.prisma.prisma.order.findFirst({
      where: {
        orderNumber,
        userId,
      },
      include: {
        orderItems: {
          include: {
            book: {
              include: {
                author: true,
              },
            },
          },
        },
      },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    // Enrich with archived data
    order.orderItems = await this.enrichOrderItems(order.orderItems);

    // If all items have no book data, throw not found (or handle as per requirements)
    if (order.orderItems.every(item => !item.book)) {
      throw new NotFoundException('Order details not available');
    }

    return {
      success: true,
      data: order,
    };
  }
}