// frontend/src/lib/booksApi.ts
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export interface Book {
  id: number;
  title: string;
  author: string;
  category: string;
  genre?: string;
  price: string | number;
  sellingPrice?: number;
  mrp?: number;
  stock: number;
  stockQuantity?: number;
  status: string;
  coverImage: string;
  isbn?: string;
  publisher?: string;
  publishedYear?: number | string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface BookFilters {
  category?: string;
  genre?: string;
  author?: string;
  status?: string;
  search?: string;
  page?: number;
  limit?: number;
  minPrice?: number;
  maxPrice?: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  total?: number;
  page?: number;
  limit?: number;
  totalPages?: number;
}

// Fetch all books with optional filters
export const fetchBooks = async (
  token: string, 
  filters?: BookFilters
): Promise<Book[]> => {
  try {
    const queryParams = new URLSearchParams();
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== '' && value !== null) {
          queryParams.append(key, value.toString());
        }
      });
    }
    
    const queryString = queryParams.toString();
    const url = queryString 
      ? `${API_BASE_URL}/books?${queryString}`
      : `${API_BASE_URL}/books`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Failed to fetch books: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    // Handle different response formats
    if (Array.isArray(data)) {
      return data;
    } else if (data.books) {
      return data.books;
    } else if (data.data) {
      return data.data;
    }
    
    throw new Error('Unexpected response format');
  } catch (error) {
    console.error('Error fetching books:', error);
    throw error;
  }
};

// Fetch single book by ID
export const fetchBookById = async (id: number, token: string): Promise<Book> => {
  try {
    const response = await fetch(`${API_BASE_URL}/books/${id}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Failed to fetch book: ${response.statusText}`);
    }
    
    const data = await response.json();
    return data.book || data.data || data;
  } catch (error) {
    console.error(`Error fetching book ${id}:`, error);
    throw error;
  }
};

// Create a new book (same as uploadBook but renamed for consistency)
export const createBook = async (formData: FormData, token: string): Promise<Book> => {
  try {
    const response = await fetch(`${API_BASE_URL}/books`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Failed to create book: ${response.statusText}`);
    }
    
    const data = await response.json();
    return data.book || data.data || data;
  } catch (error) {
    console.error('Error creating book:', error);
    throw error;
  }
};

// Update existing book
export const updateBook = async (
  id: number, 
  bookData: Partial<Book> | FormData, 
  token: string
): Promise<Book> => {
  try {
    const isFormData = bookData instanceof FormData;
    const headers: HeadersInit = {
      'Authorization': `Bearer ${token}`,
    };
    
    let body: BodyInit;
    if (isFormData) {
      body = bookData;
    } else {
      headers['Content-Type'] = 'application/json';
      body = JSON.stringify(bookData);
    }
    
    const response = await fetch(`${API_BASE_URL}/books/${id}`, {
      method: 'PUT',
      headers,
      body,
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Failed to update book: ${response.statusText}`);
    }
    
    const data = await response.json();
    return data.book || data.data || data;
  } catch (error) {
    console.error(`Error updating book ${id}:`, error);
    throw error;
  }
};

// Delete book
export const deleteBook = async (id: number, token: string): Promise<boolean> => {
  try {
    const response = await fetch(`${API_BASE_URL}/books/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Failed to delete book: ${response.statusText}`);
    }
    
    return true;
  } catch (error) {
    console.error(`Error deleting book ${id}:`, error);
    throw error;
  }
};

// Update book status only
export const updateBookStatus = async (
  id: number, 
  status: string, 
  token: string
): Promise<Book> => {
  try {
    const response = await fetch(`${API_BASE_URL}/books/${id}/status`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status }),
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Failed to update book status: ${response.statusText}`);
    }
    
    const data = await response.json();
    return data.book || data.data || data;
  } catch (error) {
    console.error(`Error updating book status for ${id}:`, error);
    throw error;
  }
};

// Bulk operations
export const bulkUpdateBooks = async (
  ids: number[], 
  updates: Partial<Book>, 
  token: string
): Promise<boolean> => {
  try {
    const response = await fetch(`${API_BASE_URL}/books/bulk`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ ids, updates }),
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Failed to bulk update books: ${response.statusText}`);
    }
    
    return true;
  } catch (error) {
    console.error('Error bulk updating books:', error);
    throw error;
  }
};

export const bulkDeleteBooks = async (ids: number[], token: string): Promise<boolean> => {
  try {
    const response = await fetch(`${API_BASE_URL}/books/bulk`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ ids }),
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Failed to bulk delete books: ${response.statusText}`);
    }
    
    return true;
  } catch (error) {
    console.error('Error bulk deleting books:', error);
    throw error;
  }
};

// Get book statistics
export const getBookStatistics = async (token: string): Promise<any> => {
  try {
    const response = await fetch(`${API_BASE_URL}/books/statistics`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Failed to get statistics: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching book statistics:', error);
    throw error;
  }
};

// Get categories/genres list
export const getCategories = async (token: string): Promise<string[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/books/categories`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Failed to get categories: ${response.statusText}`);
    }
    
    const data = await response.json();
    return data.categories || data.data || [];
  } catch (error) {
    console.error('Error fetching categories:', error);
    throw error;
  }
};

// Get authors list
export const getAuthors = async (token: string): Promise<string[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/books/authors`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Failed to get authors: ${response.statusText}`);
    }
    
    const data = await response.json();
    return data.authors || data.data || [];
  } catch (error) {
    console.error('Error fetching authors:', error);
    throw error;
  }
};

// Export uploadBook from existing api.ts for compatibility
// You can also move it here and update the import in AddBookPage
export { uploadBook } from './api';