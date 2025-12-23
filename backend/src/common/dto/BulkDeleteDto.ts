// src/common/dto/BulkDeleteDto.ts
import { IsArray, ArrayMinSize, IsInt } from 'class-validator';

export class BulkDeleteDto {
  @IsArray()
  @ArrayMinSize(1)
  @IsInt({ each: true })
  ids: number[];
}