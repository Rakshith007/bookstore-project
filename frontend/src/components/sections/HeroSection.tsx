"use client";

import React, { useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, EffectFade } from "swiper/modules";
import { motion, useMotionValue, useSpring } from "framer-motion";
import type { Swiper as SwiperType } from "swiper";

import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/effect-fade";

const slides = [
  {
    title: "Discover the",
    subtitle: "Holy Quran",
    description: "Explore our premium collection of the Holy Quran with beautiful ornate covers, various translations, and luxurious editions to enrich your spiritual connection.",
    image: "https://png.pngtree.com/thumb_back/fh260/background/20250703/pngtree-a-beautifully-adorned-quran-with-intricate-gold-lettering-on-its-cover-image_17457717.webp",
    accentColor: "#D4A373",
    bgGradient: "from-[#D4A373]/20 via-[#F5EBDD]/30 to-[#FAF9F6]",
  },
  {
    title: "Authentic",
    subtitle: "Hadith Collections",
    description: "Browse complete sets of Sahih al-Bukhari, Sahih Muslim, and other trusted Hadith compilations in authentic Arabic-English editions.",
    image: "https://cdn.pixabay.com/photo/2020/03/20/16/00/quran-4951037_1280.jpg",
    accentColor: "#B85C38",
    bgGradient: "from-[#B85C38]/20 via-[#F5EBDD]/30 to-[#FAF9F6]",
  },
  {
    title: "Renowned",
    subtitle: "Tafsir Works",
    description: "Deepen your understanding with classical Quran exegesis like Tafsir Ibn Kathir and other scholarly interpretations of the Holy Book.",
    image: "https://images.pexels.com/photos/7249193/pexels-photo-7249193.jpeg",
    accentColor: "#A3B18A",
    bgGradient: "from-[#A3B18A]/20 via-[#F5EBDD]/30 to-[#FAF9F6]",
  },
];

const MagneticButton = ({ children, variant = "primary" }: { children: React.ReactNode; variant?: "primary" | "secondary" }) => {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { damping: 20, stiffness: 200 });
  const springY = useSpring(y, { damping: 20, stiffness: 200 });

  const classes = variant === "primary"
    ? "bg-gradient-to-r from-[#B85C38] to-[#D4A373] hover:from-[#2E4A3D] hover:to-[#A3B18A] text-[#FAF9F6] shadow-xl"
    : "bg-black text-white hover:bg-gradient-to-r hover:from-[#2E4A3D] hover:to-[#A3B18A] hover:text-[#FAF9F6] border-2 border-black hover:border-transparent shadow-xl transition-all duration-500";

  return (
    <motion.button
      onMouseMove={(e) => {
        const { clientX, clientY, currentTarget } = e;
        const { left, top, width, height } = currentTarget.getBoundingClientRect();
        x.set((clientX - (left + width / 2)) * 0.25);
        y.set((clientY - (top + height / 2)) * 0.25);
      }}
      onMouseLeave={() => { x.set(0); y.set(0); }}
      style={{ x: springX, y: springY }}
      className={`px-5 sm:px-7 py-2.5 sm:py-3.5 rounded-full font-bold transition-all duration-300 text-xs sm:text-sm lg:text-base hover:scale-105 hover:shadow-2xl ${classes} font-times`}
    >
      <span className="flex items-center gap-2">
        {children}
        <motion.span
          animate={{ x: [0, 4, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          →
        </motion.span>
      </span>
    </motion.button>
  );
};

const FloatingShape = ({ delay = 0, color = "#D4A373", size = "w-32 h-32", position = "top-20 left-20" }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0 }}
    animate={{
      opacity: [0.1, 0.2, 0.1],
      scale: [1, 1.2, 1],
      rotate: [0, 180, 360],
    }}
    transition={{
      duration: 10,
      repeat: Infinity,
      delay,
      ease: "easeInOut"
    }}
    className={`absolute ${position} ${size} rounded-full blur-2xl`}
    style={{ backgroundColor: color }}
  />
);

