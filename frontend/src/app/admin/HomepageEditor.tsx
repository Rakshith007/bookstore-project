import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Menu, Upload, Save, XCircle } from 'lucide-react';
import { Sidebar, MobileSidebarDrawer } from '../../components/layout/AdminSidebar';

// ==================== TYPE DEFINITIONS ====================

interface Book {
  id: string;
  title: string;
  author: string;
  coverUrl: string;
  description?: string;
}

interface HeroSection {
  mainHeading: string;
  subheading: string;
  ctaButtonText: string;
  heroImageUrl: string;
  isVisible: boolean;
}

interface PromoSection {
  title: string;
  subtitle: string;
  description: string;
  ctaText: string;
  imageUrl: string;
}

interface Author {
  id: string;
  name: string;
  photoUrl: string;
  bio: string;
}

interface HomepageContent {
  hero: HeroSection;
  bestsellers: Book[];
  darkPromo: PromoSection;
  specialOffers: Book[];
  top10Books: Book[];
  authorSpotlight: Author[];
}

// ==================== MOCK DATA ====================

const initialContent: HomepageContent = {
  hero: {
    mainHeading: 'Find Your Next Book',
    subheading: 'Explore our curated collection of bestsellers, new releases, and timeless classics.',
    ctaButtonText: 'Explore Now',
    heroImageUrl: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=800',
    isVisible: true
  },
  bestsellers: [
    { id: '1', title: 'The Secret Garden', author: 'Frances Hodgson Burnett', coverUrl: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400' },
    { id: '2', title: 'The Great Escape', author: 'Paul Anderson', coverUrl: 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=400' },
    { id: '3', title: 'The Silent Observer', author: 'Sarah Collins', coverUrl: 'https://images.unsplash.com/photo-1532012197267-da84d127e765?w=400' },
    { id: '4', title: 'The Last Voyage', author: 'James Carter', coverUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400' }
  ],
  darkPromo: {
    title: 'Exclusive Book Fair',
    subtitle: 'Book Sale',
    description: "Don't miss out on our exclusive book fair! Enjoy discounts on a wide range of genres.",
    ctaText: 'Shop Now',
    imageUrl: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=600'
  },
  specialOffers: [
    { id: '5', title: 'The Art of Cooking', author: 'Julia Masters', coverUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=300', description: 'Explore culinary delights' },
    { id: '6', title: 'History of Science', author: 'Neil DeGrasse', coverUrl: 'https://images.unsplash.com/photo-1532012197267-da84d127e765?w=300', description: 'Discover breakthroughs' },
    { id: '7', title: 'Travel the World', author: 'Amanda Wright', coverUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=300', description: 'Journey destinations' }
  ],
  top10Books: [
    { id: '10', title: 'The Secret Garden', author: 'Frances Hodgson', coverUrl: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=300' },
    { id: '11', title: 'The Great Escape', author: 'Paul Anderson', coverUrl: 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=300' },
    { id: '12', title: 'The Silent Observer', author: 'Sarah Collins', coverUrl: 'https://images.unsplash.com/photo-1532012197267-da84d127e765?w=300' }
  ],
  authorSpotlight: [
    { id: '1', name: 'Emily Bennett', photoUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=300', bio: 'Bestselling author of The Hidden Path' },
    { id: '2', name: 'David Evans', photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300', bio: 'Award-winning author' },
    { id: '3', name: 'Olivia Foster', photoUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300', bio: 'Critically acclaimed author' }
  ]
};

// ==================== CONTEXT ====================

interface HomepageContextType {
  content: HomepageContent;
  draftContent: HomepageContent;
  updateDraft: (content: HomepageContent) => void;
  saveDraft: () => void;
  discardDraft: () => void;
}

const HomepageContext = createContext<HomepageContextType | undefined>(undefined);

export const HomepageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [content, setContent] = useState<HomepageContent>(initialContent);
  const [draftContent, setDraftContent] = useState<HomepageContent>(initialContent);

  return (
    <HomepageContext.Provider
      value={{ 
        content, 
        draftContent, 
        updateDraft: setDraftContent, 
        saveDraft: () => setContent(draftContent), 
        discardDraft: () => setDraftContent(content) 
      }}
    >
      {children}
    </HomepageContext.Provider>
  );
};

export const useHomepage = () => {
  const ctx = useContext(HomepageContext);
  if (!ctx) throw new Error('useHomepage must be within HomepageProvider');
  return ctx;
};

// ==================== REUSABLE COMPONENTS ====================

// Helper Component for the Bottom Action Bar
const SectionActions = ({ onSave, onDiscard }: { onSave: () => void, onDiscard: () => void }) => (
  <div className="flex justify-end items-center gap-4 mt-8 pt-6 border-t border-gray-100">
    <button 
      onClick={onDiscard} 
      className="flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 hover:text-red-600 hover:border-red-200 transition-all text-sm font-medium"
    >
      <XCircle size={18} />
      Discard Changes
    </button>
    <button 
      onClick={onSave} 
      className="flex items-center gap-2 px-6 py-2.5 bg-black text-white rounded-lg hover:bg-gray-800 transition-all text-sm font-medium shadow-sm hover:shadow"
    >
      <Save size={18} />
      Save Section
    </button>
  </div>
);

// ==================== ADMIN EDITOR ====================

const AdminHomepageEditor: React.FC = () => {
  const { draftContent, updateDraft, saveDraft, discardDraft } = useHomepage();
  const [tab, setTab] = useState<'hero' | 'bestsellers' | 'promo' | 'offers' | 'top10' | 'authors'>('hero');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // === HANDLERS ===
  
  const handleSave = () => {
    saveDraft();
    alert('Changes saved successfully!');
  };

  const handleDiscard = () => {
    if (window.confirm('Are you sure you want to discard your unsaved changes?')) {
      discardDraft();
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, callback: (url: string) => void) => {
    const file = e.target.files?.[0];
    if (file) {
      const objectUrl = URL.createObjectURL(file);
      callback(objectUrl);
    }
  };

  // === UPDATE FUNCTIONS ===

  const updateHero = (field: keyof HeroSection, value: any) => {
    updateDraft({ ...draftContent, hero: { ...draftContent.hero, [field]: value } });
  };

  const updatePromo = (field: keyof PromoSection, value: string) => {
    updateDraft({ ...draftContent, darkPromo: { ...draftContent.darkPromo, [field]: value } });
  };

  const updateBook = (section: 'bestsellers' | 'specialOffers' | 'top10Books', id: string, field: keyof Book, value: string) => {
    updateDraft({
      ...draftContent,
      [section]: draftContent[section].map(b => b.id === id ? { ...b, [field]: value } : b)
    });
  };

  const addBook = (section: 'bestsellers' | 'specialOffers' | 'top10Books') => {
    const newBook: Book = {
      id: Date.now().toString(),
      title: 'New Book',
      author: 'Author',
      coverUrl: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400'
    };
    updateDraft({ ...draftContent, [section]: [...draftContent[section], newBook] });
  };

  const removeBook = (section: 'bestsellers' | 'specialOffers' | 'top10Books', id: string) => {
    updateDraft({ ...draftContent, [section]: draftContent[section].filter(b => b.id !== id) });
  };

  const updateAuthor = (id: string, field: keyof Author, value: string) => {
    updateDraft({
      ...draftContent,
      authorSpotlight: draftContent.authorSpotlight.map(a => a.id === id ? { ...a, [field]: value } : a)
    });
  };

  const addAuthor = () => {
    const newAuthor: Author = {
      id: Date.now().toString(),
      name: 'New Author',
      photoUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=300',
      bio: 'Author bio'
    };
    updateDraft({ ...draftContent, authorSpotlight: [...draftContent.authorSpotlight, newAuthor] });
  };

  const removeAuthor = (id: string) => {
    updateDraft({ ...draftContent, authorSpotlight: draftContent.authorSpotlight.filter(a => a.id !== id) });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar />
      <MobileSidebarDrawer isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />

      {/* Main Content Area */}
      <div className="flex-1 w-full lg:ml-64 flex flex-col min-h-screen">
        
        <main className="flex-1 p-4 lg:p-8">
          <div className="flex justify-between items-center mb-6 lg:hidden">
            <button onClick={() => setIsMobileMenuOpen(true)} className="p-1 text-gray-700">
              <Menu size={24} />
            </button>
          </div>

          <div className="mb-8">
            <h1 className="text-3xl sm:text-4xl font-semibold text-gray-900">HomePage Editor</h1>
            <p className="text-gray-500 mt-2">Manage the content displayed on your main storefront.</p>
          </div>

          {/* Navigation Tabs */}
          <div className="flex gap-2 mb-6 flex-wrap">
            {[
              { k: 'hero', l: 'Hero' },
              { k: 'bestsellers', l: 'Bestsellers' },
              { k: 'promo', l: 'Promo' },
              { k: 'offers', l: 'Offers' },
              { k: 'top10', l: 'Top 10' },
              { k: 'authors', l: 'Authors' }
            ].map(s => (
              <button
                key={s.k}
                onClick={() => setTab(s.k as any)}
                className={`px-4 py-2 rounded-lg transition-colors text-sm font-medium ${
                  tab === s.k 
                    ? 'bg-blue-600 text-white shadow-md' 
                    : 'bg-white border text-gray-700 hover:bg-gray-50'
                }`}
              >
                {s.l}
              </button>
            ))}
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm mb-20 border border-gray-200">
            {tab === 'hero' && (
              <div className="space-y-4">
                <h2 className="text-2xl font-bold mb-6 text-gray-800">Hero Section</h2>
                <div className="grid gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Main Heading</label>
                    <input
                      value={draftContent.hero.mainHeading}
                      onChange={(e) => updateHero('mainHeading', e.target.value)}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Subheading</label>
                    <textarea
                      value={draftContent.hero.subheading}
                      onChange={(e) => updateHero('subheading', e.target.value)}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      rows={2}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Button Text</label>
                    <input
                      value={draftContent.hero.ctaButtonText}
                      onChange={(e) => updateHero('ctaButtonText', e.target.value)}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
                
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Hero Image</label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:bg-gray-50 transition-colors">
                      <input 
                          type="file" 
                          accept="image/*" 
                          id="hero-upload" 
                          className="hidden" 
                          onChange={(e) => handleFileUpload(e, (url) => updateHero('heroImageUrl', url))}
                      />
                      <label htmlFor="hero-upload" className="cursor-pointer flex flex-col items-center gap-2 text-gray-600">
                          <Upload size={32} className="text-gray-400" />
                          <span className="text-sm font-medium">Click to upload new image</span>
                      </label>
                  </div>
                </div>
                
                <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-100">
                  <img src={draftContent.hero.heroImageUrl} alt="Hero preview" className="w-full h-48 object-cover rounded-lg" />
                </div>
                
                <div className="flex items-center gap-3 mt-4">
                  <span className="text-sm font-medium text-gray-700">Section Visibility:</span>
                  <button
                    onClick={() => updateHero('isVisible', !draftContent.hero.isVisible)}
                    className={`w-12 h-6 rounded-full transition-colors ${draftContent.hero.isVisible ? 'bg-green-500' : 'bg-gray-300'}`}
                  >
                    <div className={`w-5 h-5 bg-white rounded-full transition-transform shadow-sm ${draftContent.hero.isVisible ? 'translate-x-6' : 'translate-x-1'}`}></div>
                  </button>
                  <span className="text-sm text-gray-500">{draftContent.hero.isVisible ? 'Visible' : 'Hidden'}</span>
                </div>

                {/* ACTION BUTTONS FOR HERO */}
                <SectionActions onSave={handleSave} onDiscard={handleDiscard} />
              </div>
            )}

            {(tab === 'bestsellers' || tab === 'top10') && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-800">{tab === 'bestsellers' ? 'Bestsellers' : 'Top 10 Books'}</h2>
                  <button onClick={() => addBook(tab === 'bestsellers' ? 'bestsellers' : 'top10Books')} className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors text-sm font-medium">+ Add Book</button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {draftContent[tab === 'bestsellers' ? 'bestsellers' : 'top10Books'].map(b => (
                    <div key={b.id} className="border border-gray-200 p-4 rounded-xl relative bg-gray-50 hover:shadow-md transition-shadow group">
                      <button 
                        onClick={() => removeBook(tab === 'bestsellers' ? 'bestsellers' : 'top10Books', b.id)} 
                        className="absolute top-2 right-2 bg-white text-red-500 border border-gray-200 w-8 h-8 flex items-center justify-center rounded-full z-10 hover:bg-red-50 transition-colors shadow-sm"
                        title="Remove book"
                      >
                        <XCircle size={16} />
                      </button>
                      <img src={b.coverUrl} alt={b.title} className="w-full h-48 object-cover rounded-lg mb-3 shadow-sm" />
                      
                      <div className="space-y-2">
                        <input 
                          value={b.title} 
                          onChange={(e) => updateBook(tab === 'bestsellers' ? 'bestsellers' : 'top10Books', b.id, 'title', e.target.value)} 
                          className="w-full px-3 py-1.5 border rounded text-sm font-medium" 
                          placeholder="Book Title" 
                        />
                        <input 
                          value={b.author} 
                          onChange={(e) => updateBook(tab === 'bestsellers' ? 'bestsellers' : 'top10Books', b.id, 'author', e.target.value)} 
                          className="w-full px-3 py-1.5 border rounded text-sm text-gray-600" 
                          placeholder="Author Name" 
                        />
                      </div>
                      
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">Change Cover</label>
                        <input 
                            type="file" 
                            accept="image/*"
                            className="text-xs w-full text-slate-500 file:mr-2 file:py-1 file:px-2 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
                            onChange={(e) => handleFileUpload(e, (url) => updateBook(tab === 'bestsellers' ? 'bestsellers' : 'top10Books', b.id, 'coverUrl', url))}
                        />
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* ACTION BUTTONS FOR LISTS */}
                <SectionActions onSave={handleSave} onDiscard={handleDiscard} />
              </div>
            )}

            {tab === 'promo' && (
              <div className="space-y-5">
                <h2 className="text-2xl font-bold mb-6 text-gray-800">Dark Promo Section</h2>
                <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Subtitle (Small text)</label>
                            <input value={draftContent.darkPromo.subtitle} onChange={(e) => updatePromo('subtitle', e.target.value)} className="w-full px-4 py-2 border rounded-lg" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Main Title</label>
                            <input value={draftContent.darkPromo.title} onChange={(e) => updatePromo('title', e.target.value)} className="w-full px-4 py-2 border rounded-lg" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                            <textarea value={draftContent.darkPromo.description} onChange={(e) => updatePromo('description', e.target.value)} className="w-full px-4 py-2 border rounded-lg" rows={4} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">CTA Button Text</label>
                            <input value={draftContent.darkPromo.ctaText} onChange={(e) => updatePromo('ctaText', e.target.value)} className="w-full px-4 py-2 border rounded-lg" />
                        </div>
                    </div>
                    
                    <div className="space-y-4">
                        <label className="block text-sm font-medium text-gray-700">Promo Image</label>
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:bg-gray-50 transition-colors h-40 flex flex-col justify-center items-center">
                            <input 
                                type="file" 
                                accept="image/*" 
                                id="promo-upload" 
                                className="hidden" 
                                onChange={(e) => handleFileUpload(e, (url) => updatePromo('imageUrl', url))}
                            />
                            <label htmlFor="promo-upload" className="cursor-pointer flex flex-col items-center gap-2 text-gray-600">
                                <Upload size={24} />
                                <span className="text-sm font-medium">Click to upload</span>
                            </label>
                        </div>
                        <div className="bg-gray-100 p-2 rounded-lg">
                            <img src={draftContent.darkPromo.imageUrl} alt="Promo preview" className="w-full h-64 object-cover rounded shadow-sm" />
                        </div>
                    </div>
                </div>

                {/* ACTION BUTTONS FOR PROMO */}
                <SectionActions onSave={handleSave} onDiscard={handleDiscard} />
              </div>
            )}

            {tab === 'offers' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-800">Special Offers</h2>
                  <button onClick={() => addBook('specialOffers')} className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors text-sm font-medium">+ Add Offer</button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {draftContent.specialOffers.map(b => (
                    <div key={b.id} className="border border-gray-200 p-4 rounded-xl relative bg-gray-50 flex gap-4">
                      <button onClick={() => removeBook('specialOffers', b.id)} className="absolute top-2 right-2 text-gray-400 hover:text-red-500 transition-colors">
                        <XCircle size={20} />
                      </button>
                      
                      <div className="w-1/3 shrink-0">
                          <img src={b.coverUrl} alt={b.title} className="w-full h-32 object-cover rounded-lg shadow-sm" />
                          <div className="mt-2">
                             <input 
                                type="file" 
                                accept="image/*"
                                id={`offer-${b.id}`}
                                className="hidden"
                                onChange={(e) => handleFileUpload(e, (url) => updateBook('specialOffers', b.id, 'coverUrl', url))}
                            />
                            <label htmlFor={`offer-${b.id}`} className="block text-center text-xs text-blue-600 font-medium cursor-pointer hover:underline">Change Img</label>
                          </div>
                      </div>

                      <div className="w-2/3 space-y-3">
                          <input value={b.title} onChange={(e) => updateBook('specialOffers', b.id, 'title', e.target.value)} className="w-full px-3 py-1.5 border rounded text-sm font-bold" placeholder="Offer Title" />
                          <input value={b.author} onChange={(e) => updateBook('specialOffers', b.id, 'author', e.target.value)} className="w-full px-3 py-1.5 border rounded text-xs text-gray-600" placeholder="Subtitle/Author" />
                          <textarea 
                            value={b.description || ''} 
                            onChange={(e) => updateBook('specialOffers', b.id, 'description', e.target.value)} 
                            className="w-full px-3 py-1.5 border rounded text-xs text-gray-600 resize-none" 
                            placeholder="Short description..."
                            rows={2}
                          />
                      </div>
                    </div>
                  ))}
                </div>

                {/* ACTION BUTTONS FOR OFFERS */}
                <SectionActions onSave={handleSave} onDiscard={handleDiscard} />
              </div>
            )}

            {tab === 'authors' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-800">Author Spotlight</h2>
                  <button onClick={addAuthor} className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors text-sm font-medium">+ Add Author</button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {draftContent.authorSpotlight.map(a => (
                    <div key={a.id} className="border border-gray-200 p-6 rounded-xl relative bg-white shadow-sm hover:shadow-md transition-shadow text-center">
                      <button onClick={() => removeAuthor(a.id)} className="absolute top-2 right-2 text-gray-300 hover:text-red-500">
                        <XCircle size={20} />
                      </button>
                      
                      <div className="relative inline-block group mb-4">
                        <img src={a.photoUrl} alt={a.name} className="w-24 h-24 rounded-full object-cover mx-auto shadow-sm" />
                        <label className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-xs font-medium">
                            Upload
                            <input 
                                type="file" 
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => handleFileUpload(e, (url) => updateAuthor(a.id, 'photoUrl', url))}
                            />
                        </label>
                      </div>

                      <div className="space-y-3">
                        <input value={a.name} onChange={(e) => updateAuthor(a.id, 'name', e.target.value)} className="w-full px-3 py-2 border rounded-lg text-center font-semibold text-gray-800" placeholder="Author Name" />
                        <textarea value={a.bio} onChange={(e) => updateAuthor(a.id, 'bio', e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm text-gray-600 text-center resize-none" rows={3} placeholder="Short Bio..." />
                      </div>
                    </div>
                  ))}
                </div>

                {/* ACTION BUTTONS FOR AUTHORS */}
                <SectionActions onSave={handleSave} onDiscard={handleDiscard} />
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

// ==================== MAIN APP ====================

export default function App() {
  return (
    <HomepageProvider>
      <AdminHomepageEditor />
    </HomepageProvider>
  );
}