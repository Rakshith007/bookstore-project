import React, { useState, useMemo } from 'react';
import { 
  Menu, Check, Printer, ArrowLeft, Loader2, CheckCircle
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Sidebar, MobileSidebarDrawer } from '../../components/layout/AdminSidebar';

// ================= TYPES =================
type ItemStatus = 'pending' | 'picked';

interface PickItem {
  id: string;
  title: string;
  isbn: string;
  image: string;
  quantity: number;
  price: number;
  status: ItemStatus;
  orderId: string;
}

interface BatchInfo {
  batchId: string; // ← CHANGED: now string
  totalBooks: number;
  orderCount: number;
  orders: string[];
  assignedPicker: string;
}

// ================= MAIN COMPONENT =================
const PickAndPackPage: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [items, setItems] = useState<PickItem[]>([]);
  const [batchInfo, setBatchInfo] = useState<BatchInfo | null>(null);
  const [isCompletingPicking, setIsCompletingPicking] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  const batch = location.state?.batch as any; // From IncomingOrdersPage

  useMemo(() => {
    if (!batch || !batch.items?.length) {
      navigate('/warehouse/incomingorders');
      return;
    }

    const flatItems: PickItem[] = [];
    const orderIds: string[] = [];

    batch.items.forEach((batchItem: any) => {
      const { order, booksUsed } = batchItem;
      orderIds.push(order.id);

      let remaining = booksUsed;
      order.items.forEach((book: any) => {
        const take = Math.min(book.quantity, remaining);
        if (take > 0) {
          flatItems.push({
            id: `${order.id}-${book.isbn}-${Math.random().toString(36).substr(2, 9)}`,
            title: book.title,
            isbn: book.isbn || 'N/A',
            image: book.image || '',
            quantity: take,
            price: Number(book.price) || 0,
            status: 'pending',
            orderId: order.id,
          });
          remaining -= take;
        }
      });
    });

    setItems(flatItems);
    setBatchInfo({
      batchId: batch.id, // ← Now correctly uses string ID (e.g., B20260103-104512-0)
      totalBooks: batch.totalBooks,
      orderCount: new Set(orderIds).size,
      orders: Array.from(new Set(orderIds)),
      assignedPicker: 'Warehouse Staff',
    });
  }, [batch, navigate]);

  const handleMarkPicked = (id: string) => {
    setItems(prev => prev.map(item => 
      item.id === id ? { ...item, status: 'picked' } : item
    ));
  };

  const allItemsPicked = items.every(item => item.status === 'picked');

  // UPDATED: Sends string batchId to backend
  const handleCompletePicking = async () => {
    if (!allItemsPicked || !batchInfo || isCompletingPicking) return;

    setIsCompletingPicking(true);

    const token = localStorage.getItem('authToken');
    if (!token) {
      alert('Session expired. Please log in again.');
      navigate('/login');
      setIsCompletingPicking(false);
      return;
    }

    try {
      const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000';

      // Group items by order
      const batchItemsMap = new Map<string, number>();
      items.forEach(item => {
        const current = batchItemsMap.get(item.orderId) || 0;
        batchItemsMap.set(item.orderId, current + item.quantity);
      });
      console.log('Batch Items Map:', batchItemsMap);
      const batchItems = Array.from(batchItemsMap.entries()).map(([orderNumber, booksFulfilled]) => ({
        orderNumber,
        booksFulfilled,
      }));
console.log('Batch Items to send:', batchItems);
      const response = await fetch(`${API_BASE_URL}/admin/warehouse/complete-batch-picking`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          batchId: batchInfo.batchId, // ← Now sends correct string ID
          batchItems,
        }),
      });
