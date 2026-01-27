// src/modules/admin/admin-orders.service.ts
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { GetAdminOrdersDto } from './dto/get-orders.dto';
import { OrderStatus, BatchFulfillmentStatus } from '@prisma/client';

interface BatchItem {
  orderNumber: string;
  booksFulfilled: number;
}

interface ValidationResult {
  orderNumber: string;
  booksFulfilled: number;
  valid: boolean;
  orderItems?: any[];
}

interface OrderValidationResult {
  orderNumber: string;
  requestedBooks: number;
  totalBooks: number;
  alreadyFulfilled: number;
  remainingBooks: number;
  canFulfill: boolean;
  stockAvailable: boolean;
}

@Injectable()
export class AdminOrdersService {
  constructor(private prisma: PrismaService) {}

  async getAllOrders(dto: GetAdminOrdersDto) {
    const limit = dto.limit ? Number(dto.limit) : 50;
    const page = dto.page ? Number(dto.page) : 1;
    const take = isNaN(limit) || limit <= 0 ? 50 : Math.min(limit, 1000);
    const skip = isNaN(page) || page <= 0 ? 0 : (page - 1) * take;

    const where: any = {};
    
    if (dto.priority) where.priority = dto.priority;

    const [orders, total] = await Promise.all([
      this.prisma.prisma.order.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              fullName: true,
              email: true,
              phoneNumber: true,
            },
          },
          orderItems: {
            include: {
              book: {
                include: {
                  author: true
                }
              }
            }
          },
          paymentMethod: {
            select: {
              methodType: true,
              lastFour: true,
            },
          },
          fulfillments: {
            select: {
              id: true,
              batchId: true,
              booksFulfilled: true,
              status: true,
              pickedAt: true,
              packedAt: true,
              deliveredAt: true,
              charityAddress: true,
              internalTrackingId: true,
              createdAt: true,
              updatedAt: true,
            },
            orderBy: { createdAt: 'desc' },
          },
        },
        orderBy: { orderDate: 'desc' },
        take,
        skip,
      }),
      this.prisma.prisma.order.count({ where }),
    ]);

    // Calculate derived fields for frontend
    const ordersWithCalculations = orders.map(order => {
      const totalBooks = order.orderItems.reduce((sum, item) => sum + item.quantity, 0);
      
      // FIXED: Calculate correctly - only count books in PICKED/PACKED/DELIVERED status
      const pickedBooks = order.fulfillments
        .filter(f => f.status === 'PICKED')
        .reduce((sum, f) => sum + f.booksFulfilled, 0);
      
      const packedBooks = order.fulfillments
        .filter(f => f.status === 'PACKED')
        .reduce((sum, f) => sum + f.booksFulfilled, 0);
      
      const deliveredBooks = order.fulfillments
        .filter(f => f.status === 'DELIVERED')
        .reduce((sum, f) => sum + f.booksFulfilled, 0);
      
      const totalFulfilled = pickedBooks + packedBooks + deliveredBooks;
      const remainingBooks = totalBooks - totalFulfilled;
      
      return {
        ...order,
        _calculated: {
          totalBooks,
          pickedBooks,
          packedBooks,
          deliveredBooks,
          totalFulfilled,
          remainingBooks,
          isPartiallyFulfilled: totalFulfilled > 0 && totalFulfilled < totalBooks,
        }
      };
    });

    return {
      success: true,
      data: ordersWithCalculations,
      meta: {
        total,
        page,
        limit: take,
        pages: Math.ceil(total / take),
        hasMore: skip + orders.length < total,
      },
    };
  }

  async getOrderByNumber(orderNumber: string) {
    const order = await this.prisma.prisma.order.findUnique({
      where: { orderNumber },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
            phoneNumber: true,
          },
        },
        orderItems: {
          include: {
            book: {
              include: {
                author: true
              }
            }
          }
        },
        paymentMethod: true,
        fulfillments: {
          select: {
            id: true,
            batchId: true,
            booksFulfilled: true,
            status: true,
            pickedAt: true,
            packedAt: true,
            deliveredAt: true,
            charityAddress: true,
            internalTrackingId: true,
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    return {
      success: true,
      data: order,
    };
  }

  async updateOrderStatus(orderNumber: string, newStatus: OrderStatus) {
    if (!Object.values(OrderStatus).includes(newStatus as any)) {
      throw new BadRequestException(`Invalid status: ${newStatus}`);
    }

    const order = await this.prisma.prisma.order.findUnique({
      where: { orderNumber },
      select: { id: true, status: true },
    });

    if (!order) {
      throw new NotFoundException(`Order with number ${orderNumber} not found`);
    }

    const updatedOrder = await this.prisma.prisma.order.update({
      where: { orderNumber },
      data: { status: newStatus },
      select: {
        orderNumber: true,
        status: true,
        updatedAt: true,
      },
    });

    return {
      success: true,
      message: `Order ${orderNumber} status updated to ${newStatus}`,
      data: {
        orderNumber: updatedOrder.orderNumber,
        previousStatus: order.status,
        newStatus: updatedOrder.status,
        updatedAt: updatedOrder.updatedAt,
      },
    };
  }

  // === CRITICAL FIX: Updated batch picking with proper stock validation ===
  async completeBatchPicking(batchId: string, batchItems: BatchItem[]) {
    if (!batchItems || batchItems.length === 0) {
      throw new BadRequestException('No batch items provided');
    }

    return this.prisma.prisma.$transaction(async (tx) => {
      const fulfillmentRecords: any[] = [];
      let totalBooksPicked = 0;

      // FIXED: First validate ALL orders before processing any
      const validationResults: ValidationResult[] = [];
      for (const item of batchItems) {
        const { orderNumber, booksFulfilled } = item;

        const order = await tx.order.findUnique({
          where: { orderNumber },
          include: { 
            orderItems: {
              include: {
                book: true
              }
            },
            fulfillments: true 
          },
        });

        if (!order) {
          throw new BadRequestException(`Order ${orderNumber} not found`);
        }

        const totalBooksInOrder = order.orderItems.reduce((sum, oi) => sum + oi.quantity, 0);
        const alreadyFulfilled = order.fulfillments
          .filter(f => ['PICKED', 'PACKED', 'DELIVERED'].includes(f.status))
          .reduce((sum, f) => sum + f.booksFulfilled, 0);
        
        const remainingBooks = totalBooksInOrder - alreadyFulfilled;

        if (booksFulfilled > remainingBooks) {
          throw new BadRequestException(
            `Order ${orderNumber}: Cannot pick ${booksFulfilled} books. Only ${remainingBooks} remaining.`
          );
        }

        // FIXED: Check stock for each book in the order with null checks
        for (const orderItem of order.orderItems) {
          // Safely handle null book
          if (!orderItem.book) {
            throw new BadRequestException(
              `Book information not available for order item in order ${orderNumber}`
            );
          }
          
          // Calculate how many of THIS book we need to pick
          const percentageOfOrder = orderItem.quantity / totalBooksInOrder;
          const booksToPickFromThisItem = Math.ceil(booksFulfilled * percentageOfOrder);
          
          // Check stock
          if (orderItem.book.stockQuantity < booksToPickFromThisItem) {
            throw new BadRequestException(
              `Insufficient stock for "${orderItem.book.title}". ` +
              `Required: ${booksToPickFromThisItem}, Available: ${orderItem.book.stockQuantity}`
            );
          }
        }

        validationResults.push({
          orderNumber,
          booksFulfilled,
          valid: true,
          orderItems: order.orderItems
        });
      }

      // FIXED: Now process all orders
      for (const validation of validationResults) {
        const { orderNumber, booksFulfilled, orderItems } = validation;

        // Re-fetch order to ensure we have latest data
        const order = await tx.order.findUnique({
          where: { orderNumber },
          include: { 
            orderItems: {
              include: {
                book: true
              }
            },
            fulfillments: true 
          },
        });

        if (!order) {
          throw new BadRequestException(`Order ${orderNumber} not found during processing`);
        }

        const totalBooksInOrder = order.orderItems.reduce((sum, oi) => sum + oi.quantity, 0);
        
        // FIXED: Update stock for each book with null checks
        for (const orderItem of order.orderItems) {
          if (!orderItem.book) {
            throw new BadRequestException(
              `Book information not available for order item in order ${orderNumber} during processing`
            );
          }
          
          const percentageOfOrder = orderItem.quantity / totalBooksInOrder;
          const booksToPickFromThisItem = Math.ceil(booksFulfilled * percentageOfOrder);
          
          await tx.book.update({
            where: { id: orderItem.book.id },
            data: { 
              stockQuantity: { decrement: booksToPickFromThisItem } 
            }
          });
        }

        const fulfillment = await tx.orderBatchFulfillment.create({
          data: {
            batchId,
            orderNumber,
            booksFulfilled,
            status: 'PICKED' as const,
            pickedAt: new Date(),
          },
        });

        fulfillmentRecords.push(fulfillment);
        totalBooksPicked += booksFulfilled;
        
        // FIXED: Update order status after each fulfillment
        await this.updateOrderStatusAfterFulfillment(tx, orderNumber);
      }

      return {
        success: true,
        message: `Batch ${batchId} picking completed! ${totalBooksPicked} books from ${batchItems.length} order(s).`,
        data: {
          batchId,
          fulfillmentRecords,
          totalBooksPicked,
        },
      };
    });
  }

  async generatePackingSlip(batchId: string, internalTrackingId: string, charityAddress: any) {
    return this.prisma.prisma.$transaction(async (tx) => {
      const fulfillments = await tx.orderBatchFulfillment.findMany({
        where: { 
          batchId,
          status: 'PICKED'
        },
      });

      if (fulfillments.length === 0) {
        throw new BadRequestException(`No PICKED fulfillments found for batch ${batchId}`);
      }

      await tx.orderBatchFulfillment.updateMany({
        where: { 
          batchId,
          status: 'PICKED' 
        },
        data: {
          status: 'PACKED' as const,
          packedAt: new Date(),
          internalTrackingId,
          charityAddress,
        },
      });

      for (const f of fulfillments) {
        await this.updateOrderStatusAfterFulfillment(tx, f.orderNumber);
      }

      return {
        success: true,
        message: `Packing slip generated for Batch ${batchId}`,
        data: {
          batchId,
          trackingId: internalTrackingId,
          fulfillmentsCount: fulfillments.length,
        },
      };
    });
  }

  // ============= CRITICAL FIX: Updated status logic =============
  private async updateOrderStatusAfterFulfillment(tx: any, orderNumber: string) {
    const order = await tx.order.findUnique({
      where: { orderNumber },
      include: {
        orderItems: true,
        fulfillments: true,
      },
    });

    if (!order) return;

    const totalBooks = order.orderItems.reduce(
      (sum, oi) => sum + oi.quantity,
      0
    );

    // FIXED: Calculate each status separately
    const pickedBooks = order.fulfillments
      .filter((f) => f.status === 'PICKED')
      .reduce((sum, f) => sum + f.booksFulfilled, 0);

    const packedBooks = order.fulfillments
      .filter((f) => f.status === 'PACKED')
      .reduce((sum, f) => sum + f.booksFulfilled, 0);

    const deliveredBooks = order.fulfillments
      .filter((f) => f.status === 'DELIVERED')
      .reduce((sum, f) => sum + f.booksFulfilled, 0);

    const totalInProgress = pickedBooks + packedBooks;
    const totalFulfilled = pickedBooks + packedBooks + deliveredBooks;

    // 1. Fully delivered
    if (deliveredBooks >= totalBooks) {
      await tx.order.update({
        where: { orderNumber },
        data: {
          status: 'DELIVERED',
          deliveredAt: new Date(),
        },
      });
      return;
    }

    // 2. Fully picked/packed but not delivered
    if (totalInProgress >= totalBooks) {
      const newStatus = packedBooks > 0 ? 'PACKED' : 'PICKED';
      await tx.order.update({
        where: { orderNumber },
        data: {
          status: newStatus,
          ...(newStatus === 'PICKED' && !order.pickedAt && { pickedAt: new Date() }),
          ...(newStatus === 'PACKED' && !order.packedAt && { packedAt: new Date() }),
        },
      });
      return;
    }

    // 3. Partially picked/packed
    if (totalInProgress > 0) {
      await tx.order.update({
        where: { orderNumber },
        data: {
          status: 'PARTIALLY_PICKED',
        },
      });
      return;
    }

    // 4. Nothing picked yet
    await tx.order.update({
      where: { orderNumber },
      data: {
        status: 'PROCESSING',
      },
    });
  }

  // ============= NEW: Mark batch as delivered =============
  async markBatchAsDelivered(batchId: string) {
    return this.prisma.prisma.$transaction(async (tx) => {
      const fulfillments = await tx.orderBatchFulfillment.findMany({
        where: { 
          batchId,
          status: 'PACKED'
        },
      });

      if (fulfillments.length === 0) {
        throw new BadRequestException(`No PACKED fulfillments found for batch ${batchId}`);
      }

      await tx.orderBatchFulfillment.updateMany({
        where: { 
          batchId,
          status: 'PACKED' 
        },
        data: {
          status: 'DELIVERED' as const,
          deliveredAt: new Date(),
        },
      });

      for (const f of fulfillments) {
        await this.updateOrderStatusAfterFulfillment(tx, f.orderNumber);
      }

      return {
        success: true,
        message: `Batch ${batchId} marked as delivered`,
        data: {
          batchId,
          deliveredAt: new Date(),
          fulfillmentsCount: fulfillments.length,
        },
      };
    });
  }

  // ============= NEW: Get order fulfillment summary =============
  async getOrderFulfillmentSummary(orderNumber: string) {
    const order = await this.prisma.prisma.order.findUnique({
      where: { orderNumber },
      include: {
        orderItems: {
          include: {
            book: true
          }
        },
        fulfillments: true,
      },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    const totalBooks = order.orderItems.reduce((sum, item) => sum + item.quantity, 0);
    
    const pickedBooks = order.fulfillments
      .filter(f => f.status === 'PICKED')
      .reduce((sum, f) => sum + f.booksFulfilled, 0);
    
    const packedBooks = order.fulfillments
      .filter(f => f.status === 'PACKED')
      .reduce((sum, f) => sum + f.booksFulfilled, 0);
    
    const deliveredBooks = order.fulfillments
      .filter(f => f.status === 'DELIVERED')
      .reduce((sum, f) => sum + f.booksFulfilled, 0);
    
    const totalFulfilled = pickedBooks + packedBooks + deliveredBooks;
    const remainingBooks = totalBooks - totalFulfilled;

    return {
      success: true,
      data: {
        orderNumber,
        totalBooks,
        pickedBooks,
        packedBooks,
        deliveredBooks,
        totalFulfilled,
        remainingBooks,
        isFullyFulfilled: totalFulfilled >= totalBooks,
        isPartiallyFulfilled: totalFulfilled > 0 && totalFulfilled < totalBooks,
        status: order.status,
        fulfillments: order.fulfillments,
      },
    };
  }

  // ============= NEW: Batch validation endpoint =============
  async validateBatch(batchItems: BatchItem[]) {
    const validationResults: OrderValidationResult[] = [];
    const errors: Array<{orderNumber: string, error: string}> = [];

    for (const item of batchItems) {
      try {
        const order = await this.prisma.prisma.order.findUnique({
          where: { orderNumber: item.orderNumber },
          include: {
            orderItems: {
              include: { book: true }
            },
            fulfillments: true,
          },
        });

        if (!order) {
          errors.push({
            orderNumber: item.orderNumber,
            error: 'Order not found'
          });
          continue;
        }

        const totalBooksInOrder = order.orderItems.reduce((sum, oi) => sum + oi.quantity, 0);
        const alreadyFulfilled = order.fulfillments
          .filter(f => ['PICKED', 'PACKED', 'DELIVERED'].includes(f.status))
          .reduce((sum, f) => sum + f.booksFulfilled, 0);
        
        const remainingBooks = totalBooksInOrder - alreadyFulfilled;

        // Safely check stock availability with null checks
        const stockAvailable = order.orderItems.every(oi => {
          if (!oi.book) return false; // No book info available
          return oi.book.stockQuantity >= oi.quantity;
        });

        validationResults.push({
          orderNumber: item.orderNumber,
          requestedBooks: item.booksFulfilled,
          totalBooks: totalBooksInOrder,
          alreadyFulfilled,
          remainingBooks,
          canFulfill: item.booksFulfilled <= remainingBooks,
          stockAvailable,
        });
      } catch (error: any) {
        errors.push({
          orderNumber: item.orderNumber,
          error: error.message
        });
      }
    }

    const allValid = validationResults.every(r => r.canFulfill && r.stockAvailable) && errors.length === 0;

    return {
      success: allValid,
      data: {
        validationResults,
        errors,
        allValid,
        canProceed: allValid,
      },
    };
  }
}