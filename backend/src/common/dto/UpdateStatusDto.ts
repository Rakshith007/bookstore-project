// src/common/dto/UpdateStatusDto.ts
import { IsString, IsEnum } from 'class-validator';

export class UpdateStatusDto {
  @IsString()
  @IsEnum(['available', 'out-of-stock', 'draft', 'archived'])
  status: string;
}