// backend/src/modules/books/books.service.ts
import { Injectable, BadRequestException, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import { createClient } from '@supabase/supabase-js';
import { BookFilterDto } from '../../common/dto/BookFilterDto';
import { UpdateBookDto } from '../../common/dto/UpdateBookDto';
import { BulkDeleteDto } from '../../common/dto/BulkDeleteDto';
import { UpdateStatusDto } from '../../common/dto/UpdateStatusDto';

@Injectable()
export class BooksService {
  private supabase;
  private readonly logger = new Logger(BooksService.name);

  constructor(
    private prisma: PrismaService,
    private config: ConfigService,
  ) {
    const supabaseUrl = this.config.get<string>('SUPABASE_URL');
    const supabaseKey = this.config.get<string>('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing Supabase URL or Service Role Key in .env');
    }

    this.supabase = createClient(supabaseUrl, supabaseKey);
  }

  async createBook(dto: any, coverImage?: Express.Multer.File) {
    this.logger.log(`Creating book: ${dto.title}`);
    let coverImageUrl: string | undefined;

    // Upload cover image to Supabase Storage
    if (coverImage) {
      try {
        const fileExtension = coverImage.originalname.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExtension}`;
        
        this.logger.log(`Uploading image: ${fileName}`);
        
        const { data, error } = await this.supabase.storage
          .from('book-covers')
          .upload(fileName, coverImage.buffer, {
            contentType: coverImage.mimetype,
            upsert: false,
          });

        if (error) {
          this.logger.error(`Image upload failed: ${error.message}`);
          throw new BadRequestException('Image upload failed: ' + error.message);
        }

        coverImageUrl = `${this.config.get('SUPABASE_URL')}/storage/v1/object/public/book-covers/${data.path}`;
        this.logger.log(`Image uploaded successfully: ${coverImageUrl}`);
      } catch (error) {
        this.logger.error(`Image upload error: ${error.message}`);
        throw new BadRequestException('Failed to upload image');
      }
    }

    // Handle Author: find or create
    let author: { id: number } | null = null;
    if (dto.author && dto.author.trim()) {
      author = await this.prisma.client.author.findFirst({
        where: { name: dto.author.trim() },
        select: { id: true },
      });

      if (!author) {
        const newAuthor = await this.prisma.client.author.create({
          data: { name: dto.author.trim() },
          select: { id: true },
        });
        author = newAuthor;
        this.logger.log(`Created new author: ${dto.author.trim()}`);
      }
    }

    // Handle Genre: upsert (name is unique)
    let genre: { id: number } | null = null;
    if (dto.category && dto.category.trim()) {
      genre = await this.prisma.client.genre.upsert({
        where: { name: dto.category.trim() },
        update: {},
        create: { name: dto.category.trim() },
        select: { id: true },
      });
      this.logger.log(`Processed genre: ${dto.category.trim()}`);
    }

    // Build metadata object
    const metadata: any = {};
    if (dto.publisher) metadata.publisher = dto.publisher.trim();
    if (dto.publishedYear) {
      const year = parseInt(dto.publishedYear, 10);
      const currentYear = new Date().getFullYear();
      if (year < 1900 || year > currentYear + 1) {
        throw new BadRequestException(`Published year must be between 1900 and ${currentYear + 1}`);
      }
      metadata.publishedYear = year;
    }
    if (dto.mrp) metadata.mrp = parseFloat(dto.mrp);

    // Validate selling price
    const sellingPrice = parseFloat(dto.price || dto.sellingPrice || '0');
    if (sellingPrice <= 0) {
      throw new BadRequestException('Selling price must be greater than 0');
    }

    // Validate stock quantity
    const stockQuantity = parseInt(dto.stockQuantity || '0', 10);
    if (stockQuantity < 0) {
      throw new BadRequestException('Stock quantity cannot be negative');
    }

    // Create the book with temporary SKU
    const book = await this.prisma.client.book.create({
      data: {
        title: dto.title.trim(),
        author: author ? { connect: { id: author.id } } : undefined,
        genre: genre ? { connect: { id: genre.id } } : undefined,
        price: sellingPrice,
        stockQuantity: stockQuantity,
        sku: 'TEMP-SKU', // Temporary placeholder - will be updated
        barcode: dto.isbn || null,
        description: dto.description || null,
        coverImageUrl,
        metadata: Object.keys(metadata).length > 0 ? metadata : undefined,
        status: dto.status || 'available',
      },
      include: {
        author: true,
        genre: true,
      },
    });

    this.logger.log(`Book created with ID: ${book.id}`);

    // Update SKU with auto-generated format: BK000001, BK000002, etc.
    const finalSku = `BK${String(book.id).padStart(6, '0')}`;
    const updatedBook = await this.prisma.client.book.update({
      where: { id: book.id },
      data: { sku: finalSku },
      include: {
        author: true,
        genre: true,
      },
    });

    this.logger.log(`Book SKU updated to: ${finalSku}`);
    this.logger.log(`Book created successfully: ${dto.title}`);
    
    return {
      ...updatedBook,
      message: 'Book created successfully',
      sku: finalSku
    };
  }

  async findAll(filters?: BookFilterDto) {
    const { 
      category, 
      author, 
      status, 
      search, 
      page = 1, 
      limit = 20 
    } = filters || {};
    
    const pageNumber = Number(page) || 1;
    const limitNumber = Number(limit) || 20;
    const safeLimit = Math.min(limitNumber, 1000);

    const skip = (pageNumber - 1) * safeLimit;
    
    const where: any = {};
    
    if (category) {
      where.genre = {
        name: {
          contains: category,
          mode: 'insensitive',
        },
      };
    }
    
    if (author) {
      where.author = {
        name: {
          contains: author,
          mode: 'insensitive',
        },
      };
    }
    
    if (status) {
      where.status = status;
    }
    
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { author: { name: { contains: search, mode: 'insensitive' } } },
        { genre: { name: { contains: search, mode: 'insensitive' } } },
      ];
    }
    
    const [books, total] = await Promise.all([
      this.prisma.client.book.findMany({
        where,
        include: {
          author: true,
          genre: true,
        },
        skip,
        take: safeLimit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.client.book.count({ where }),
    ]);
    
    const transformedBooks = books.map(book => {
      const metadata = book.metadata as any;
      const mrp = metadata?.mrp;
      const priceNumber = Number(book.price);
      
      return {
        id: book.id,
        title: book.title,
        author: book.author?.name || 'Unknown',
        category: book.genre?.name || 'Unknown',
        genre: book.genre?.name || 'Unknown',
        price: priceNumber,
        sellingPrice: priceNumber,
        mrp: mrp || priceNumber,
        stock: book.stockQuantity,
        stockQuantity: book.stockQuantity,
        status: book.status,
        coverImage: book.coverImageUrl,
        isbn: book.barcode,
        publisher: metadata?.publisher,
        publishedYear: metadata?.publishedYear,
        description: book.description,
        sku: book.sku,
        averageRating: Number(book.averageRating),
        totalReviews: book.totalReviews,
        createdAt: book.createdAt,
        updatedAt: book.updatedAt,
      };
    });
    
    return {
      success: true,
      data: transformedBooks,
      total,
      page: pageNumber,
      limit: safeLimit,
      totalPages: Math.ceil(total / safeLimit),
    };
  }

  async findOne(id: number) {
    const book = await this.prisma.client.book.findUnique({
      where: { id },
      include: {
        author: true,
        genre: true,
      },
    });
    
    if (!book) {
      throw new NotFoundException(`Book with ID ${id} not found`);
    }
    
    const metadata = book.metadata as any;
    const mrp = metadata?.mrp;
    const priceNumber = Number(book.price);
    
    return {
      success: true,
      data: {
        id: book.id,
        title: book.title,
        author: book.author?.name || 'Unknown',
        category: book.genre?.name || 'Unknown',
        genre: book.genre?.name || 'Unknown',
        price: priceNumber,
        sellingPrice: priceNumber,
        mrp: mrp || priceNumber,
        stock: book.stockQuantity,
        stockQuantity: book.stockQuantity,
        status: book.status,
        coverImage: book.coverImageUrl,
        isbn: book.barcode,
        publisher: metadata?.publisher,
        publishedYear: metadata?.publishedYear,
        description: book.description,
        sku: book.sku,
        averageRating: Number(book.averageRating),
        totalReviews: book.totalReviews,
        createdAt: book.createdAt,
        updatedAt: book.updatedAt,
      },
    };
  }

  async update(id: number, dto: UpdateBookDto, coverImage?: Express.Multer.File) {
    const existingBook = await this.prisma.client.book.findUnique({
      where: { id },
      include: { author: true, genre: true },
    });
    
    if (!existingBook) {
      throw new NotFoundException(`Book with ID ${id} not found`);
    }
    
    let coverImageUrl = existingBook.coverImageUrl;
    
    if (coverImage) {
      try {
        const fileExtension = coverImage.originalname.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExtension}`;
        
        const { data, error } = await this.supabase.storage
          .from('book-covers')
          .upload(fileName, coverImage.buffer, {
            contentType: coverImage.mimetype,
            upsert: false,
          });
        
        if (error) {
          throw new BadRequestException('Image upload failed: ' + error.message);
        }
        
        coverImageUrl = `${this.config.get('SUPABASE_URL')}/storage/v1/object/public/book-covers/${data.path}`;
        
        if (existingBook.coverImageUrl) {
          const oldFileName = existingBook.coverImageUrl.split('/').pop();
          await this.supabase.storage
            .from('book-covers')
            .remove([oldFileName]);
        }
      } catch (error) {
        throw new BadRequestException('Failed to upload image');
      }
    }
    
    let author: { id: number } | null = null;
    if (dto.author && dto.author.trim()) {
      author = await this.prisma.client.author.findFirst({
        where: { name: dto.author.trim() },
        select: { id: true },
      });
      
      if (!author) {
        const newAuthor = await this.prisma.client.author.create({
          data: { name: dto.author.trim() },
          select: { id: true },
        });
        author = newAuthor;
      }
    }
    
    let genre: { id: number } | null = null;
    if (dto.category && dto.category.trim()) {
      genre = await this.prisma.client.genre.upsert({
        where: { name: dto.category.trim() },
        update: {},
        create: { name: dto.category.trim() },
        select: { id: true },
      });
    }
    
    const metadata: any = { ...(existingBook.metadata as any || {}) };
    if (dto.publisher) metadata.publisher = dto.publisher.trim();
    if (dto.publishedYear) {
      const year = parseInt(dto.publishedYear as any, 10);
      const currentYear = new Date().getFullYear();
      if (year < 1900 || year > currentYear + 1) {
        throw new BadRequestException(`Published year must be between 1900 and ${currentYear + 1}`);
      }
      metadata.publishedYear = year;
    }
    if (dto.mrp !== undefined) metadata.mrp = parseFloat(dto.mrp as any);
    
    const updateData: any = {
      title: dto.title?.trim() || existingBook.title,
      price: dto.price !== undefined ? parseFloat(dto.price as any) : Number(existingBook.price),
      stockQuantity: dto.stockQuantity !== undefined ? parseInt(dto.stockQuantity as any, 10) : existingBook.stockQuantity,
      barcode: dto.isbn || existingBook.barcode,
      description: dto.description || existingBook.description,
      coverImageUrl,
      metadata: Object.keys(metadata).length > 0 ? metadata : undefined,
      status: dto.status || existingBook.status,
      version: existingBook.version + 1,
    };
    
    if (author) updateData.author = { connect: { id: author.id } };
    if (genre) updateData.genre = { connect: { id: genre.id } };
    
    const updatedBook = await this.prisma.client.book.update({
      where: { id },
      data: updateData,
      include: {
        author: true,
        genre: true,
      },
    });
    
    const updatedMetadata = updatedBook.metadata as any;
    const priceNumber = Number(updatedBook.price);
    
    return {
      success: true,
      data: {
        id: updatedBook.id,
        title: updatedBook.title,
        author: updatedBook.author?.name || 'Unknown',
        category: updatedBook.genre?.name || 'Unknown',
        price: priceNumber,
        stock: updatedBook.stockQuantity,
        status: updatedBook.status,
        coverImage: updatedBook.coverImageUrl,
        isbn: updatedBook.barcode,
        publisher: updatedMetadata?.publisher,
        publishedYear: updatedMetadata?.publishedYear,
        description: updatedBook.description,
        sku: updatedBook.sku,
        averageRating: Number(updatedBook.averageRating),
        totalReviews: updatedBook.totalReviews,
      },
      message: 'Book updated successfully',
    };
  }
  async remove(id: number) {
    const book = await this.prisma.client.book.findUnique({
      where: { id },
      include: { author: true, genre: true },
    });

    if (!book) {
      throw new NotFoundException(`Book with ID ${id} not found`);
    }

    // 1. Archive the book
    await this.prisma.client.archivedBook.create({
      data: {
        originalId: book.id,
        title: book.title,
        author: book.author?.name,
        genre: book.genre?.name,
        price: book.price,
        sku: book.sku,
        barcode: book.barcode,
        coverImageUrl: book.coverImageUrl,
        description: book.description,
        metadata: book.metadata ?? undefined,
      },
    });

    // 2. Remove from cart & wishlist
    await this.prisma.client.cartItem.deleteMany({ where: { bookId: id } });
    await this.prisma.client.wishlist.deleteMany({ where: { bookId: id } });

    // 3. Preserve reference for order history
    await this.prisma.client.orderItem.updateMany({
      where: { bookId: id },
      data: {
        originalBookId: id,
        bookId: null,
      },
    });

    // 4. Delete the book safely
    await this.prisma.client.book.delete({ where: { id } });

    return {
      success: true,
      message: 'Book archived and deleted successfully',
    };
  }




  async bulkDelete(ids: number[]) {
    const books = await this.prisma.client.book.findMany({
      where: { id: { in: ids } },
      include: { author: true, genre: true },
    });

    for (const book of books) {
      await this.prisma.client.archivedBook.create({
        data: {
          originalId: book.id,
          title: book.title,
          author: book.author?.name,
          genre: book.genre?.name,
          price: book.price,
          sku: book.sku,
          barcode: book.barcode,
          coverImageUrl: book.coverImageUrl,
          description: book.description,
          metadata: book.metadata ?? undefined,
        },
      });
    }

    // Remove from cart & wishlist
    await this.prisma.client.cartItem.deleteMany({
      where: { bookId: { in: ids } },
    });

    await this.prisma.client.wishlist.deleteMany({
      where: { bookId: { in: ids } },
    });

    // Preserve order history
    await this.prisma.client.orderItem.updateMany({
      where: { bookId: { in: ids } },
      data: {
        bookId: null,
      },
    });

    // Delete books safely
    await this.prisma.client.book.deleteMany({
      where: { id: { in: ids } },
    });

    return {
      success: true,
      message: `${ids.length} book(s) archived and deleted successfully`,
    };
  }



  async getCategories() {
    const genres = await this.prisma.client.genre.findMany({
      select: { name: true },
      orderBy: { name: 'asc' },
    });
    
    const categories = genres.map(genre => genre.name).filter(Boolean);
    
    return {
      success: true,
      data: categories,
    };
  }

  async getAuthors() {
    const authors = await this.prisma.client.author.findMany({
      select: { name: true },
      orderBy: { name: 'asc' },
    });
    
    const authorNames = authors.map(author => author.name).filter(Boolean);
    
    return {
      success: true,
      data: authorNames,
    };
  }

  async updateStatus(id: number, statusDto: UpdateStatusDto) {
    const book = await this.prisma.client.book.findUnique({
      where: { id },
    });
    
    if (!book) {
      throw new NotFoundException(`Book with ID ${id} not found`);
    }
    
    const updatedBook = await this.prisma.client.book.update({
      where: { id },
      data: { 
        status: statusDto.status,
        version: book.version + 1,
      },
      include: {
        author: true,
        genre: true,
      },
    });
    
    return {
      success: true,
      data: {
        id: updatedBook.id,
        title: updatedBook.title,
        status: updatedBook.status,
      },
      message: 'Book status updated successfully',
    };
  }

  // ===================================================================
  // NEW: Bulk update status - used by "Add to Products" in admin panel
  // ===================================================================
  async bulkUpdateStatus(ids: number[], status: string) {
    if (ids.length === 0) {
      throw new BadRequestException('No book IDs provided');
    }

    // Validate all books exist
    const existingCount = await this.prisma.client.book.count({
      where: { id: { in: ids } },
    });

    if (existingCount !== ids.length) {
      throw new NotFoundException('One or more selected books not found');
    }

    // Bulk update status and increment version for concurrency
    const result = await this.prisma.client.book.updateMany({
      where: { id: { in: ids } },
      data: {
        status,
        version: { increment: 1 },
      },
    });

    this.logger.log(`Bulk updated ${result.count} books to status "${status}"`);

    return {
      success: true,
      count: result.count,
      message: `${result.count} book(s) successfully updated to "${status}"`,
    };
  }
}