const HeroSection = () => {
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <section className="relative w-full h-[600px] sm:h-[500px] lg:h-[580px] bg-gradient-to-br from-[#FAF9F6] via-[#F5EBDD] to-[#FAF9F6] overflow-hidden mb-0">
      {/* Animated Background Shapes - Adjusted for mobile */}
      <FloatingShape delay={0} color="#D4A373" size="w-32 sm:w-48 lg:w-64 h-32 sm:h-48 lg:h-64" position="top-5 sm:top-10 -left-10 sm:-left-20" />
      <FloatingShape delay={2} color="#B85C38" size="w-24 sm:w-36 lg:w-48 h-24 sm:h-36 lg:h-48" position="bottom-5 sm:bottom-10 -right-5 sm:-right-10" />
      <FloatingShape delay={4} color="#A3B18A" size="w-28 sm:w-40 lg:w-56 h-28 sm:h-40 lg:h-56" position="top-20 sm:top-32 right-5 sm:right-10" />
      <FloatingShape delay={1} color="#2E4A3D" size="w-20 sm:w-32 lg:w-40 h-20 sm:h-32 lg:h-40" position="bottom-5 sm:bottom-10 left-1/4 sm:left-1/3" />

      {/* Top gradient border */}
      <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-[#2E4A3D] via-[#D4A373] via-[#B85C38] to-[#A3B18A]" />

      {/* Decorative dots pattern */}
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle,#2E4A3D_1px,transparent_1px)] bg-[length:20px_20px] sm:bg-[length:30px_30px]" />

      <Swiper
        modules={[Autoplay, Pagination, EffectFade]}
        effect="fade"
        fadeEffect={{ crossFade: true }}
        speed={1200}
        autoplay={{ delay: 5000, disableOnInteraction: false }}
        pagination={{ clickable: true, el: ".custom-pagination" }}
        loop={true}
        onSlideChange={(swiper: SwiperType) => setActiveIndex(swiper.realIndex)}
        className="w-full h-full"
      >
        {slides.map((slide, index) => (
          <SwiperSlide key={index}>
            {({ isActive }) => (
              <div className="relative w-full h-full flex items-center">
                {/* Slide-specific gradient background */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={isActive ? { opacity: 1 } : { opacity: 0 }}
                  transition={{ duration: 1 }}
                  className={`absolute inset-0 bg-gradient-to-br ${slide.bgGradient}`}
                />

                <div className="container mx-auto px-4 sm:px-6 lg:px-16 relative z-10">
                  <div className="grid lg:grid-cols-2 gap-6 sm:gap-8 items-center">

                    {/* Left Content */}
                    <motion.div
                      initial={{ opacity: 0, x: -50 }}
                      animate={isActive ? { opacity: 1, x: 0 } : { opacity: 0, x: -50 }}
                      transition={{ duration: 0.8, ease: "easeOut" }}
                      className="space-y-3 sm:space-y-4 lg:space-y-6 text-center lg:text-left"
                    >
                      {/* Badge */}
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={isActive ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                        transition={{ duration: 0.6, delay: 0.3 }}
                        className="inline-flex items-center gap-2 sm:gap-3 px-3 sm:px-5 py-1.5 sm:py-2.5 bg-gradient-to-r from-[#D4A373] to-[#B85C38] rounded-full shadow-lg"
                      >
                        <motion.div
                          animate={{ scale: [1, 1.3, 1] }}
                          transition={{ duration: 2, repeat: Infinity }}
                          className="w-2 sm:w-2.5 h-2 sm:h-2.5 rounded-full bg-[#FAF9F6]"
                        />
                        <span className="text-[#FAF9F6] text-[10px] sm:text-xs lg:text-sm font-bold tracking-wider font-times">
                          FEATURED COLLECTION
                        </span>
                      </motion.div>

                      {/* Title */}
                      <div>
                        <motion.h2
                          initial={{ opacity: 0, y: 20 }}
                          animate={isActive ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                          transition={{ duration: 0.6, delay: 0.4 }}
                          className="text-xl sm:text-2xl lg:text-4xl font-bold bg-gradient-to-r from-[#2E4A3D] to-[#A3B18A] bg-clip-text text-transparent mb-1 sm:mb-2 font-times"
                        >
                          {slide.title}
                        </motion.h2>
                        <motion.h1
                          initial={{ opacity: 0, y: 20 }}
                          animate={isActive ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                          transition={{ duration: 0.6, delay: 0.5 }}
                          className="text-3xl sm:text-4xl lg:text-6xl font-extrabold bg-gradient-to-r from-[#B85C38] via-[#2E4A3D] to-[#A3B18A] bg-clip-text text-transparent relative inline-block font-times"
                        >
                          {slide.subtitle}
                          <motion.div
                            initial={{ scaleX: 0 }}
                            animate={isActive ? { scaleX: 1 } : { scaleX: 0 }}
                            transition={{ duration: 0.8, delay: 0.7 }}
                            className="absolute -bottom-1 sm:-bottom-2 left-0 right-0 h-2 sm:h-3 bg-gradient-to-r from-[#D4A373] via-[#B85C38] to-[#A3B18A] opacity-40 origin-left rounded-full"
                          />
                        </motion.h1>
                      </div>

                      {/* Description */}
                      <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={isActive ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                        transition={{ duration: 0.6, delay: 0.6 }}
                        className="text-sm sm:text-base lg:text-lg text-[#333333] leading-relaxed max-w-lg mx-auto lg:mx-0 font-medium font-times px-2 sm:px-0"
                      >
                        {slide.description}
                      </motion.p>

                      {/* CTAs */}
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={isActive ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                        transition={{ duration: 0.6, delay: 0.8 }}
                        className="flex flex-wrap justify-center lg:justify-start gap-3 sm:gap-4 pt-1 sm:pt-2"
                      >
                        <a href="/search" className="inline-block">
                          <MagneticButton variant="secondary">SHOP NOW</MagneticButton>
                        </a>
                      </motion.div>
                    </motion.div>

                    {/* Right Image Container */}
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8, rotate: -5 }}
                      animate={isActive ? { opacity: 1, scale: 1, rotate: 0 } : { opacity: 0, scale: 0.8, rotate: -5 }}
                      transition={{ duration: 0.9, ease: "easeOut" }}
                      className="relative h-[280px] sm:h-[350px] lg:h-[460px] flex items-center justify-center mt-4 lg:mt-0"
                    >
                      {/* Rotating gradient ring */}
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                        className="absolute w-[280px] h-[280px] sm:w-[380px] sm:h-[380px] lg:w-[480px] lg:h-[480px] rounded-[30px] sm:rounded-[50px]"
                        style={{
                          background: `conic-gradient(from 0deg, ${slide.accentColor}, #D4A373, #A3B18A, ${slide.accentColor})`,
                          opacity: 0.15
                        }}
                      />

                      {/* Background box */}
                      <div className="absolute w-[260px] h-[260px] sm:w-[360px] sm:h-[360px] lg:w-[460px] lg:h-[460px] bg-gradient-to-br from-[#F5EBDD] via-[#FAF9F6] to-[#F5EBDD] rounded-[30px] sm:rounded-[50px] shadow-2xl" />

                      {/* Multi-colored border */}
                      <motion.div
                        key={activeIndex}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.8 }}
                        className="absolute w-[260px] h-[260px] sm:w-[360px] sm:h-[360px] lg:w-[460px] lg:h-[460px] rounded-[30px] sm:rounded-[50px] border-[4px] sm:border-[6px]"
                        style={{
                          borderColor: slides[activeIndex].accentColor,
                          boxShadow: `0 0 20px ${slides[activeIndex].accentColor}50`
                        }}
                      />

                      {/* Dashed border */}
                      <motion.div
                        animate={{ rotate: -360 }}
                        transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                        className="absolute w-[240px] h-[240px] sm:w-[340px] sm:h-[340px] lg:w-[440px] lg:h-[440px] rounded-[30px] sm:rounded-[50px] border-2 border-dashed border-[#D4A373]/40"
                      />

                      {/* Floating dots - hidden on very small screens */}
                      {[
                        { color: "#D4A373", size: "w-3 h-3 sm:w-4 sm:h-4", pos: "top-4 sm:top-8 left-4 sm:left-8" },
                        { color: "#B85C38", size: "w-2 h-2 sm:w-3 sm:h-3", pos: "top-8 sm:top-16 right-6 sm:right-12" },
                        { color: "#A3B18A", size: "w-4 h-4 sm:w-5 sm:h-5", pos: "bottom-6 sm:bottom-12 left-8 sm:left-16" },
                        { color: "#2E4A3D", size: "w-2 h-2 sm:w-3 sm:h-3", pos: "bottom-8 sm:bottom-16 right-5 sm:right-10" },
                      ].map((dot, i) => (
                        <motion.div
                          key={i}
                          animate={{
                            y: [0, -15, 0],
                            opacity: [0.6, 1, 0.6],
                            scale: [1, 1.2, 1]
                          }}
                          transition={{
                            duration: 3,
                            repeat: Infinity,
                            delay: i * 0.5
                          }}
                          className={`absolute ${dot.pos} ${dot.size} rounded-full shadow-lg hidden sm:block`}
                          style={{ backgroundColor: dot.color }}
                        />
                      ))}

                      {/* Image */}
                      <div className="absolute w-[260px] h-[260px] sm:w-[360px] sm:h-[360px] lg:w-[460px] lg:h-[460px] rounded-[30px] sm:rounded-[50px] overflow-hidden flex items-center justify-center z-10">
                        <motion.img
                          initial={{ scale: 0.8, opacity: 0 }}
                          animate={isActive ? {
                            scale: 1,
                            opacity: 1,
                            y: [0, -10, 0],
                            rotate: [0, 3, -3, 0]
                          } : { scale: 0.8, opacity: 0 }}
                          transition={{
                            scale: { duration: 0.8, ease: "easeOut" },
                            opacity: { duration: 0.5 },
                            y: { duration: 6, repeat: Infinity, ease: "easeInOut" },
                            rotate: { duration: 6, repeat: Infinity, ease: "easeInOut" }
                          }}
                          src={slide.image}
                          alt={slide.subtitle}
                          className="w-full h-full object-contain p-4 sm:p-6 drop-shadow-2xl"
                        />
                      </div>
                    </motion.div>
                  </div>
                </div>
              </div>
            )}
          </SwiperSlide>
        ))}
      </Swiper>

      {/* Colorful Pagination */}
      <div className="absolute bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 lg:left-6 lg:translate-x-0 lg:left-16 z-20 flex items-center gap-3 sm:gap-4">
        <div className="custom-pagination" />
        <div className="hidden sm:flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-white/80 backdrop-blur-sm rounded-full shadow-lg">
          <span className="font-bold text-base sm:text-lg bg-gradient-to-r from-[#B85C38] to-[#D4A373] bg-clip-text text-transparent font-times">
            {String(activeIndex + 1).padStart(2, '0')}
          </span>
          <span className="text-[#333333]/40 text-sm sm:text-base">/</span>
          <span className="text-[#333333]/60 font-times text-sm sm:text-base">{String(slides.length).padStart(2, '0')}</span>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{
        __html: `
        @import url('https://fonts.googleapis.com/css2?family=Times+New+Roman&display=swap');
        
        .font-times {
          font-family: 'Times New Roman', Times, serif !important;
        }
        
        .custom-pagination {
          display: flex;
          gap: 8px;
        }
        @media (min-width: 640px) {
          .custom-pagination {
            gap: 12px;
          }
        }
        .custom-pagination .swiper-pagination-bullet {
          width: 10px;
          height: 10px;
          background: linear-gradient(135deg, #2E4A3D, #A3B18A);
          opacity: 0.3;
          border-radius: 50%;
          transition: all 0.4s ease;
          box-shadow: 0 2px 8px rgba(46, 74, 61, 0.2);
        }
        @media (min-width: 640px) {
          .custom-pagination .swiper-pagination-bullet {
            width: 14px;
            height: 14px;
          }
        }
        .custom-pagination .swiper-pagination-bullet-active {
          width: 35px;
          background: linear-gradient(90deg, #B85C38, #D4A373, #A3B18A);
          opacity: 1;
          border-radius: 10px;
          box-shadow: 0 4px 15px rgba(184, 92, 56, 0.4);
        }
        @media (min-width: 640px) {
          .custom-pagination .swiper-pagination-bullet-active {
            width: 50px;
          }
        }
        .custom-pagination .swiper-pagination-bullet:hover {
          opacity: 0.6;
          transform: scale(1.1);
        }
      `}} />
    </section>
  );
};

export default HeroSection;