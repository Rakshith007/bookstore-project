// src/pages/OrderHistoryPage.tsx

import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Package } from "lucide-react";
import Navbar from "../../components/layout/Navbar";
import { isLoggedIn, getToken } from "../../lib/auth";

// --- Types ---
interface OrderItem {
  id: number;
  book?: {
    id: number;
    title: string;
    author: { name: string };
    coverImageUrl?: string;
  } | null;
  quantity: number;
}

interface Order {
  id: number;
  orderNumber: string;
  orderDate: string;
  status: string; // keep string to accept whatever backend sends
  totalAmount: number;
  orderItems: OrderItem[];
}

// --- Components ---

const OrderCard: React.FC<{ order: Order }> = ({ order }) => {
  // Map backend status → displayed status + style
  let displayStatus = order.status;
  let statusStyles = '';

  if (order.status === 'PICKED') {
    displayStatus = 'DELIVERED';
    statusStyles = 'bg-[#A3B18A] text-[#2E4A3D]'; // Greenish (same as delivered)
  } else if (order.status === 'PROCESSING') {
    statusStyles = 'bg-[#F5EBDD] text-[#D4A373]'; // Beige/Tan
  } else {
    // Fallback for any unexpected status (shouldn't happen)
    statusStyles = 'bg-gray-100 text-gray-700';
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  const coverUrl = order.orderItems[0]?.book?.coverImageUrl || "https://via.placeholder.com/200x300?text=Book";

  return (
    <div className="bg-[#FAF9F6] rounded-xl shadow-sm border border-[#F5EBDD] p-5 flex items-center justify-between gap-6 hover:shadow-md transition-all duration-300 border-l-4 border-l-[#D4A373] max-w-3xl mx-auto">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-3 mb-2">
          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${statusStyles}`}>
            {displayStatus}
          </span>
          <p className="text-[11px] font-bold text-[#D4A373] uppercase tracking-tight opacity-80">
            ID: {order.orderNumber}
          </p>
        </div>
        
        <h3 className="text-lg font-serif font-bold text-[#333333] truncate">
          Placed on {formatDate(order.orderDate)}
        </h3>
        
        <div className="mt-4 flex items-center gap-4">
          <Link 
            to="/orderdetail" 
            state={{ orderNumber: order.orderNumber }}
            className="text-xs font-bold text-[#B85C38] hover:text-[#2E4A3D] underline underline-offset-4 transition-colors"
          >
            View Details
          </Link>
          <span className="text-xs text-gray-400">|</span>
          <span className="text-xs font-medium text-gray-600">
            Total: ${Number(order.totalAmount).toFixed(2)}
          </span>
        </div>
      </div>

      <div className="w-16 h-24 flex-shrink-0 rounded-md overflow-hidden shadow-md ring-2 ring-[#F5EBDD]">
        <img
          src={coverUrl}
          alt="Book cover"
          className="w-full h-full object-cover"
        />
      </div>
    </div>
  );
};

const EmptyState: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 bg-[#FAF9F6] border border-[#F5EBDD] rounded-xl">
      <div className="w-24 h-24 mb-6 bg-[#F5EBDD] rounded-full flex items-center justify-center shadow-inner">
        <Package className="w-10 h-10 text-[#D4A373]" />
      </div>
      <h3 className="text-xl font-serif font-bold text-[#333333] mb-2">No orders yet</h3>
      <p className="text-[#333333] opacity-70 text-center max-w-md mb-6 text-sm">
        Your order history is currently empty. Browse our collection to begin your voyage.
      </p>
      <Link to="/">
        <button className="px-6 py-3 bg-[#333333] hover:bg-black text-white text-xs font-bold uppercase tracking-widest rounded transition-colors">
          Shop Now
        </button>
      </Link>
    </div>
  );
};

const OrderHistoryPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:4000";

  useEffect(() => {
    const fetchOrderHistory = async () => {
      if (!isLoggedIn()) {
        setError("Please log in to view your order history.");
        setLoading(false);
        return;
      }

      const token = getToken();

      try {
        const response = await fetch(`${API_BASE_URL}/orders`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        const result = await response.json();

        if (result.success && Array.isArray(result.data)) {
          // Filter only the two relevant statuses
          const relevantOrders = result.data.filter((o: any) =>
            ["PROCESSING", "PICKED"].includes(o.status)
          );

          // Sort newest first
          relevantOrders.sort((a: any, b: any) =>
            new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime()
          );

          setOrders(relevantOrders);
        } else {
          setOrders([]);
        }
      } catch (err: any) {
        console.error("Order history fetch error:", err);
        setError(err.message || "Failed to load order history");
      } finally {
        setLoading(false);
      }
    };

    fetchOrderHistory();
  }, [API_BASE_URL]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAF9F6]">
        <Navbar />
        <div className="flex items-center justify-center h-[60vh]">
          <p className="text-lg font-serif text-[#D4A373] animate-pulse">Loading OrderHistory...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#FAF9F6]">
        <Navbar />
        <div className="flex flex-col items-center justify-center h-[60vh] px-4">
          <p className="text-xl font-serif text-red-800 mb-4">{error}</p>
          <Link to="/">
            <button className="px-6 py-3 bg-[#333333] text-white text-xs font-bold uppercase rounded hover:bg-black">
              Return Home
            </button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF9F6]">
      <Navbar />
      <main className="max-w-3xl mx-auto px-6 py-10">
        <header className="mb-8 text-center">
          <h2 className="text-2xl font-serif font-bold text-black mb-1">
            Order History
          </h2>
          <p className="text-sm text-black opacity-70">
            Small acts of kindness create big waves of change.
          </p>
        </header>

        {orders.length > 0 ? (
          <div className="space-y-4">
            {orders.map((order) => (
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