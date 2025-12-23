import React from "react";

import Navbar from "../../components/layout/Navbar";
import Footer from "../../components/layout/Footer";

import HeroSection from "../../components/sections/HeroSection";
import BestsellersSection from "../../components/sections/BestsellersSection";
import DarkPromoSection from "../../components/sections/DarkPromoSection";
import SpecialOffersSection from "../../components/sections/SpecialOffersSection";
import TopBooksSection from "../../components/sections/TopBooksSection";
import AuthorSpotlightSection from "../../components/sections/AuthorSpotlightSection";

export default function BookHaven() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-12">
        <HeroSection />
        <BestsellersSection />
        <DarkPromoSection />
        <SpecialOffersSection />
        <TopBooksSection />
        <AuthorSpotlightSection />
      </main>

      <Footer />
    </div>
  );
}
