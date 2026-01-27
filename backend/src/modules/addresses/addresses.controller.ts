import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AddressesService } from './addresses.service';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Request } from 'express';

interface AuthRequest extends Request {
  user: { userId: number };
}

@Controller('addresses')
@UseGuards(JwtAuthGuard)
export class AddressesController {
  constructor(private readonly addressesService: AddressesService) {}

  @Post()
  create(@Req() req: AuthRequest, @Body() dto: CreateAddressDto) {
    return this.addressesService.create(req.user.userId, dto);
  }

  @Get()
  findAll(@Req() req: AuthRequest) {
    return this.addressesService.findAll(req.user.userId);
  }

  @Get(':id')
  findOne(@Req() req: AuthRequest, @Param('id') id: string) {
    return this.addressesService.findOne(req.user.userId, Number(id));
  }

  @Patch(':id')
  update(
    @Req() req: AuthRequest,
    @Param('id') id: string,
    @Body() dto: UpdateAddressDto,
  ) {
    return this.addressesService.update(req.user.userId, Number(id), dto);
  }

  // New endpoint: Set an address as the default one
  @Patch(':id/default')
  setDefault(@Req() req: AuthRequest, @Param('id') id: string) {
    return this.addressesService.setDefault(req.user.userId, Number(id));
  }

  @Delete(':id')
  remove(@Req() req: AuthRequest, @Param('id') id: string) {
    return this.addressesService.remove(req.user.userId, Number(id));
  }
}