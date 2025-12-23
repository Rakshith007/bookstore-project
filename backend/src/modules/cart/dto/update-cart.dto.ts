import { IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateCartDto {
  @IsInt()
  @Min(1)
  @Type(() => Number)
  quantity: number;
}