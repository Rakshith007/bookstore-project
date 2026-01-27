// src/modules/shipment/shipment.controller.ts
import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { ShipmentService } from './shipment.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role, ShipmentStatus } from '@prisma/client';
import { CreateShipmentDto } from './dto/create-shipment.dto';
import { BulkUpdateShipmentStatusDto } from './dto/bulk-update-status.dto';

@Controller('shipments')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN, Role.WAREHOUSE)
export class ShipmentController {
  constructor(private readonly shipmentService: ShipmentService) {}

  // ================================================================
  // === LEGACY: Customer Paid Orders (UNCHANGED) ===
  // ================================================================

  @Get()
  async getAllShipments() {
    return this.shipmentService.getAllShipments();
  }

  @Post()
  async createShipment(@Body() dto: CreateShipmentDto) {
    return this.shipmentService.createShipment(dto);
  }

  /**
   * Update regular (paid) shipment — requires at least one field
   */
  @Patch(':orderNumber')
  async updateShipmentDetails(
    @Param('orderNumber') orderNumber: string,
    @Body() body: { trackingNumber?: string; courier?: string },
  ) {
    if (!body.trackingNumber && !body.courier) {
      throw new BadRequestException('At least one of trackingNumber or courier must be provided');
    }

    return this.shipmentService.updateShipment(orderNumber, body);
  }

  @Patch('bulk-update')
  async bulkUpdateStatus(@Body() dto: BulkUpdateShipmentStatusDto) {
    if (!dto.orderNumbers?.length) {
      throw new BadRequestException('orderNumbers array is required');
    }
    if (!Object.values(ShipmentStatus).includes(dto.newStatus)) {
      throw new BadRequestException(`Invalid status: ${dto.newStatus}`);
    }

    return this.shipmentService.bulkUpdateStatus(dto.orderNumbers, dto.newStatus);
  }

  // ================================================================
  // === CHARITY DONATION BATCHES (Waiting → Delivered) ===
  // ================================================================

  /**
   * Get all charity batches (Waiting and Delivered)
   */
  @Get('charity-batches')
  async getCharityBatches() {
    return this.shipmentService.getCharityBatches();
  }

  /**
   * Update charity batch
   * - batchId is string (e.g., B20260103-104512-0)
   * - trackingNumber and courier are FULLY OPTIONAL
   * - Can send {} → just marks as Delivered
   * - Empty strings clear the fields
   * - Always results in status = Delivered
   */
  @Patch('charity-batch/:batchId')
  async updateCharityBatch(
    @Param('batchId') batchId: string,
    @Body() body: { trackingNumber?: string; courier?: string },
  ) {
    // No validation — both fields are optional
    return this.shipmentService.updateCharityBatch(batchId, body);
  }

  /**
   * Bulk mark charity batches as Delivered
   */
  @Patch('charity-bulk-delivered')
  async bulkMarkCharityDelivered(@Body() body: { batchIds: string[] }) {
    if (!body.batchIds || !Array.isArray(body.batchIds) || body.batchIds.length === 0) {
      throw new BadRequestException('batchIds array is required and cannot be empty');
    }

    return this.shipmentService.bulkMarkCharityDelivered(body.batchIds);
  }
}