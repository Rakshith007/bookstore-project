import { IsString, IsOptional, IsBoolean } from 'class-validator';

export class CreateAddressDto {
  @IsString()
  streetAddress: string;

  @IsOptional()
  @IsString()
  apartment?: string;

  @IsString()
  city: string;

  @IsOptional()
  @IsString()
  state?: string;

  @IsString()
  country: string;

  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
}