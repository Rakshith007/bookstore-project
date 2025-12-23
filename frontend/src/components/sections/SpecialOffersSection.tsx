import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";

// Swiper v12 module imports
import { Navigation, Pagination, Autoplay } from "swiper/modules";

// Swiper styles
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

const specialOffers = [
  {
    title: "The Art of Cooking",
    desc: "Explore culinary delights",
    image:
      "https://images.unsplash.com/photo-1484980972926-edee96e0960d?auto=format&fit=crop&w=400&q=80",
  },
  {
    title: "The History of Science",
    desc: "Discover scientific breakthroughs",
    image:
      "https://images.unsplash.com/photo-1555949963-aa79dcee981c?auto=format&fit=crop&w=400&q=80",
  },
  {
    title: "Travel the World",
    desc: "Journey to new destinations",
    image:
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=400&q=80",
  },
  {
    title: "Travel the World",
    desc: "Journey to new destinations",
    image:
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=400&q=80",
  },
  {
    title: "The Art of Cook",
    desc: "Explore culinary delights",
    image:
      "https://images.unsplash.com/photo-1484980972926-edee96e0960d?auto=format&fit=crop&w=400&q=80",
  },
  {
    title: "The Art of Cook",
    desc: "Explore culinary delights",
    image:
      "https://images.unsplash.com/photo-1484980972926-edee96e0960d?auto=format&fit=crop&w=400&q=80",
  },
];

const SpecialOffersSection = () => {
  return (
    <section className="mb-20">
      {/* APPLY SAME TEXT STYLE */}
      <div className="font-serif">
        <h2 className="text-2xl sm:text-3xl font-bold mb-6">
          Special Offers
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
          {specialOffers.map((offer, index) => (
            <SwiperSlide key={index}>
              <div className="cursor-pointer group">
                <img
                  src={offer.image}
                  alt={offer.title}
                  className="rounded-lg mb-3 aspect-[3/4] object-cover group-hover:scale-105 transition"
                />
                <h3 className="font-semibold text-xs sm:text-sm">
                  {offer.title}
                </h3>
                <p className="text-[10px] sm:text-xs text-gray-600">
                  {offer.desc}
                </p>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
};

export default SpecialOffersSection;
