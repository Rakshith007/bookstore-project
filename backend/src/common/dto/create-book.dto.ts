import { IsString, IsNumber, IsOptional, Min, Max, IsInt } from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class CreateBookDto {
  @IsString()
  title: string;

  @IsString()
  author: string;

  @IsString()
  category: string;

  @IsOptional()
  @IsString()
  isbn?: string;

  @IsOptional()
  @IsString()
  publisher?: string;

  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  @IsInt()
  @Min(1900)
  @Max(new Date().getFullYear() + 1)
  publishedYear?: number;

  @IsOptional()
  @Transform(({ value }) => parseFloat(value))
  @IsNumber()
  @Min(0)
  mrp?: number;

  @Transform(({ value }) => parseFloat(value))
  @IsNumber()
  @Min(0.01)
  price: number;

  @Transform(({ value }) => parseInt(value, 10))
  @IsInt()
  @Min(0)
  stockQuantity: number;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  status?: string; // Add this for draft/publish status

  // Note: SKU is removed because backend auto-generates it
  // Note: sellingPrice is removed - use 'price' field instead
}