import React from "react";
import BookCard from "../ui/BookCard";

import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

const topBooks = [
  {
    title: "The Hidden Path",
    author: "Emily Bennett",
    image:
      "https://images.unsplash.com/photo-1449157291145-7efd050a4d0e?auto=format&fit=crop&w=400&q=80",
  },
  {
    title: "The Lost Manuscript",
    author: "David Evans",
    image:
      "https://images.unsplash.com/photo-1455885666463-7063c29c82c1?auto=format&fit=crop&w=400&q=80",
  },
  {
    title: "The Final Chapter",
    author: "Olivia Foster",
    image:
      "https://images.unsplash.com/photo-1472289065668-ce650ac443d2?auto=format&fit=crop&w=400&q=80",
  },
  {
    title: "The Stolen Crown",
    author: "Michael Grant",
    image:
      "https://images.unsplash.com/photo-1495446815901-a7297e633e8d?auto=format&fit=crop&w=400&q=80",
  },
  {
    title: "The Forgotten City",
    author: "Sophia Hayes",
    image:
      "https://images.unsplash.com/photo-1489710437720-ebb67ec84dd2?auto=format&fit=crop&w=400&q=80",
  },
  {
    title: "The Forgotten City",
    author: "Sophia Hayes",
    image:
      "https://images.unsplash.com/photo-1489710437720-ebb67ec84dd2?auto=format&fit=crop&w=400&q=80",
  },
];

const TopBooksSection = () => {
  return (
    <section className="mb-20">
      {/* APPLY SAME TEXT STYLE */}
      <div className="font-serif">
        <h2 className="text-2xl sm:text-3xl font-bold mb-6">
          Top 10 Best Selling Books
        </h2>

        <Swiper
          modules={[Navigation, Pagination, Autoplay]}
          spaceBetween={20}
          slidesPerView={2}
          navigation
          pagination={{ clickable: true }}
          autoplay={{ delay: 2500, disableOnInteraction: false }}
          breakpoints={{
            640: { slidesPerView: 3 },
            1024: { slidesPerView: 5 },
          }}
          style={{ paddingBottom: "32px" }}
        >
          {topBooks.slice(0, 10).map((book, index) => (
            <SwiperSlide key={index}>
              <BookCard {...book} />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
};

export default TopBooksSection;
