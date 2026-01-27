import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Heart, ShoppingBag } from "lucide-react";
import Navbar from "../../components/layout/Navbar";
import { isLoggedIn, getToken } from "../../lib/auth";

interface WishlistItem {
  id: number;
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const API_BASE_URL =
    process.env.REACT_APP_API_URL || "http://localhost:4000";

  const categories = [
    "All",
    "Fiction",
    "Non-Fiction",
    "Mystery",
    "Science Fiction",
    "Biography",
  ];

  useEffect(() => {
    const fetchWishlist = async () => {
      setLoading(true);
      setError(null);

      if (!isLoggedIn()) {
        setError("Please login to view your wishlist");
        setLoading(false);
        return;
      }

      const token = getToken();
      if (!token) {
        setError("Authentication required");
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`${API_BASE_URL}/wishlist`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) throw new Error();

        const result = await response.json();

        if (result.success && Array.isArray(result.data)) {
          setWishlistItems(
            result.data.map((item: any, index: number) => ({
              id: item.book.id,
              title: item.book.title,
              author: item.book.author?.name || "Unknown Author",
              image:
                item.book.coverImageUrl ||
                "https://via.placeholder.com/300x450",
              color: getColorClass(index),
              category: item.book.genre?.name || "Uncategorized",
            }))
          );
        }
      } catch {
        setError("Failed to load wishlist");
      } finally {
        setLoading(false);
      }
    };

    fetchWishlist();
  }, []);

  const getColorClass = (index: number) => {
    const colors = [
      "bg-[#F5EBDD]",
      "bg-[#FAF9F6]",
      "bg-[#F5EBDD]",
    ];
    return colors[index % colors.length];
  };

  const removeFromWishlist = async (bookId: number) => {
    const token = getToken();
    if (!token) return;

    try {
      await fetch(`${API_BASE_URL}/wishlist/${bookId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      setWishlistItems((prev) => prev.filter((i) => i.id !== bookId));
    } catch {
      alert("Could not remove from wishlist");
    }
  };

  const addToCart = async (bookId: number) => {
    const token = getToken();
    if (!token) return navigate("/login");

    try {
      await fetch(`${API_BASE_URL}/cart`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ bookId }),
      });
      alert("Added to cart!");
    } catch {
      alert("Could not add to cart");
    }
  };

  const filteredItems =
    activeCategory === "All"
      ? wishlistItems
      : wishlistItems.filter((i) => i.category === activeCategory);

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-[#FAF9F6] flex items-center justify-center">
          <p className="text-lg text-[#333333]/70">
            Loading your wishlist...
          </p>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-[#FAF9F6] text-center py-20">
          <p className="text-xl mb-6 text-[#B85C38]">{error}</p>
          <Link to="/login">
            <button className="px-10 py-4 rounded-full bg-[#B85C38] text-white hover:bg-[#A3B18A] transition">
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
      <div className="min-h-screen bg-[#FAF9F6]">
        <main className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
          <h2 className="text-4xl font-bold text-[#333333] mb-2">
            Your Wishlist
          </h2>
          <p className="text-sm text-[#333333]/70 mb-8">
            Books you love, saved for later.
          </p>

          {/* Category Tabs */}
          <div className="flex gap-6 mb-8 border-b border-[#D4A373]/40">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`pb-3 text-sm font-medium transition ${
                  activeCategory === category
                    ? "text-[#333333] border-b-2 border-[#B85C38]"
                    : "text-[#333333]/60 hover:text-[#A3B18A]"
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          {/* Book Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {filteredItems.map((book) => (
              <div key={book.id}>
                <div
                  className={`${book.color} rounded-xl p-4 mb-3 aspect-[2/3] flex items-center justify-center`}
                >
                  <img
                    src={book.image}
                    alt={book.title}
                    className="w-full h-full object-contain hover:scale-105 transition"
                  />
                </div>

                <h3 className="text-sm font-medium text-[#333333] line-clamp-2">
                  {book.title}
                </h3>
                <p className="text-xs text-[#333333]/70 mb-4">
                  {book.author}
                </p>

                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => addToCart(book.id)}
                    className="flex items-center justify-center gap-2 px-4 py-2 rounded-full bg-[#B85C38] text-white text-xs hover:bg-[#A3B18A] transition"
                  >
                    <ShoppingBag size={14} />
                    Add to Cart
                  </button>

                  <button
                    onClick={() => removeFromWishlist(book.id)}
                    className="flex items-center justify-center gap-2 px-4 py-2 rounded-full border border-[#D4A373] text-[#333333] text-xs hover:bg-[#F5EBDD] transition"
                  >
                    <Heart size={14} />
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
    </>
  );
};

export default WishlistPage;
