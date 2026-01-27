// src/lib/adminOrdersApi.ts
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export interface AdminOrder {
  orderNumber: string;
  orderDate: string;
  totalAmount: number;
  status: string;
  priority: string;
  user: {
    fullName: string;
    email: string;
    phoneNumber?: string | null;
  } | null;
  shippingAddressSnapshot: {
    streetAddress?: string;
    apartment?: string;
    city?: string;
    state?: string;
    pincode?: string;
  };
  paymentMethod?: {
    methodType: string;
  } | null;
  orderItems: Array<{
    quantity: number;
    unitPrice: number;
    book: {
      title: string;
      coverImageUrl?: string | null;
      author: { name: string };
      stockQuantity: number;
      sku?: string;
    };
  }>;
}

export interface AdminOrdersResponse {
  success: boolean;
  data: AdminOrder[];
}

export const fetchAdminOrders = async (): Promise<AdminOrder[]> => {
  const token = localStorage.getItem('authToken');
  if (!token) {
    throw new Error('You must be logged in');
  }

  const response = await fetch(`${API_BASE_URL}/admin/orders`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to load orders');
  }

  const result: AdminOrdersResponse = await response.json();

  if (!result.success || !result.data) {
    throw new Error('Invalid response from server');
  }

  return result.data;
};