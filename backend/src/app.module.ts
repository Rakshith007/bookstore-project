// backend/src/app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaService } from './prisma/prisma.service';
import { BooksModule } from './modules/books/books.module';
import { AuthModule } from './modules/auth/auth.module';
import { CartModule } from './modules/cart/cart.module';
import { WishlistModule } from './modules/wishlist/wishlist.module';
import { AddressesModule } from './modules/addresses/addresses.module'; // ← Add this

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    AuthModule,
    BooksModule,
    CartModule,
    WishlistModule,
    AddressesModule, // ← Add AddressesModule here
  ],
  providers: [PrismaService],
  exports: [PrismaService],
})
export class AppModule {}