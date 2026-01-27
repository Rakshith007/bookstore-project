import { Test } from '@nestjs/testing';
import { AppModule } from '../../src/app.module';
import { PrismaService } from '../../src/prisma/prisma.service';
import * as bcrypt from 'bcryptjs';

let prisma: PrismaService;
let moduleRef: any;

beforeAll(async () => {
  console.log('🔄 Setting up test database for API tests...');
  
  try {
    moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    prisma = moduleRef.get<PrismaService>(PrismaService);

    // Only clean tables we'll use for API tests
    const tables = ['users', 'books', 'cart_items', 'orders', 'order_items'];
    
    for (const table of tables) {
      try {
        await prisma.$executeRawUnsafe(`DELETE FROM "${table}";`);
      } catch (error) {
        console.log(`Table ${table} might not exist:`, error.message);
      }
    }

    // Create essential test users
    const hashedCustomerPass = await bcrypt.hash('Customer@123', 10);
    const hashedAdminPass = await bcrypt.hash('Admin@123', 10);

    await prisma.user.createMany({
      data: [
        {
          username: 'testcustomer',
          fullName: 'Test Customer',
          email: 'customer@test.com',
          passwordHash: hashedCustomerPass,
          role: 'CUSTOMER',
          emailVerified: true,
          profile: {},
        },
        {
          username: 'testadmin',
          fullName: 'Test Admin',
          email: 'admin@test.com',
          passwordHash: hashedAdminPass,
          role: 'ADMIN',
          emailVerified: true,
          profile: {},
        },
      ]
    });

    console.log('✅ API test database ready!');
  } catch (error) {
    console.error('❌ Database setup failed:', error.message);
    throw error;
  }
});

afterAll(async () => {
  if (prisma) {
    await prisma.$disconnect();
  }
});

export { prisma, moduleRef };