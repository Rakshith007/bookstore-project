import React from "react";

import Navbar from "../../components/layout/Navbar";
import Footer from "../../components/layout/Footer";

import HeroSection from "../../components/sections/HeroSection";
import BestsellersSection from "../../components/sections/BestsellersSection";
import SpecialOffersSection from "../../components/sections/SpecialOffersSection";
import TopBooksSection from "../../components/sections/TopBooksSection";
import AuthorSpotlightSection from "../../components/sections/AuthorSpotlightSection";

export default function BookHaven() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      
        <HeroSection />
        
        {/*<SpecialOffersSection />*/}
        <TopBooksSection />
        <BestsellersSection />
        {/*<AuthorSpotlightSection />*/}

      <Footer />
    </div>
  );
}
