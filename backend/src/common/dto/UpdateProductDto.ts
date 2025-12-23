// src/common/dto/UpdateProductDto.ts
import { IsOptional, IsString, IsNumber, Min, IsEnum } from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class UpdateProductDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  brand?: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @Transform(({ value }) => parseFloat(value))
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  price?: number;

  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  stockQuantity?: number;

  @IsOptional()
  @IsString()
  upc?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  manufacturer?: string;

  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  @Type(() => Number)
  @IsNumber()
  @Min(1900)
  releaseYear?: number;

  @IsOptional()
  @Transform(({ value }) => parseFloat(value))
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  mrp?: number;

  @IsOptional()
  @IsEnum(['available', 'out-of-stock', 'draft', 'archived'])
  status?: string;
}