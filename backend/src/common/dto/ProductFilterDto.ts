// src/common/dto/ProductFilterDto.ts
import { IsOptional, IsString, IsNumber, IsEnum, Min } from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class ProductFilterDto {
  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsString()
  brand?: string;

  @IsOptional()
  @IsEnum(['available', 'out-of-stock', 'draft', 'archived'])
  status?: string;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  limit?: number = 20;
}