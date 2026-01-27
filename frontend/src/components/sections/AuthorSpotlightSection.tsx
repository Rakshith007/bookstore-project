import React from "react";
import { ArrowRight } from "lucide-react";

const authors = [
  {
    name: "Friedrich Nietzsche",
    desc: "Philosopher and cultural critic whose work has exerted a profound influence on modern intellectual history.",
    image: "https://i.pravatar.cc/200?img=13",
  },
  {
    name: "Erwin Schrödinger",
    desc: "Nobel Prize-winning physicist whose work centered on quantum theory and wave mechanics.",
    image: "https://i.pravatar.cc/200?img=54",
  },
  {
    name: "Another Author",
    desc: "British-American author of fantasy genre. His first book became a finalist of the fantasy genre in 2011.",
    image: "https://i.pravatar.cc/200?img=32",
  },
];

const AuthorSpotlightSection = () => {
  return (
    <div className="font-serif">
      {/* AUTHOR SPOTLIGHT SECTION */}
      <section className="mb-0 bg-[#F5EBDD] py-16 px-4 rounded-t-xl">
        <div className="max-w-7xl mx-auto">
          {/* HEADER */}
          <div className="flex items-center justify-between mb-12 px-2">
            <h2 className="text-2xl sm:text-3xl font-bold text-[#2E4A3D]">
              Get to know our Scholars
            </h2>
            <button className="text-sm font-bold text-[#B85C38] hover:text-[#2E4A3D] transition-colors hover:underline">
              See all authors
            </button>
          </div>

          {/* GREEN ROUNDED CONTAINER */}
          <div className="bg-[#2E4A3D] text-[#FAF9F6] rounded-3xl py-14 px-6 sm:px-10 shadow-xl">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-16 sm:gap-12 text-center">
              {authors.map((author, index) => (
                <div key={index} className="relative flex flex-col items-center">
                  {/* AUTHOR IMAGE */}
                  <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-[#FAF9F6] shadow-2xl -mt-20 mb-4 bg-[#FAF9F6]">
                    <img
                      src={author.image}
                      alt={author.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* AUTHOR DETAILS */}
                  <h3 className="text-lg font-bold text-[#D4A373]">
                    {author.name}
                  </h3>

                  <p className="text-sm font-bold mt-1 text-[#FAF9F6]/90 uppercase tracking-wider">
                    About the author
                  </p>

                  <p className="text-sm opacity-80 mt-2 max-w-xs leading-relaxed">
                    {author.desc}
                  </p>
                  
                  <div className="h-0.5 w-12 bg-[#A3B18A] mt-4 opacity-50 rounded-full"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* BRIDGE CTA SECTION (Fills space before footer) */}
      <section className="bg-[#FAF9F6] py-20 border-t border-[#F5EBDD]">
        <div className="max-w-4xl mx-auto px-6 text-center">
        </div>
      </section>
    </div>
  );
};

export default AuthorSpotlightSection;