import {
  Controller,
  Get,
  Param,
  Query,
  Post,
  Body,
  Patch,
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
  UpdatePackingSlipWorkflowDto,
  GenerateSecurityCodeDto,
} from './dto/warehouse.dto';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AdminOrdersController {
  constructor(private readonly adminOrdersService: AdminOrdersService) { }

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

  @Roles(Role.ADMIN, Role.WAREHOUSE)
  @Post('warehouse/complete-batch-picking')
  async completeBatchPicking(@Body() body: CompleteBatchPickingDto) {
    return this.adminOrdersService.completeBatchPicking(body.batchId, body.batchItems);
  }

  @Roles(Role.ADMIN, Role.WAREHOUSE)
  @Post('warehouse/generate-packing-slip')
  async generatePackingSlip(@Body() body: GeneratePackingSlipDto) {
    return this.adminOrdersService.generatePackingSlip(
      body.batchId,
      body.charityAddress,
      body.qrData,
      body.verificationUrl,
      body.securityCode,
      body.securityCodeSent,
      body.sharedToWarehouse,
      body.markedAsPacked
    );
  }

  // =========================
  // NEW PACKING SLIP ENDPOINTS
  // =========================

  @Roles(Role.ADMIN, Role.WAREHOUSE)
  @Get('warehouse/packing-slip/:batchId')
  async getPackingSlip(@Param('batchId') batchId: string) {
    return this.adminOrdersService.getPackingSlip(batchId);
  }

  @Roles(Role.ADMIN, Role.WAREHOUSE)
  @Patch('warehouse/packing-slip/workflow')
  async updatePackingSlipWorkflow(@Body() body: UpdatePackingSlipWorkflowDto) {
    return this.adminOrdersService.updatePackingSlipWorkflow(
      body.batchId,
      {
        securityCodeSent: body.securityCodeSent,
        sharedToWarehouse: body.sharedToWarehouse,
        markedAsPacked: body.markedAsPacked,
      }
    );
  }

  @Roles(Role.ADMIN, Role.WAREHOUSE)
  @Post('warehouse/generate-security-code')
  async generateSecurityCode(@Body() body: GenerateSecurityCodeDto) {
    return this.adminOrdersService.generateSecurityCodeOnly(body.batchId);
  }

}