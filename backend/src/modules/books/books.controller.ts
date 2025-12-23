// backend/src/modules/books/books.controller.ts
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
// Uncomment these imports when you create the DTO files
// import { BookFilterDto } from '../dto/BookFilterDto';
// import { UpdateBookDto } from '../dto/UpdateBookDto';
// import { BulkDeleteDto } from '../dto/BulkDeleteDto';
// import { UpdateStatusDto } from '../dto/UpdateStatusDto';
// import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

@Controller('books')
// @UseGuards(JwtAuthGuard) // Uncomment if you have authentication
export class BooksController {
  constructor(private readonly booksService: BooksService) {}

  // ✅ Create new book
  @Post()
  @UseInterceptors(FileInterceptor('coverImage'))
  async create(@Body() dto: any, @UploadedFile() coverImage?: Express.Multer.File) {
    return this.booksService.createBook(dto, coverImage);
  }

  // ✅ Get all books with filters (admin panel uses this)
  @Get()
  async findAll(@Query() filters?: any) {
    return this.booksService.findAll(filters);
  }

  // ✅ Get single book by ID
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.booksService.findOne(id);
  }

  // ✅ Update book
  @Put(':id')
  @UseInterceptors(FileInterceptor('coverImage'))
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: any,
    @UploadedFile() coverImage?: Express.Multer.File,
  ) {
    return this.booksService.update(id, dto, coverImage);
  }

  // ✅ Delete single book
  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.booksService.remove(id);
  }

  // ✅ Bulk delete books
  @Delete('bulk')
  async bulkDelete(@Body() bulkDeleteDto: any) {
    return this.booksService.bulkDelete(bulkDeleteDto.ids);
  }

  // ✅ Update single book status (e.g., draft → available)
  @Patch(':id/status')
  async updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateStatusDto: any,
  ) {
    return this.booksService.updateStatus(id, updateStatusDto);
  }

  // ✅ NEW: Bulk update status — used by "Add to Products"
  @Patch('bulk/status')
  async bulkUpdateStatus(@Body() body: { ids: number[]; status: string }) {
    return this.booksService.bulkUpdateStatus(body.ids, body.status);
  }

  // ✅ Get all categories (genres)
  @Get('categories')
  async getCategories() {
    return this.booksService.getCategories();
  }

  // ✅ Get all authors
  @Get('authors')
  async getAuthors() {
    return this.booksService.getAuthors();
  }
}