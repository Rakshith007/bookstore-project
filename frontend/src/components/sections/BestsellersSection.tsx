"use client";

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay } from "swiper/modules";

import "swiper/css";
import "swiper/css/navigation";

interface Book {
  id: string;
  title: string;
  description?: string;
  author: string;
  price: number;
  sellingPrice: number;
  mrp: number;
  coverImage: string;
  category: string;
  genre: string;
  stockQuantity: number;
  status: string;
  isbn: string;
  averageRating: number;
  totalReviews: number;
}

const SpecialOffersSection = () => {
  const navigate = useNavigate();
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Debug API URL
  useEffect(() => {
    console.log("Current API URL:", process.env.REACT_APP_API_URL || "http://localhost:4000");
  }, []);

  // Fetch books (your original fetch logic unchanged)
  useEffect(() => {
    const fetchBooks = async () => {
      try {
        setLoading(true);
        setError(null);

        const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:4000";
        const endpoints = [
          `${API_BASE}/api/books`,
          `${API_BASE}/books`,
          `${API_BASE}/book`,
          "http://localhost:4000/api/books",
        ];

        let response = null;
        let lastError = null;

        for (const endpoint of endpoints) {
          try {
            console.log(`Trying endpoint: ${endpoint}`);
            response = await fetch(endpoint, {
              method: "GET",
              headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
              },
            });

            if (response.ok) {
              const contentType = response.headers.get("content-type");

              if (!contentType || !contentType.includes("application/json")) {
                const textResponse = await response.text();
                console.log("Non-JSON response:", textResponse.substring(0, 200));

                if (textResponse.includes("<!DOCTYPE") || textResponse.includes("<html")) {
                  lastError = new Error(`Server returned HTML instead of JSON at ${endpoint}`);
                  continue;
                }

                try {
                  const jsonData = JSON.parse(textResponse);
                  if (jsonData.success && Array.isArray(jsonData.data)) {
                    setBooks(jsonData.data);
                    return;
                  } else if (Array.isArray(jsonData)) {
                    setBooks(jsonData);
                    return;
                  }
                } catch (parseError) {
                  lastError = new Error(`Failed to parse response from ${endpoint}`);
                  continue;
                }
              } else {
                const result = await response.json();
                if (result.success && Array.isArray(result.data)) {
                  setBooks(result.data);
                  return;
                } else if (Array.isArray(result)) {
                  setBooks(result);
                  return;
                } else {
                  lastError = new Error(`Invalid response format from ${endpoint}`);
                  continue;
                }
              }
            }
          } catch (err) {
            console.log(`Endpoint ${endpoint} failed:`, err);
            lastError = err;
          }
        }

        throw lastError || new Error("All API endpoints failed");
      } catch (err: any) {
        console.error("Error fetching books:", err);
        let errorMessage = "Failed to load books.";

        if (err.message.includes("HTML instead of JSON")) {
          errorMessage = "Server configuration issue. Please check the API endpoint.";
        } else if (err.message.includes("Failed to fetch")) {
          errorMessage = "Cannot connect to server. Make sure the backend is running.";
        } else if (err.message.includes("All API endpoints")) {
          errorMessage = "No working API endpoint found.";
        } else {
          errorMessage = err.message || "Failed to load books. Please try again later.";
        }

        setError(errorMessage);

        // Fallback dummy data in development
        if (process.env.NODE_ENV === "development") {
          console.log("Using fallback data for development");
          setBooks([
            {
              id: "1",
              title: "The Art of Cooking",
              description: "Explore culinary delights with timeless recipes and techniques",
              author: "Chef Master",
              price: 29.99,
              sellingPrice: 24.99,
              mrp: 29.99,
              coverImage:
                "https://images.unsplash.com/photo-1484980972926-edee96e0960d?auto=format&fit=crop&w=400&q=80",
              category: "Cooking",
              genre: "Cooking",
              stockQuantity: 10,
              status: "ACTIVE",
              isbn: "1234567890",
              averageRating: 4.5,
              totalReviews: 120,
            },
            {
              id: "2",
              title: "The History of Science",
              description: "Discover groundbreaking breakthroughs that shaped our world",
              author: "Dr. Scientist",
              price: 24.99,
              sellingPrice: 19.99,
              mrp: 24.99,
              coverImage:
                "https://images.unsplash.com/photo-1555949963-aa79dcee981c?auto=format&fit=crop&w=400&q=80",
              category: "Science",
              genre: "Science",
              stockQuantity: 5,
              status: "ACTIVE",
              isbn: "1234567891",
              averageRating: 4.7,
              totalReviews: 89,
            },
          ]);
          setError(null);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchBooks();
  }, []);

  const handleCardClick = (bookId: string) => {
    navigate(`/books/${bookId}`);
  };

  const handleBuyNow = (e: React.MouseEvent, bookId: string) => {
    // Prevent card click from also firing when button is clicked
    e.stopPropagation();
    navigate(`/books/${bookId}`);
  };

  const handleViewAllBooks = () => {
    navigate("/search");
  };

  // ────────────────────────────────────────────────
  // Loading / Error / Empty states (unchanged)
  // ────────────────────────────────────────────────

  if (loading) {
    return (
      <section className="py-12 md:py-16 bg-[#FAF9F6]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#D4A373] mx-auto"></div>
            <p className="mt-4 text-[#2E4A3D]">Loading books...</p>
          </div>
        </div>
      </section>
    );
  }

  if (error && books.length === 0) {
    return (
      <section className="py-12 md:py-16 bg-[#FAF9F6]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <div className="text-red-500 mb-4">⚠️</div>
            <p className="text-red-600 mb-2">{error}</p>
            <p className="text-sm text-gray-600 mb-4">
              Check if your NestJS server is running on http://localhost:4000
            </p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-6 py-2 bg-[#D4A373] text-white rounded-lg hover:bg-[#B85C38] transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      id="bestSeller"
      className="py-12 md:py-16 bg-[#FAF9F6] overflow-hidden"
      style={{
        fontFamily: 'ui-serif, Georgia, Cambria, "Times New Roman", Times, serif',
      }}
    >
      {/* Background effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-96 h-96 bg-[#D4A373]/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#A3B18A]/10 rounded-full blur-3xl" />
      </div>

      {/* Show warning if using fallback data */}
      {error && books.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-4">
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <span className="text-yellow-400">⚠️</span>
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-700">
                  Using sample data. Could not connect to backend: {error}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="mb-10 md:mb-12">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[#F5EBDD]">
            <div>
              <h2 className="text-3xl md:text-4xl lg:text-[40px] font-bold text-[#2E4A3D]">
                Best Selling Books You May Like
              </h2>
              <div className="h-[4px] w-20 mt-3 bg-[#B85C38] rounded-full"></div>
            </div>

            {/* Navigation Arrows */}
            <div className="flex gap-3">
              <button className="swiper-prev-custom flex items-center justify-center w-10 h-10 rounded-full bg-white border-2 border-[#D4A373] text-[#2E4A3D] shadow-sm hover:bg-[#A3B18A] hover:text-white hover:border-[#A3B18A] transition-all duration-300 cursor-pointer active:scale-95">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="m15 18-6-6 6-6" />
                </svg>
              </button>
              <button className="swiper-next-custom flex items-center justify-center w-10 h-10 rounded-full bg-white border-2 border-[#D4A373] text-[#2E4A3D] shadow-sm hover:bg-[#A3B18A] hover:text-white hover:border-[#A3B18A] transition-all duration-300 cursor-pointer active:scale-95">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="m9 18 6-6-6-6" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Swiper */}
        <div className="relative">
          <Swiper
            modules={[Navigation, Autoplay]}
            spaceBetween={20}
            slidesPerView={1}
            navigation={{
              prevEl: ".swiper-prev-custom",
              nextEl: ".swiper-next-custom",
            }}
            autoplay={{ delay: 5000, disableOnInteraction: false }}
            breakpoints={{
              640: { slidesPerView: 1, spaceBetween: 20 },
              768: { slidesPerView: 2, spaceBetween: 24 },
              1024: { slidesPerView: 3, spaceBetween: 28 },
              1280: { slidesPerView: 4, spaceBetween: 32 },
              1536: { slidesPerView: 5, spaceBetween: 32 },
            }}
            className="w-full"
          >
            {books.map((book) => (
              <SwiperSlide key={book.id}>
                {/* Entire card is now clickable */}
                <div
                  onClick={() => navigate(`/books/${book.id}`)}
                  className="group relative flex flex-col h-full bg-white border border-[#F5EBDD] rounded-xl overflow-hidden transition-all duration-500 hover:shadow-2xl hover:border-[#D4A373]/50 hover:-translate-y-1 cursor-pointer active:scale-[0.98] select-none"
                >
                  {/* Book Cover */}
                  <div className="relative aspect-[3/4] overflow-hidden bg-gradient-to-br from-[#F5EBDD]/30 to-[#FAF9F6] p-4">
                    <div className="w-full h-full relative shadow-md overflow-hidden rounded-lg">
                      <img
                        src={book.coverImage || "https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=400&q=80"}
                        alt={book.title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        onError={(e) => {
                          e.currentTarget.src =
                            "https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=400&q=80";
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </div>

                    {/* Bestseller badge */}
                    <div className="absolute top-3 left-3">
                      <span className="bg-[#B85C38] text-white text-[10px] font-bold px-3 py-1 rounded-full shadow-lg font-sans tracking-wider uppercase">
                        Bestseller
                      </span>
                    </div>

                    {/* Out of stock badge */}
                    {book.stockQuantity <= 0 && (
                      <div className="absolute top-3 right-3">
                        <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-lg font-sans">
                          Out of Stock
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Book Info */}
                  <div className="p-5 text-center flex flex-col flex-grow">
                    <h3 className="font-bold text-[#2E4A3D] text-base leading-tight line-clamp-1 group-hover:text-[#B85C38] transition-colors mb-2">
                      {book.title}
                    </h3>

                    <p className="text-sm text-[#666666] mb-2 italic">
                      By {book.author}
                    </p>

                    <p className="text-xs text-[#666666] mb-4 line-clamp-2 leading-relaxed">
                      {book.description || "No description available"}
                    </p>

                    {/* Price */}
                    <div className="mt-auto mb-3">
                      <div className="flex items-center justify-center gap-2">
                        <span className="text-lg font-bold text-[#B85C38]">
                          ${book.sellingPrice.toFixed(2)}
                        </span>
                        {book.mrp > book.sellingPrice && (
                          <>
                            <span className="text-sm text-gray-500 line-through">
                              ${book.mrp.toFixed(2)}
                            </span>
                            <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                              Save ${(book.mrp - book.sellingPrice).toFixed(2)}
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Buy Now Button – still works, but card click takes priority */}
                    <div className="mt-auto">
                      <button
                        onClick={(e) => handleBuyNow(e, book.id)}
                        disabled={book.stockQuantity <= 0}
                        className={`w-full py-2.5 text-xs font-bold rounded-lg transition-all duration-300 tracking-wider shadow-md transform group-hover:shadow-lg uppercase cursor-pointer active:scale-95 ${
                          book.stockQuantity <= 0
                            ? "bg-gray-400 text-gray-200 cursor-not-allowed"
                            : "bg-[#2E4A3D] text-white hover:bg-[#B85C38]"
                        }`}
                      >
                        {book.stockQuantity <= 0 ? "Out of Stock" : "Buy Now"}
                      </button>
                    </div>
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>

        {/* View All Books Button */}
        <div className="flex justify-center mt-12">
          <button
            onClick={handleViewAllBooks}
            className="px-8 py-3 bg-transparent border-2 border-[#D4A373] text-[#2E4A3D] font-bold text-sm tracking-widest rounded-full hover:bg-[#D4A373] hover:text-white transition-all duration-300 transform hover:-translate-y-0.5 active:scale-95 shadow-sm hover:shadow-md"
          >
            VIEW ALL BOOKS
          </button>
        </div>
      </div>
    </section>
  );
};

export default SpecialOffersSection;