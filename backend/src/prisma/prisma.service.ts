// src/prisma/prisma.service.ts
import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

@Injectable()
export class PrismaService implements OnModuleInit, OnModuleDestroy {
  public prisma: PrismaClient;
  public client: PrismaClient; // Backward compatibility for existing code

  constructor() {
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
    });
    const adapter = new PrismaPg(pool);
    const baseClient = new PrismaClient({ adapter });

    this.prisma = baseClient;
    this.client = baseClient;

    // ← THIS IS THE KEY FIX: Add nested 'prisma' property pointing to itself
    (this.prisma as any).prisma = baseClient;
  }

  async onModuleInit() {
    await this.prisma.$connect();
    Logger.log('Prisma connected to Supabase PostgreSQL via driver adapter');
  }

  async onModuleDestroy() {
    await this.prisma.$disconnect();
    Logger.log('Prisma disconnected');
  }
}