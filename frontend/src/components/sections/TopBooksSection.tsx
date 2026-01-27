"use client";

import React, { useEffect, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay } from "swiper/modules";
import { useNavigate } from "react-router-dom";

import "swiper/css";
import "swiper/css/navigation";

interface Book {
  id: number;
  title: string;
  author: string;
  description: string;
  coverImage: string;
  createdAt: string;
  category?: string;
  genre?: string;
  price?: number;
  sellingPrice?: number;
  stock?: number;
}

interface ApiResponse {
  data: Book[];
}

const API_BASE_URL = "http://localhost:4000";

const NewArrivalsSection = () => {
  const [newArrivals, setNewArrivals] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_BASE_URL}/books`);

        if (!response.ok) {
          throw new Error(`Failed to fetch books: ${response.status}`);
        }

        const result: ApiResponse = await response.json();
        const books = result.data || [];

        console.log("Fetched books:", books);

        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

        const recentBooks = books.filter((book) => {
          if (!book.createdAt) return false;
          const bookDate = new Date(book.createdAt);
          return !isNaN(bookDate.getTime()) && bookDate >= oneWeekAgo;
        });

        recentBooks.sort((a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );

        setNewArrivals(recentBooks);
      } catch (err) {
        console.error("Error fetching books:", err);
        setError(err instanceof Error ? err.message : "Failed to load books");

        // Fallback dummy data
        setNewArrivals([
          {
            id: 1,
            title: "The Hidden Path",
            author: "Emily Bennett",
            description: "A journey through uncharted territories of the human spirit.",
            coverImage:
              "https://images.unsplash.com/photo-1541963463532-d68292c34b19?auto=format&fit=crop&w=400&q=80",
            createdAt: new Date().toISOString(),
          },
          {
            id: 2,
            title: "The Final Chapter",
            author: "Olivia Foster",
            description: "The long-awaited conclusion to the legendary trilogy.",
            coverImage:
              "https://images.unsplash.com/photo-1472289065668-ce650ac443d2?auto=format&fit=crop&w=400&q=80",
            createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          },
          {
            id: 3,
            title: "The Stolen Crown",
            author: "Michael Grant",
            description: "Power, betrayal, and the cost of an empire's legacy.",
            coverImage:
              "https://images.unsplash.com/photo-1495446815901-a7297e633e8d?auto=format&fit=crop&w=400&q=80",
            createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchBooks();
  }, []);

  // ────────────────────────────────────────────────
  // Loading / Error / Empty states (unchanged)
  // ────────────────────────────────────────────────

  if (loading && newArrivals.length === 0) {
    return (
      <section
        className="w-full py-12 md:py-16 bg-[#FAF9F6] overflow-hidden"
        style={{ fontFamily: 'ui-serif, Georgia, Cambria, "Times New Roman", Times, serif' }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-10 md:mb-12">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[#F5EBDD]/50">
              <div>
                <span className="text-xs font-bold uppercase tracking-[0.3em] text-[#B85C38] block mb-1">
                  New to Collection
                </span>
                <h2 className="text-3xl md:text-4xl lg:text-[40px] font-bold text-[#2E4A3D]">
                  New Arrivals
                </h2>
              </div>
            </div>
          </div>

          <div className="flex justify-center items-center h-48">
            <div className="text-[#2E4A3D]">Loading new arrivals...</div>
          </div>
        </div>
      </section>
    );
  }

  if (error && newArrivals.length === 0) {
    return (
      <section
        className="w-full py-12 md:py-16 bg-[#FAF9F6] overflow-hidden"
        style={{ fontFamily: 'ui-serif, Georgia, Cambria, "Times New Roman", Times, serif' }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-10 md:mb-12">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[#F5EBDD]/50">
              <div>
                <span className="text-xs font-bold uppercase tracking-[0.3em] text-[#B85C38] block mb-1">
                  New to Collection
                </span>
                <h2 className="text-3xl md:text-4xl lg:text-[40px] font-bold text-[#2E4A3D]">
                  New Arrivals
                </h2>
              </div>
            </div>
          </div>

          <div className="flex flex-col justify-center items-center h-48 text-center">
            <div className="text-[#B85C38] mb-2">Error loading books</div>
            <div className="text-sm text-[#2E4A3D]/70 mb-4">{error}</div>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-[#D4A373] text-white rounded-lg hover:bg-[#B85C38] transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </section>
    );
  }

  if (newArrivals.length === 0) {
    return (
      <section
        className="w-full py-12 md:py-16 bg-[#FAF9F6] overflow-hidden"
        style={{ fontFamily: 'ui-serif, Georgia, Cambria, "Times New Roman", Times, serif' }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-10 md:mb-12">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[#F5EBDD]/50">
              <div>
                <span className="text-xs font-bold uppercase tracking-[0.3em] text-[#B85C38] block mb-1">
                  New to Collection
                </span>
                <h2 className="text-3xl md:text-4xl lg:text-[40px] font-bold text-[#2E4A3D]">
                  New Arrivals
                </h2>
              </div>
            </div>
          </div>

          <div className="flex justify-center items-center h-48">
            <div className="text-[#2E4A3D] text-center">
              <p className="mb-2">No new arrivals in the past week.</p>
              <p className="text-sm text-[#2E4A3D]/70">Check back soon for new books!</p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      className="w-full py-12 md:py-16 bg-[#FAF9F6] overflow-hidden"
      style={{ fontFamily: 'ui-serif, Georgia, Cambria, "Times New Roman", Times, serif' }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-10 md:mb-12">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[#F5EBDD]/50">
            <div>
              <span className="text-xs font-bold uppercase tracking-[0.3em] text-[#B85C38] block mb-1">
                New to Collection
              </span>
              <h2 className="text-3xl md:text-4xl lg:text-[40px] font-bold text-[#2E4A3D]">
                New Arrivals
              </h2>
              <p className="text-sm text-[#2E4A3D]/70 mt-1">
                {newArrivals.length} new book{newArrivals.length !== 1 ? "s" : ""} added this week
              </p>
            </div>

            {/* Navigation Arrows */}
            <div className="flex gap-2">
              <button className="new-prev-custom flex items-center justify-center w-10 h-10 rounded-full border-2 border-[#D4A373] text-[#2E4A3D] hover:bg-[#A3B18A] hover:text-white hover:border-[#A3B18A] transition-all duration-300 shadow-sm cursor-pointer active:scale-95">
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
                  className="block"
                >
                  <path d="m15 18-6-6 6-6" />
                </svg>
              </button>
              <button className="new-next-custom flex items-center justify-center w-10 h-10 rounded-full border-2 border-[#D4A373] text-[#2E4A3D] hover:bg-[#A3B18A] hover:text-white hover:border-[#A3B18A] transition-all duration-300 shadow-sm cursor-pointer active:scale-95">
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
                  className="block"
                >
                  <path d="m9 18 6-6-6-6" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Swiper */}
        <div className="relative overflow-hidden">
          <Swiper
            modules={[Navigation, Autoplay]}
            spaceBetween={24}
            slidesPerView={1}
            navigation={{
              prevEl: ".new-prev-custom",
              nextEl: ".new-next-custom",
            }}
            autoplay={{ delay: 5000, disableOnInteraction: false }}
            breakpoints={{
              640: { slidesPerView: 1, spaceBetween: 24 },
              768: { slidesPerView: 2, spaceBetween: 24 },
              1024: { slidesPerView: 3, spaceBetween: 28 },
              1280: { slidesPerView: 3, spaceBetween: 32 },
            }}
            className="w-full"
          >
            {newArrivals.map((book) => (
              <SwiperSlide key={book.id}>
                {/* Clickable entire card */}
                <div
                  onClick={() => navigate(`/books/${book.id}`)}
                  className="h-[180px] sm:h-[200px] md:h-[220px] bg-white rounded-xl border border-[#F5EBDD] overflow-hidden transition-all duration-300 hover:shadow-2xl hover:border-[#D4A373]/50 hover:-translate-y-1 group cursor-pointer active:scale-[0.98]"
                >
                  <div className="flex h-full">
                    {/* Left - Cover Image */}
                    <div className="w-2/5 bg-gradient-to-br from-[#F5EBDD]/40 to-[#FAF9F6] p-3 sm:p-4 flex items-center justify-center">
                      <div className="w-full h-full relative shadow-lg overflow-hidden rounded-md bg-gray-200">
                        <img
                          src={book.coverImage}
                          alt={book.title}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                          onError={(e) => {
                            e.currentTarget.src =
                              "https://images.unsplash.com/photo-1541963463532-d68292c34b19?auto=format&fit=crop&w=400&q=80";
                          }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      </div>
                    </div>

                    {/* Right - Info */}
                    <div className="w-3/5 p-4 sm:p-5 flex flex-col justify-between">
                      <div className="overflow-hidden">
                        <div className="flex items-center justify-between mb-2 sm:mb-3">
                          <div className="flex gap-1"></div>
                          <span className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-[#B85C38] bg-[#F5EBDD] px-2 py-1 rounded-full">
                            New
                          </span>
                        </div>

                        <h3 className="font-bold text-[#2E4A3D] text-sm sm:text-base leading-tight mb-1.5 sm:mb-2 line-clamp-1 group-hover:text-[#B85C38] transition-colors">
                          {book.title}
                        </h3>

                        <p className="text-[#D4A373] text-xs sm:text-sm font-semibold uppercase tracking-wider mb-2 sm:mb-3">
                          {book.author}
                        </p>

                        <p className="text-[#333333]/70 text-xs sm:text-sm leading-relaxed line-clamp-2 italic">
                          {book.description}
                        </p>
                      </div>

                      {/* You can add a visible button here later if desired */}
                      {/* <div className="mt-2 sm:mt-3">
                        <button className="text-xs sm:text-sm text-[#B85C38] font-medium hover:underline">
                          View Details →
                        </button>
                      </div> */}
                    </div>
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </div>
    </section>
  );
};

export default NewArrivalsSection;