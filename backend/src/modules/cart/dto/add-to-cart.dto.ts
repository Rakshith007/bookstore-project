import { IsInt, Min, IsNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';

export class AddToCartDto {
  @IsInt()
  @Min(1)
  @Type(() => Number)
  bookId: number;

  @IsInt()
  @Min(1)
  @Type(() => Number)
  quantity?: number = 1;
}