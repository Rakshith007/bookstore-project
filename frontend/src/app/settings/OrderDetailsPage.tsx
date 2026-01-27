// src/app/settings/OrderDetailsPage.tsx

import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Package, Truck, Check, RefreshCw, Loader2 } from "lucide-react";
import { getToken } from "../../lib/auth";
import Navbar from "../../components/layout/Navbar";

// --- Types ---
interface OrderItem {
  id: number;
  book?: {
    id: number;
    title: string;
    author: { name: string };
    coverImageUrl?: string;
    price: number;
  } | null;
  quantity: number;
  unitPrice: number;
}

interface OrderData {
  id: number;
  orderNumber: string;
  orderDate: string;
  status: string; // more flexible than union → backend might send anything
  totalAmount: number;
  shippingAddressSnapshot?: {
    fullName: string;
    phone: string;
    streetAddress: string;
    apartment?: string;
    city: string;
    state?: string;
    country: string;
  };
  orderItems: OrderItem[];
}

const OrderDetailsPage: React.FC = () => {
  const location = useLocation();
  const [allOrders, setAllOrders] = useState<OrderData[]>([]);
  const [currentOrder, setCurrentOrder] = useState<OrderData | null>(null);
  const [loading, setLoading] = useState(true);

  const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:4000";

  const requestedOrderNumber = (location.state as { orderNumber?: string })?.orderNumber;

  useEffect(() => {
    const fetchAllOrders = async () => {
      const token = getToken();
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`${API_BASE_URL}/orders`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) throw new Error("Failed to load orders");

        const result = await response.json();
        if (result.success && result.data) {
          const orders: OrderData[] = result.data;

          orders.sort((a, b) =>
            new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime()
          );

          setAllOrders(orders);

          if (requestedOrderNumber) {
            const matched = orders.find((o) => o.orderNumber === requestedOrderNumber);
            if (matched) {
              setCurrentOrder(matched);
              setLoading(false);
              return;
            }
          }

          // Only consider PROCESSING or PICKED as "active" now
          const activeOrder = orders.find((o) =>
            ["PROCESSING", "PICKED"].includes(o.status)
          );

          setCurrentOrder(activeOrder || (orders.length > 0 ? orders[0] : null));
        }
      } catch (err) {
        console.error("Error loading orders:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAllOrders();
  }, [API_BASE_URL, requestedOrderNumber]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAF9F6] flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-[#D4A373]" />
      </div>
    );
  }

  if (!currentOrder) {
    return (
      <div className="min-h-screen bg-[#FAF9F6] p-10 flex items-center justify-center">
        <div className="bg-white rounded-xl border border-[#F5EBDD] p-12 text-center max-w-md">
          <Package className="w-16 h-16 text-[#D4A373] mx-auto mb-6 opacity-50" />
          <h2 className="text-2xl font-serif font-bold text-[#333333] mb-3">
            Order Not Found
          </h2>
          <p className="text-[#333333] opacity-70 text-sm leading-relaxed">
            We couldn't find the requested order. Please try again from your order history.
          </p>
        </div>
      </div>
    );
  }

  // Map backend status → displayed status + style + icon
  let displayStatus = currentOrder.status;
  let statusBg = "bg-[#F5EBDD] text-[#D4A373]";
  let StatusIcon = Truck;

  if (currentOrder.status === "PICKED") {
    displayStatus = "DELIVERED";
    statusBg = "bg-[#A3B18A] text-[#2E4A3D]";
    StatusIcon = Check;
  } else if (currentOrder.status === "PROCESSING") {
    // remains PROCESSING + truck icon + beige
  }

  const calculatedSubtotal = currentOrder.orderItems.reduce(
    (acc, item) => acc + item.unitPrice * item.quantity,
    0
  );
  const estimatedShipping =
    currentOrder.totalAmount > calculatedSubtotal
      ? currentOrder.totalAmount - calculatedSubtotal
      : 0;

  // Only show "Buy Again" if displayed as DELIVERED (i.e. real status was PICKED)
  const showBuyAgain = displayStatus === "DELIVERED";

  return (
    <div className="min-h-screen bg-[#FAF9F6]">
      <Navbar />

      <main className="max-w-4xl mx-auto px-6 py-10">
        {/* Compact Header */}
        <header className="mb-8 border-b border-[#F5EBDD] pb-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h2 className="text-2xl font-serif font-bold text-black mb-1">
                Order Details
              </h2>
              <p className="text-sm text-black opacity-70">
                Ref: <span className="font-mono">{currentOrder.orderNumber}</span> • Placed{" "}
                {formatDate(currentOrder.orderDate)}
              </p>
            </div>
            <div
              className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider ${statusBg}`}
            >
              <StatusIcon className="w-3.5 h-3.5" />
              {displayStatus}
            </div>
          </div>
        </header>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left: Items List */}
          <div className="lg:col-span-2">
            <section className="bg-white rounded-xl border border-[#F5EBDD] overflow-hidden">
              <div className="bg-[#F5EBDD] px-5 py-3 border-b border-[#D4A373]">
                <h3 className="text-sm font-bold text-[#2E4A3D] uppercase tracking-widest">
                  Purchased Titles
                </h3>
              </div>
              <div className="divide-y divide-[#F5EBDD]">
                {currentOrder.orderItems.map((item) => {
                  const book = item.book;

                  const title = book ? book.title : "Title not available";
                  const authorName = book ? (book.author?.name || "Unknown Author") : "—";
                  const coverUrl = book?.coverImageUrl || "https://via.placeholder.com/150";

                  return (
                    <div key={item.id} className="p-4 flex items-center gap-4">
                      <img
                        src={coverUrl}
                        alt={title}
                        className="w-12 h-16 object-cover rounded shadow-sm"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-bold text-[#333333] truncate">
                          {title}
                        </h4>
                        <p className="text-xs text-[#333333] opacity-60">
                          by {authorName}
                        </p>
                        <p className="text-[10px] text-[#333333] opacity-40 mt-1">
                          Qty: {item.quantity}
                        </p>
                      </div>
                      <div className="text-sm font-bold text-[#2E4A3D]">
                        ${(item.unitPrice * item.quantity).toFixed(2)}
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          </div>

          {/* Right: Summary & Actions */}
          <div className="space-y-6">
            {/* Payment Summary */}
            <section className="bg-[#F5EBDD] rounded-xl p-5 border-l-4 border-l-[#D4A373]">
              <h3 className="text-xs font-bold text-[#2E4A3D] uppercase tracking-widest mb-4">
                Summary
              </h3>
              <div className="space-y-3 text-xs">
                <div className="flex justify-between text-[#333333] opacity-70">
                  <span>Subtotal</span>
                  <span>${calculatedSubtotal.toFixed(2)}</span>
                </div>
                {estimatedShipping > 0 && (
                  <div className="flex justify-between text-[#333333] opacity-70">
                    <span>Shipping</span>
                    <span>${estimatedShipping.toFixed(2)}</span>
                  </div>
                )}
                <div className="pt-3 border-t border-[#D4A373] flex justify-between items-end">
                  <span className="font-bold text-[#333333]">Total</span>
                  <span className="text-xl font-serif font-bold text-[#2E4A3D]">
                    ${Number(currentOrder.totalAmount).toFixed(2)}
                  </span>
                </div>
              </div>
            </section>            
          </div>
        </div>
      </main>
    </div>
  );
};

export default OrderDetailsPage;