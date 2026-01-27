import React, { useState } from 'react';
import { Heart, Search, ShoppingBag, User, AlignLeft, Grid3x3, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';

const BooksListingPage = () => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState([0, 100]);
  const [searchAuthor, setSearchAuthor] = useState('');
  const [selectedRatings, setSelectedRatings] = useState<number[]>([]);

  const genres = ['Fiction', 'Mystery', 'Thriller', 'Romance', 'Science Fiction'];
  const ratings = [5, 4, 3, 2, 1];

  const books = [
    { id: 1, title: 'The Whispering Woods', image: 'https://images.unsplash.com/photo-1510443729864-1628d0979b9d?auto=format&fit=crop&q=80&w=300&h=450', color: 'bg-[#F5EBDD]' },
    { id: 2, title: 'Emerald Canopy', image: 'https://images.unsplash.com/photo-1589998059171-988d880ad7cb?auto=format&fit=crop&q=80&w=300&h=450', color: 'bg-[#F5EBDD]' },
    { id: 3, title: 'Secrets of the Silent Grove', image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=300&h=450', color: 'bg-[#F5EBDD]' },
    { id: 4, title: 'The Hidden Path', image: 'https://images.unsplash.com/photo-1543165275-f763321900a6?auto=format&fit=crop&q=80&w=300&h=450', color: 'bg-[#F5EBDD]' },
    { id: 5, title: 'Echoes of the Ancient Trees', image: 'https://images.unsplash.com/photo-1456513080510-7bf32be8f2ee?auto=format&fit=crop&q=80&w=300&h=450', color: 'bg-[#F5EBDD]' },
    { id: 6, title: "The Forest's Embrace", image: 'https://images.unsplash.com/photo-1517849195971-4603e5c70752?auto=format&fit=crop&q=80&w=300&h=450', color: 'bg-[#F5EBDD]' },
    { id: 7, title: 'Beneath the Boughs', image: 'https://images.unsplash.com/photo-1514787010476-857c61f239e3?auto=format&fit=crop&q=80&w=300&h=450', color: 'bg-[#F5EBDD]' },
    { id: 8, title: 'The Green Heart', image: 'https://images.unsplash.com/photo-1509316792376-78e24c787310?auto=format&fit=crop&q=80&w=300&h=450', color: 'bg-[#F5EBDD]' },
    { id: 9, title: 'Whispers of the Wild', image: 'https://images.unsplash.com/photo-1541963463532-d68292c34b19?auto=format&fit=crop&q=80&w=300&h=450', color: 'bg-[#F5EBDD]' },
    { id: 10, title: "The Canopy's Secret", image: 'https://images.unsplash.com/photo-1519682337058-cd94625dc03a?auto=format&fit=crop&q=80&w=300&h=450', color: 'bg-[#F5EBDD]' },
    { id: 11, title: 'Shadows of the Forest', image: 'https://images.unsplash.com/photo-1515157303023-e2e4e8979c55?auto=format&fit=crop&q=80&w=300&h=450', color: 'bg-[#F5EBDD]' },
    { id: 12, title: 'The Verdant Veil', image: 'https://images.unsplash.com/photo-1498418043697-393c5d63f0d5?auto=format&fit=crop&q=80&w=300&h=450', color: 'bg-[#F5EBDD]' },
  ];

  const toggleGenre = (genre: string) => {
    setSelectedGenres(prev =>
      prev.includes(genre) ? prev.filter(g => g !== genre) : [...prev, genre]
    );
  };

  const toggleRating = (rating: number) => {
    setSelectedRatings(prev =>
      prev.includes(rating) ? prev.filter(r => r !== rating) : [...prev, rating]
    );
  };

  return (
    <div className="min-h-screen bg-[#FAF9F6] font-serif text-[#333333]">
      {/* Header */}
      <header className="border-b border-[#F5EBDD] bg-white px-4 sm:px-6 py-4 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="flex flex-col lg:flex-row items-start lg:items-center gap-4 lg:gap-8 w-full lg:w-auto">
            <h1 className="text-2xl font-bold font-serif text-[#2E4A3D]">NovelNest</h1>
            <nav className="flex flex-wrap gap-4 sm:gap-6 lg:gap-8">
              <a href="#" className="text-[#333333] hover:text-[#B85C38] font-medium text-sm sm:text-base transition-colors">New Arrivals</a>
              <a href="#" className="text-[#333333] hover:text-[#B85C38] font-medium text-sm sm:text-base transition-colors">Bestsellers</a>
              <a href="#" className="text-[#333333] hover:text-[#B85C38] font-medium text-sm sm:text-base transition-colors">Categories</a>
            </nav>
          </div>
          <div className="flex items-center gap-3 sm:gap-4 w-full lg:w-auto">
            <div className="relative flex-1 lg:flex-initial">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#A3B18A] w-5 h-5" />
              <input
                type="text"
                placeholder="Search classics..."
                className="pl-10 pr-4 py-2 bg-[#FAF9F6] border border-[#F5EBDD] rounded-lg w-full lg:w-64 focus:outline-none focus:ring-2 focus:ring-[#D4A373] text-sm"
              />
            </div>
            <button className="p-2 bg-[#FAF9F6] border border-[#F5EBDD] rounded-lg hover:bg-[#A3B18A]/20 transition-colors">
              <Heart className="w-5 h-5 text-[#2E4A3D]" />
            </button>
            <button className="p-2 bg-[#2E4A3D] rounded-lg hover:bg-[#2E4A3D]/90 transition-colors">
              <ShoppingBag className="w-5 h-5 text-white" />
            </button>
            <div className="w-10 h-10 bg-[#D4A373] rounded-full flex items-center justify-center cursor-pointer flex-shrink-0 hover:bg-[#B85C38] transition-colors">
              <User className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-8 lg:gap-12">
          {/* Sidebar Filters */}
          <aside className="lg:col-span-1">
            <div className="space-y-8 sticky top-24">
              <h2 className="text-3xl font-bold font-serif text-[#2E4A3D]">Curate</h2>

              {/* Genres */}
              <div>
                <h3 className="text-xl font-semibold mb-4 font-serif text-[#D4A373]">Genres</h3>
                <div className="space-y-3">
                  {genres.map((genre) => (
                    <label key={genre} className="flex items-center gap-3 cursor-pointer group">
                      <div className="relative">
                        <input
                          type="checkbox"
                          checked={selectedGenres.includes(genre)}
                          onChange={() => toggleGenre(genre)}
                          className="w-5 h-5 rounded border-2 border-[#F5EBDD] appearance-none checked:bg-[#2E4A3D] checked:border-[#2E4A3D] cursor-pointer transition-colors"
                        />
                        {selectedGenres.includes(genre) && (
                          <svg className="absolute top-0 left-0 w-5 h-5 text-white pointer-events-none p-1" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                      <span className="text-base text-[#333333] font-serif group-hover:text-[#2E4A3D] transition-colors">{genre}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Price */}
              <div>
                <h3 className="text-xl font-semibold mb-4 font-serif text-[#D4A373]">Price</h3>
                <div className="space-y-4">
                  <p className="text-base text-[#333333] font-medium font-serif">Up to ${priceRange[1]}</p>
                  <div className="relative pt-2">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={priceRange[1]}
                      onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                      className="w-full h-1.5 bg-[#F5EBDD] rounded-lg appearance-none cursor-pointer accent-[#B85C38]"
                    />
                  </div>
                </div>
              </div>

              {/* Authors */}
              <div>
                <h3 className="text-xl font-semibold mb-4 font-serif text-[#D4A373]">Authors</h3>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#A3B18A] w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search Scholars"
                    value={searchAuthor}
                    onChange={(e) => setSearchAuthor(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-[#F5EBDD] bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A3B18A] text-sm"
                  />
                </div>
              </div>

              {/* Ratings */}
              <div>
                <h3 className="text-xl font-semibold mb-4 font-serif text-[#D4A373]">Scholarly Rating</h3>
                <div className="flex flex-wrap gap-2">
                  {ratings.map((rating) => (
                    <button
                      key={rating}
                      onClick={() => toggleRating(rating)}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                        selectedRatings.includes(rating)
                          ? 'bg-[#2E4A3D] text-white shadow-md'
                          : 'bg-white text-[#2E4A3D] border border-[#F5EBDD] hover:bg-[#A3B18A]/10'
                      }`}
                    >
                      {rating}★
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          {/* Books Area */}
          <main className="lg:col-span-1">
            <div className="mb-8">
              <h1 className="text-4xl sm:text-5xl font-bold mb-3 font-serif text-[#2E4A3D]">The Forest Library</h1>
              <p className="text-[#333333]/80 text-lg mb-8 font-serif italic border-l-4 border-[#D4A373] pl-4">
                "Between the pages of a book is a lovely place to be."
              </p>

              {/* Controls */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-[#F5EBDD] shadow-sm">
                <div className="flex gap-2">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2.5 rounded-lg transition-all ${
                      viewMode === 'grid' ? 'bg-[#2E4A3D] text-white shadow-md' : 'bg-[#FAF9F6] text-[#2E4A3D] border border-[#F5EBDD] hover:bg-[#A3B18A]/20'
                    }`}
                  >
                    <Grid3x3 className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2.5 rounded-lg transition-all ${
                      viewMode === 'list' ? 'bg-[#2E4A3D] text-white shadow-md' : 'bg-[#FAF9F6] text-[#2E4A3D] border border-[#F5EBDD] hover:bg-[#A3B18A]/20'
                    }`}
                  >
                    <AlignLeft className="w-5 h-5" />
                  </button>
                </div>

                <button className="flex items-center gap-2 px-5 py-2.5 bg-[#D4A373] text-white rounded-lg hover:bg-[#B85C38] transition-colors text-sm font-bold shadow-sm">
                  <ChevronDown className="w-4 h-4" />
                  <span>Sort Collection</span>
                </button>
              </div>
            </div>

            {/* Catalog */}
            {viewMode === 'grid' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8 mb-12">
                {books.map((book) => (
                  <div key={book.id} className="group cursor-pointer">
                    <div className={`${book.color} rounded-2xl p-6 flex items-center justify-center mb-4 aspect-[3/4] overflow-hidden border border-[#D4A373]/10 shadow-sm transition-all group-hover:shadow-xl group-hover:border-[#A3B18A]`}>
                      <img
                        src={book.image}
                        alt={book.title}
                        className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500 rounded shadow-2xl"
                        onError={(e) => {
                          e.currentTarget.src = 'https://via.placeholder.com/300x450/2E4A3D/ffffff?text=Classic+Tale';
                        }}
                      />
                    </div>
                    <h3 className="text-lg font-bold text-[#2E4A3D] font-serif group-hover:text-[#B85C38] transition-colors line-clamp-1">{book.title}</h3>
                    <p className="text-[#D4A373] text-sm mt-1 font-serif">Deep Forest Editions</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-8 mb-12">
                {books.map((book) => (
                  <div key={book.id} className="flex gap-8 group cursor-pointer border-b border-[#F5EBDD] pb-8 items-center">
                    <div className={`${book.color} rounded-xl p-4 flex items-center justify-center w-36 h-52 flex-shrink-0 overflow-hidden border border-[#D4A373]/10 group-hover:shadow-lg transition-all`}>
                      <img
                        src={book.image}
                        alt={book.title}
                        className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500 rounded shadow-lg"
                      />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold text-[#2E4A3D] mb-3 font-serif group-hover:text-[#B85C38] transition-colors">{book.title}</h3>
                      <p className="text-[#333333] text-base font-serif leading-relaxed mb-4 line-clamp-2">A masterfully crafted journey through the enchanted woods, exploring the silence between the ancient boughs...</p>
                      <button className="text-[#B85C38] font-bold text-sm hover:underline">View Scholarly Summary →</button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Pagination */}
            <div className="flex items-center justify-center gap-3">
              <button className="p-2.5 hover:bg-[#A3B18A]/20 rounded-full transition-colors border border-[#F5EBDD]">
                <ChevronLeft className="w-5 h-5 text-[#2E4A3D]" />
              </button>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((p) => (
                  <button key={p} className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-sm transition-all ${p === 1 ? 'bg-[#2E4A3D] text-white shadow-lg scale-110' : 'bg-white text-[#2E4A3D] border border-[#F5EBDD] hover:bg-[#F5EBDD]'}`}>
                    {p}
                  </button>
                ))}
              </div>
              <button className="p-2.5 hover:bg-[#A3B18A]/20 rounded-full transition-colors border border-[#F5EBDD]">
                <ChevronRight className="w-5 h-5 text-[#2E4A3D]" />
              </button>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default BooksListingPage;