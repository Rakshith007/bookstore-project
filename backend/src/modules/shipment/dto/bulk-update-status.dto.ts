// src/modules/shipment/dto/bulk-update-status.dto.ts
import { IsArray, IsEnum, ArrayNotEmpty } from 'class-validator';
import { ShipmentStatus } from '@prisma/client';

export class BulkUpdateShipmentStatusDto {
  @IsArray()
  @ArrayNotEmpty()
  orderNumbers: string[];

  @IsEnum(ShipmentStatus)
  newStatus: ShipmentStatus;
}