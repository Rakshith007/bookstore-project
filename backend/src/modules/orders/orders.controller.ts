// src/modules/orders/orders.controller.ts
import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { GetUser } from '../auth/get-user.decorator';

@Controller('orders')
@UseGuards(JwtAuthGuard)
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  // GET /orders → All user orders
  @Get()
  async getUserOrders(@GetUser() user: any) {
    return this.ordersService.getUserOrders(user.sub);
  }

  // GET /orders/:orderNumber → Single order details
  @Get(':orderNumber')
  async getOrderByNumber(
    @GetUser() user: any,
    @Param('orderNumber') orderNumber: string,
  ) {
    return this.ordersService.getOrderByNumber(user.sub, orderNumber);
  }
}