import { 
  Controller, 
  Post, 
  Get, 
  Put, 
  Delete, 
  Patch, 
  Body, 
  Param, 
  Query, 
  UploadedFile, 
  UseInterceptors,
  ParseIntPipe,
  UseGuards 
} from '@nestjs/common';
import { BooksService } from './books.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../../modules/auth/jwt-auth.guard';
import { RolesGuard } from '../../modules/auth/roles.guard';
import { Roles } from '../../modules/auth/roles.decorator';
import { Role } from '@prisma/client';

// Uncomment DTOs when ready
// import { BookFilterDto } from '../dto/BookFilterDto';
// import { UpdateBookDto } from '../dto/UpdateBookDto';
// import { BulkDeleteDto } from '../dto/BulkDeleteDto';
// import { UpdateStatusDto } from '../dto/UpdateStatusDto';

@Controller('books')
export class BooksController {
  constructor(private readonly booksService: BooksService) {}

  // ────────────────────────────────────────────────
  // PUBLIC READ ENDPOINTS (no auth needed)
  // ────────────────────────────────────────────────

  // Get all books (with filters) - public for customers
  @Get()
  async findAll(@Query() filters?: any) {
    return this.booksService.findAll(filters);
  }

  // Get single book by ID - public for product detail page
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.booksService.findOne(id);
  }

  // Get categories (genres) - public
  @Get('categories')
  async getCategories() {
    return this.booksService.getCategories();
  }

  // Get authors - public
  @Get('authors')
  async getAuthors() {
    return this.booksService.getAuthors();
  }

  // ────────────────────────────────────────────────
  // ADMIN-ONLY WRITE OPERATIONS
  // ────────────────────────────────────────────────

  // Create new book - ADMIN only
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @UseInterceptors(FileInterceptor('coverImage'))
  async create(@Body() dto: any, @UploadedFile() coverImage?: Express.Multer.File) {
    return this.booksService.createBook(dto, coverImage);
  }

  // Update book - ADMIN only
  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @UseInterceptors(FileInterceptor('coverImage'))
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: any,
    @UploadedFile() coverImage?: Express.Multer.File,
  ) {
    return this.booksService.update(id, dto, coverImage);
  }

  // Delete single book - ADMIN only
  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.booksService.remove(id);
  }

  // Bulk delete books - ADMIN only
  @Delete('bulk')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async bulkDelete(@Body() bulkDeleteDto: any) {
    return this.booksService.bulkDelete(bulkDeleteDto.ids);
  }

  // Update single book status - ADMIN only
  @Patch(':id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateStatusDto: any,
  ) {
    return this.booksService.updateStatus(id, updateStatusDto);
  }

  // Bulk update status (e.g. "Add to Products") - ADMIN only
  @Patch('bulk/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async bulkUpdateStatus(@Body() body: { ids: number[]; status: string }) {
    return this.booksService.bulkUpdateStatus(body.ids, body.status);
  }
}