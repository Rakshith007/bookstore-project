import React from "react";
import { Link } from "react-router-dom";

const WishlistEmpty: React.FC = () => {
  return (
    <main
      className="
        min-h-screen
        w-full
        flex flex-col items-center justify-center
        px-4 py-16
        text-center
        bg-[#FAF9F6]
      "
    >
      <div className="w-full max-w-md space-y-8">

        {/* Illustration */}
        <div className="relative mx-auto h-60 w-60 flex items-center justify-center">
          {/* Scholarly Highlight Glow */}
          <div className="absolute inset-0 rounded-full bg-[#D4A373]/20 blur-3xl" />

          <div
            className="
              relative h-full w-full
              rounded-2xl
              bg-[#F5EBDD]
              bg-center bg-contain bg-no-repeat
            "
            style={{
              backgroundImage:
                "url('https://lh3.googleusercontent.com/aida-public/AB6AXuCMK74Sz57h9e1CGA2RGLLa9YqeAIfVrmUKxJyJ5p7U4Z4hshWpk_30DJhKEUA361DKdnRpX8_8fqL9gqrWq9H7Y5L3y8I6XPfE-E0DhmVnwSz6TjrP252MGGhOmV7_y-zuWhEWIgyMTK-Wjh3CaUfLStSUFE_HKZWQ5gRFC2fyISaDIoFeUZ1suSmI5L31L7haTYSPZ1dsKdWt3ohSdsEiLWxzrN5TQFMC67ymiSoPJopMKup0WimOm79EP9XarxdsoFPp2ZnfjEE')",
            }}
          />
        </div>

        {/* Text */}
        <div className="space-y-3">
          <h1 className="text-3xl font-bold tracking-tight text-[#333333]">
            Your Wishlist Is Empty
          </h1>
          <p className="text-lg text-[#333333]/70">
            Save books you’re interested in and find them easily later.
          </p>
        </div>

        {/* Action */}
        <Link to="/search">
          <button
            className="
              h-12 w-full rounded-full
              bg-[#B85C38]
              text-white font-medium
              shadow-[0_8px_20px_rgba(0,0,0,0.15)]
              transition-all
              hover:bg-[#A3B18A]
              focus:ring-4 focus:ring-[#A3B18A]/40
              active:scale-95
            "
          >
            Start Shopping
          </button>
        </Link>

      </div>
    </main>
  );
};

export default WishlistEmpty;
