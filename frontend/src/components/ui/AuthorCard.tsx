import React from "react";

interface AuthorCardProps {
  name: string;
  desc: string;
  image: string;
}

const AuthorCard: React.FC<AuthorCardProps> = ({ name, desc, image }) => {
  return (
    <div className="text-center group cursor-pointer">
      <img
        src={image}
        alt={name}
        className="w-32 h-32 sm:w-40 sm:h-40 mx-auto rounded-full object-cover mb-4 group-hover:scale-105 transition"
      />
      <h3 className="font-bold text-sm sm:text-base">{name}</h3>
      <p className="text-xs sm:text-sm text-gray-600">{desc}</p>
    </div>
  );
};

export default AuthorCard;
