// src/common/dto/UpdateBookDto.ts
import { PartialType } from '@nestjs/swagger'; // Changed from @nestjs/mapped-types
import { CreateBookDto } from './create-book.dto';

export class UpdateBookDto extends PartialType(CreateBookDto) {}