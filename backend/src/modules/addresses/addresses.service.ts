import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';

@Injectable()
export class AddressesService {
  constructor(private prisma: PrismaService) {}

  async create(userId: number, dto: CreateAddressDto) {
    const addressCount = await this.prisma.prisma.address.count({
      where: { userId },
    });

    const isDefault = dto.isDefault ?? addressCount === 0;

    if (isDefault && addressCount > 0) {
      await this.prisma.prisma.address.updateMany({
        where: { userId, isDefault: true },
        data: { isDefault: false },
      });
    }

    const { streetAddress, apartment, city, state, country } = dto;

    const address = await this.prisma.prisma.address.create({
      data: {
        userId,
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

    if (dto.isDefault) {
      await this.prisma.prisma.address.updateMany({
        where: { userId, isDefault: true },
        data: { isDefault: false },
      });
    }

    const { streetAddress, apartment, city, state, country, isDefault } = dto;

    const updated = await this.prisma.prisma.address.update({
      where: { id },
      data: {
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

    if (address.isDefault) {
      const remaining = await this.prisma.prisma.address.findFirst({
        where: { userId },
      });
      if (remaining) {
        await this.prisma.prisma.address.update({
          where: { id: remaining.id },
          data: { isDefault: true },
        });
      }
    }

    return { success: true, message: 'Address deleted' };
  }
}