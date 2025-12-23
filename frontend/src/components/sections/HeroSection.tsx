"use client";

import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";

// Swiper CSS
import "swiper/css";
import "swiper/css/pagination";

// Slide data
const slides = [
  {
    title: "Find Your Next Book",
    description:
      "Explore our curated collection of bestsellers, new releases, and timeless classics. Discover stories that will captivate and inspire you.",
    image: "https://cdn-icons-png.flaticon.com/512/2702/2702602.png",
  },
  {
    title: "Discover New Genres",
    description:
      "Adventure, Romance, Mystery — explore worlds that enrich your imagination.",
    image: "https://cdn-icons-png.flaticon.com/512/2920/2920215.png",
  },
  {
    title: "Exclusive Book Deals",
    description:
      "Enjoy limited-time offers on handpicked books from your favorite authors.",
    image: "https://cdn-icons-png.flaticon.com/512/3145/3145765.png",
  },
];

const HeroSection = () => {
  return (
    <section className="my-10 font-serif">
      <Swiper
        modules={[Autoplay, Pagination]}
        autoplay={{ delay: 3000, disableOnInteraction: false }}
        pagination={{ clickable: true }}
        loop={true}
        spaceBetween={40}
      >
        {slides.map((slide, index) => (
          <SwiperSlide key={index}>
            <div className="flex flex-col lg:flex-row items-center gap-12">

              {/* LEFT IMAGE */}
              <div className="flex-1 flex items-center justify-center">
                <div className="bg-[#f8f5ef] p-2 sm:p-10 rounded-2xl shadow-sm border border-gray-100">
                  <img
                    src={slide.image}
                    alt={slide.title}
                    className="w-full max-w-md rounded-xl object-contain"
                  />
                </div>
              </div>

              {/* RIGHT CONTENT */}
              <div className="flex-1">
                <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 leading-tight mb-4">
                  {slide.title}
                </h1>

                <p className="text-gray-700 max-w-md mb-8 leading-relaxed text-base">
                  {slide.description}
                </p>

                <button
                  className="px-10 py-4 bg-gradient-to-r from-cyan-100 to-teal-800
                             text-gray-900 rounded-full font-semibold shadow-md
                             hover:opacity-90 transition"
                >
                  Explore Now
                </button>
              </div>

            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  );
};

export default HeroSection;
