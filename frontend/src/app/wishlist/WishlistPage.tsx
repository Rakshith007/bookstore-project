import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Heart, ShoppingBag } from "lucide-react";
import Navbar from "../../components/layout/Navbar";
import { isLoggedIn, getToken } from "../../lib/auth";

interface WishlistItem {
  id: number; // book.id
  title: string;
  author: string;
  image: string;
  color: string;
  category: string;
}

const WishlistPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState("All");
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000';

  const categories = [
    "All",
    "Fiction",
    "Non-Fiction",
    "Mystery",
    "Science Fiction",
    "Biography",
  ];

  // Fetch wishlist
  useEffect(() => {
    const fetchWishlist = async () => {
      setLoading(true);
      setError(null);

      if (!isLoggedIn()) {
        setError('Please login to view your wishlist');
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
        const response = await fetch(`${API_BASE_URL}/wishlist`, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) throw new Error('Failed to load wishlist');

        const result = await response.json();

        if (result.success && Array.isArray(result.data)) {
          const mappedItems: WishlistItem[] = result.data.map((item: any, index: number) => ({
            id: item.book.id,
            title: item.book.title,
            author: item.book.author?.name || 'Unknown Author',
            image: item.book.coverImageUrl || 'https://via.placeholder.com/300x450/1f2937/ffffff?text=Book+Cover',
            color: getColorClass(index),
            category: item.book.genre?.name || 'Uncategorized',
          }));
          setWishlistItems(mappedItems);
        } else {
          setWishlistItems([]);
        }
      } catch (err) {
        setError('Failed to load wishlist');
      } finally {
        setLoading(false);
      }
    };

    fetchWishlist();
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

  // Remove from wishlist
  const removeFromWishlist = async (bookId: number) => {
    const token = getToken();
    if (!token) return;

    try {
      const response = await fetch(`${API_BASE_URL}/wishlist/${bookId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error('Failed to remove');

      setWishlistItems(prev => prev.filter(item => item.id !== bookId));
    } catch (err) {
      alert('Could not remove from wishlist');
    }
  };

  // Add to cart from wishlist
  const addToCart = async (bookId: number) => {
    const token = getToken();
    if (!token) {
      navigate('/login');
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/cart`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ bookId }),
      });

      if (!response.ok) throw new Error('Failed to add to cart');

      alert('Added to cart!');
    } catch (err) {
      alert('Could not add to cart');
    }
  };

  const filteredItems = activeCategory === "All"
    ? wishlistItems
    : wishlistItems.filter(item => item.category === activeCategory);

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-white font-serif flex items-center justify-center">
          <p className="text-lg text-gray-600">Loading your wishlist...</p>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-white font-serif text-center py-20">
          <p className="text-red-600 text-xl mb-6">{error}</p>
          <Link to="/login">
            <button className="bg-black text-white px-10 py-4 rounded-lg hover:bg-gray-800">
              Login to View Wishlist
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
        <main className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
          <div className="mb-2">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
              Your Wishlist
            </h2>
          </div>
          <p className="text-gray-500 text-sm mb-8">
            Books you love, saved for later.
          </p>

          {/* Category Tabs */}
          <div className="flex gap-4 mb-8 border-b border-gray-200 overflow-x-auto pb-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`pb-3 px-1 text-sm font-medium whitespace-nowrap transition ${
                  activeCategory === category
                    ? "text-gray-900 border-b-2 border-gray-900"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          {/* Book Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 mb-12">
            {filteredItems.length === 0 ? (
              <div className="col-span-full text-center py-16">
                <p className="text-gray-500 text-lg">
                  {activeCategory === "All" 
                    ? "Your wishlist is empty. Start adding books!"
                    : `No books in ${activeCategory} category.`}
                </p>
              </div>
            ) : (
              filteredItems.map((book) => (
                <div key={book.id} className="group cursor-pointer">
                  <div
                    className={`${book.color} rounded-xl p-4 flex items-center justify-center mb-3 aspect-[2/3] overflow-hidden`}
                  >
                    <img
                      src={book.image}
                      alt={book.title}
                      className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        e.currentTarget.src = "https://via.placeholder.com/300x450/1f2937/ffffff?text=Book";
                      }}
                    />
                  </div>

                  <h3 className="text-sm font-medium text-gray-900 mb-1 line-clamp-2">
                    {book.title}
                  </h3>
                  <p className="text-xs text-gray-600 mb-4">{book.author}</p>

                  {/* Action Buttons */}
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() => addToCart(book.id)}
                      className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-900 text-white text-xs rounded-full hover:bg-gray-800 transition"
                    >
                      <ShoppingBag size={14} />
                      Add to Cart
                    </button>

                    <button
                      onClick={() => removeFromWishlist(book.id)}
                      className="flex items-center justify-center gap-2 px-4 py-2 bg-white text-gray-900 text-xs rounded-full border border-gray-300 hover:bg-gray-50 transition"
                    >
                      <Heart size={14} />
                      Remove
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </main>
      </div>
    </>
  );
};

export default WishlistPage;