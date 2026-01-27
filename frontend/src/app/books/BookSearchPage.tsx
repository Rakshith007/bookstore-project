import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Grid3x3, AlignLeft, ChevronLeft, ChevronRight, BookOpen, Calendar } from 'lucide-react';
import Navbar from '../../components/layout/Navbar';

interface Book {
  id: number;
  title: string;
  author: string;
  image: string;
  color: string;
  price?: number;
  category?: string;
  description?: string;
  status?: string;
  publisher?: string;
  publishedYear?: number;
  isbn?: string;
}

interface ApiResponse {
  success: boolean;
  data: Array<{
    id: number;
    title: string;
    author: string;
    coverImage?: string;
    price?: number;
    category?: string;
    description?: string;
    status?: string;
    publisher?: string;
    publishedYear?: number;
    isbn?: string;
    stockQuantity?: number;
  }>;
  total?: number;
  totalPages?: number;
  page?: number;
  limit?: number;
}

const BookSearchPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalBooks, setTotalBooks] = useState<number>(0);

  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000';

  useEffect(() => {
    const query = searchParams.get('q') || '';
    if (query !== searchQuery) {
      setSearchQuery(query);
      setPage(1);
    }
  }, [searchParams, searchQuery]);

  const fetchBooks = async (search = '', pageNum = 1) => {
    setLoading(true);
    setError(null);
    
    try {
      const params = new URLSearchParams({
        page: pageNum.toString(),
        limit: '12',
        status: 'available',
      });

      if (search.trim()) {
        params.append('search', search.trim());
      }

      const response = await fetch(`${API_BASE_URL}/books?${params}`);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to fetch books');
      }

      const data: ApiResponse = await response.json();
      
      if (data.success && data.data) {
        const mappedBooks: Book[] = data.data.map((book) => ({
          id: book.id,
          title: book.title,
          author: book.author || 'Unknown Author',
          image: book.coverImage || 'https://via.placeholder.com/300x450/2E4A3D/ffffff?text=Book+Cover',
          color: 'bg-[#F5EBDD]',
          price: book.price,
          category: book.category,
          description: book.description,
          status: book.status,
          publisher: book.publisher,
          publishedYear: book.publishedYear,
          isbn: book.isbn
        }));
        
        setBooks(mappedBooks);
        setTotalBooks(data.total || 0);
        setTotalPages(data.totalPages || 1);
      } else {
        setBooks([]);
        setTotalBooks(0);
        setTotalPages(1);
      }
    } catch (err: unknown) {
      console.error('Error fetching books:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to load books';
      setError(errorMessage);
      setBooks([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooks(searchQuery, page);
  }, [searchQuery, page]);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
    }
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-[#FAF9F6] font-serif text-[#333333]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
          {/* Stats and Controls */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div>
              <p className="text-[#333333]/70">
                {loading ? 'Loading...' : `Found ${totalBooks} book${totalBooks !== 1 ? 's' : ''}`}
              </p>
            </div>

            <div className="flex gap-0 border border-[#D4A373]/30 rounded-lg overflow-hidden w-fit shadow-sm">
              <button
                onClick={() => setViewMode('grid')}
                className={`flex items-center justify-center gap-2 px-4 py-2 transition-colors border-r border-[#D4A373]/30 ${
                  viewMode === 'grid' ? 'bg-[#2E4A3D] text-white' : 'bg-white text-[#333333] hover:bg-[#A3B18A]/10'
                }`}
              >
                <Grid3x3 className="w-4 h-4" />
                <span className="text-sm font-medium">Grid</span>
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`flex items-center justify-center gap-2 px-4 py-2 transition-colors ${
                  viewMode === 'list' ? 'bg-[#2E4A3D] text-white' : 'bg-white text-[#333333] hover:bg-[#A3B18A]/10'
                }`}
              >
                <AlignLeft className="w-4 h-4" />
                <span className="text-sm font-medium">List</span>
              </button>
            </div>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700">{error}</p>
              <button
                onClick={() => fetchBooks(searchQuery, page)}
                className="mt-2 text-sm text-[#B85C38] hover:underline font-medium"
              >
                Try Again
              </button>
            </div>
          )}

          {loading && (
            <div className="flex justify-center items-center py-12">
              <div className="text-lg font-medium text-[#2E4A3D] animate-pulse">Loading scholarly works...</div>
            </div>
          )}

          {!loading && !error && (
            <>
              {books.length === 0 ? (
                <div className="text-center py-16">
                  <div className="max-w-md mx-auto">
                    <div className="mb-8">
                      <div className="bg-[#F5EBDD] rounded-full w-28 h-28 mx-auto flex items-center justify-center shadow-inner">
                        <BookOpen className="w-14 h-14 text-[#D4A373]" />
                      </div>
                    </div>
                    <h3 className="text-2xl font-bold text-[#2E4A3D] mb-3">
                      No book found
                    </h3>
                    <p className="text-[#333333]/70 text-base leading-relaxed">
                      {searchQuery ? (
                        <>
                          We couldn't find any books matching "<span className="font-semibold text-[#2E4A3D]">{searchQuery}</span>".
                          <br />
                          Try searching with a different title, author, or keyword.
                        </>
                      ) : (
                        'Start exploring by searching for a book title or author above.'
                      )}
                    </p>
                  </div>
                </div>
              ) : viewMode === 'grid' ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 mb-12">
                  {books.map((book) => (
                    <Link
                      key={book.id}
                      to={`/books/${book.id}`}
                      className="group cursor-pointer"
                    >
                      <div
                        className={`${book.color} rounded-xl p-6 flex items-center justify-center mb-3 aspect-[2/3] overflow-hidden border border-[#D4A373]/20 shadow-sm group-hover:shadow-md transition-shadow`}
                      >
                        <img
                          src={book.image}
                          alt={book.title}
                          className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                          onError={(e) => {
                            e.currentTarget.src = "https://via.placeholder.com/300x450/2E4A3D/ffffff?text=Book+Cover";
                          }}
                        />
                      </div>
                      <h3 className="text-sm font-bold text-[#2E4A3D] mb-1 line-clamp-2 group-hover:text-[#B85C38] transition-colors">
                        {book.title}
                      </h3>
                      <p className="text-xs text-[#333333]/80">
                        by {book.author}
                      </p>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="space-y-6 mb-12">
                  {books.map((book) => (
                    <Link
                      key={book.id}
                      to={`/books/${book.id}`}
                      className="flex gap-6 group cursor-pointer border-b border-[#F5EBDD] pb-6"
                    >
                      <div className={`${book.color} rounded-xl p-4 flex items-center justify-center w-28 h-40 flex-shrink-0 overflow-hidden border border-[#D4A373]/10`}>
                        <img
                          src={book.image}
                          alt={book.title}
                          className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                          onError={(e) => {
                            e.currentTarget.src = 'https://via.placeholder.com/150x225/2E4A3D/ffffff?text=Book';
                          }}
                        />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-[#2E4A3D] mb-1 group-hover:text-[#B85C38] transition-colors">{book.title}</h3>
                        <p className="text-sm text-[#D4A373] font-medium mb-3">by {book.author}</p>
                        <p className="text-sm text-[#333333] mb-3 line-clamp-2">
                          {book.description || 'A captivating mystery that will keep you guessing until the very end...'}
                        </p>
                        <div className="flex flex-wrap gap-2 text-xs">
                          {book.category && (
                            <span className="flex items-center gap-1 px-2 py-1 bg-[#A3B18A]/20 text-[#2E4A3D] rounded">
                              <BookOpen className="w-3 h-3" />
                              {book.category}
                            </span>
                          )}
                          {book.publishedYear && (
                            <span className="flex items-center gap-1 px-2 py-1 bg-[#F5EBDD] text-[#333333] rounded">
                              <Calendar className="w-3 h-3" />
                              {book.publishedYear}
                            </span>
                          )}
                        </div>
                        {book.price && (
                          <p className="text-base font-bold text-[#B85C38] mt-3">
                            ${book.price.toFixed(2)}
                          </p>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-8">
                  <button 
                    onClick={() => handlePageChange(page - 1)}
                    disabled={page === 1}
                    className={`p-2 rounded transition-colors ${page === 1 ? 'text-gray-300 cursor-not-allowed' : 'hover:bg-[#A3B18A]/20 text-[#2E4A3D]'}`}
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  
                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum: number;
                      if (totalPages <= 5) pageNum = i + 1;
                      else if (page <= 3) pageNum = i + 1;
                      else if (page >= totalPages - 2) pageNum = totalPages - 4 + i;
                      else pageNum = page - 2 + i;

                      return (
                        <button
                          key={pageNum}
                          onClick={() => handlePageChange(pageNum)}
                          className={`w-10 h-10 rounded flex items-center justify-center font-bold text-sm transition-colors ${
                            page === pageNum 
                              ? 'bg-[#2E4A3D] text-white shadow-md' 
                              : 'hover:bg-[#A3B18A]/20 text-[#2E4A3D]'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>
                  
                  <button 
                    onClick={() => handlePageChange(page + 1)}
                    disabled={page === totalPages}
                    className={`p-2 rounded transition-colors ${page === totalPages ? 'text-gray-300 cursor-not-allowed' : 'hover:bg-[#A3B18A]/20 text-[#2E4A3D]'}`}
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default BookSearchPage;