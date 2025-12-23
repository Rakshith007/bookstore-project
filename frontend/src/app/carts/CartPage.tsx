import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../../components/layout/Navbar";
import { isLoggedIn, getToken } from "../../lib/auth";

interface CartItem {
  id: number;
  title: string;
  author: string;
  image: string;
  color: string;
  quantity: number;
  price: number;
}

const CartPage: React.FC = () => {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000';

  // Fetch cart from backend
  useEffect(() => {
    const fetchCart = async () => {
      setLoading(true);
      setError(null);

      if (!isLoggedIn()) {
        setError('Please login to view your cart');
        setLoading(false);
        return;
      }

      const token = getToken();
      if (!token) {
        setError('Authentication required');
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`${API_BASE_URL}/cart`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          const errData = await response.json().catch(() => ({}));
          throw new Error(errData.message || 'Failed to load cart');
        }

        const result = await response.json();

        if (result.success && Array.isArray(result.data)) {
          const mappedItems: CartItem[] = result.data.map((item: any, index: number) => ({
            id: item.id,
            title: item.book.title,
            author: item.book.author?.name || 'Unknown Author',
            image: item.book.coverImageUrl || 'https://via.placeholder.com/300x450/1f2937/ffffff?text=Book+Cover',
            color: getColorClass(index),
            quantity: item.quantity,
            price: Number(item.book.price),
          }));
          setCartItems(mappedItems);
        } else {
          setCartItems([]);
        }
      } catch (err) {
        console.error('Fetch cart error:', err);
        setError('Failed to load your cart');
      } finally {
        setLoading(false);
      }
    };

    fetchCart();
  }, []);

  const getColorClass = (index: number): string => {
    const colors = [
      'bg-teal-800', 'bg-stone-200', 'bg-teal-900',
      'bg-teal-900', 'bg-gray-900', 'bg-teal-800',
      'bg-green-700', 'bg-stone-200', 'bg-teal-800',
      'bg-teal-900', 'bg-stone-100', 'bg-gray-800'
    ];
    return colors[index % colors.length];
  };

  // Update quantity
  const updateQuantity = async (id: number, newQuantity: number) => {
    if (newQuantity < 1) return;

    const token = getToken();
    if (!token) return;

    try {
      const response = await fetch(`${API_BASE_URL}/cart/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ quantity: newQuantity }),
      });

      if (!response.ok) throw new Error('Failed to update');

      setCartItems(prev =>
        prev.map(item => (item.id === id ? { ...item, quantity: newQuantity } : item))
      );
    } catch (err) {
      alert('Could not update quantity');
    }
  };

  // Remove item
  const removeItem = async (id: number) => {
    const token = getToken();
    if (!token) return;

    try {
      const response = await fetch(`${API_BASE_URL}/cart/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error('Failed to remove');

      setCartItems(prev => prev.filter(item => item.id !== id));
    } catch (err) {
      alert('Could not remove item');
    }
  };

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const tax = subtotal * 0.08;
  const total = subtotal + tax;

  const freeShippingThreshold = 50;
  const shippingProgress = Math.min((subtotal / freeShippingThreshold) * 100, 100);

  const handleCheckout = () => {
    if (isLoggedIn()) {
      navigate('/checkout');
    } else {
      navigate('/login', { state: { from: '/cart' } });
    }
  };

  // Loading
  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-white font-serif flex items-center justify-center">
          <p className="text-lg text-gray-600">Loading your cart...</p>
        </div>
      </>
    );
  }

  // Error / Not logged in
  if (error) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-white font-serif text-center py-20">
          <p className="text-red-600 text-xl mb-6">{error}</p>
          <Link to="/login">
            <button className="bg-black text-white px-10 py-4 rounded-lg hover:bg-gray-800">
              Login to View Cart
            </button>
          </Link>
        </div>
      </>
    );
  }

  // Empty cart
  if (cartItems.length === 0) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-white font-serif text-center py-20">
          <h2 className="text-4xl font-bold mb-6">Your Cart is Empty</h2>
          <p className="text-gray-600 mb-8">Add some books to get started!</p>
          <Link to="/books">
            <button className="bg-black text-white px-10 py-4 rounded-lg hover:bg-gray-800">
              Browse Books
            </button>
          </Link>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-white font-serif">
        {/* MAIN CONTENT */}
        <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
          {/* Page Title */}
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-8">
            Your Cart
          </h2>

          {/* Free Shipping Progress */}
          <div className="mb-8">
            <div className="flex justify-between mb-2">
              <span className="text-sm font-medium">Free Shipping threshold</span>
              <span className="text-sm font-medium">
                {Math.round(shippingProgress)}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-gray-900 h-full rounded-full transition-all"
                style={{ width: `${shippingProgress}%` }}
              />
            </div>
          </div>

          {/* Cart Table */}
          <div className="border border-gray-200 rounded-lg mb-8 overflow-hidden">
            {/* Header */}
            <div className="px-6 py-4 border-b grid grid-cols-12 gap-4 text-sm font-medium">
              <div className="col-span-6">Book</div>
              <div className="col-span-3">Details</div>
              <div className="col-span-2 text-center">Quantity</div>
              <div className="col-span-1 text-right">Price</div>
            </div>

            {/* Items */}
            <div className="bg-gray-50">
              {cartItems.map((item, index) => (
                <div
                  key={item.id}
                  className={`px-6 py-6 ${
                    index !== cartItems.length - 1 ? "border-b border-gray-200" : ""
                  }`}
                >
                  <div className="grid grid-cols-12 gap-4 items-center">
                    {/* Book */}
                    <div className="col-span-6 flex items-center gap-4">
                      <div
                        className={`${item.color} w-16 h-20 rounded-lg flex items-center justify-center overflow-hidden`}
                      >
                        <img
                          src={item.image}
                          alt={item.title}
                          className="w-full h-full object-contain"
                          onError={(e) => {
                            e.currentTarget.src = "https://via.placeholder.com/300x450/1f2937/ffffff?text=Book";
                          }}
                        />
                      </div>
                      <div>
                        <h3 className="font-medium">{item.title}</h3>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="text-sm text-red-600 hover:text-red-800 mt-2"
                        >
                          Remove
                        </button>
                      </div>
                    </div>

                    {/* Author */}
                    <div className="col-span-3 text-sm text-gray-600">
                      by {item.author}
                    </div>

                    {/* Quantity */}
                    <div className="col-span-2 flex justify-center">
                      <div className="bg-gray-100 rounded-lg flex items-center gap-3 px-2 py-2">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                          className="text-lg disabled:opacity-50"
                        >
                          −
                        </button>
                        <span className="w-8 text-center">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="text-lg"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    {/* Price */}
                    <div className="col-span-1 text-right">
                      ${(item.price * item.quantity).toFixed(2)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Order Summary */}
          <div className="max-w-2xl">
            <h3 className="text-2xl font-bold mb-6">Order Summary</h3>

            <div className="space-y-4 mb-6">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span>Free</span>
              </div>
              <div className="flex justify-between border-b pb-4">
                <span>Tax</span>
                <span>${tax.toFixed(2)}</span>
              </div>
            </div>

            <button
              onClick={handleCheckout}
              className="w-full bg-green-900 text-white py-4 rounded-lg hover:bg-green-800 transition"
            >
              Proceed to Checkout
            </button>
          </div>
        </main>
      </div>
    </>
  );
};

export default CartPage;