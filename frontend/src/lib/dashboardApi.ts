// src/lib/dashboardApi.ts  (or wherever you put it)

import { getToken } from './auth';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export interface DashboardStats {
  totalOrders: number;
  totalSales: number;
  pendingShipments: number;
  newUsers: number;
  lowStockItems: number;
  monthlySales: { month: string; amount: number }[];
  genreSales: { genre: string; sales: number }[];
}

export const fetchDashboardStats = async (): Promise<DashboardStats> => {
  const token = getToken();
  if (!token) {
    throw new Error('Not authenticated');
  }

  const response = await fetch(`${API_BASE_URL}/admin/orders?limit=1000`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to fetch orders for dashboard');
  }

  const result = await response.json();

  // Safeguard: backend returns { success: true, data: [...] }
  if (!result.success || !Array.isArray(result.data)) {
    throw new Error('Invalid response format from server');
  }

  const orders = result.data;

  // === Calculations (all correct and safe) ===
  const totalOrders = orders.length;

  const totalSales = orders.reduce((sum: number, order: any) => {
    return sum + (order.totalAmount || 0);
  }, 0);

  const pendingShipments = orders.filter((order: any) =>
    ['PROCESSING', 'PICKED', 'PACKED'].includes(order.status)
  ).length;

  // Monthly sales – improved sorting and formatting
  const monthlyMap = new Map<string, number>();
  orders.forEach((order: any) => {
    if (!order.orderDate) return;
    const date = new Date(order.orderDate);
    if (isNaN(date.getTime())) return; // skip invalid dates

    const monthKey = date.toLocaleString('default', { month: 'short', year: 'numeric' });
    monthlyMap.set(monthKey, (monthlyMap.get(monthKey) || 0) + (order.totalAmount || 0));
  });

  const monthlySales = Array.from(monthlyMap.entries())
    .sort((a, b) => {
      // Sort by actual date (e.g., "Jan 2024" before "Feb 2025")
      return new Date(a[0] + ' 1').getTime() - new Date(b[0] + ' 1').getTime();
    })
    .slice(-12) // last 12 months
    .map(([month, amount]) => ({
      month,
      amount: Math.round(amount),
    }));

  // Genre sales – safe access
  const genreMap = new Map<string, number>();
  orders.forEach((order: any) => {
    if (!order.orderItems || !Array.isArray(order.orderItems)) return;

    order.orderItems.forEach((item: any) => {
      const genreName = item.book?.genre?.name || 'Unknown';
      const revenue = (item.quantity || 0) * (item.unitPrice || 0);
      genreMap.set(genreName, (genreMap.get(genreName) || 0) + revenue);
    });
  });

  const genreSales = Array.from(genreMap.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([genre, sales]) => ({
      genre,
      sales: Math.round(sales),
    }));

  // Placeholder values – clearly marked
  const newUsers = 0; // TODO: Add /users count endpoint later
  const lowStockItems = 0; // TODO: Add books low stock query later

  return {
    totalOrders,
    totalSales: Math.round(totalSales),
    pendingShipments,
    newUsers,
    lowStockItems,
    monthlySales: monthlySales.length > 0 ? monthlySales : [],
    genreSales: genreSales.length > 0 ? genreSales : [],
  };
};