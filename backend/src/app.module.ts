// backend/src/app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaService } from './prisma/prisma.service';
import { BooksModule } from './modules/books/books.module';
import { AuthModule } from './modules/auth/auth.module';
import { CartModule } from './modules/cart/cart.module';
import { WishlistModule } from './modules/wishlist/wishlist.module';
import { AddressesModule } from './modules/addresses/addresses.module'; // ← Add this
import { PaymentModule } from './modules/payment/payment.module'; // ← And this
import { OrdersModule } from './modules/orders/orders.module'; // ← And this
import { AdminModule } from './modules/admin/admin.module'; // ← And this
import { ShipmentModule } from './modules/shipment/shipment.module';
import { UsersModule } from './modules/users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    AuthModule,
    BooksModule,
    CartModule,
    WishlistModule,
    AddressesModule, 
    PaymentModule,
    OrdersModule,
    AdminModule,
    ShipmentModule,
    UsersModule,
  ],
  providers: [PrismaService],
  exports: [PrismaService],
})
export class AppModule {}