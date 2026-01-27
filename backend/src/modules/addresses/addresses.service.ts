import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';

@Injectable()
export class AddressesService {
  constructor(private prisma: PrismaService) {}

  async create(userId: number, dto: CreateAddressDto) {
    // REMOVED: No more limit of 2 addresses
    // Old code: if (addressCount >= 2) throw...

    const addressCount = await this.prisma.prisma.address.count({
      where: { userId },
    });

    // If this is the first address, make it default
    const isDefault = dto.isDefault ?? addressCount === 0;

    // If setting as default, unset others
    if (isDefault) {
      await this.prisma.prisma.address.updateMany({
        where: { userId, isDefault: true },
        data: { isDefault: false },
      });
    }

    const { streetAddress, apartment, city, state, country, phone } = dto;

    // REMOVED: No longer saving phone to user profile on first address
    // Phone is just stored in the address like any other field

    const address = await this.prisma.prisma.address.create({
      data: {
        userId,
        phone,                    // ← Phone saved normally in address
        streetAddress,
        apartment,
        city,
        state,
        country,
        isDefault,
      },
    });

    return {
      success: true,
      data: address,
    };
  }

  async findAll(userId: number) {
    const addresses = await this.prisma.prisma.address.findMany({
      where: { userId },
      orderBy: { isDefault: 'desc' },
    });

    return {
      success: true,
      data: addresses,
    };
  }

  async findOne(userId: number, id: number) {
    const address = await this.prisma.prisma.address.findUnique({
      where: { id },
    });

    if (!address || address.userId !== userId) {
      throw new NotFoundException('Address not found');
    }

    return {
      success: true,
      data: address,
    };
  }

  async update(userId: number, id: number, dto: UpdateAddressDto) {
    const address = await this.prisma.prisma.address.findUnique({
      where: { id },
    });

    if (!address || address.userId !== userId) {
      throw new NotFoundException('Address not found');
    }

    // If updating to default, unset other defaults
    if (dto.isDefault) {
      await this.prisma.prisma.address.updateMany({
        where: { userId, isDefault: true },
        data: { isDefault: false },
      });
    }

    const updated = await this.prisma.prisma.address.update({
      where: { id },
      data: {
        streetAddress: dto.streetAddress,
        apartment: dto.apartment,
        city: dto.city,
        state: dto.state,
        country: dto.country,
        phone: dto.phone,         // ← Phone updated normally
        isDefault: dto.isDefault,
      },
    });

    return {
      success: true,
      data: updated,
    };
  }

  async remove(userId: number, id: number) {
    const address = await this.prisma.prisma.address.findUnique({
      where: { id },
    });

    if (!address || address.userId !== userId) {
      throw new NotFoundException('Address not found');
    }

    await this.prisma.prisma.address.delete({
      where: { id },
    });

    // If deleted address was default, promote the oldest remaining one
    if (address.isDefault) {
      const remaining = await this.prisma.prisma.address.findFirst({
        where: { userId },
        orderBy: { createdAt: 'asc' },
      });
      if (remaining) {
        await this.prisma.prisma.address.update({
          where: { id: remaining.id },
          data: { isDefault: true },
        });
      }
    }

    return { success: true, message: 'Address deleted successfully' };
  }

  // Optional: Keep this endpoint for explicitly setting default
  async setDefault(userId: number, addressId: number) {
    const address = await this.prisma.prisma.address.findUnique({
      where: { id: addressId },
    });

    if (!address || address.userId !== userId) {
      throw new NotFoundException('Address not found');
    }

    await this.prisma.prisma.$transaction([
      this.prisma.prisma.address.updateMany({
        where: { userId, isDefault: true },
        data: { isDefault: false },
      }),
      this.prisma.prisma.address.update({
        where: { id: addressId },
        data: { isDefault: true },
      }),
    ]);

    return { success: true, message: 'Default address updated successfully' };
  }
}