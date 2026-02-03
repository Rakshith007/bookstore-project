import {
  IsNotEmpty,
  IsArray,
  ValidateNested,
  IsString,
  IsObject,
  IsInt,
  Min,
  IsEnum,
  IsOptional,
  IsBoolean,
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

// UPDATED: Added all new fields for packing slip
export class GeneratePackingSlipDto {
  @IsString()
  @IsNotEmpty()
  batchId!: string;

  @IsString()
  @IsOptional()
  internalTrackingId?: string;

  @IsObject()
  @IsOptional()
  charityAddress?: Record<string, any>;

  @IsString()
  @IsOptional()
  securityCode?: string;

  @IsString()
  @IsOptional()
  qrData?: string;

  @IsString()
  @IsOptional()
  verificationUrl?: string;

  @IsBoolean()
  @IsOptional()
  securityCodeSent?: boolean;

  @IsBoolean()
  @IsOptional()
  sharedToWarehouse?: boolean;

  @IsBoolean()
  @IsOptional()
  markedAsPacked?: boolean;
}

// NEW DTOs
export class UpdatePackingSlipWorkflowDto {
  @IsString()
  @IsNotEmpty()
  batchId!: string;

  @IsBoolean()
  @IsOptional()
  securityCodeSent?: boolean;

  @IsBoolean()
  @IsOptional()
  sharedToWarehouse?: boolean;

  @IsBoolean()
  @IsOptional()
  markedAsPacked?: boolean;
}

export class GenerateSecurityCodeDto {
  @IsString()
  @IsNotEmpty()
  batchId!: string;
}