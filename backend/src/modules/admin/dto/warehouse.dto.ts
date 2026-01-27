// src/modules/admin/dto/warehouse.dto.ts
import {
  IsNotEmpty,
  IsArray,
  ValidateNested,
  IsString,
  IsObject,
  IsInt,
  Min,
  IsEnum,
} from 'class-validator';
import { Type } from 'class-transformer';
import { OrderStatus } from '@prisma/client';

export class UpdateOrderStatusDto {
  @IsNotEmpty()
  @IsEnum(OrderStatus)
  status!: OrderStatus;
}

export class BatchItemDto {
  @IsString()
  @IsNotEmpty()
  orderNumber!: string;

  @IsInt()
  @Min(1)
  booksFulfilled!: number;
}

// UPDATED: batchId is now a String to match Prisma schema
export class CompleteBatchPickingDto {
  @IsString()
  @IsNotEmpty()
  batchId!: string;  // ← Changed from number to string

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BatchItemDto)
  batchItems!: BatchItemDto[];
}

// UPDATED: batchId is now a String
export class GeneratePackingSlipDto {
  @IsString()
  @IsNotEmpty()
  batchId!: string;  // ← Changed from number to string

  @IsString()
  @IsNotEmpty()
  internalTrackingId!: string;

  @IsObject()
  @IsNotEmpty()
  charityAddress!: Record<string, any>;
}