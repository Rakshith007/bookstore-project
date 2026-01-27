import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Heart } from "lucide-react";
import Navbar from "../../components/layout/Navbar";
import { isLoggedIn, getToken } from "../../lib/auth";

interface Book {
  id: number;
  title: string;
  author: string;
  image: string;
  price?: number;
  category?: string;
  description?: string;
  publisher?: string;
  publishedYear?: number;
  isbn?: string;
}

const BookProductPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [addingToCart, setAddingToCart] = useState<boolean>(false);
  const [addSuccess, setAddSuccess] = useState<boolean>(false);

  const [isInWishlist, setIsInWishlist] = useState<boolean>(false);
  const [wishlistLoading, setWishlistLoading] = useState<boolean>(true);
  const [wishlistActionLoading, setWishlistActionLoading] = useState<boolean>(false);

  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000';

  const ratings = [
    { stars: 5, percentage: 50 },
    { stars: 4, percentage: 30 },
    { stars: 3, percentage: 10 },
    { stars: 2, percentage: 5 },
    { stars: 1, percentage: 5 },
  ];

  useEffect(() => {
    if (!id) {
      setError('Book ID is required');
      setLoading(false);
      return;
    }

    const fetchBook = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`${API_BASE_URL}/books/${id}`);
        if (!response.ok) throw new Error('Failed to fetch book');
        const data = await response.json();

        if (data.success && data.data) {
          const mappedBook: Book = {
            id: data.data.id,
            title: data.data.title,
            author: data.data.author || 'Unknown Author',
            image: data.data.coverImage || 'https://via.placeholder.com/300x450/2E4A3D/ffffff?text=Book+Cover',
            price: data.data.price,
            category: data.data.category,
            description: data.data.description,
            publisher: data.data.publisher,
            publishedYear: data.data.publishedYear,
            isbn: data.data.isbn,
          };
          setBook(mappedBook);
        } else {
          setError('Book not found');
        }
      } catch (err) {
        setError('Failed to load book details');
      } finally {
        setLoading(false);
      }
    };

    fetchBook();
  }, [id]);

  useEffect(() => {
    if (!isLoggedIn() || !id) {
      setWishlistLoading(false);
      return;
    }

    const token = getToken();

    const checkWishlist = async () => {
      setWishlistLoading(true);
      try {
        const response = await fetch(`${API_BASE_URL}/wishlist`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.ok) {
          const result = await response.json();
          if (result.success) {
            const inWishlist = result.data.some((item: any) => item.book.id === Number(id));
            setIsInWishlist(inWishlist);
          }
        }
      } catch (err) {
        console.error('Failed to check wishlist');
      } finally {
        setWishlistLoading(false);
      }
    };

    checkWishlist();
  }, [id]);

  const toggleWishlist = async () => {
    if (!isLoggedIn()) {
      navigate('/login', { state: { from: `/books/${id}` } });
      return;
    }

    setWishlistActionLoading(true);
    const token = getToken();

    try {
      if (isInWishlist) {
        await fetch(`${API_BASE_URL}/wishlist/${id}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` },
        });
        setIsInWishlist(false);
      } else {
        const res = await fetch(`${API_BASE_URL}/wishlist`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ bookId: Number(id) }),
        });

        if (!res.ok && !res.status.toString().startsWith('4')) throw new Error();
        setIsInWishlist(true);
      }
    } catch (err) {
      alert('Could not update wishlist');
    } finally {
      setWishlistActionLoading(false);
    }
  };

  const handleAddToCart = async () => {
    if (!isLoggedIn()) {
      navigate('/login', { state: { from: `/books/${id}` } });
      return;
    }

    setAddingToCart(true);
    setAddSuccess(false);

    try {
      const token = getToken();
      const response = await fetch(`${API_BASE_URL}/cart`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ bookId: Number(id), quantity: 1 }),
      });

      if (!response.ok) throw new Error();

      setAddSuccess(true);
      setTimeout(() => setAddSuccess(false), 3000);
    } catch (err) {
      alert('Could not add to cart');
    } finally {
      setAddingToCart(false);
    }
  };

  const handleBuyNow = async () => {
    if (!isLoggedIn()) {
      navigate('/login', { state: { from: `/books/${id}` } });
      return;
    }

    const token = getToken();
    try {
      await fetch(`${API_BASE_URL}/cart`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ bookId: Number(id), quantity: 1 }),
      });
    } catch (err) {
      alert('Could not add to cart for Buy Now');
      return;
    }

    navigate('/cart');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAF9F6]">
        <Navbar />
        <div className="flex justify-center items-center py-32">
          <div className="text-lg font-medium text-[#2E4A3D] animate-pulse">Loading scholarly details...</div>
        </div>
      </div>
    );
  }

  if (error || !book) {
    return (
      <div className="min-h-screen bg-[#FAF9F6]">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 text-center">
          <p className="text-[#B85C38] text-xl mb-6 font-bold">{error || 'Book not found'}</p>
          <button onClick={() => window.history.back()} className="bg-[#2E4A3D] text-white px-8 py-3 rounded-lg hover:bg-[#A3B18A] transition-colors">
            Return to Collection
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF9F6] font-serif text-[#333333]">
      <Navbar />

      {/* Breadcrumbs */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="flex items-center gap-2 text-sm">
          
          
          <span className="text-[#D4A373]">{book.category || 'Uncategorized'}</span>
          <span className="text-[#1E5A4D]">/</span>
          <span className="text-[#2E4A3D] font-bold">{book.title}</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Image Section */}
          <div className="relative">
            <div className="bg-[#F5EBDD] border border-[#D4A373]/20 rounded-lg p-8 sm:p-12 flex items-center justify-center shadow-inner">
              <img
                src={book.image}
                alt={book.title}
                className="w-full max-w-sm rounded shadow-2xl object-cover ring-4 ring-white/50"
                onError={(e) => {
                  e.currentTarget.src = "https://via.placeholder.com/300x450/2E4A3D/ffffff?text=Book+Cover";
                }}
              />
            </div>

            <button
              onClick={toggleWishlist}
              disabled={wishlistLoading || wishlistActionLoading}
              className="absolute top-4 right-4 bg-[#2E4A3D] rounded-full p-3 hover:bg-[#A3B18A] transition-all disabled:opacity-50 shadow-lg"
            >
              <Heart
                className={`w-6 h-6 text-white transition-all ${isInWishlist ? 'fill-white' : ''}`}
              />
            </button>
          </div>

          {/* Details Section */}
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-[#2E4A3D] mb-2">{book.title}</h1>
            <p className="text-[#D4A373] text-lg font-medium mb-2">By {book.author}</p>
            <p className="inline-block bg-[#A3B18A]/20 text-[#2E4A3D] px-3 py-1 rounded text-sm mb-6">{book.category || 'Uncategorized'}</p>

            

            {book.price && (
              <p className="text-3xl sm:text-4xl font-bold text-[#B85C38] mb-6">${book.price.toFixed(2)}</p>
            )}

            {book.description && (
              <div className="border-l-4 border-[#F5EBDD] pl-6 mb-8">
                <p className="text-[#333333] italic leading-relaxed text-lg">{book.description}</p>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-4 mb-10">
              <button
                onClick={handleAddToCart}
                disabled={addingToCart}
                className="relative bg-[#B85C38] text-white px-10 py-4 rounded-lg hover:bg-[#2E4A3D] disabled:opacity-70 disabled:cursor-not-allowed transition-all font-bold text-lg shadow-md"
              >
                {addingToCart ? 'Adding...' : 'Add to Cart'}
                {addSuccess && (
                  <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-[#2E4A3D] text-white px-4 py-2 rounded-lg text-sm whitespace-nowrap shadow-lg animate-bounce">
                    ✓ Added to cart!
                  </div>
                )}
              </button>

              <button
                onClick={handleBuyNow}
                className="border-2 border-[#D4A373] text-[#2E4A3D] px-10 py-4 rounded-lg hover:bg-[#F5EBDD] transition-all font-bold text-lg"
              >
                Buy Now
              </button>
            </div>

            {/* Reviews Section
            <div className="border-t border-[#F5EBDD] pt-8">
              <h3 className="text-2xl font-bold text-[#2E4A3D] mb-6">Customer Reviews</h3>

              <div className="flex flex-col sm:flex-row gap-10 mb-8">
                <div className="text-center sm:text-left">
                  <div className="text-6xl font-bold text-[#D4A373] mb-2">4.6</div>
                  <p className="text-[#333333]/70 font-medium">234 reviews</p>
                </div>

                <div className="flex-1 space-y-2">
                  {ratings.map((r) => (
                    <div key={r.stars} className="flex items-center gap-3">
                      <span className="text-sm font-bold w-10 text-[#2E4A3D]">{r.stars} ★</span>
                      <div className="flex-1 h-3 bg-[#F5EBDD] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#D4A373] rounded-full"
                          style={{ width: `${r.percentage}%` }}
                        />
                      </div>
                      <span className="text-sm w-12 text-right font-medium text-[#333333]/60">{r.percentage}%</span>
                    </div>
                  ))}
                </div>
              </div> */}

              {/* <div className="mt-10 bg-white p-6 rounded-xl border border-[#F5EBDD] shadow-sm">
                <h4 className="font-bold text-[#2E4A3D] mb-4">Write a Review</h4>
                <textarea
                  className="w-full border-2 border-[#F5EBDD] rounded-lg p-4 mb-4 focus:outline-none focus:border-[#A3B18A] transition-colors resize-none"
                  rows={4}
                  placeholder="Share your thoughts about this book..."
                />
                <div className="flex items-center justify-between">
                  <div className="flex gap-2 text-2xl text-[#D4A373]">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button key={star} className="hover:scale-125 transition-transform">
                        ★
                      </button>
                    ))}
                  </div>
                  <button className="bg-[#2E4A3D] text-white px-8 py-3 rounded-lg hover:bg-[#A3B18A] font-bold transition-colors">
                    Submit Review
                  </button>
                </div>
              </div> */}
            {/* </div> */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookProductPage;