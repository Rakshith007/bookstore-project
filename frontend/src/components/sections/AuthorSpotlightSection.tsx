import React from "react";

const authors = [
  {
    name: "Friedrich Nietzsche",
    desc: "British-American author of fantasy genre. His first book – 'The lord of Thorns' became a finalist of The fantasy genre in 2011.",
    image: "https://i.pravatar.cc/200?img=13",
  },
  {
    name: "Ervin Shredingery",
    desc: "British-American author of fantasy genre. His first book became a finalist of the fantasy genre in 2011.",
    image: "https://i.pravatar.cc/200?img=54",
  },
  {
    name: "Another Author",
    desc: "British-American author of fantasy genre. His first book – 'The lord of Thorns' became a finalist of The fantasy genre.",
    image: "https://i.pravatar.cc/200?img=32",
  },
];

const AuthorSpotlightSection = () => {
  return (
    <section className="mb-16 bg-[#F7EEDF] py-10 px-4 rounded-xl">
      {/* APPLY SAME TEXT STYLE */}
      <div className="font-serif">
        {/* HEADER */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl sm:text-3xl font-bold">
            Get to know
          </h2>
          <button className="text-sm font-semibold text-red-500 hover:underline">
            See all
          </button>
        </div>

        {/* GREEN ROUNDED CONTAINER */}
        <div className="bg-[#254734] text-white rounded-3xl py-14 px-6 sm:px-10">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-12 text-center">

            {authors.map((author, index) => (
              <div key={index} className="relative flex flex-col items-center">

                {/* AUTHOR IMAGE */}
                <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-white shadow-lg -mt-20 mb-4">
                  <img
                    src={author.image}
                    alt={author.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* AUTHOR DETAILS */}
                <h3 className="text-lg font-bold">
                  {author.name}
                </h3>

                <p className="text-sm font-semibold mt-1">
                  About the author:
                </p>

                <p className="text-sm opacity-80 mt-2 max-w-xs">
                  {author.desc}
                </p>
              </div>
            ))}

          </div>
        </div>
      </div>
    </section>
  );
};

export default AuthorSpotlightSection;
