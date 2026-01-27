"use client";

import React, { useRef } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay } from "swiper/modules";
import type { Swiper as SwiperType } from "swiper"; // <-- Add this import for proper typing

import "swiper/css";
import "swiper/css/navigation";

const specialOffers = [
  {
    title: "The Art of Cooking",
    desc: "Explore culinary delights with timeless recipes and techniques",
    image: "https://images.unsplash.com/photo-1484980972926-edee96e0960d?auto=format&fit=crop&w=400&q=80",
    discount: "20% Off"
  },
  {
    title: "The History of Science",
    desc: "Discover groundbreaking breakthroughs that shaped our world",
    image: "https://images.unsplash.com/photo-1555949963-aa79dcee981c?auto=format&fit=crop&w=400&q=80",
    discount: "15% Off"
  },
  {
    title: "Travel the World",
    desc: "Journey to new destinations through vivid storytelling",
    image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=400&q=80",
    discount: "30% Off"
  },
  {
    title: "Modern Architecture",
    desc: "Explore innovative design and structural masterpieces",
    image: "https://images.unsplash.com/photo-1487958449943-2429e8be8625?auto=format&fit=crop&w=400&q=80",
    discount: "65% Off"
  },
  {
    title: "Ancient Philosophy",
    desc: "The timeless wisdom of the world's greatest thinkers",
    image: "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=400&q=80",
    discount: "10% Off"
  },
  {
    title: "The Art of Cooking",
    desc: "Explore culinary delights with timeless recipes and techniques",
    image: "https://images.unsplash.com/photo-1484980972926-edee96e0960d?auto=format&fit=crop&w=400&q=80",
    discount: "35% Off"
  },
  {
    title: "The History of Science",
    desc: "Discover groundbreaking breakthroughs that shaped our world",
    image: "https://images.unsplash.com/photo-1555949963-aa79dcee981c?auto=format&fit=crop&w=400&q=80",
    discount: "40% Off"
  },
];

const SpecialOffersSection = () => {
  const prevRef = useRef<HTMLButtonElement>(null);
  const nextRef = useRef<HTMLButtonElement>(null);

  return (
    <section
      className="py-16 bg-[#FAF9F6] overflow-hidden relative"
      style={{ fontFamily: 'ui-serif, Georgia, Cambria, "Times New Roman", Times, serif' }}
    >
      {/* Background Decor */}
      <div className="absolute inset-0 pointer-events-none opacity-40">
        <div className="absolute top-0 left-0 w-96 h-96 bg-[#D4A373]/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#A3B18A]/20 rounded-full blur-[100px]" />
      </div>

      <div className="w-full px-6 md:px-12 relative z-10 mb-12">
        <div className="flex items-end justify-between border-b border-[#F5EBDD] pb-6">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#B85C38]">
              EXCLUSIVE ACCESS
            </span>
            <h2 className="text-[40px] font-bold text-[#2E4A3D] mt-1">
             Special Offers
            </h2>
            <div className="h-[4px] w-20 mt-3 bg-[#B85C38] rounded-full"></div>
          </div>

          {/* Always Visible Navigation Arrows - Above the carousel */}
          <div className="flex gap-6">
            <button
              ref={prevRef}
              className="flex items-center justify-center w-14 h-14 rounded-full bg-white border-2 border-[#D4A373] text-[#2E4A3D] shadow-xl hover:bg-[#A3B18A] hover:text-white hover:border-[#A3B18A] transition-all duration-300 cursor-pointer z-30"
              aria-label="Previous slide"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="m15 18-6-6 6-6" />
              </svg>
            </button>

            <button
              ref={nextRef}
              className="flex items-center justify-center w-14 h-14 rounded-full bg-white border-2 border-[#D4A373] text-[#2E4A3D] shadow-xl hover:bg-[#A3B18A] hover:text-white hover:border-[#A3B18A] transition-all duration-300 cursor-pointer z-30"
              aria-label="Next slide"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="m9 18 6-6-6-6" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <div className="w-full relative z-10">
        <Swiper
          modules={[Navigation, Autoplay]}
          spaceBetween={30}
          slidesPerView={1.2}
          navigation={{
            prevEl: prevRef.current,
            nextEl: nextRef.current,
          }}
          onSwiper={(swiper: SwiperType) => {
            // Properly connect custom buttons after Swiper initializes
            if (swiper.params.navigation && typeof swiper.params.navigation === "object") {
              swiper.params.navigation.prevEl = prevRef.current;
              swiper.params.navigation.nextEl = nextRef.current;
              swiper.navigation.init();
              swiper.navigation.update();
            }
          }}
          autoplay={{
            delay: 5000,
            disableOnInteraction: false,
          }}
          loop={true}
          breakpoints={{
            640: { slidesPerView: 2.2 },
            1024: { slidesPerView: 3.5 },
            1280: { slidesPerView: 4.5 },
            1536: { slidesPerView: 5.5 },
          }}
          className="px-6 md:px-12"
        >
          {specialOffers.map((offer, index) => (
            <SwiperSlide key={index}>
              <div className="group relative flex flex-col h-full bg-white rounded-lg border border-[#F5EBDD] overflow-hidden transition-all duration-500 hover:shadow-2xl hover:border-[#D4A373]/50">
                <div className="relative aspect-[3/4] overflow-hidden bg-[#F5EBDD]/30 p-4">
                  <div className="w-full h-full relative shadow-md overflow-hidden rounded-sm">
                    <img
                      src={offer.image}
                      alt={offer.title}
                      className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                    />
                    <div className="absolute top-2 left-2">
                      <span className="bg-[#B85C38] text-white text-[10px] font-bold px-3 py-1 rounded shadow-lg font-sans tracking-widest uppercase">
                        {offer.discount}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-6 text-center flex flex-col flex-grow">
                  <h3 className="font-bold text-[#2E4A3D] text-lg leading-tight line-clamp-1 group-hover:text-[#B85C38] transition-colors mb-2">
                    {offer.title}
                  </h3>
                  <p className="text-[12px] text-[#D4A373] mb-6 line-clamp-2 italic leading-relaxed">
                    {offer.desc}
                  </p>

                  <button className="mt-auto w-full py-3 bg-[#2E4A3D] text-[#FAF9F6] text-xs font-bold rounded hover:bg-[#B85C38] transition-all duration-300 tracking-[0.2em] shadow-md transform translate-y-2 opacity-90 group-hover:translate-y-0 group-hover:opacity-100">
                    DISCOVER
                  </button>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
};

export default SpecialOffersSection;