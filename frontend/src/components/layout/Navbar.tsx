"use client";

import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Heart, ShoppingCart, User, BookOpen, Search, X } from "lucide-react";
import { isLoggedIn } from "../../lib/auth";

const Navbar = () => {
  const navigate = useNavigate();
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const loggedIn = isLoggedIn();

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
    setShowSearch(false);
    setSearchQuery("");
  };

  // GO TO HOME — always replace history (clicking logo should feel like "home base")
  const handleLogoClick = () => {
    navigate("/", { replace: true });
  };

  // WISHLIST — exploratory, so keep normal history when going to real wishlist
  const handleWishlistClick = () => {
    navigate(loggedIn ? "/wishlist" : "/wishlist/empty");
  };

  // CART — same as wishlist
  const handleCartClick = () => {
    navigate(loggedIn ? "/cart" : "/cart/empty");
  };

  // PROFILE — only for logged-in users, normal navigation
  const handleProfileClick = () => {
    navigate("/profile");
  };

  return (
    <header className="bg-white py-4 px-6 border-b border-gray-200 font-serif">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* LEFT LOGO — Use onClick with replace: true */}
        <div
          onClick={handleLogoClick}
          className="flex items-center gap-2 cursor-pointer"
        >
          <BookOpen className="w-5 h-5 text-gray-700" />
          <span className="font-bold text-lg text-gray-900">Book Haven</span>
        </div>

        {/* RIGHT SECTION */}
        <div className="flex items-center gap-4">
          {/* SEARCH BAR */}
          {showSearch ? (
            <form
              onSubmit={handleSearchSubmit}
              className="flex items-center bg-gray-100 px-4 py-2 rounded-full border border-gray-200 w-60"
            >
              <Search className="w-5 h-5 text-gray-500" />
              <input
                type="text"
                placeholder="Search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent outline-none px-2 w-full text-sm"
                autoFocus
              />
              <X
                className="w-5 h-5 text-gray-500 cursor-pointer"
                onClick={() => {
                  setShowSearch(false);
                  setSearchQuery("");
                }}
              />
            </form>
          ) : (
            <div
              onClick={() => setShowSearch(true)}
              className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center cursor-pointer hover:bg-gray-300 transition"
            >
              <Search className="w-5 h-5 text-gray-700" />
            </div>
          )}

          {/* LOGIN BUTTON - Only when NOT logged in */}
          {!loggedIn && (
            <Link
              to="/login"
              className="px-5 py-2 bg-gradient-to-r from-gray-200 to-gray-400 text-gray-900 font-semibold rounded-full hover:opacity-90 transition"
            >
              Login
            </Link>
          )}

          {/* WISHLIST */}
          <div
            onClick={handleWishlistClick}
            className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center cursor-pointer hover:bg-gray-300 transition"
            title="Wishlist"
          >
            <Heart className="w-5 h-5 text-gray-700" />
          </div>

          {/* CART */}
          <div
            onClick={handleCartClick}
            className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center cursor-pointer hover:bg-gray-300 transition"
            title="Cart"
          >
            <ShoppingCart className="w-5 h-5 text-gray-700" />
          </div>

          {/* PROFILE ICON - Only visible when logged in */}
          {loggedIn && (
            <div
              onClick={handleProfileClick}
              className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center cursor-pointer hover:bg-gray-300 transition"
              title="My Profile"
            >
              <User className="w-5 h-5 text-gray-700" />
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;