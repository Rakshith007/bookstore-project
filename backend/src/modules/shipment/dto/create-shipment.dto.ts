// src/modules/shipment/dto/create-shipment.dto.ts

import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateShipmentDto {
  @IsString()
  @IsNotEmpty()
  orderNumber: string;

  @IsOptional()                 // ← ADD THIS
  @IsString()
  trackingNumber?: string;      // ← Make optional

  @IsOptional()                 // ← ADD THIS
  @IsString()
  courier?: string;             // ← Make optional

  @IsOptional()
  @IsString()
  shippingMethod?: string;
}