// frontend/src/lib/catalogApi.ts
// API service for the public book catalog / search page

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export interface CatalogBook {
  id: number;
  title: string;
  author: {
    name: string;
  } | null;
  genre?: {
    name: string;
  } | null;
  price: number; // Decimal → number in JS
  coverImageUrl?: string | null;
  averageRating: number;
  totalReviews: number;
}

export interface CatalogResponse {
  success: boolean;
  data: CatalogBook[];
  total?: number;
  page?: number;
  limit?: number;
}

/**
 * Fetch books for the catalog/search page
 * Supports pagination, search query, genre filter, price range, etc.
 */
export const fetchCatalogBooks = async ({
  query = '',
  genre = '',
  page = 1,
  limit = 20,
  sort = 'title', // or 'price', 'rating', 'newest'
}: {
  query?: string;
  genre?: string;
  page?: number;
  limit?: number;
  sort?: string;
}): Promise<CatalogResponse> => {
  try {
    const params = new URLSearchParams();
    if (query) params.append('search', query);
    if (genre) params.append('genre', genre);
    params.append('page', page.toString());
    params.append('limit', limit.toString());
    params.append('sort', sort);

    const response = await fetch(`${API_BASE_URL}/books/catalog?${params.toString()}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to fetch books');
    }

    const result: CatalogResponse = await response.json();

    // Normalize response just in case
    if (!result.data) {
      result.data = [];
    }

    return result;
  } catch (error) {
    console.error('Error fetching catalog books:', error);
    throw error;
  }
};