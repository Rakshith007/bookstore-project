import { IsString, IsIn, IsInt } from 'class-validator';

export class CreatePaymentDto {
  @IsString()
  @IsIn(['COD', 'ONLINE'])
  paymentMethod: 'COD' | 'ONLINE';

  @IsInt()
  shippingAddressId: number;
}