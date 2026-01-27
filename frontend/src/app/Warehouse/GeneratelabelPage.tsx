import React, { useState, useEffect } from 'react';
import { 
  Menu, Printer, Download, Package, 
  ArrowLeft, Building2, Plus, Edit2, Trash2, Loader2, Scissors, AlertCircle, MapPin, Phone, CheckCircle
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Sidebar, MobileSidebarDrawer } from '../../components/layout/AdminSidebar';

interface BatchItem {
  title: string;
  quantity: number;
  price: number;
  isbn: string;
  location: string;
}

interface CharityAddress {
  id: number;
  instituteName: string;
  streetAddress: string;
  displayStreetAddress: string;
  apartment?: string;
  city: string;
  state?: string;
  country: string;
  phone?: string;
}

interface BatchDetails {
  batchId: string;
  totalBooks: number;
  items: BatchItem[];
}

const GenerateLabelPage: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [batch, setBatch] = useState<BatchDetails | null>(null);
  const [addresses, setAddresses] = useState<CharityAddress[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<CharityAddress | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState<CharityAddress | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    instituteName: '',
    streetAddress: '',
    apartment: '',
    city: '',
    state: '',
    country: '',
    phone: ''
  });

  const navigate = useNavigate();
  const location = useLocation();
  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000';

  const getToken = () => localStorage.getItem('authToken');

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    navigate('/login');
  };

  const handleSessionExpired = () => {
    localStorage.removeItem('authToken');
    alert('Your session has expired. Please log in again.');
    navigate('/login');
  };

  const fetchAddresses = async () => {
    const token = getToken();
    if (!token) {
      handleSessionExpired();
      return;
    }

    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/addresses`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (res.status === 401) {
        handleSessionExpired();
        return;
      }

      if (!res.ok) throw new Error('Failed to load addresses');

      const result = await res.json();
      const fetched: CharityAddress[] = result.data.map((addr: any) => {
        const fullStreet = addr.streetAddress?.trim() || '';
        const lines = fullStreet.split('\n').map((l: string) => l.trim()).filter((l: string) => l);
        
        const instituteName = lines.length > 0 ? lines[0] : 'Unnamed Institute';
        const displayStreetAddress = lines.length > 1 ? lines.slice(1).join(', ') : '';

        return {
          id: addr.id,
          instituteName,
          streetAddress: fullStreet,
          displayStreetAddress,
          apartment: addr.apartment?.trim() || '',
          city: addr.city?.trim() || '',
          state: addr.state?.trim() || '',
          country: addr.country?.trim() || '',
          phone: addr.phone?.trim() || ''
        };
      });

      setAddresses(fetched);
      if (fetched.length > 0 && !selectedAddress) {
        setSelectedAddress(fetched[0]);
      }
    } catch (err) {
      console.error(err);
      alert('Could not load addresses. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const incomingBatch = location.state?.batch;
    const incomingBatchId = location.state?.batchId;

    if (!incomingBatch || !incomingBatch.items?.length || !incomingBatchId) {
      navigate('/warehouse/pickandpack');
      return;
    }

    const flatItems: BatchItem[] = [];
    let totalBooks = 0;

    incomingBatch.items.forEach((batchItem: any) => {
      const { order, booksUsed } = batchItem;
      let remaining = booksUsed;
      order.items.forEach((book: any) => {
        const take = Math.min(book.quantity, remaining);
        if (take > 0) {
          flatItems.push({
            title: book.title,
            quantity: take,
            price: book.price || 0,
            isbn: book.isbn || 'N/A',
            location: 'A-12'
          });
          totalBooks += take;
          remaining -= take;
        }
      });
    });

    setBatch({
      batchId: incomingBatchId,
      totalBooks,
      items: flatItems
    });
  }, [location.state, navigate]);

  useEffect(() => {
    fetchAddresses();
  }, []);

  const resetForm = () => {
    setFormData({
      instituteName: '',
      streetAddress: '',
      apartment: '',
      city: '',
      state: '',
      country: '',
      phone: ''
    });
    setEditingAddress(null);
  };

  const startAdd = () => {
    resetForm();
    setShowForm(true);
  };

  const startEdit = (addr: CharityAddress) => {
    setFormData({
      instituteName: addr.instituteName,
      streetAddress: addr.displayStreetAddress,
      apartment: addr.apartment || '',
      city: addr.city,
      state: addr.state || '',
      country: addr.country,
      phone: addr.phone || ''
    });
    setEditingAddress(addr);
    setShowForm(true);
  };

  const saveAddress = async () => {
    if (!formData.instituteName || !formData.streetAddress || !formData.city || !formData.country) {
      alert('Institute Name, Street Address, City, and Country are required');
      return;
    }

    const token = getToken();
    if (!token) {
      handleSessionExpired();
      return;
    }

    setSaving(true);
    try {
      const url = editingAddress
        ? `${API_BASE_URL}/addresses/${editingAddress.id}`
        : `${API_BASE_URL}/addresses`;

      const method = editingAddress ? 'PATCH' : 'POST';

      const combinedStreetAddress = `${formData.instituteName.trim()}\n${formData.streetAddress.trim()}`;

      const body: any = {
        streetAddress: combinedStreetAddress,
        city: formData.city.trim(),
        country: formData.country.trim(),
      };
      if (formData.apartment?.trim()) body.apartment = formData.apartment.trim();
      if (formData.state?.trim()) body.state = formData.state.trim();
      if (formData.phone?.trim()) body.phone = formData.phone.trim();

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(body)
      });

      if (res.status === 401) {
        handleSessionExpired();
        return;
      }

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'Failed to save address');
      }

      await fetchAddresses();
      setShowForm(false);
      resetForm();
      alert(editingAddress ? 'Address updated!' : 'New address added!');
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = (id: number) => setShowDeleteConfirm(id);

  const performDelete = async () => {
    if (!showDeleteConfirm) return;

    const token = getToken();
    if (!token) {
      handleSessionExpired();
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/addresses/${showDeleteConfirm}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (res.status === 401) {
        handleSessionExpired();
        return;
      }

      if (!res.ok) throw new Error('Failed to delete');

      await fetchAddresses();
      if (selectedAddress?.id === showDeleteConfirm) {
        setSelectedAddress(addresses[0] || null);
      }
    } catch {
      alert('Could not delete address');
    } finally {
      setShowDeleteConfirm(null);
    }
  };

  const handlePrint = () => window.print();

  const handleMarkAsShipped = async () => {
    if (!batch || !selectedAddress || isSubmitting) return;

    const token = getToken();
    if (!token) {
      handleSessionExpired();
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`${API_BASE_URL}/admin/warehouse/generate-packing-slip`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          batchId: batch.batchId,
          internalTrackingId: null, // No tracking ID anymore
          charityAddress: {
            ...selectedAddress,
            name: selectedAddress.instituteName,
            streetAddress: selectedAddress.streetAddress
          },
        }),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.message || 'Failed to save packing slip');
      }

      alert('Packing slip saved and batch marked as packed!');

      navigate('/admin/shippingqueue', {
        state: {
          newShipment: {
            id: batch.batchId,
            charityName: selectedAddress.instituteName,
            totalBooks: batch.totalBooks,
            address: selectedAddress,
          }
        }
      });
    } catch (err: any) {
      console.error(err);
      alert(`Error: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleShareToWarehouse = () => {
    if (!batch || !selectedAddress) return;

    const today = new Date().toLocaleDateString('en-GB');

    let message = `*CHARITY SHIPMENT - READY FOR PACKING*\n\n` +
      `*Suggested Courier:* BlueDart (Standard)\n\n` +
      `*Deliver To:*\n` +
      `*${selectedAddress.instituteName}*\n` +
      `${selectedAddress.displayStreetAddress}${selectedAddress.apartment ? `, ${selectedAddress.apartment}` : ''}\n` +
      `${selectedAddress.city}${selectedAddress.state ? `, ${selectedAddress.state}` : ''}\n` +
      `${selectedAddress.country}\n` +
      `${selectedAddress.phone ? `Ph: ${selectedAddress.phone}\n` : ''}\n\n` +
      `*Items:*\n`;

    batch.items.forEach(item => {
      message += `• ${item.quantity} × ${item.title} — OMR ${item.price.toFixed(3)}\n`;
    });

    message += `\n━━━━━━━━━━━━━━━━━━━━━━━\n` +
      `*WAREHOUSE PACKING SLIP*\n\n` +
      `*Date:* ${today}\n` +
      `*Batch:* ${batch.batchId}\n\n` +
      `Chk   Loc      ISBN         Item                        Qty   Price\n` +
      `──────────────────────────────────────────────────────────────\n`;

    batch.items.forEach(item => {
      message += `☐     ${item.location.padEnd(7)} ${item.isbn.padEnd(10)} ${item.title.padEnd(28)} ${item.quantity.toString().padEnd(5)} OMR ${item.price.toFixed(3)}\n`;
    });

    message += `\n*Packed By:* _________________\n` +
      `*Total Items:* ${batch.totalBooks}\n\n` +
      `*Important:* This is a charity donation. Please assign actual courier and tracking in Shipping Queue.`;

    const encoded = encodeURIComponent(message);
    const isMobile = /Mobi|Android/i.test(navigator.userAgent);

    if (isMobile) {
      window.open(`https://api.whatsapp.com/send?text=${encoded}`, '_blank');
    } else {
      navigator.clipboard.writeText(message);
      alert('Packing slip copied to clipboard! Paste in WhatsApp Web.');
    }
  };

  if (!batch) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center text-gray-600">Loading batch...</div>;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="animate-spin" size={40} />
        <span className="ml-3 text-lg">Loading addresses...</span>
      </div>
    );
  }

  const totalValue = batch.items.reduce((s, i) => s + i.price * i.quantity, 0);
  const today = new Date().toLocaleDateString('en-GB');

  return (
    <div className="min-h-screen bg-gray-50">
      <style>{`
        @media print {
          body * { visibility: hidden; }
          #printable-label-area, #printable-label-area * { visibility: visible; }
          #printable-label-area { position: absolute; left: 0; top: 0; width: 100%; margin: 0; padding: 0; background: white; }
          .no-print { display: none !important; }
        }
      `}</style>

      <div className="hidden lg:block no-print">
        <Sidebar onLogout={handleLogout} />
      </div>
      <MobileSidebarDrawer 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
        onLogout={handleLogout} 
      />

      <div className="lg:hidden sticky top-0 z-30 bg-white border-b px-4 py-3 flex items-center gap-3 shadow-sm no-print">
        <button onClick={() => setIsSidebarOpen(true)} className="p-2 hover:bg-gray-100 rounded-lg">
          <Menu size={24} className="text-gray-700" />
        </button>
        <h1 className="text-lg font-bold">Generate Charity Packing Slip</h1>
      </div>

      <div className="lg:ml-64 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-6 flex justify-between items-center no-print">
            <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-blue-600">
              <ArrowLeft size={20} /> Back
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6 no-print">
              {/* Batch Details */}
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                <div className="flex justify-between items-start mb-4">
                  <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <Package size={20} /> Batch Details
                  </h2>
                  <span className="text-sm bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full font-bold">
                    {batch.batchId}
                  </span>
                </div>
                <div className="mb-6">
                  <p className="text-xs text-gray-500 uppercase font-semibold">Generated On</p>
                  <p className="font-medium text-gray-900">{today}</p>
                </div>

                <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                  <div className="flex justify-between items-center mb-2">
                    <p className="text-xs font-bold text-gray-500 uppercase">Shipment Contents</p>
                    <p className="text-xs font-bold text-gray-500 uppercase">Price</p>
                  </div>
                  <ul className="text-sm text-gray-700 space-y-2">
                    {batch.items.map(item => (
                      <li key={item.isbn} className="flex justify-between border-b border-gray-200 pb-2 last:border-0 last:pb-0">
                        <div className="flex items-start gap-2">
                          <span className="font-medium text-gray-900">• {item.title}</span>
                          <span className="text-xs text-gray-500 bg-white border rounded px-1.5 py-0.5">x{item.quantity}</span>
                          <span className="text-xs text-gray-400 italic">({item.location})</span>
                        </div>
                        <span className="font-medium text-gray-900">OMR {item.price.toFixed(3)}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="flex justify-end mt-2 pt-2 border-t border-gray-200">
                    <p className="text-xs text-gray-500 mr-2">Items Total:</p>
                    <p className="text-sm font-bold text-gray-900">OMR {totalValue.toFixed(3)}</p>
                  </div>
                </div>
              </div>

              {/* Charity Addresses */}
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <Building2 size={20} /> Charity Institute (Delivery Address)
                  </h2>
                  <button
                    onClick={startAdd}
                    className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                  >
                    <Plus size={16} /> Add New
                  </button>
                </div>

                {!showForm ? (
                  <div className="space-y-3">
                    {addresses.length === 0 ? (
                      <div className="text-center py-12 text-gray-500">
                        <Building2 size={48} className="mx-auto mb-3 opacity-30" />
                        <p>No addresses saved yet</p>
                        <button onClick={startAdd} className="mt-4 text-blue-600 underline">Add your first one</button>
                      </div>
                    ) : (
                      addresses.map(addr => (
                        <div
                          key={addr.id}
                          onClick={() => setSelectedAddress(addr)}
                          className={`p-5 rounded-xl border-2 cursor-pointer transition-all shadow-sm hover:shadow-md ${
                            selectedAddress?.id === addr.id
                              ? 'border-blue-600 bg-blue-50 ring-4 ring-blue-100 shadow-lg'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <p className="text-lg font-bold text-gray-900">{addr.instituteName}</p>
                              <div className="mt-3 space-y-1 text-sm text-gray-700">
                                <div className="flex items-start gap-2">
                                  <MapPin size={16} className="text-gray-500 mt-0.5 flex-shrink-0" />
                                  <span>
                                    {addr.displayStreetAddress}
                                    {addr.apartment && <>, {addr.apartment}</>}
                                    <br />
                                    {addr.city}{addr.state && `, ${addr.state}`}, {addr.country}
                                  </span>
                                </div>
                                {addr.phone && (
                                  <div className="flex items-center gap-2 mt-2">
                                    <Phone size={16} className="text-gray-500" />
                                    <span>{addr.phone}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="flex gap-2 ml-4">
                              <button
                                onClick={(e) => { e.stopPropagation(); startEdit(addr); }}
                                className="p-2.5 hover:bg-gray-200 rounded-lg transition"
                              >
                                <Edit2 size={18} className="text-gray-600" />
                              </button>
                              <button
                                onClick={(e) => { e.stopPropagation(); confirmDelete(addr.id); }}
                                className="p-2.5 hover:bg-red-100 rounded-lg transition"
                              >
                                <Trash2 size={18} className="text-red-600" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                ) : (
                  <div className="space-y-3 p-5 bg-gray-50 rounded-xl">
                    <input 
                      placeholder="Institute Name *" 
                      value={formData.instituteName} 
                      onChange={e => setFormData({...formData, instituteName: e.target.value})} 
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                    />
                    <input 
                      placeholder="Street Address *" 
                      value={formData.streetAddress} 
                      onChange={e => setFormData({...formData, streetAddress: e.target.value})} 
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" 
                    />
                    <input 
                      placeholder="Apartment / Building" 
                      value={formData.apartment} 
                      onChange={e => setFormData({...formData, apartment: e.target.value})} 
                      className="w-full p-3 border border-gray-300 rounded-lg" 
                    />
                    <div className="grid grid-cols-2 gap-3">
                      <input 
                        placeholder="City *" 
                        value={formData.city} 
                        onChange={e => setFormData({...formData, city: e.target.value})} 
                        className="p-3 border border-gray-300 rounded-lg" 
                      />
                      <input 
                        placeholder="State / Region" 
                        value={formData.state} 
                        onChange={e => setFormData({...formData, state: e.target.value})} 
                        className="p-3 border border-gray-300 rounded-lg" 
                      />
                    </div>
                    <input 
                      placeholder="Country *" 
                      value={formData.country} 
                      onChange={e => setFormData({...formData, country: e.target.value})} 
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" 
                    />
                    <input 
                      placeholder="Phone" 
                      value={formData.phone} 
                      onChange={e => setFormData({...formData, phone: e.target.value})} 
                      className="w-full p-3 border border-gray-300 rounded-lg" 
                    />
                    <div className="flex gap-3 pt-3">
                      <button 
                        onClick={saveAddress} 
                        disabled={saving} 
                        className="flex-1 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:opacity-70"
                      >
                        {saving ? 'Saving...' : editingAddress ? 'Update Address' : 'Save Address'}
                      </button>
                      <button 
                        onClick={() => { setShowForm(false); resetForm(); }} 
                        className="px-6 py-3 border border-red-600 text-red-600 rounded-lg hover:bg-red-50"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

                {/* Selected Address Preview */}
                {selectedAddress && !showForm && (
                  <div className="mt-8 p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border-2 border-blue-300 shadow-lg">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 bg-blue-600 rounded-lg">
                        <Building2 size={24} className="text-white" />
                      </div>
                      <h3 className="text-xl font-bold text-blue-900">Selected Delivery Address</h3>
                    </div>
                    <div className="space-y-3 text-gray-800">
                      <p className="text-lg font-bold">{selectedAddress.instituteName}</p>
                      <div className="flex items-start gap-2">
                        <MapPin size={18} className="text-blue-600 mt-1 flex-shrink-0" />
                        <div>
                          <p>{selectedAddress.displayStreetAddress}</p>
                          {selectedAddress.apartment && <p className="text-gray-600">{selectedAddress.apartment}</p>}
                          <p className="mt-1">{selectedAddress.city}{selectedAddress.state && `, ${selectedAddress.state}`}</p>
                          <p>{selectedAddress.country}</p>
                        </div>
                      </div>
                      {selectedAddress.phone && (
                        <div className="flex items-center gap-2">
                          <Phone size={18} className="text-blue-600" />
                          <p>{selectedAddress.phone}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column - Print Preview & Actions */}
            <div className="space-y-6">
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="bg-gray-100 px-4 py-2 border-b flex justify-between items-center no-print">
                  <h3 className="text-sm font-bold text-gray-700">Print Preview</h3>
                  {selectedAddress && <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full font-medium">Ready</span>}
                </div>

                <div className="p-4 bg-gray-200 flex justify-center">
                  <div id="printable-label-area" className="w-full max-w-md bg-white border-2 border-black text-xs font-mono shadow-lg">
                    {selectedAddress ? (
                      <>
                        <div className="p-4 pb-2">
                          <div className="flex justify-between items-start border-b-2 border-black pb-2 mb-2">
                            <div>
                              <h1 className="text-xl font-bold uppercase">BlueDart</h1>
                              <p className="font-bold">Standard</p>
                            </div>
                            <div className="text-right">
                              <h2 className="text-2xl font-bold">MCT / MCT</h2>
                              <p className="text-[10px]">Charity Local</p>
                            </div>
                          </div>

                          <div className="border-b-2 border-black pb-2 mb-2">
                            <p className="text-[10px] text-gray-500 uppercase">Deliver To:</p>
                            <p className="font-bold text-sm">{selectedAddress.instituteName}</p>
                            <p>{selectedAddress.displayStreetAddress}{selectedAddress.apartment && `, ${selectedAddress.apartment}`}</p>
                            <p>{selectedAddress.city}{selectedAddress.state && `, ${selectedAddress.state}`}</p>
                            <p>{selectedAddress.country}</p>
                            {selectedAddress.phone && <p className="mt-1">Ph: {selectedAddress.phone}</p>}
                          </div>

                          <div className="border-b-2 border-black pb-2 mb-2">
                            <p className="text-[10px] font-bold uppercase mb-1">Contents Summary:</p>
                            <div className="text-[10px] space-y-0.5">
                              {batch.items.map(item => (
                                <div key={item.isbn} className="flex justify-between">
                                  <span className="truncate pr-2">{item.quantity}x {item.title}</span>
                                  <span>OMR {item.price.toFixed(3)}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 text-gray-400 px-2 py-1">
                          <Scissors size={14} />
                          <div className="border-b-2 border-dashed border-gray-400 w-full"></div>
                        </div>

                        <div className="p-4 bg-gray-50 print:bg-white">
                          <div className="flex justify-between items-center mb-3">
                            <h3 className="font-bold text-sm uppercase border-b-2 border-black inline-block">Warehouse Packing Slip</h3>
                            <div className="text-right text-[10px]">
                              <p>Date: {today}</p>
                              <p>Batch: {batch.batchId}</p>
                            </div>
                          </div>

                          <table className="w-full text-left text-[10px] border-collapse">
                            <thead>
                              <tr className="border-b border-black">
                                <th className="py-1 w-8">Chk</th>
                                <th className="py-1">Loc</th>
                                <th className="py-1">ISBN / Item</th>
                                <th className="py-1 text-center">Qty</th>
                                <th className="py-1 text-right">Price</th>
                              </tr>
                            </thead>
                            <tbody>
                              {batch.items.map((item) => (
                                <tr key={item.isbn} className="border-b border-gray-300">
                                  <td className="py-2"><div className="w-3 h-3 border border-black"></div></td>
                                  <td className="py-2 font-bold">{item.location}</td>
                                  <td className="py-2">
                                    <span className="block font-bold">{item.isbn}</span>
                                    <span className="block">{item.title}</span>
                                  </td>
                                  <td className="py-2 text-center text-sm font-bold">{item.quantity}</td>
                                  <td className="py-2 text-right">OMR {item.price.toFixed(3)}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>

                          <div className="mt-4 text-[10px] flex justify-between items-end">
                            <div className="w-1/2">
                              <p className="mb-4">Packed By: _________________</p>
                            </div>
                            <div className="text-right">
                              <p className="font-bold">Total Items: {batch.totalBooks}</p>
                            </div>
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="h-96 flex flex-col items-center justify-center text-gray-400">
                        <Package size={48} className="opacity-20 mb-4" />
                        <p>Select an address to preview the packing slip</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 no-print">
                {selectedAddress ? (
                  <>
                    <div className="grid grid-cols-2 gap-3">
                      <button onClick={handlePrint} className="py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2">
                        <Printer size={18} /> Print
                      </button>
                      <button onClick={handlePrint} className="py-3 bg-white border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 flex items-center justify-center gap-2">
                        <Download size={18} /> Save PDF
                      </button>
                    </div>

                    <button 
                      onClick={handleMarkAsShipped}
                      disabled={isSubmitting}
                      className="w-full py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 flex items-center justify-center gap-2 disabled:opacity-70"
                    >
                      {isSubmitting ? (
                        <>Processing...</>
                      ) : (
                        <>
                          <CheckCircle size={18} /> Mark as Packed & Add to Queue
                        </>
                      )}
                    </button>

                    <button
                      onClick={handleShareToWarehouse}
                      className="w-full py-3 bg-[#25D366] text-white font-medium rounded-lg hover:bg-[#128C7E] flex items-center justify-center gap-2"
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.198.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.074-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.088"/>
                      </svg>
                      Share to Warehouse
                    </button>
                  </>
                ) : (
                  <div className="py-8 text-center text-gray-500">
                    <p>Please select a delivery address to enable actions</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 no-print">
          <div className="bg-white rounded-xl p-6 max-w-sm w-full shadow-2xl">
            <div className="flex items-center gap-3 text-red-600 mb-4">
              <AlertCircle size={32} />
              <h3 className="text-lg font-bold">Delete Address?</h3>
            </div>
            <p className="text-gray-700 mb-6">
              This action cannot be undone. The address will be permanently removed.
            </p>
            <div className="flex gap-3">
              <button
                onClick={performDelete}
                className="flex-1 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700"
              >
                Yes, Delete
              </button>
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="flex-1 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GenerateLabelPage;