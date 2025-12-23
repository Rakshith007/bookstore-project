import React from "react";
import { Link } from "react-router-dom";

const WishlistEmpty: React.FC = () => {
  return (
    <main className="flex flex-1 flex-col items-center justify-center px-4 py-16 text-center">
      <div className="w-full max-w-md space-y-8">

        {/* Illustration */}
        <div className="relative mx-auto h-60 w-60 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full bg-primary/10 blur-3xl" />
          <div
            className="relative h-full w-full rounded-2xl bg-center bg-contain bg-no-repeat"
            style={{
              backgroundImage:
                "url('https://lh3.googleusercontent.com/aida-public/AB6AXuCMK74Sz57h9e1CGA2RGLLa9YqeAIfVrmUKxJyJ5p7U4Z4hshWpk_30DJhKEUA361DKdnRpX8_8fqL9gqrWq9H7Y5L3y8I6XPfE-E0DhmVnwSz6TjrP252MGGhOmV7_y-zuWhEWIgyMTK-Wjh3CaUfLStSUFE_HKZWQ5gRFC2fyISaDIoFeUZ1suSmI5L31L7haTYSPZ1dsKdWt3ohSdsEiLWxzrN5TQFMC67ymiSoPJopMKup0WimOm79EP9XarxdsoFPp2ZnfjEE')",
            }}
          />
        </div>

        {/* Text */}
        <div className="space-y-3">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            Your Wishlist Is Empty
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-lg">
            Save books you’re interested in and find them easily later.
          </p>
        </div>

        {/* Actions */}
        <Link to="/search">
        <div className="flex flex-col gap-4">
          <button
                    className="
                      h-12 rounded-full
                      bg-slate-100
                      text-slate-700
                      font-medium
                      shadow-[0_8px_20px_rgba(0,0,0,0.08)]
                      hover:bg-slate-200
                      hover:shadow-[0_10px_28px_rgba(0,0,0,0.12)]
                      transition
                      active:scale-95
                    "
>
  Start Shopping </button>



        </div>
        </Link>

      </div>
    </main>
  );
};

export default WishlistEmpty;
