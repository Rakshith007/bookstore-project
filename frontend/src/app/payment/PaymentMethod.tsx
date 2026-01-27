import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/layout/Navbar";
import { isLoggedIn, getToken } from "../../lib/auth";

interface CartItem {
  id: number;
  title: string;
  author: string;
  image: string;
  price: number;
  quantity: number;
}

const PaymentPage: React.FC = () => {
  const navigate = useNavigate();

  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [placingOrder, setPlacingOrder] = useState(false);

  const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:4000";

  // Check login + fetch cart only
  useEffect(() => {
    const fetchData = async () => {
      if (!isLoggedIn()) {
        navigate("/login", { state: { from: "/payment" } });
        return;
      }

      const token = getToken();

      try {
        // Fetch cart only (no addresses needed anymore)
        const cartRes = await fetch(`${API_BASE_URL}/cart`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (cartRes.ok) {
          const cartData = await cartRes.json();
          if (cartData.success && cartData.data) {
            const items = cartData.data.map((item: any) => ({
              id: item.book.id,
              title: item.book.title,
              author: item.book.author?.name || "Unknown",
              image: item.book.coverImageUrl || "",
              price: Number(item.book.price),
              quantity: item.quantity,
            }));
            setCartItems(items);
          }
        } else {
          throw new Error("Failed to load cart");
        }
      } catch (err) {
        console.error("Failed to load cart:", err);
        alert("Failed to load your cart. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = 0;
  const tax = 0;
  const total = subtotal + shipping + tax;

  const handlePlaceOrder = async () => {
    setPlacingOrder(true);
    const token = getToken();

    try {
      const orderPayload = {
        paymentMethod: "ONLINE", // Only online payment
        // No shippingAddressId anymore
      };

      const response = await fetch(`${API_BASE_URL}/payment/order`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(orderPayload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to place order");
      }

      const result = await response.json();

      navigate("/ordersuccess", {
        replace: true,
        state: {
          orderNumber: result.data.orderNumber,
          totalAmount: result.data.totalAmount,
          paymentMethod: "Online Payment",
        },
      });
    } catch (err: any) {
      console.error("Order placement error:", err);
      alert(err.message || "Failed to place order. Please try again.");
    } finally {
      setPlacingOrder(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-xl">Loading payment details...</p>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <p className="text-2xl mb-4">Your cart is empty</p>
            <button
              onClick={() => navigate("/")}
              className="px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800"
            >
              Continue Shopping
            </button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50">
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-bold mb-8">Payment</h1>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* LEFT - Payment Info */}
            <div className="lg:col-span-2 space-y-8">
              {/* Payment Method - Only Online */}
              <div>
                <h2 className="text-xl font-semibold mb-4">Payment Method</h2>
                <div className="bg-white p-5 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="w-6 h-6 rounded-full border-2 border-gray-900 flex items-center justify-center">
                      <div className="w-4 h-4 bg-gray-900 rounded-full" />
                    </div>
                    <span className="text-lg font-medium">Online Payment</span>
                  </div>
                </div>
              </div>

              {/* Place Order Button */}
              <div className="flex justify-end">
                <button
                  onClick={handlePlaceOrder}
                  disabled={placingOrder}
                  className="px-10 py-4 bg-gray-900 text-white text-lg font-medium rounded-lg hover:bg-gray-800 disabled:opacity-70 disabled:cursor-not-allowed transition"
                >
                  {placingOrder ? "Processing Payment..." : "Pay Now"}
                </button>
              </div>
            </div>

            {/* RIGHT - Order Summary */}
            <div>
              <div className="bg-white p-6 rounded-lg border shadow-sm">
                <h2 className="text-2xl font-bold mb-6">Order Summary</h2>

                {cartItems.map((item) => (
                  <div key={item.id} className="flex gap-4 mb-6 pb-6 border-b last:border-0">
                    <img
                      src={item.image || "https://via.placeholder.com/80x120"}
                      alt={item.title}
                      className="w-16 h-24 object-cover rounded"
                    />
                    <div className="flex-1">
                      <p className="font-medium">{item.title}</p>
                      <p className="text-sm text-gray-600">by {item.author}</p>
                      <p className="text-sm mt-1">Qty: {item.quantity}</p>
                    </div>
                    <p className="font-medium">
                      ${(item.price * item.quantity).toFixed(2)}
                    </p>
                  </div>
                ))}

                {/*<div className="border-t pt-4 space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shipping</span>
                    <span>Free</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tax</span>
                    <span>$0.00</span>
                  </div>
                </div>*/}

                <div className="border-t mt-4 pt-4 flex justify-between text-xl font-bold">
                  <span>Total</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
};

export default PaymentPage;