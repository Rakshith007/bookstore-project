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
    {
      id: 1,
      title: 'The Whispering Woods',
      // Working Image URL
      image: 'https://images.unsplash.com/photo-1510443729864-1628d0979b9d?auto=format&fit=crop&q=80&w=300&h=450',
      color: 'bg-emerald-900'
    },
    {
      id: 2,
      title: 'Emerald Canopy',
      // Working Image URL
      image: 'https://images.unsplash.com/photo-1589998059171-988d880ad7cb?auto=format&fit=crop&q=80&w=300&h=450',
      color: 'bg-stone-200'
    },
    {
      id: 3,
      title: 'Secrets of the Silent Grove',
      // Working Image URL
      image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=300&h=450',
      color: 'bg-teal-800'
    },
    {
      id: 4,
      title: 'The Hidden Path',
      // Working Image URL
      image: 'https://images.unsplash.com/photo-1543165275-f763321900a6?auto=format&fit=crop&q=80&w=300&h=450',
      color: 'bg-stone-300'
    },
    {
      id: 5,
      title: 'Echoes of the Ancient Trees',
      // Working Image URL
      image: 'https://images.unsplash.com/photo-1456513080510-7bf32be8f2ee?auto=format&fit=crop&q=80&w=300&h=450',
      color: 'bg-stone-100'
    },
    {
      id: 6,
      title: "The Forest's Embrace",
      // Working Image URL
      image: 'https://images.unsplash.com/photo-1517849195971-4603e5c70752?auto=format&fit=crop&q=80&w=300&h=450',
      color: 'bg-emerald-900'
    },
    {
      id: 7,
      title: 'Beneath the Boughs',
      // Working Image URL
      image: 'https://images.unsplash.com/photo-1514787010476-857c61f239e3?auto=format&fit=crop&q=80&w=300&h=450',
      color: 'bg-stone-100'
    },
    {
      id: 8,
      title: 'The Green Heart',
      // Working Image URL
      image: 'https://images.unsplash.com/photo-1509316792376-78e24c787310?auto=format&fit=crop&q=80&w=300&h=450',
      color: 'bg-green-700'
    },
    {
      id: 9,
      title: 'Whispers of the Wild',
      // Working Image URL
      image: 'https://images.unsplash.com/photo-1541963463532-d68292c34b19?auto=format&fit=crop&q=80&w=300&h=450',
      color: 'bg-stone-200'
    },
    {
      id: 10,
      title: "The Canopy's Secret",
      // Working Image URL
      image: 'https://images.unsplash.com/photo-1519682337058-cd94625dc03a?auto=format&fit=crop&q=80&w=300&h=450',
      color: 'bg-stone-100'
    },
    {
      id: 11,
      title: 'Shadows of the Forest',
      // Working Image URL
      image: 'https://images.unsplash.com/photo-1515157303023-e2e4e8979c55?auto=format&fit=crop&q=80&w=300&h=450',
      color: 'bg-stone-300'
    },
    {
      id: 12,
      title: 'The Verdant Veil',
      // Working Image URL
      image: 'https://images.unsplash.com/photo-1498418043697-393c5d63f0d5?auto=format&fit=crop&q=80&w=300&h=450',
      color: 'bg-emerald-800'
    },
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
    <div className="min-h-screen bg-white font-serif">
      {/* Header */}
      <header className="border-b border-gray-200 px-4 sm:px-6 py-4">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="flex flex-col lg:flex-row items-start lg:items-center gap-4 lg:gap-8 w-full lg:w-auto">
            <h1 className="text-2xl font-bold font-serif">NovelNest</h1>
            <nav className="flex flex-wrap gap-4 sm:gap-6 lg:gap-8">
              <a href="#" className="text-gray-900 hover:text-gray-600 font-medium text-sm sm:text-base">New Arrivals</a>
              <a href="#" className="text-gray-900 hover:text-gray-600 font-medium text-sm sm:text-base">Bestsellers</a>
              <a href="#" className="text-gray-900 hover:text-gray-600 font-medium text-sm sm:text-base">Categories</a>
              <a href="#" className="text-gray-900 hover:text-gray-600 font-medium text-sm sm:text-base">Authors</a>
              <a href="#" className="text-gray-900 hover:text-gray-600 font-medium text-sm sm:text-base">Gifts</a>
            </nav>
          </div>
          <div className="flex items-center gap-3 sm:gap-4 w-full lg:w-auto">
            <div className="relative flex-1 lg:flex-initial">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search"
                className="pl-10 pr-4 py-2 bg-gray-100 rounded-lg w-full lg:w-64 focus:outline-none focus:ring-2 focus:ring-gray-300 text-sm"
              />
            </div>
            <button className="p-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors">
              <Heart className="w-5 h-5 text-gray-700" />
            </button>
            <button className="p-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors">
              <ShoppingBag className="w-5 h-5 text-gray-700" />
            </button>
            <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center cursor-pointer flex-shrink-0">
              <User className="w-6 h-6 text-gray-600" />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-8 lg:gap-12">
          {/* Sidebar Filters */}
          <div className="lg:col-span-1">
            <div className="space-y-8">
              {/* Filters Title */}
              <h2 className="text-3xl font-bold font-serif">Filters</h2>

              {/* Genres */}
              <div>
                <h3 className="text-xl font-semibold mb-4 font-serif">Genres</h3>
                <div className="space-y-3">
                  {genres.map((genre) => (
                    <label key={genre} className="flex items-center gap-3 cursor-pointer group">
                      <div className="relative">
                        <input
                          type="checkbox"
                          checked={selectedGenres.includes(genre)}
                          onChange={() => toggleGenre(genre)}
                          className="w-5 h-5 rounded border-2 border-gray-300 appearance-none checked:bg-transparent checked:border-gray-800 cursor-pointer"
                        />
                        {selectedGenres.includes(genre) && (
                          <svg className="absolute top-0 left-0 w-5 h-5 text-gray-800 pointer-events-none" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                      <span className="text-base text-gray-900 font-serif">{genre}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Price */}
              <div>
                <h3 className="text-xl font-semibold mb-4 font-serif">Price</h3>
                <div className="space-y-4">
                  <p className="text-base text-gray-900 font-medium font-serif">Price Range</p>
                  <div className="relative pt-2">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={priceRange[1]}
                      onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                      className="w-full h-1 bg-black rounded-lg appearance-none cursor-pointer accent-black"
                      style={{
                        background: `linear-gradient(to right, black 0%, black ${priceRange[1]}%, #e5e7eb ${priceRange[1]}%, #e5e7eb 100%)`
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Authors */}
              <div>
                <h3 className="text-xl font-semibold mb-4 font-serif">Authors</h3>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search Authors"
                    value={searchAuthor}
                    onChange={(e) => setSearchAuthor(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300 text-sm"
                  />
                </div>
              </div>

              {/* Ratings */}
              <div>
                <h3 className="text-xl font-semibold mb-4 font-serif">Ratings</h3>
                <div className="flex flex-wrap gap-3">
                  {ratings.map((rating) => (
                    <button
                      key={rating}
                      onClick={() => toggleRating(rating)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        selectedRatings.includes(rating)
                          ? 'bg-gray-900 text-white'
                          : 'bg-white text-gray-900 border border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      {rating} {rating === 1 ? 'Star' : 'Stars'}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Books Grid */}
          <div className="lg:col-span-1">
            {/* Header Section */}
            <div className="mb-8">
              <h1 className="text-4xl sm:text-5xl font-bold mb-3 font-serif">Deep Forest Green</h1>
              <p className="text-gray-600 text-base mb-8 font-serif">
                Explore the enchanting world of Deep Forest Green, where nature's tranquility meets literary adventure.
              </p>

              {/* View Toggle and Sort */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex gap-2">
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2.5 rounded-lg transition-colors ${
                      viewMode === 'list' ? 'bg-gray-900 text-white' : 'bg-white border border-gray-300 text-gray-700'
                    }`}
                  >
                    <AlignLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2.5 rounded-lg transition-colors ${
                      viewMode === 'grid' ? 'bg-gray-900 text-white' : 'bg-white border border-gray-300 text-gray-700'
                    }`}
                  >
                    <Grid3x3 className="w-5 h-5" />
                  </button>
                </div>

                <button className="flex items-center gap-2 px-5 py-2.5 bg-emerald-800 text-white rounded-lg hover:bg-emerald-900 transition-colors text-sm font-medium">
                  <ChevronDown className="w-4 h-4" />
                  <span>Sort By</span>
                </button>
              </div>
            </div>

            {/* Books Grid or List */}
            {viewMode === 'grid' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 mb-12">
                {books.map((book) => (
                  <div key={book.id} className="group cursor-pointer">
                    <div className={`${book.color} rounded-xl p-8 flex items-center justify-center mb-4 aspect-[2/3] overflow-hidden`}>
                      <img
                        src={book.image}
                        alt={book.title}
                        className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          e.currentTarget.src = 'https://via.placeholder.com/300x450/1f2937/ffffff?text=Book+Cover';
                        }}
                      />
                    </div>
                    <h3 className="text-base font-medium text-gray-900 font-serif">{book.title}</h3>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-6 mb-12">
                {books.map((book) => (
                  <div key={book.id} className="flex gap-6 group cursor-pointer border-b border-gray-200 pb-6">
                    <div className={`${book.color} rounded-xl p-4 flex items-center justify-center w-32 h-48 flex-shrink-0 overflow-hidden`}>
                      <img
                        src={book.image}
                        alt={book.title}
                        className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          e.currentTarget.src = 'https://via.placeholder.com/150x225/1f2937/ffffff?text=Book';
                        }}
                      />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-gray-900 mb-2 font-serif">{book.title}</h3>
                      <p className="text-gray-600 text-sm font-serif">A captivating journey through the enchanted forest...</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Pagination */}
            <div className="flex items-center justify-center gap-2">
              <button className="p-2 hover:bg-gray-100 rounded transition-colors">
                <ChevronLeft className="w-5 h-5 text-gray-700" />
              </button>
              <button className="w-10 h-10 rounded flex items-center justify-center bg-gray-900 text-white font-medium text-sm">1</button>
              <button className="w-10 h-10 rounded flex items-center justify-center hover:bg-gray-100 text-gray-700 font-medium text-sm transition-colors">2</button>
              <button className="w-10 h-10 rounded flex items-center justify-center hover:bg-gray-100 text-gray-700 font-medium text-sm transition-colors">3</button>
              <button className="w-10 h-10 rounded flex items-center justify-center hover:bg-gray-100 text-gray-700 font-medium text-sm transition-colors">4</button>
              <button className="w-10 h-10 rounded flex items-center justify-center hover:bg-gray-100 text-gray-700 font-medium text-sm transition-colors">5</button>
              <button className="p-2 hover:bg-gray-100 rounded transition-colors">
                <ChevronRight className="w-5 h-5 text-gray-700" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BooksListingPage;