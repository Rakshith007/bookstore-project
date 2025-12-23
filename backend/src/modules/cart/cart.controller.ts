import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
  Req,
} from '@nestjs/common';
import { CartService } from './cart.service';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { UpdateCartDto } from './dto/update-cart.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Request } from 'express';

interface AuthRequest extends Request {
  user: { userId: number };
}

@Controller('cart')
@UseGuards(JwtAuthGuard)
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Post()
  async addToCart(@Req() req: AuthRequest, @Body() dto: AddToCartDto) {
    return this.cartService.addToCart(req.user.userId, dto);
  }

  @Get()
  async getCart(@Req() req: AuthRequest) {
    return this.cartService.getCart(req.user.userId);
  }

  @Patch(':id')
  async updateQuantity(
    @Req() req: AuthRequest,
    @Param('id') id: string,
    @Body() dto: UpdateCartDto,
  ) {
    return this.cartService.updateQuantity(req.user.userId, Number(id), dto);
  }

  @Delete(':id')
  async removeItem(@Req() req: AuthRequest, @Param('id') id: string) {
    return this.cartService.removeItem(req.user.userId, Number(id));
  }

  @Delete()
  async clearCart(@Req() req: AuthRequest) {
    return this.cartService.clearCart(req.user.userId);
  }
}