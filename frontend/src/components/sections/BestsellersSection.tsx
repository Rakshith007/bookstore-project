import React from "react";
import BookCard from "../ui/BookCard";

import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

const bestsellers = [
  {
    title: "The Secret Garden",
    author: "Frances Hodgson Burnett",
    image:
      "https://images.unsplash.com/photo-1529655683826-aba9b3e77383?auto=format&fit=crop&w=400&q=80",
  },
  {
    title: "The Great Escape",
    author: "Paul Anderson",
    image:
      "https://images.unsplash.com/photo-1507842217343-583bb7270b66?auto=format&fit=crop&w=400&q=80",
  },
  {
    title: "The Silent Observer",
    author: "Sarah Collins",
    image:
      "https://images.unsplash.com/photo-1509021436665-8f07dbf5bf1d?auto=format&fit=crop&w=400&q=80",
  },
  {
    title: "The Last Voyage",
    author: "James Carter",
    image:
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=400&q=80",
  },
   {
    title: "The Last Voyage",
    author: "James Carter",
    image:
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=400&q=80",
  },
];

const BestsellersSection = () => {
  return (
    <section className="mb-20 font-serif">
      <h2 className="text-2xl sm:text-3xl font-bold mb-6">
        Bestsellers
      </h2>

      {/* SLIDER WRAPPER */}
      <div className="relative">
        <Swiper
          modules={[Navigation, Pagination, Autoplay]}
          navigation
          autoplay={{ delay: 2500, disableOnInteraction: false }}
          pagination={{
            clickable: true,
            el: ".bestseller-pagination", // ✅ move pagination OUT
          }}
          spaceBetween={20}
          slidesPerView={1.3}
          breakpoints={{
            640: { slidesPerView: 2.2 },
            1024: { slidesPerView: 4 },
          }}
        >
          {bestsellers.map((book, index) => (
            <SwiperSlide key={index}>
              <BookCard {...book} />
            </SwiperSlide>
          ))}
        </Swiper>

        {/* ✅ PAGINATION OUTSIDE SLIDER */}
        <div className="bestseller-pagination mt-6 flex justify-center" />
      </div>
    </section>
  );
};

export default BestsellersSection;
