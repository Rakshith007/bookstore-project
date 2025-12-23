import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Req,
  Body,
  UseGuards,
} from '@nestjs/common';
import { WishlistService } from './wishlist.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard'; // ← Correct path
import { Request } from 'express';

interface AuthRequest extends Request {
  user: { userId: number };
}

@Controller('wishlist')
@UseGuards(JwtAuthGuard)
export class WishlistController {
  constructor(private readonly wishlistService: WishlistService) {}

  @Get()
  getWishlist(@Req() req: AuthRequest) {
    return this.wishlistService.getWishlist(req.user.userId);
  }

  @Post()
  addToWishlist(@Req() req: AuthRequest, @Body() body: { bookId: number }) {
    return this.wishlistService.addToWishlist(req.user.userId, body.bookId);
  }

  // Changed from :id to :bookId — matches composite key in service
  @Delete(':bookId')
  removeFromWishlist(@Req() req: AuthRequest, @Param('bookId') bookId: string) {
    return this.wishlistService.removeFromWishlist(req.user.userId, Number(bookId));
  }
}