console.log('Complete Picking Response Status:', response.status);
console.log('Complete Picking Response data:', response);
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to complete batch picking');
      }

      const result = await response.json();
      console.log('Batch picking completed:', result);

      alert('Batch picking completed successfully! Proceeding to packing slip...');

      // Navigate to Generate Packing Slip with full batch data
      navigate('/warehouse/generatelabel', {
        state: {
          batch: location.state.batch,
          batchId: batchInfo.batchId, // ← String ID passed forward
          pickedItems: items,
        },
      });
    } catch (err: any) {
      console.error('Error completing picking:', err.message);
      alert(`Error: ${err.message || 'Network error. Please try again.'}`);
    } finally {
      setIsCompletingPicking(false);
    }
  };

  if (!batchInfo) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600 text-lg">Loading batch details...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="hidden lg:block"><Sidebar /></div>
      <MobileSidebarDrawer isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      <div className="lg:hidden sticky top-0 z-30 bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3 shadow-sm">
        <button onClick={() => setIsSidebarOpen(true)} className="p-2 hover:bg-gray-100 rounded-lg">
          <Menu size={24} className="text-gray-700" />
        </button>
        <h1 className="text-lg font-semibold text-gray-900">Pick & Pack</h1>
      </div>

      <div className="lg:ml-64 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-6 flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Pick & Pack</h1>
              <p className="text-sm text-gray-500 mt-1">Fulfillment Center • Picking Zone</p>
            </div>
            <button
              onClick={() => navigate('/warehouse/incomingorders')}
              className="flex items-center gap-2 text-sm text-blue-600 font-medium hover:text-blue-800"
            >
              <ArrowLeft size={16} /> Back to Batches
            </button>
          </div>

          {/* Batch Header - Now shows full string ID cleanly */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6 shadow-sm">
            <div className="flex flex-col md:flex-row justify-between items-start gap-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
                  <span className="text-xl font-bold text-green-700">
                    {batchInfo.batchId.slice(-1)} {/* Last digit for visual flair */}
                  </span>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{batchInfo.batchId}</h2>
                  <p className="text-lg text-gray-700 font-medium">
                    {batchInfo.totalBooks} books • {batchInfo.orderCount} order{batchInfo.orderCount > 1 ? 's' : ''}
                  </p>
                  <div className="flex flex-wrap gap-2 mt-3">
                    {batchInfo.orders.map((id) => (
                      <span key={id} className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-sm font-medium">
                        {id}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 text-center min-w-[180px]">
                <p className="text-sm text-gray-600 mb-1">Assigned Picker</p>
                <p className="text-lg font-bold text-gray-900">{batchInfo.assignedPicker}</p>
              </div>
            </div>
          </div>

          {/* Picking Table - unchanged */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden mb-6 shadow-sm">
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
              <h3 className="font-bold text-gray-900">
                Picking List ({items.length} items)
              </h3>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr className="text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    <th className="px-6 py-3">Book Details</th>
                    <th className="px-6 py-3 text-center">Qty</th>
                    <th className="px-6 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {items.map((item) => (
                    <tr key={item.id} className={item.status === 'picked' ? 'bg-green-50' : 'bg-white'}>
                      <td className="px-6 py-5 align-middle">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-16 bg-gray-200 rounded border border-gray-300 overflow-hidden flex-shrink-0">
                            <img
                              src={item.image || 'https://via.placeholder.com/80x120/e5e7eb/9ca3af?text=No+Cover'}
                              alt={item.title}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.currentTarget.src = 'https://via.placeholder.com/80x120/e5e7eb/9ca3af?text=No+Cover';
                              }}
                            />
                          </div>

                          <div>
                            <p className="font-medium text-gray-900 line-clamp-2">{item.title}</p>
                            <p className="text-xs text-gray-500 mt-1">ISBN: {item.isbn}</p>
                            <p className="text-sm font-semibold text-gray-900 mt-2">
                              OMR {(item.price * item.quantity).toFixed(3)}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">From: {item.orderId}</p>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-5 text-center align-middle">
                        <span className="text-2xl font-bold text-gray-900">{item.quantity}</span>
                      </td>

                      <td className="px-6 py-5 text-right align-middle">
                        {item.status === 'picked' ? (
                          <button className="inline-flex items-center gap-2 px-5 py-2.5 bg-green-600 text-white rounded-lg font-medium text-sm">
                            <Check size={16} /> Picked
                          </button>
                        ) : (
                          <button
                            onClick={() => handleMarkPicked(item.id)}
                            className="inline-flex items-center gap-2 px-6 py-2.5 bg-black text-white rounded-lg font-medium text-sm hover:bg-gray-800 transition"
                          >
                            Mark Picked
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Action Buttons - unchanged */}
          <div className="flex flex-col sm:flex-row justify-between items-center bg-white border border-gray-200 p-5 rounded-xl shadow-sm gap-4">
            <div className="text-sm text-gray-600">
              Action recorded by: <span className="font-bold text-gray-900">{batchInfo.assignedPicker}</span>
            </div>
            <div className="flex gap-4 w-full sm:w-auto">
              <button
                onClick={() => navigate('/warehouse/incomingorders')}
                className="flex-1 sm:flex-none px-6 py-3 border border-red-600 text-red-600 font-medium rounded-lg hover:bg-red-50 transition"
              >
                Hold Batch
              </button>
              <button
                onClick={handleCompletePicking}
                disabled={!allItemsPicked || isCompletingPicking}
                className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-8 py-3 font-bold rounded-lg transition ${
                  allItemsPicked && !isCompletingPicking
                    ? 'bg-black text-white hover:bg-gray-800 cursor-pointer'
                    : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                }`}
              >
                {isCompletingPicking ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <CheckCircle size={18} />
                    {allItemsPicked ? 'Complete Picking → Generate Packing Slip' : 'Complete Picking First'}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PickAndPackPage;