// src/modules/admin/dto/warehouse-broken.dto.ts
import { IsNotEmpty, IsString, IsIn, IsOptional, IsBoolean, IsArray, IsNumber } from 'class-validator';

export class ResolveBrokenOrderDto {
  @IsString()
  @IsNotEmpty()
  orderNumber!: string;

  @IsString()
  @IsIn(['cancel', 'hold'])
  action!: 'cancel' | 'hold';

  @IsString()
  @IsNotEmpty()
  reason!: string;

  @IsOptional()
  @IsBoolean()
  cleanupFulfillments?: boolean;
}

export class DeleteFulfillmentsDto {
  @IsString()
  @IsNotEmpty()
  orderNumber!: string;

  @IsArray()
  @IsNumber({}, { each: true })
  fulfillmentIds!: number[];
}