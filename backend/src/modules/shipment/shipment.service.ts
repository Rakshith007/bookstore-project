// src/modules/shipment/shipment.service.ts
import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateShipmentDto } from './dto/create-shipment.dto';
import { ShipmentStatus, BatchFulfillmentStatus } from '@prisma/client';

@Injectable()
export class ShipmentService {
  constructor(private prisma: PrismaService) {}

  // ================================================================
  // === LEGACY: Customer Paid Orders (UNCHANGED) ===
  // ================================================================

  async getAllShipments() {
    const shipments = await this.prisma.prisma.shipment.findMany({
      where: {
        status: {
          in: [
            ShipmentStatus.WAITING,
            ShipmentStatus.SHIPPED,
            ShipmentStatus.DELIVERED,
          ],
        },
      },
      include: {
        order: {
          select: {
            orderNumber: true,
            user: {
              select: { fullName: true, phoneNumber: true },
            },
          },
        },
        courier: {
          select: { name: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return shipments.map((s) => ({
      id: s.order.orderNumber,
      trackingNumber: s.trackingNumber || 'N/A',
      courier: s.courier?.name || 'Unknown Courier',
      assignedPickupTime:
        s.assignedPickupTime
          ? new Date(s.assignedPickupTime).toLocaleTimeString('en-IN', {
              hour: '2-digit',
              minute: '2-digit',
            })
          : s.shippedAt
          ? new Date(s.shippedAt).toLocaleTimeString('en-IN', {
              hour: '2-digit',
              minute: '2-digit',
            })
          : 'Today',
      status:
        s.status === ShipmentStatus.WAITING
          ? 'Waiting'
          : s.status === ShipmentStatus.SHIPPED
          ? 'Shipped'
          : 'Delivered',
    }));
  }

  async createShipment(dto: CreateShipmentDto) {
    // ... unchanged (legacy paid orders)
    const order = await this.prisma.prisma.order.findUnique({
      where: { orderNumber: dto.orderNumber },
      include: { shipment: true },
    });

    if (!order) {
      throw new NotFoundException(`Order ${dto.orderNumber} not found`);
    }

    if (order.shipment) {
      throw new BadRequestException(`Shipment already exists for order ${dto.orderNumber}`);
    }

    let courierId: number | undefined = undefined;

    if (dto.courier?.trim()) {
      let courier = await this.prisma.prisma.courier.findUnique({
        where: { name: dto.courier.trim() },
      });

      if (!courier) {
        courier = await this.prisma.prisma.courier.create({
          data: { name: dto.courier.trim() },
        });
      }

      courierId = courier.id;
    }

    const shipment = await this.prisma.prisma.shipment.create({
      data: {
        order: { connect: { id: order.id } },
        trackingNumber: dto.trackingNumber?.trim() || null,
        courier: courierId ? { connect: { id: courierId } } : undefined,
        shippingMethod: dto.shippingMethod || 'Standard',
        status: ShipmentStatus.WAITING,
        assignedPickupTime: new Date(),
      },
      include: {
        order: { select: { orderNumber: true } },
        courier: { select: { name: true } },
      },
    });

    return {
      success: true,
      message: `Shipment created (waiting for courier assignment) for order ${shipment.order.orderNumber}`,
      data: {
        id: shipment.order.orderNumber,
        trackingNumber: shipment.trackingNumber || 'N/A',
        courier: shipment.courier?.name || 'Unknown Courier',
        status: 'Waiting',
      },
    };
  }

  async updateShipment(
    orderNumber: string,
    updates: { trackingNumber?: string; courier?: string },
  ) {
    // ... unchanged (legacy paid orders)
    const order = await this.prisma.prisma.order.findUnique({
      where: { orderNumber },
      include: { shipment: true },
    });

    if (!order || !order.shipment) {
      throw new NotFoundException(`Shipment not found for order ${orderNumber}`);
    }

    let courierId: number | undefined = undefined;

    if (updates.courier?.trim()) {
      let courier = await this.prisma.prisma.courier.findUnique({
        where: { name: updates.courier.trim() },
      });

      if (!courier) {
        courier = await this.prisma.prisma.courier.create({
          data: { name: updates.courier.trim() },
        });
      }

      courierId = courier.id;
    }

    const updateData: any = {
      status: ShipmentStatus.SHIPPED,
      shippedAt: new Date(),
    };

    if (updates.trackingNumber?.trim()) {
      updateData.trackingNumber = updates.trackingNumber.trim();
    }

    if (courierId !== undefined) {
      updateData.courier = { connect: { id: courierId } };
    }

    const updated = await this.prisma.prisma.shipment.update({
      where: { orderId: order.id },
      data: updateData,
      include: {
        order: { select: { orderNumber: true } },
        courier: { select: { name: true } },
      },
    });

    await this.prisma.prisma.order.update({
      where: { id: order.id },
      data: { status: 'SHIPPED' },
    });

    return {
      success: true,
      data: {
        id: updated.order.orderNumber,
        trackingNumber: updated.trackingNumber || 'N/A',
        courier: updated.courier?.name || 'Unknown Courier',
        status: 'Shipped',
      },
    };
  }

  async bulkUpdateStatus(orderNumbers: string[], newStatus: ShipmentStatus) {
    // ... unchanged
    const orders = await this.prisma.prisma.order.findMany({
      where: { orderNumber: { in: orderNumbers } },
      include: { shipment: true },
    });

    if (orders.length !== orderNumbers.length) {
      const found = orders.map((o) => o.orderNumber);
      const missing = orderNumbers.filter((n) => !found.includes(n));
      throw new BadRequestException(`Orders not found: ${missing.join(', ')}`);
    }

    const orderIds = orders.map((o) => o.id);

    const updateData: any = { status: newStatus };
    if (newStatus === ShipmentStatus.SHIPPED) {
      updateData.shippedAt = new Date();
    }

    const result = await this.prisma.prisma.shipment.updateMany({
      where: { orderId: { in: orderIds } },
      data: updateData,
    });

    if (newStatus === ShipmentStatus.SHIPPED) {
      await this.prisma.prisma.order.updateMany({
        where: { id: { in: orderIds } },
        data: { status: 'SHIPPED' },
      });
    }

    return {
      success: true,
      message: `Updated ${result.count} shipments to ${newStatus}`,
      data: { updatedCount: result.count },
    };
  }

  // ================================================================
  // === CHARITY DONATION BATCHES - NOW: Waiting → Delivered ===
  // ================================================================

  /**
   * Get all charity batches (Waiting and Delivered only)
   */
  async getCharityBatches() {
    const batches = await this.prisma.prisma.orderBatchFulfillment.findMany({
      where: {
        status: {
          in: [BatchFulfillmentStatus.PACKED, BatchFulfillmentStatus.DELIVERED],
        },
      },
      include: {
        courier: {
          select: { name: true },
        },
      },
      orderBy: { packedAt: 'desc' },
    });

    return batches.map((batch) => {
      let charityAddress = 'Address not saved';

      if (batch.charityAddress) {
        let addr: any;

        if (typeof batch.charityAddress === 'string') {
          try {
            addr = JSON.parse(batch.charityAddress);
          } catch (e) {
            console.error('Failed to parse charityAddress:', e);
            addr = null;
          }
        } else {
          addr = batch.charityAddress;
        }

        if (addr && typeof addr === 'object') {
          const parts = [
            addr.streetAddress,
            addr.apartment,
            addr.city,
            addr.state,
            addr.country || 'Oman',
          ].filter(Boolean);

          charityAddress = parts.join(', ') || 'Address details missing';
        }
      }

      return {
        id: batch.batchId,
        batchId: batch.batchId,
        trackingNumber: batch.internalTrackingId || null,
        courier: batch.courier?.name || 'Not assigned',
        assignedPickupTime: batch.packedAt
          ? new Date(batch.packedAt).toLocaleTimeString('en-IN', {
              hour: '2-digit',
              minute: '2-digit',
            })
          : 'Today',
        status: batch.status === BatchFulfillmentStatus.PACKED ? 'Waiting' : 'Delivered',
        totalBooks: batch.booksFulfilled,
        charityAddress,
      };
    });
  }

  /**
   * Update charity batch: save optional tracking/courier and mark as DELIVERED
   * Both fields are fully optional — can send {}, only tracking, only courier, or both
   */
  async updateCharityBatch(
    batchId: string,
    updates: { trackingNumber?: string; courier?: string },
  ) {
    const fulfillmentRecords = await this.prisma.prisma.orderBatchFulfillment.findMany({
      where: { batchId },
      include: { courier: true },
    });

    if (fulfillmentRecords.length === 0) {
      throw new NotFoundException(`Charity batch ${batchId} not found`);
    }

    const updateData: any = {};
    let hasChanges = false;

    // Tracking number — allow clearing
    if (updates.trackingNumber !== undefined) {
      const trimmed = updates.trackingNumber.trim();
      updateData.internalTrackingId = trimmed || null;
      hasChanges = true;
    }

    // Courier — allow clearing
    if (updates.courier !== undefined) {
      const trimmed = updates.courier.trim();
      if (trimmed) {
        let courier = await this.prisma.prisma.courier.findUnique({
          where: { name: trimmed },
        });

        if (!courier) {
          courier = await this.prisma.prisma.courier.create({
            data: { name: trimmed },
          });
        }

        updateData.courier = { connect: { id: courier.id } };
        hasChanges = true;
      } else {
        updateData.courier = { disconnect: true };
        updateData.courierId = null;
        hasChanges = true;
      }
    }

    // Always mark as Delivered when this endpoint is called
    // (even if only to save/clear tracking or courier)
    updateData.status = BatchFulfillmentStatus.DELIVERED;
    updateData.deliveredAt = new Date();

    // Apply update
    await this.prisma.prisma.orderBatchFulfillment.updateMany({
      where: { batchId },
      data: updateData,
    });

    // Fetch updated record
    const updatedRecord = await this.prisma.prisma.orderBatchFulfillment.findFirst({
      where: { batchId },
      include: { courier: { select: { name: true } } },
    });

    if (!updatedRecord) {
      throw new NotFoundException('Failed to retrieve updated batch');
    }

    return {
      success: true,
      message: `Charity Batch ${batchId} marked as Delivered`,
      data: {
        id: batchId,
        trackingNumber: updatedRecord.internalTrackingId || null,
        courier: updatedRecord.courier?.name || null,
        status: 'Delivered',
      },
    };
  }

  /**
   * Bulk mark charity batches as Delivered
   */
  async bulkMarkCharityDelivered(batchIds: string[]) {
    const result = await this.prisma.prisma.orderBatchFulfillment.updateMany({
      where: {
        batchId: { in: batchIds },
      },
      data: {
        status: BatchFulfillmentStatus.DELIVERED,
        deliveredAt: new Date(),
      },
    });

    return {
      success: true,
      message: `Marked ${result.count} charity batch(es) as Delivered`,
      data: { updatedCount: result.count },
    };
  }
}