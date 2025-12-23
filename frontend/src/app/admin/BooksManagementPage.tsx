import React, { useState, useEffect, useRef } from 'react';
import { Menu, X, ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Sidebar, MobileSidebarDrawer } from '../../components/layout/AdminSidebar';
import { fetchBooks, deleteBook, bulkDeleteBooks } from '../../lib/booksApi';
import { getToken } from '../../lib/auth';

interface Book {
  id: number;
  title: string;
  author: string;
  genre: string;
  category: string;
  price: number;
  sellingPrice?: number;
  stock: number;
  stockQuantity?: number;
  status: string;
  coverImage: string | null;
  isbn?: string;
}

interface Filters {
  genre: string;
  author: string;
  status: string;
}

const PLACEHOLDER_IMAGE = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjE1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZTVlNWU1Ii8+PHRleHQgeD0iNTAiIHk9IjUwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiM4ODgiPk5vIENvdmVyPC90ZXh0Pjwvc3ZnPg==';

const FiltersBar: React.FC<{
  filters: Filters;
  onFilterChange: (filters: Filters) => void;
  availableGenres: string[];
  availableAuthors: string[];
  availableStatuses: string[];
}> = ({ filters, onFilterChange, availableGenres, availableAuthors, availableStatuses }) => {
  const [openDropdown, setOpenDropdown] = useState<'genre' | 'author' | 'status' | null>(null);
  const genreRef = useRef<HTMLDivElement>(null);
  const authorRef = useRef<HTMLDivElement>(null);
  const statusRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        (genreRef.current && !genreRef.current.contains(event.target as Node)) &&
        (authorRef.current && !authorRef.current.contains(event.target as Node)) &&
        (statusRef.current && !statusRef.current.contains(event.target as Node))
      ) {
        setOpenDropdown(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleFilterSelect = (type: 'genre' | 'author' | 'status', value: string) => {
    onFilterChange({ ...filters, [type]: value });
    setOpenDropdown(null);
  };

  const toggleDropdown = (type: 'genre' | 'author' | 'status') => {
    setOpenDropdown(openDropdown === type ? null : type);
  };

  return (
    <div className="flex flex-wrap gap-3 mb-6">
      <button 
        onClick={() => onFilterChange({ genre: '', author: '', status: '' })}
        className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 whitespace-nowrap"
      >
        All
      </button>
      
      {/* Genre Filter */}
      <div className="relative" ref={genreRef}>
        <button 
          onClick={() => toggleDropdown('genre')}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 whitespace-nowrap min-w-[120px]"
        >
          <span className="truncate">{filters.genre || 'Genre'}</span>
          <ChevronDown size={16} className={`transition-transform ${openDropdown === 'genre' ? 'rotate-180' : ''}`} />
        </button>
        {openDropdown === 'genre' && (
          <div className="absolute top-full left-0 mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
            <div className="py-1 max-h-60 overflow-y-auto">
              <button
                onClick={() => handleFilterSelect('genre', '')}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 truncate"
              >
                All Genres
              </button>
              {availableGenres.map(genre => (
                <button
                  key={genre}
                  onClick={() => handleFilterSelect('genre', genre)}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 truncate"
                  title={genre}
                >
                  {genre}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
      
      {/* Author Filter */}
      <div className="relative" ref={authorRef}>
        <button 
          onClick={() => toggleDropdown('author')}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 whitespace-nowrap min-w-[120px]"
        >
          <span className="truncate">{filters.author || 'Author'}</span>
          <ChevronDown size={16} className={`transition-transform ${openDropdown === 'author' ? 'rotate-180' : ''}`} />
        </button>
        {openDropdown === 'author' && (
          <div className="absolute top-full left-0 mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
            <div className="py-1 max-h-60 overflow-y-auto">
              <button
                onClick={() => handleFilterSelect('author', '')}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 truncate"
              >
                All Authors
              </button>
              {availableAuthors.map(author => (
                <button
                  key={author}
                  onClick={() => handleFilterSelect('author', author)}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 truncate"
                  title={author}
                >
                  {author}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
      
      {/* Status Filter */}
      <div className="relative" ref={statusRef}>
        <button 
          onClick={() => toggleDropdown('status')}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 whitespace-nowrap min-w-[120px]"
        >
          <span className="truncate">{filters.status || 'Status'}</span>
          <ChevronDown size={16} className={`transition-transform ${openDropdown === 'status' ? 'rotate-180' : ''}`} />
        </button>
        {openDropdown === 'status' && (
          <div className="absolute top-full left-0 mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
            <div className="py-1">
              <button
                onClick={() => handleFilterSelect('status', '')}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                All Status
              </button>
              {availableStatuses.map(status => (
                <button
                  key={status}
                  onClick={() => handleFilterSelect('status', status)}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  {status.charAt(0).toUpperCase() + status.slice(1).replace('-', ' ')}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const BooksTable: React.FC<{
  books: Book[];
  selectedBooks: number[];
  onSelectAll: (checked: boolean) => void;
  onSelectBook: (id: number) => void;
}> = ({ books, selectedBooks, onSelectAll, onSelectBook }) => {
  const allSelected = books.length > 0 && selectedBooks.length === books.length;

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const target = e.target as HTMLImageElement;
    if (!target.src.includes('data:image/svg+xml')) {
      target.src = PLACEHOLDER_IMAGE;
    }
    e.preventDefault();
    e.stopPropagation();
  };

  return (
    <div className="hidden md:block bg-white rounded-lg border border-gray-200 overflow-hidden">
      <table className="w-full">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            <th className="w-12 px-6 py-3">
              <input 
                type="checkbox" 
                className="w-4 h-4 rounded border-gray-300" 
                checked={allSelected}
                onChange={(e) => onSelectAll(e.target.checked)}
              />
            </th>
            <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Cover</th>
            <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Title</th>
            <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Author</th>
            <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Genre</th>
            <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Price</th>
            <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Stock</th>
            <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {books.map((book) => (
            <tr key={book.id} className="hover:bg-gray-50">
              <td className="px-6 py-4">
                <input 
                  type="checkbox" 
                  className="w-4 h-4 rounded border-gray-300" 
                  checked={selectedBooks.includes(book.id)}
                  onChange={() => onSelectBook(book.id)}
                />
              </td>
              <td className="px-6 py-4">
                <img 
                  src={book.coverImage || PLACEHOLDER_IMAGE}
                  alt={book.title} 
                  className="w-12 h-12 object-cover rounded shadow-sm"
                  onError={handleImageError}
                  loading="lazy"
                />
              </td>
              <td className="px-6 py-4 text-sm text-gray-900 font-medium">{book.title}</td>
              <td className="px-6 py-4 text-sm text-gray-600">{book.author}</td>
              <td className="px-6 py-4 text-sm text-gray-600">{book.category || book.genre}</td>
              <td className="px-6 py-4 text-sm text-gray-900">
                ${book.price.toFixed(2)}
              </td>
              <td className="px-6 py-4 text-sm text-gray-900">{book.stockQuantity || book.stock}</td>
              <td className="px-6 py-4">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  book.status === 'available' ? 'bg-green-100 text-green-800' :
                  book.status === 'out-of-stock' ? 'bg-red-100 text-red-800' :
                  book.status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {book.status.charAt(0).toUpperCase() + book.status.slice(1).replace('-', ' ')}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const BookCard: React.FC<{
  book: Book;
  selected: boolean;
  onSelect: (id: number) => void;
}> = ({ book, selected, onSelect }) => {
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const target = e.target as HTMLImageElement;
    if (!target.src.includes('data:image/svg+xml')) {
      target.src = PLACEHOLDER_IMAGE;
    }
    e.preventDefault();
    e.stopPropagation();
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 mb-3">
      <div className="flex items-start gap-4">
        <input
          type="checkbox"
          className="w-4 h-4 rounded border-gray-300 mt-1"
          checked={selected}
          onChange={() => onSelect(book.id)}
        />
        <img 
          src={book.coverImage || PLACEHOLDER_IMAGE}
          alt={book.title} 
          className="w-20 h-20 object-cover rounded shadow-sm flex-shrink-0"
          onError={handleImageError}
          loading="lazy"
        />
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-medium text-gray-900 mb-1 truncate">{book.title}</h3>
          <p className="text-sm text-gray-600 mb-2 truncate">{book.author}</p>
          <p className="text-sm text-gray-600 mb-3 truncate">{book.category || book.genre}</p>
          <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
            <span className="text-gray-900 font-medium">
              ${book.price.toFixed(2)}
            </span>
            <span className="text-gray-600">Stock: {book.stockQuantity || book.stock}</span>
            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
              book.status === 'available' ? 'bg-green-100 text-green-800' :
              book.status === 'out-of-stock' ? 'bg-red-100 text-red-800' :
              book.status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
              'bg-gray-100 text-gray-800'
            }`}>
              {book.status.charAt(0).toUpperCase() + book.status.slice(1).replace('-', ' ')}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

const BooksManagementPage: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [books, setBooks] = useState<Book[]>([]);
  const [filteredBooks, setFilteredBooks] = useState<Book[]>([]);
  const [selectedBooks, setSelectedBooks] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  
  const [filters, setFilters] = useState<Filters>({
    genre: '',
    author: '',
    status: ''
  });
  
  const [availableGenres, setAvailableGenres] = useState<string[]>([]);
  const [availableAuthors, setAvailableAuthors] = useState<string[]>([]);
  const [availableStatuses] = useState<string[]>(['available', 'out-of-stock', 'draft']);
  
  const navigate = useNavigate();

  const getUniqueValues = <T,>(array: T[], getter: (item: T) => string | undefined): string[] => {
    const map: Record<string, boolean> = {};
    const result: string[] = [];
    
    array.forEach(item => {
      const value = getter(item);
      if (value && !map[value]) {
        map[value] = true;
        result.push(value);
      }
    });
    
    return result;
  };

  const loadBooks = async () => {
    try {
      setLoading(true);
      const token = getToken();
      if (!token) {
        throw new Error('Please log in as admin first');
      }

      const booksData = await fetchBooks(token);
      
      const transformedBooks = booksData.map((book: any) => {
        const priceValue = book.price || book.sellingPrice || 0;
        const priceNumber = typeof priceValue === 'string' 
          ? parseFloat(priceValue.replace('$', '')) 
          : typeof priceValue === 'number'
            ? priceValue
            : 0;
        
        let coverImage = book.coverImage;
        if (!coverImage || coverImage === 'null' || coverImage === 'undefined' || coverImage === PLACEHOLDER_IMAGE) {
          coverImage = null;
        }
        
        return {
          id: book.id,
          title: book.title,
          author: book.author || 'Unknown',
          genre: book.category || book.genre || 'Unknown',
          category: book.category || book.genre || 'Unknown',
          price: priceNumber,
          sellingPrice: book.sellingPrice,
          stock: book.stockQuantity || book.stock || 0,
          stockQuantity: book.stockQuantity,
          status: book.status?.toLowerCase() || 'available',
          coverImage: coverImage,
          isbn: book.isbn
        };
      });
      
      setBooks(transformedBooks);
      setFilteredBooks(transformedBooks);
      
      const genres = getUniqueValues(transformedBooks, (b) => b.category || b.genre);
      const authors = getUniqueValues(transformedBooks, (b) => b.author);
      
      setAvailableGenres(genres);
      setAvailableAuthors(authors);
      
    } catch (error: any) {
      console.error('Error loading books:', error);
      setMessage({
        type: 'error',
        text: error.message || 'Failed to load books'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let result = books;
    
    if (filters.genre) {
      result = result.filter(book => 
        (book.category || book.genre).toLowerCase().includes(filters.genre.toLowerCase())
      );
    }
    
    if (filters.author) {
      result = result.filter(book => 
        book.author.toLowerCase().includes(filters.author.toLowerCase())
      );
    }
    
    if (filters.status) {
      result = result.filter(book => 
        book.status.toLowerCase().includes(filters.status.toLowerCase())
      );
    }
    
    setFilteredBooks(result);
    setSelectedBooks([]);
  }, [filters, books]);

  useEffect(() => {
    loadBooks();
  }, []);

  const handleFilterChange = (newFilters: Filters) => {
    setFilters(newFilters);
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedBooks(filteredBooks.map(book => book.id));
    } else {
      setSelectedBooks([]);
    }
  };

  const handleSelectBook = (id: number) => {
    if (selectedBooks.includes(id)) {
      setSelectedBooks(selectedBooks.filter(bookId => bookId !== id));
    } else {
      setSelectedBooks([...selectedBooks, id]);
    }
  };

  // NEW: Add to Products (publish selected books)
  const handleAddToProducts = async () => {
    if (selectedBooks.length === 0) {
      setMessage({
        type: 'error',
        text: 'Please select at least one book to add to products'
      });
      return;
    }

    if (!window.confirm(`Publish ${selectedBooks.length} selected book(s) to the website?`)) {
      return;
    }

    try {
      const token = getToken();
      if (!token) throw new Error('Authentication required');

      // You'll need to create this function in booksApi.ts
      // It should PATCH /books/:id/status with { status: "available" }
      await Promise.all(
        selectedBooks.map(bookId => 
          // Replace with your actual API call
          fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/books/${bookId}/status`, {
            method: 'PATCH',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ status: 'available' }),
          }).then(res => {
            if (!res.ok) throw new Error('Failed to update status');
            return res.json();
          })
        )
      );

      setMessage({
        type: 'success',
        text: `${selectedBooks.length} book(s) added to products successfully!`
      });

      await loadBooks();
      setSelectedBooks([]);
    } catch (error: any) {
      setMessage({
        type: 'error',
        text: error.message || 'Failed to add books to products'
      });
    }
  };

  const handleDelete = async () => {
    if (selectedBooks.length === 0) {
      setMessage({
        type: 'error',
        text: 'Please select at least one book to delete'
      });
      return;
    }

    if (!window.confirm(`Are you sure you want to delete ${selectedBooks.length} selected book(s)?`)) {
      return;
    }

    try {
      const token = getToken();
      if (!token) {
        throw new Error('Please log in as admin first');
      }

      if (selectedBooks.length === 1) {
        await deleteBook(selectedBooks[0], token);
      } else {
        await bulkDeleteBooks(selectedBooks, token);
      }
      
      setMessage({
        type: 'success',
        text: `${selectedBooks.length} book(s) deleted successfully`
      });
      
      await loadBooks();
      setSelectedBooks([]);
      
    } catch (error: any) {
      console.error('Error deleting books:', error);
      setMessage({
        type: 'error',
        text: error.message || 'Failed to delete books'
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <MobileSidebarDrawer
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      <div className="lg:hidden fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-30">
        <div className="flex items-center justify-between px-4 py-3">
          <button onClick={() => setIsSidebarOpen(true)} className="p-2">
            <Menu size={24} />
          </button>
          <h1 className="text-lg font-semibold text-gray-900">Books Management</h1>
          <div className="w-10" />
        </div>
      </div>

      <div className="lg:ml-64 pt-16 lg:pt-0">
        <div className="px-4 py-6 lg:px-8 lg:py-8">
          {message && (
            <div className={`p-4 rounded-lg mb-6 text-sm font-medium ${
              message.type === 'success' 
                ? 'bg-green-50 text-green-800 border border-green-200' 
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}>
              <div className="flex items-center justify-between">
                <span>{message.text}</span>
                <button onClick={() => setMessage(null)} className="hover:opacity-70">
                  <X size={16} />
                </button>
              </div>
            </div>
          )}

          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6 lg:mb-8">
            <h1 className="text-2xl lg:text-3xl font-semibold text-gray-900 mb-4 lg:mb-0 hidden lg:block">
              Books Management
            </h1>
            
            {/* ACTION BUTTONS - "Add to Products" + Delete */}
            <div className="flex flex-wrap gap-3">
              <button 
                onClick={handleAddToProducts}
                disabled={selectedBooks.length === 0}
                className="px-6 py-2.5 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
              >
                Add to Products ({selectedBooks.length})
              </button>
              <button 
                onClick={handleDelete}
                disabled={selectedBooks.length === 0}
                className="px-6 py-2.5 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
              >
                Delete Selected ({selectedBooks.length})
              </button>
            </div>
          </div>

          {/* NEW: Staged for Publishing Preview */}
          {selectedBooks.length > 0 && (
            <div className="mb-8 p-5 bg-green-50 border-2 border-green-200 rounded-xl">
              <h3 className="text-lg font-semibold text-green-900 mb-4">
                Staged for Publishing ({selectedBooks.length})
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {filteredBooks
                  .filter(book => selectedBooks.includes(book.id))
                  .map(book => (
                    <div key={book.id} className="text-center">
                      <img 
                        src={book.coverImage || PLACEHOLDER_IMAGE}
                        alt={book.title}
                        className="w-full aspect-[2/3] object-cover rounded mb-2 shadow-sm"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          if (!target.src.includes('data:image/svg+xml')) {
                            target.src = PLACEHOLDER_IMAGE;
                          }
                        }}
                      />
                      <p className="text-xs text-gray-700 truncate font-medium">{book.title}</p>
                      <p className="text-xs text-gray-500">${book.price.toFixed(2)}</p>
                    </div>
                  ))}
              </div>
              <p className="text-sm text-green-700 mt-4">
                These books will be visible on the website after clicking "Add to Products"
              </p>
            </div>
          )}

          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              <p className="mt-4 text-gray-600">Loading books...</p>
            </div>
          ) : (
            <>
              <FiltersBar 
                filters={filters}
                onFilterChange={handleFilterChange}
                availableGenres={availableGenres}
                availableAuthors={availableAuthors}
                availableStatuses={availableStatuses}
              />
              
              <BooksTable 
                books={filteredBooks}
                selectedBooks={selectedBooks}
                onSelectAll={handleSelectAll}
                onSelectBook={handleSelectBook}
              />

              <div className="md:hidden">
                {filteredBooks.map((book) => (
                  <BookCard 
                    key={book.id} 
                    book={book}
                    selected={selectedBooks.includes(book.id)}
                    onSelect={handleSelectBook}
                  />
                ))}
              </div>

              {selectedBooks.length > 0 && (
                <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-800">
                    {selectedBooks.length} book(s) selected. Use "Add to Products" to publish them.
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default BooksManagementPage;