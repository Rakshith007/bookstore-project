import {
  Controller,
  Get,
  Param,
  Query,
  Post,
  Body,
  UseGuards,
} from '@nestjs/common';
import { AdminOrdersService } from './admin-orders.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '@prisma/client';
import { GetAdminOrdersDto } from './dto/get-orders.dto';
import {
  UpdateOrderStatusDto,
  CompleteBatchPickingDto,
  GeneratePackingSlipDto,
} from './dto/warehouse.dto';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AdminOrdersController {
  constructor(private readonly adminOrdersService: AdminOrdersService) {}

  // ====================
  // ADMIN-ONLY ENDPOINTS
  // ====================

  @Roles(Role.ADMIN)
  @Get('orders')
  async getAllOrders(@Query() query: GetAdminOrdersDto) {
    return this.adminOrdersService.getAllOrders(query);
  }

  @Roles(Role.ADMIN)
  @Get('orders/:orderNumber')
  async getOrderByNumber(@Param('orderNumber') orderNumber: string) {
    return this.adminOrdersService.getOrderByNumber(orderNumber);
  }

  @Roles(Role.ADMIN)
  @Post('orders/:orderNumber/status')
  async updateOrderStatus(
    @Param('orderNumber') orderNumber: string,
    @Body() body: UpdateOrderStatusDto,
  ) {
    return this.adminOrdersService.updateOrderStatus(orderNumber, body.status);
  }

  // =========================
  // WAREHOUSE ENDPOINTS (ADMIN + WAREHOUSE)
  // =========================

  @Roles(Role.ADMIN, Role.WAREHOUSE)  // ← FIXED: Allow warehouse staff
  @Post('warehouse/complete-batch-picking')
  async completeBatchPicking(@Body() body: CompleteBatchPickingDto) {
    return this.adminOrdersService.completeBatchPicking(body.batchId, body.batchItems);
  }

  @Roles(Role.ADMIN, Role.WAREHOUSE)  // ← FIXED: Allow warehouse staff
  @Post('warehouse/generate-packing-slip')
  async generatePackingSlip(@Body() body: GeneratePackingSlipDto) {
    return this.adminOrdersService.generatePackingSlip(
      body.batchId,
      body.internalTrackingId,
      body.charityAddress,
    );
  }
}