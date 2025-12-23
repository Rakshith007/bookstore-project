import React from "react";

const DarkPromoSection = () => {
  return (
    <section className="mb-20">
      {/* APPLY SAME TEXT STYLE */}
      <div className="font-serif">
        <h2 className="text-2xl sm:text-3xl font-bold mb-6">
          Dark Promo
        </h2>

        <div className="p-6 sm:p-10 bg-gradient-to-br from-amber-50 to-stone-100 rounded-2xl flex flex-col lg:flex-row gap-10">
          <div className="flex-1">
            <h3 className="text-xl font-bold">
              Book Fair
            </h3>
            <h4 className="text-lg font-semibold mt-2 mb-4">
              Exclusive Book Fair
            </h4>

            <p className="text-gray-600 mb-6 text-sm sm:text-base">
              Enjoy discounts on a wide range of genres. Limited time offer.
            </p>

            <button className="px-6 py-2 bg-gradient-to-r from-cyan-300 to-cyan-500 text-white rounded-full font-medium">
              Shop Now
            </button>
          </div>

          <div className="flex-1">
            <img
              src="https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=800&q=80"
              alt="Open Books"
              className="rounded-xl object-cover w-full"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default DarkPromoSection;
