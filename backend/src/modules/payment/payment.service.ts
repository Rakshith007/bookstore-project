import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreatePaymentDto } from './dto/create-payment.dto';

@Injectable()
export class PaymentService {
  constructor(private prisma: PrismaService) {}

  async createOrder(userId: number, dto: CreatePaymentDto) {
    const { paymentMethod } = dto;

    // Use interactive transaction to ensure atomic stock deduction + order creation
    return this.prisma.prisma.$transaction(async (tx) => {

      // 2. Fetch cart items with book details (including current stock)
      const cartItems = await tx.cartItem.findMany({
        where: { userId },
        include: {
          book: {
            select: {
              id: true,
              title: true,
              price: true,
              stockQuantity: true,
            },
          },
        },
      });

      if (cartItems.length === 0) {
        throw new BadRequestException('Your cart is empty');
      }

      // 3. Check stock availability
      const insufficientStockItems: string[] = [];

      for (const item of cartItems) {
        if (item.book.stockQuantity < item.quantity) {
          insufficientStockItems.push(
            `${item.book.title} (requested: ${item.quantity}, available: ${item.book.stockQuantity})`,
          );
        }
      }

      if (insufficientStockItems.length > 0) {
        throw new BadRequestException(
          `Insufficient stock for the following items: ${insufficientStockItems.join('; ')}`,
        );
      }

      // 4. Deduct stock from each book
      for (const item of cartItems) {
        await tx.book.update({
          where: { id: item.bookId },
          data: {
            stockQuantity: {
              decrement: item.quantity,
            },
          },
        });
      }

      // 5. Calculate subtotal and total
      const subtotal = cartItems.reduce(
        (sum, item) => sum + Number(item.book.price) * item.quantity,
        0,
      );
      const totalAmount = subtotal;

      // 6. Generate unique order number
      const orderNumber = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

      // 7. Fetch user details
      const user = await tx.user.findUnique({
        where: { id: userId },
        select: { fullName: true, phoneNumber: true },
      });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      // 8. Create the order
      const order = await tx.order.create({
        data: {
          orderNumber,
          userId,
          subtotal,
          shippingCost: 0,
          tax: 0,
          totalAmount,
          status: 'PROCESSING',
          priority: 'NORMAL',
         
        },
      });

      // 9. Create order items
      await tx.orderItem.createMany({
        data: cartItems.map((item) => ({
          orderId: order.id,
          bookId: item.bookId,
          quantity: item.quantity,
          unitPrice: item.book.price,
          subtotal: Number(item.book.price) * item.quantity,
        })),
      });

      // 10. Clear the user's cart
      await tx.cartItem.deleteMany({
        where: { userId },
      });

      // 11. Return success response
      return {
        success: true,
        data: {
          orderNumber: order.orderNumber,
          totalAmount: order.totalAmount,
          status: order.status,
          paymentMethod,
        },
      };
    });
  }
}