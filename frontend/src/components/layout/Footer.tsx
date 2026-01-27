import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Facebook, Twitter, Instagram, Send } from "lucide-react";
import PrivacyPopup from "./PrivacyPopup";
import TermsPopup from "./TermsPopup";

const Footer = () => {
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [showTerms, setShowTerms] = useState(false);

  return (
    <footer className="border-t border-[#F5EBDD] bg-[#FAF9F6] text-[#333333]">
      <div className="font-serif">
        <div className="max-w-7xl mx-auto px-6 py-14">
          {/* GRID TOP SECTION */}
          <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4">
            {/* Newsletter */}
            <div>
              <h3 className="text-lg font-bold mb-4 text-[#2E4A3D]">
                Stay Updated
              </h3>
              <p className="text-sm text-[#333333]/80 mb-4">
                Subscribe to our newsletter for the latest updates.
              </p>
              <div className="flex">
                <input
                  type="email"
                  placeholder="Your email"
                  className="flex-1 px-4 py-2 border border-[#D4A373] rounded-l-lg focus:outline-none focus:ring-2 focus:ring-[#A3B18A] text-sm"
                />
                <button className="bg-[#2E4A3D] text-white px-4 py-2 rounded-r-lg hover:bg-[#1E3328] transition-colors">
                  <Send className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="text-lg font-bold mb-4 text-[#2E4A3D]">
                Quick Links
              </h3>
              <nav className="space-y-2 text-sm">
                <Link
                  to="/"
                  className="block hover:text-[#D4A373] transition-colors"
                >
                  Home
                </Link>
                <Link
                  to="/about"
                  className="block hover:text-[#D4A373] transition-colors"
                >
                  About Us
                </Link>
                <a
                  href="/search"
                  className="block hover:text-[#D4A373] transition-colors"
                >
                  Products
                </a>
              </nav>
            </div>

            {/* Contact */}
            <div>
              <h3 className="text-lg font-bold mb-4 text-[#2E4A3D]">
                Contact Us
              </h3>
              <div className="space-y-1 text-sm text-[#333333]/80">
                <p>123 Innovation Street</p>
                <p>Tech City, TC 12345</p>
                <p>Phone: (123) 456-7890</p>
                <p>Email: hello@example.com</p>
              </div>
            </div>

            {/* Social Links */}
            <div>
              <h3 className="text-lg font-bold mb-4 text-[#2E4A3D]">
                Follow Us
              </h3>
              <div className="flex gap-3 mb-6">
                <button className="w-10 h-10 border border-[#D4A373] rounded-full flex items-center justify-center text-[#2E4A3D] hover:bg-[#A3B18A]/20 transition">
                  <Facebook className="h-4 w-4" />
                </button>
                <button className="w-10 h-10 border border-[#D4A373] rounded-full flex items-center justify-center text-[#2E4A3D] hover:bg-[#A3B18A]/20 transition">
                  <Twitter className="h-4 w-4" />
                </button>
                <button className="w-10 h-10 border border-[#D4A373] rounded-full flex items-center justify-center text-[#2E4A3D] hover:bg-[#A3B18A]/20 transition">
                  <Instagram className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Bottom Section - Fixed alignment */}
          <div className="mt-12 pt-6 border-t border-[#F5EBDD]">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              {/* Copyright - Now properly aligned to left */}
              <div className="text-center md:text-left">
                <p className="text-sm text-[#333333]/60">
                  © 2025 Book Haven. All rights reserved.
                </p>
              </div>
              
              {/* Policy Links - Now properly aligned to right */}
              <div className="flex items-center gap-4 text-sm font-medium">
                <button
                  onClick={() => setShowPrivacy(true)}
                  className="text-[#333333]/70 hover:text-[#B85C38] transition-colors"
                >
                  Privacy Policy
                </button>
                <button
                  onClick={() => setShowTerms(true)}
                  className="text-[#333333]/70 hover:text-[#B85C38] transition-colors"
                >
                  Terms of Service
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Render the Popup Components */}
      <PrivacyPopup
        isOpen={showPrivacy}
        onClose={() => setShowPrivacy(false)}
      />
      <TermsPopup 
        isOpen={showTerms} 
        onClose={() => setShowTerms(false)} 
      />
    </footer>
  );
};

export default Footer;