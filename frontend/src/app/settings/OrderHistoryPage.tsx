// src/pages/OrderHistoryPage.tsx

import React from 'react';

type OrderStatus = 'Delivered' | 'Processing' | 'Cancelled';

interface Order {
  id: string;
  placedDate: string;
  status: OrderStatus;
  bookCoverUrl: string;
}

const mockedOrders: Order[] = [
  {
    id: '#1234567890',
    placedDate: 'July 15, 2024',
    status: 'Delivered',
    bookCoverUrl: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&h=600&fit=crop',
  },
  {
    id: '#9876543210',
    placedDate: 'June 20, 2024',
    status: 'Processing',
    bookCoverUrl: 'https://images.unsplash.com/photo-1509264288246-68c1e4d0d298?w=400&h=600&fit=crop',
  },
  {
    id: '#5555555555',
    placedDate: 'May 5, 2024',
    status: 'Cancelled',
    bookCoverUrl: 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=400&h=600&fit=crop',
  },
];

// For empty state demonstration, comment out the data above and use:
// const mockedOrders: Order[] = [];


const OrderCard: React.FC<{ order: Order }> = ({ order }) => {
  const statusColor = order.status === 'Delivered' ? 'text-green-600' :
                      order.status === 'Processing' ? 'text-amber-600' :
                      'text-red-600';

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-8 hover:shadow-md transition-shadow">
      <div className="flex-1">
        <p className="text-sm text-gray-500 mb-1">Order ID: {order.id}</p>
        <p className="text-lg font-semibold text-gray-900 mb-2">Placed: {order.placedDate}</p>
        <p className={`text-sm font-medium ${statusColor} mb-6`}>Status: {order.status}</p>
        <button className="px-5 py-2 bg-gray-100 hover:bg-gray-200 rounded-full text-sm font-medium text-gray-700 transition-colors">
          View Details
        </button>
      </div>
      <div className="w-full md:w-48 h-72 rounded-2xl overflow-hidden shadow-lg">
        <img
          src={order.bookCoverUrl}
          alt="Book cover"
          className="w-full h-full object-cover"
        />
      </div>
    </div>
  );
};

const EmptyState: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center py-24 px-6 bg-gray-50 rounded-3xl">
      <div className="w-64 h-64 mb-8 bg-beige-100 rounded-2xl flex items-center justify-center shadow-inner">
        <img
          src="https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400&h=400&fit=crop"
          alt="Stack of books"
          className="w-48 h-48 object-contain"
        />
      </div>
      <h3 className="text-2xl font-semibold text-gray-900 mb-3">No orders yet</h3>
      <p className="text-gray-600 text-center max-w-md mb-8">
        Browse our collection and find your next great read.
      </p>
      <button className="px-8 py-3 bg-gray-900 hover:bg-gray-800 text-white rounded-full font-medium transition-colors">
        Shop Now
      </button>
    </div>
  );
};

const OrderHistoryPage: React.FC = () => {
  const hasOrders = mockedOrders.length > 0;

  return (
    <div className="min-h-screen bg-gray-50">

      <main className="max-w-7xl mx-auto px-6 py-12">
        <div className="mb-12">
          <h2 className="text-4xl md:text-5xl font-serif font-bold text-gray-900 mb-4">Order History</h2>
          <p className="text-lg text-gray-600 max-w-2xl">
            View your past orders and track current deliveries.
          </p>
        </div>

        {hasOrders ? (
          <div className="space-y-12">
            {mockedOrders.map((order) => (
              <OrderCard key={order.id} order={order} />
            ))}
          </div>
        ) : (
          <EmptyState />
        )}
      </main>
    </div>
  );
};

export default OrderHistoryPage;