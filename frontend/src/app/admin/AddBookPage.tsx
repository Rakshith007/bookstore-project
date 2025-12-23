import React, { useState } from 'react';
import { Menu, X, Upload, ChevronRight } from 'lucide-react';
import { Sidebar, MobileSidebarDrawer } from '../../components/layout/AdminSidebar';
import { uploadBook } from '../../lib/api';
import { useNavigate } from 'react-router-dom';

interface BookFormData {
  title: string;
  author: string;
  category: string;
  isbn: string;
  publisher: string;
  publishedYear: string;
  mrp: string;
  sellingPrice: string;
  stockQuantity: string;
  description: string;
  coverImage: File | null;
  sku?: string;
}

const AddBookPage: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [formData, setFormData] = useState<BookFormData>({
    title: '',
    author: '',
    category: '',
    isbn: '',
    publisher: '',
    publishedYear: '',
    mrp: '',
    sellingPrice: '',
    stockQuantity: '',
    description: '',
    coverImage: null,
    sku: '',
  });
  const [dragActive, setDragActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const navigate = useNavigate();

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files?.[0]) {
      setFormData((prev) => ({ ...prev, coverImage: e.dataTransfer.files[0] }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      setFormData((prev) => ({ ...prev, coverImage: files[0] }));
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    setMessage(null);

    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('Please log in as admin first');
      }

      // Basic validation
      if (!formData.title.trim()) throw new Error('Book title is required');
      if (!formData.author.trim()) throw new Error('Author is required');
      if (!formData.category) throw new Error('Category is required');
      if (!formData.sellingPrice || parseFloat(formData.sellingPrice) <= 0) 
        throw new Error('Valid selling price is required');
      if (!formData.stockQuantity || parseInt(formData.stockQuantity) < 0) 
        throw new Error('Valid stock quantity is required');

      // Year validation
      if (formData.publishedYear) {
        const year = parseInt(formData.publishedYear, 10);
        const currentYear = new Date().getFullYear();
        if (year < 1900 || year > currentYear + 1) {
          throw new Error(`Published year must be between 1900 and ${currentYear + 1}`);
        }
      }

      const formDataToSend = new FormData();
      formDataToSend.append('title', formData.title.trim());
      formDataToSend.append('author', formData.author.trim());
      formDataToSend.append('category', formData.category);
      formDataToSend.append('isbn', formData.isbn || '');
      formDataToSend.append('publisher', formData.publisher || '');
      formDataToSend.append('publishedYear', formData.publishedYear || '');
      formDataToSend.append('mrp', formData.mrp || '');
      formDataToSend.append('price', formData.sellingPrice);
      formDataToSend.append('stockQuantity', formData.stockQuantity);
      formDataToSend.append('description', formData.description || '');
      formDataToSend.append('status', 'draft'); // Always saved as draft
      
      if (formData.coverImage) {
        formDataToSend.append('coverImage', formData.coverImage);
      }

      await uploadBook(formDataToSend, token);

      setMessage({ 
        type: 'success', 
        text: 'Book saved as draft successfully! Go to Books Management → select book → click "Add to Products" to publish it on the website.'
      });
      setTimeout(() => navigate('/admin/books'), 3000);
    } catch (err: any) {
      setMessage({ 
        type: 'error', 
        text: err.message || 'Failed to save book' 
      });
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate(-1);
  };

  const inputClass = "w-full px-4 py-3 bg-white border border-gray-200 rounded-lg text-sm text-gray-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow";
  const labelClass = "block text-sm font-semibold text-gray-900 mb-2";

  return (
    <div className="min-h-screen bg-[#F8F9FA]">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <Sidebar />
      </div>

      {/* Mobile Sidebar */}
      <MobileSidebarDrawer isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      {/* Mobile Header */}
      <div className="lg:hidden sticky top-0 z-30 bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3 shadow-sm">
        <button onClick={() => setIsSidebarOpen(true)} className="p-2 -ml-2 hover:bg-gray-100 rounded-lg transition-colors">
          <Menu size={24} className="text-gray-700" />
        </button>
        <span className="text-lg font-semibold text-gray-900">Add New Book</span>
      </div>

      {/* Main Content */}
      <div className="lg:ml-64 transition-all duration-300">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8 hidden lg:block">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Add New Book</h1>
            <p className="text-gray-600">Books are saved as draft. Publish them from Books Management.</p>
          </div>

          {/* Success/Error Message */}
          {message && (
            <div className={`p-4 rounded-lg mb-6 text-sm font-medium ${message.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
              {message.text}
            </div>
          )}

          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 sm:p-8">
            <form className="space-y-6">
              {/* Book Title */}
              <div>
                <label className={labelClass}>Book Title *</label>
                <input 
                  name="title" 
                  required 
                  value={formData.title} 
                  onChange={handleInputChange} 
                  className={inputClass} 
                  placeholder="Enter book title" 
                />
              </div>

              {/* Author */}
              <div>
                <label className={labelClass}>Author *</label>
                <input 
                  name="author" 
                  required 
                  value={formData.author} 
                  onChange={handleInputChange} 
                  className={inputClass} 
                  placeholder="Enter author name" 
                />
              </div>

              {/* Category - UPDATED WITH COMPREHENSIVE OPTIONS */}
              <div>
                <label className={labelClass}>Category *</label>
                <div className="relative">
                  <select 
                    name="category" 
                    required 
                    value={formData.category} 
                    onChange={handleInputChange} 
                    className={`${inputClass} appearance-none cursor-pointer`}
                  >
                    <option value="">Select Category</option>
                    
                    {/* Fiction Categories */}
                    <optgroup label="Fiction">
                      <option value="literary-fiction">Literary Fiction</option>
                      <option value="science-fiction">Science Fiction</option>
                      <option value="fantasy">Fantasy</option>
                      <option value="mystery-thriller">Mystery & Thriller</option>
                      <option value="horror">Horror</option>
                      <option value="romance">Romance</option>
                      <option value="historical-fiction">Historical Fiction</option>
                      <option value="young-adult">Young Adult</option>
                      <option value="graphic-novels">Graphic Novels</option>
                      <option value="short-stories">Short Stories</option>
                      <option value="poetry">Poetry</option>
                    </optgroup>
                    
                    {/* Non-Fiction Categories */}
                    <optgroup label="Non-Fiction">
                      <option value="biography-memoir">Biography & Memoir</option>
                      <option value="history">History</option>
                      <option value="science-nature">Science & Nature</option>
                      <option value="technology-computers">Technology & Computers</option>
                      <option value="business-economics">Business & Economics</option>
                      <option value="self-help">Self-Help & Personal Development</option>
                      <option value="health-fitness">Health & Fitness</option>
                      <option value="travel">Travel</option>
                      <option value="cooking-food">Cooking & Food</option>
                      <option value="art-photography">Art & Photography</option>
                      <option value="philosophy">Philosophy</option>
                      <option value="psychology">Psychology</option>
                    </optgroup>
                    
                    {/* Religious & Spiritual Books */}
                    <optgroup label="Religious & Spiritual">
                      <option value="hinduism">Hinduism</option>
                      <option value="islam">Islam</option>
                      <option value="christianity">Christianity</option>
                      <option value="buddhism">Buddhism</option>
                      <option value="judaism">Judaism</option>
                      <option value="sikhism">Sikhism</option>
                      <option value="other-religions">Other Religions</option>
                      <option value="spirituality">Spirituality</option>
                      <option value="yoga-meditation">Yoga & Meditation</option>
                      <option value="mythology">Mythology</option>
                    </optgroup>
                    
                    {/* Academic & Educational */}
                    <optgroup label="Academic & Educational">
                      <option value="textbooks">Textbooks</option>
                      <option value="reference">Reference</option>
                      <option value="childrens-books">Children's Books</option>
                      <option value="educational">Educational</option>
                      <option value="language-learning">Language Learning</option>
                    </optgroup>
                    
                    {/* Additional Categories */}
                    <optgroup label="Other Categories">
                      <option value="humor">Humor</option>
                      <option value="sports">Sports</option>
                      <option value="music">Music</option>
                      <option value="drama">Drama</option>
                      <option value="essays">Essays</option>
                      <option value="true-crime">True Crime</option>
                    </optgroup>
                  </select>
                  <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 rotate-90 pointer-events-none" />
                </div>
              </div>

              {/* ISBN Number */}
              <div>
                <label className={labelClass}>ISBN Number</label>
                <input 
                  name="isbn" 
                  value={formData.isbn} 
                  onChange={handleInputChange} 
                  className={inputClass} 
                  placeholder="Enter ISBN number" 
                />
              </div>

              {/* Publisher */}
              <div>
                <label className={labelClass}>Publisher</label>
                <input 
                  name="publisher" 
                  value={formData.publisher} 
                  onChange={handleInputChange} 
                  className={inputClass} 
                  placeholder="Enter publisher" 
                />
              </div>

              {/* Published Year - INPUT FIELD */}
              <div>
                <label className={labelClass}>Published Year</label>
                <input 
                  name="publishedYear" 
                  type="number"
                  min="1900" 
                  max={new Date().getFullYear() + 1}
                  value={formData.publishedYear} 
                  onChange={handleInputChange} 
                  className={inputClass} 
                  placeholder={`e.g., ${new Date().getFullYear()}`} 
                />
                <p className="text-xs text-gray-500 mt-1">
                  Enter year between 1900 and {new Date().getFullYear() + 1}
                </p>
              </div>

              {/* Pricing Section */}
              <div className="pt-4 border-t border-gray-100">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Pricing</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className={labelClass}>MRP (Maximum Retail Price)</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                      <input 
                        name="mrp" 
                        type="number"
                        step="0.01"
                        min="0"
                        value={formData.mrp} 
                        onChange={handleInputChange} 
                        className={`${inputClass} pl-8`} 
                        placeholder="0.00" 
                      />
                    </div>
                  </div>
                  <div>
                    <label className={labelClass}>Selling Price *</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                      <input 
                        name="sellingPrice" 
                        required 
                        type="number"
                        step="0.01"
                        min="0.01"
                        value={formData.sellingPrice} 
                        onChange={handleInputChange} 
                        className={`${inputClass} pl-8`} 
                        placeholder="0.00" 
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Inventory Section */}
              <div className="pt-4 border-t border-gray-100">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Inventory</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className={labelClass}>Stock Quantity *</label>
                    <input 
                      name="stockQuantity" 
                      type="number" 
                      required 
                      min="0"
                      value={formData.stockQuantity} 
                      onChange={handleInputChange} 
                      className={inputClass} 
                      placeholder="0" 
                    />
                  </div>
                  {/* SKU - AUTO-GENERATED */}
                  <div>
                    <label className={labelClass}>SKU (Stock Keeping Unit)</label>
                    <div className="flex items-center gap-2">
                      <input 
                        value={formData.sku || "Will be auto-generated"} 
                        disabled 
                        className={`${inputClass} bg-slate-50 text-slate-500 cursor-not-allowed flex-1`} 
                      />
                      <button 
                        type="button"
                        onClick={() => {
                          const previewSku = `BK${String(Math.floor(Math.random() * 1000000)).padStart(6, '0')}`;
                          setFormData(prev => ({ ...prev, sku: previewSku }));
                        }}
                        className="px-4 py-3 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
                      >
                        Preview SKU
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      SKU will be auto-generated as BK000001, BK000002, etc.
                    </p>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="pt-4 border-t border-gray-100">
                <label className={labelClass}>Book Description</label>
                <textarea 
                  name="description" 
                  value={formData.description} 
                  onChange={handleInputChange} 
                  rows={6} 
                  className={`${inputClass} resize-y min-h-[150px]`} 
                  placeholder="Write a brief description of the book..." 
                />
              </div>

              {/* Book Cover Upload */}
              <div className="pt-4 border-t border-gray-100">
                <label className={labelClass}>Book Cover Image</label>
                <div
                  className={`border-2 border-dashed rounded-xl p-8 sm:p-10 text-center transition-all duration-200 ${dragActive ? 'border-blue-500 bg-blue-50' : 'border-slate-300 bg-slate-50 hover:bg-slate-100'}`}
                  onDragEnter={handleDrag}
                  onDragOver={handleDrag}
                  onDragLeave={handleDrag}
                  onDrop={handleDrop}
                >
                  <div className="flex flex-col items-center justify-center space-y-3">
                    <div className="p-3 bg-white rounded-full shadow-sm">
                      <Upload className="w-6 h-6 text-blue-600" />
                    </div>
                    <p className="text-base font-semibold text-gray-900">Drag & drop or click to upload</p>
                    <p className="text-sm text-gray-500">Recommended: 300×450px (JPG, PNG, WebP) Max: 5MB</p>
                    <div className="pt-4">
                      <label htmlFor="file-upload" className="cursor-pointer">
                        <input 
                          id="file-upload" 
                          type="file" 
                          className="hidden" 
                          accept="image/jpeg,image/png,image/webp" 
                          onChange={handleFileChange} 
                        />
                        <span className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors shadow-sm">
                          Browse Files
                        </span>
                      </label>
                    </div>
                    {formData.coverImage && (
                      <div className="mt-4 flex items-center gap-2 text-sm text-green-600 font-medium bg-green-50 px-3 py-1 rounded-full">
                        <span>✓ {formData.coverImage.name}</span>
                        <button 
                          type="button" 
                          onClick={() => setFormData((prev) => ({ ...prev, coverImage: null }))}
                          className="hover:text-red-600"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons - Only Save as Draft */}
              <div className="flex flex-col-reverse sm:flex-row sm:justify-end items-center gap-4 pt-6 border-t border-gray-100">
                <button 
                  type="button" 
                  onClick={handleCancel} 
                  className="w-full sm:w-auto px-6 py-3 text-sm font-semibold text-gray-700 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="button" 
                  onClick={handleSubmit}
                  disabled={loading}
                  className="w-full sm:w-auto px-8 py-3 bg-blue-600 text-white rounded-lg text-base font-semibold hover:bg-blue-700 shadow-sm disabled:opacity-50 transition-colors"
                >
                  {loading ? 'Saving...' : 'Save Book as Draft'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddBookPage;