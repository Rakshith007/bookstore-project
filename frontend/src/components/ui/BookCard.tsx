import React from "react";

interface BookCardProps {
  title: string;
  author?: string;
  image: string;
}

const BookCard: React.FC<BookCardProps> = ({ title, author, image }) => {
  return (
    <div className="cursor-pointer group">
      <img
        src={image}
        alt={title}
        className="rounded-lg mb-3 aspect-[3/4] object-cover group-hover:scale-105 transition"
      />
      <h3 className="font-semibold text-xs sm:text-sm">{title}</h3>
      {author && (
        <p className="text-[10px] sm:text-xs text-gray-600">by {author}</p>
      )}
    </div>
  );
};

export default BookCard;
