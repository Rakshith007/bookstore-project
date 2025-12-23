// frontend/src/lib/inventoryApi.ts
// API service dedicated to Inventory Check page operations

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

/**
 * Interface matching the Book model from Prisma schema
 * Used specifically for inventory operations
 */
export interface InventoryBook {
  id: number;
  title: string;
  sku: string;
  price: number; // Decimal → number in JS
  stockQuantity: number;
  coverImageUrl?: string | null;
  restockAlertLevel?: string | null; // Stored as string in DB, e.g., "10"
}

/**
 * Response format for inventory list
 */
export interface InventoryResponse {
  success: boolean;
  data: InventoryBook[];
  total?: number;
}

/**
 * Partial update payload for stock and/or price
 */
export interface InventoryUpdatePayload {
  price?: number;
  addedStock?: number; // Changed to match backend
}

/**
 * Fetch all books for inventory view
 * Optimized: gets essential fields only (can extend later)
 */
export const fetchInventoryBooks = async (token: string): Promise<InventoryBook[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/books?limit=1000`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to fetch inventory books');
    }

    const result = await response.json();

    // Handle various backend response formats
    let books: InventoryBook[] = [];
    if (Array.isArray(result)) {
      books = result;
    } else if (result.data) {
      books = result.data;
    } else if (result.books) {
      books = result.books;
    } else {
      throw new Error('Unexpected response format');
    }

    return books;
  } catch (error) {
    console.error('Error fetching inventory books:', error);
    throw error;
  }
};

/**
 * Partially update one or more books (price and/or add stock)
 * Uses PATCH with Prisma atomic operations support
 */
export const updateInventoryBooks = async (
  bookIds: number[],
  updates: { price?: number; addedStock?: number },
  token: string
): Promise<void> => {
  if (bookIds.length === 0) {
    throw new Error('No books selected for update');
  }

  // Check if there's anything to update
  if (updates.price === undefined && updates.addedStock === undefined) {
    throw new Error('Nothing to update: provide price or added stock');
  }

  try {
    const payload: { price?: number; addedStock?: number } = {};

    // Only include price if it's a valid number
    if (updates.price !== undefined && !isNaN(updates.price) && updates.price >= 0) {
      payload.price = updates.price;
    }

    // Only include addedStock if it's a positive number
    if (updates.addedStock !== undefined && !isNaN(updates.addedStock) && updates.addedStock > 0) {
      payload.addedStock = updates.addedStock;
    }

    if (Object.keys(payload).length === 0) {
      throw new Error('No valid updates provided');
    }

    // Perform updates sequentially
    await Promise.all(
      bookIds.map(async (id) => {
        const response = await fetch(`${API_BASE_URL}/books/${id}/inventory`, {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          const err = await response.json().catch(() => ({}));
          throw new Error(err.message || `Failed to update book ID ${id}`);
        }
      })
    );
  } catch (error) {
    console.error('Error updating inventory books:', error);
    throw error;
  }
};