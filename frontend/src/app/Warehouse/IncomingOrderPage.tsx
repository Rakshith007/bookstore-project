import React, { useState, useMemo, useEffect, useRef } from 'react';
import { 
  Search, Menu, Package,
  CheckCircle, ChevronDown, ChevronUp, AlertCircle, Info
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Sidebar, MobileSidebarDrawer } from '../../components/layout/AdminSidebar';
import { fetchAdminOrders, AdminOrder } from '../../lib/adminOrdersApi';

// Extend AdminOrder to include fulfillments
interface AdminOrderWithFulfillments extends AdminOrder {
  status: string;
  fulfillments?: Array<{
    id: number;
    booksFulfilled: number;
    status: string;
    batchId?: string;
  }>;
}

// ================= TYPES (Frontend) =================
type StockStatus = 'In Stock' | 'Low Stock' | 'Out of Stock';
type Priority = 'Normal' | 'Urgent';

export interface OrderItem {
  id: string;
  title: string;
  quantity: number;
  isbn: string;
  image: string;
  price: number;
  stockStatus: StockStatus;
}

export interface OriginalOrder {
  id: string;
  orderDate: string;
  customerName: string;
  customerPhone: string;
  totalAmount: number;
  priority: Priority;
  items: OrderItem[];
  totalBooks: number;
  allInStock: boolean;
  fulfilledBooks: number;
  remainingBooks: number;
  isPartiallyFulfilled: boolean;
  status: string;
  fulfillments: AdminOrderWithFulfillments['fulfillments'];
}

export interface BatchItem {
  order: OriginalOrder;
  booksUsed: number;
}

// ================= HELPER COMPONENTS =================
const StatusBadge = ({ status }: { status: string }) => {
  const styles: Record<string, string> = {
    'In Stock': 'text-green-600 bg-green-50',
    'Low Stock': 'text-orange-600 bg-orange-50',
    'Out of Stock': 'text-red-600 bg-red-50',
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[status] || 'bg-gray-100 text-gray-800'}`}>
      {status}
    </span>
  );
};

const ProgressBadge = ({ fulfilled, total }: { fulfilled: number; total: number }) => {
  if (fulfilled === 0 || fulfilled >= total) return null;
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
      <AlertCircle size={12} />
      {fulfilled}/{total} delivered
    </span>
  );
};

// ================= DEBUG COMPONENT =================


// ================= MAIN COMPONENT =================
const IncomingOrdersPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeView, setActiveView] = useState<'pending' | 'inprogress'>('pending');
  
  const [batchSize, setBatchSize] = useState<number>(() => {
    const saved = localStorage.getItem('warehouseBatchSize');
    return saved ? parseInt(saved, 10) : 5;
  });

  const [expandedBatches, setExpandedBatches] = useState<Set<string>>(new Set());
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const [orders, setOrders] = useState<OriginalOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate();

  const batchCounterRef = useRef<number>(0);
  const currentDateRef = useRef<string>('');

  useEffect(() => {
    localStorage.setItem('warehouseBatchSize', batchSize.toString());
  }, [batchSize]);

  // FIXED: Check if order is already fully picked/packed/delivered
  const isAlreadyPicked = (order: OriginalOrder) => {
    const totalPicked = (order.fulfillments || []).reduce((sum, f) => {
      if (['PICKED', 'PACKED', 'DELIVERED'].includes(f.status)) {
        return sum + f.booksFulfilled;
      }
      return sum;
    }, 0);
    
    // Only skip if ALL books are already picked/packed/delivered
    return totalPicked >= order.totalBooks;
  };

  useEffect(() => {
    const loadOrders = async () => {
      try {
        setLoading(true);
        setError(null);
        const adminOrders = await fetchAdminOrders();

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const mappedOrders: OriginalOrder[] = (adminOrders as AdminOrderWithFulfillments[])
          .map(order => {
            const orderDateObj = new Date(order.orderDate);
            const isToday = orderDateObj.toDateString() === today.toDateString();

            const totalBooks = order.orderItems.reduce((sum, item) => sum + item.quantity, 0);
            const allInStock = order.orderItems.every(item => 
              item.book.stockQuantity >= item.quantity
            );

            // FIXED: Calculate properly fulfilled books (only DELIVERED status)
            const deliveredBooks = (order.fulfillments || [])
              .filter(f => f.status === 'DELIVERED')
              .reduce((sum, f) => sum + f.booksFulfilled, 0);

            // FIXED: Calculate total fulfilled in ANY status for correct remaining calculation
            const totalFulfilledAnyStatus = (order.fulfillments || []).reduce(
              (sum, f) => sum + f.booksFulfilled, 0
            );

            const remainingBooks = totalBooks - totalFulfilledAnyStatus;
            const isPartiallyFulfilled = totalFulfilledAnyStatus > 0 && remainingBooks > 0;

            const totalAmount = Number(order.totalAmount) || 0;

            return {
              id: order.orderNumber,
              orderDate: orderDateObj.toLocaleString('en-GB', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                hour12: true
              }),
              customerName: order.user?.fullName || 'Guest Customer',
              customerPhone: order.user?.phoneNumber || 'N/A',
              totalAmount,
              priority: isToday ? ('Urgent' as Priority) : ('Normal' as Priority),
              totalBooks,
              allInStock,
              fulfilledBooks: totalFulfilledAnyStatus,
              remainingBooks,
              isPartiallyFulfilled,
              status: order.status,
              fulfillments: order.fulfillments || [],
              items: order.orderItems.map((item, idx) => {
                const stockStatus: StockStatus = item.book.stockQuantity >= item.quantity
                  ? 'In Stock'
                  : item.book.stockQuantity > 0
                    ? 'Low Stock'
                    : 'Out of Stock';

                return {
                  id: String(idx),
                  title: item.book.title,
                  quantity: item.quantity,
                  isbn: item.book.sku || 'N/A',
                  image: item.book.coverImageUrl || '📚',
                  price: Number(item.unitPrice) || 0,
                  stockStatus,
                };
              })
            };
          });

        setOrders(mappedOrders);
      } catch (err: any) {
        setError(err.message || 'Failed to load orders. Please try again.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadOrders();
  }, []);

  // FIXED: CORRECT pendingOrders calculation
  const pendingOrders = useMemo(() => {
    return orders.filter(order => {
      // Calculate total books already picked/packed/delivered
      const alreadyFulfilled = (order.fulfillments || []).reduce((sum, f) => {
        if (['PICKED', 'PACKED', 'DELIVERED'].includes(f.status)) {
          return sum + f.booksFulfilled;
        }
        return sum;
      }, 0);
      
      // Show order if ANY books still need picking
      return alreadyFulfilled < order.totalBooks;
    });
  }, [orders]);

  // FIXED: CORRECT inProgressOrders calculation
  const inProgressOrders = useMemo(() => {
    return orders.filter(order => {
      // Calculate books in progress (PICKED or PACKED but not DELIVERED)
      const inProgressFulfilled = (order.fulfillments || []).reduce((sum, f) => {
        if (['PICKED', 'PACKED'].includes(f.status)) {
          return sum + f.booksFulfilled;
        }
        return sum;
      }, 0);
      
      const deliveredFulfilled = (order.fulfillments || []).reduce((sum, f) => {
        if (f.status === 'DELIVERED') {
          return sum + f.booksFulfilled;
        }
        return sum;
      }, 0);
      
      // In Progress = Has PICKED/PACKED books AND not all are delivered
      return inProgressFulfilled > 0 && deliveredFulfilled < order.totalBooks;
    });
  }, [orders]);

  const currentOrders = activeView === 'pending' ? pendingOrders : inProgressOrders;

  const filteredOrders = useMemo(() => {
    if (!searchQuery) return currentOrders;

    const lowerQuery = searchQuery.toLowerCase();
    return currentOrders.filter(order =>
      order.id.toLowerCase().includes(lowerQuery) ||
      order.customerName.toLowerCase().includes(lowerQuery) ||
      order.customerPhone.includes(lowerQuery)
    );
  }, [currentOrders, searchQuery]);

  const totalPendingValue = useMemo(() => {
    return filteredOrders.reduce((sum, order) => sum + order.totalAmount, 0);
  }, [filteredOrders]);

  // FIXED: Batch creation logic to use correct remaining books calculation
  const batches = useMemo(() => {
    const batchList: { 
      id: string; 
      items: BatchItem[]; 
      totalBooks: number; 
      isFull: boolean;
      isReviewOnly?: boolean;
    }[] = [];
    let currentItems: BatchItem[] = [];
    let currentBooks = 0;

    const now = new Date();
    const todayKey = now.toISOString().slice(0, 10);

    if (currentDateRef.current !== todayKey) {
      currentDateRef.current = todayKey;
      batchCounterRef.current = 0;
    }

    const generateUniqueBatchId = () => {
      const datePart = now.toISOString().slice(0, 10).replace(/-/g, '');
      const timePart = now.toTimeString().slice(0, 8).replace(/:/g, '');
      return `B${datePart}-${timePart}-${batchCounterRef.current++}`;
    };

    const sortedOrders = [...filteredOrders]
      .sort((a, b) => {
        if (a.allInStock && !b.allInStock) return -1;
        if (!a.allInStock && b.allInStock) return 1;
        return 0;
      });

    for (const order of sortedOrders) {
      // FIXED: Calculate how many books can still be picked for this order
      const alreadyFulfilled = (order.fulfillments || []).reduce((sum, f) => {
        if (['PICKED', 'PACKED', 'DELIVERED'].includes(f.status)) {
          return sum + f.booksFulfilled;
        }
        return sum;
      }, 0);
      
      let remaining = order.totalBooks - alreadyFulfilled;

      if (activeView === 'pending' && remaining === 0) {
        continue;
      }

      const isReviewOnly = activeView === 'inprogress' && remaining === 0;

      if (isReviewOnly) {
        if (currentItems.length === 0) {
          batchList.push({
            id: generateUniqueBatchId(),
            items: [{ order, booksUsed: 0 }],
            totalBooks: 0,
            isFull: false,
            isReviewOnly: true
          });
        }
        continue;
      }

      while (remaining > 0) {
        const space = batchSize - currentBooks;

        if (space === 0 || (currentBooks === 0 && batchList.length > 0)) {
          batchList.push({
            id: generateUniqueBatchId(),
            items: currentItems,
            totalBooks: batchSize,
            isFull: true,
            isReviewOnly: false
          });
          currentItems = [];
          currentBooks = 0;
        }

        const take = Math.min(remaining, batchSize - currentBooks);
        currentItems.push({ order, booksUsed: take });
        currentBooks += take;
        remaining -= take;
      }
    }

    if (currentItems.length > 0) {
      batchList.push({
        id: generateUniqueBatchId(),
        items: currentItems,
        totalBooks: currentBooks,
        isFull: currentBooks === batchSize,
        isReviewOnly: false
      });
    }

    return batchList.sort((a, b) => (b.isFull ? 1 : 0) - (a.isFull ? 1 : 0));
  }, [filteredOrders, batchSize, activeView]);

  const toggleBatch = (id: string) => {
    setExpandedBatches(prev => {
      const newSet = new Set(prev);
      newSet.has(id) ? newSet.delete(id) : newSet.add(id);
      return newSet;
    });
  };

  // FIXED: handleProceedBatch with correct validation
  const handleProceedBatch = (batch: typeof batches[0]) => {
    // Check if batch is already fully fulfilled
    const isReviewOnly = batch.items.every(item => {
      const totalFulfilled = (item.order.fulfillments || []).reduce((sum, f) => {
        if (['PICKED', 'PACKED', 'DELIVERED'].includes(f.status)) {
          return sum + f.booksFulfilled;
        }
        return sum;
      }, 0);
      return totalFulfilled >= item.order.totalBooks;
    });
    
    if (isReviewOnly) {
      alert('This batch is already fully fulfilled. No further picking needed.');
      return;
    }

    if (!batch.isFull) {
      alert('Only full batches can proceed to Pick & Pack');
      return;
    }

    if (batch.items.length === 0) {
      alert('Batch is empty – cannot proceed');
      return;
    }

    // Check if this batch/order is already picked
    const firstOrder = batch.items[0].order;
    const pickedFulfillment = firstOrder.fulfillments?.find(
      f => f.status === 'PICKED'
    );

    if (pickedFulfillment) {
      navigate('/warehouse/generatelabel', {
        state: {
          batch,
          batchId: pickedFulfillment.batchId,
          isBroken: true,
          from: 'incoming-orders-page'
        }
      });
    } else {
      navigate('/warehouse/pickandpack', {
        state: { 
          batch,
          isReviewOnly: false
        }
      });
    }
  };

  // FIXED: Add verification for previously hidden orders
  useEffect(() => {
    if (orders.length > 0 && !loading) {
      // Check if previously hidden orders now appear
      const order37 = orders.find(o => o.id === 'ORD-1768468542717-87');
      const order39 = orders.find(o => o.id === 'ORD-1768470219861-958');
      
      if (order37) {
        const isInPending = pendingOrders.some(o => o.id === order37.id);
        const isInProgress = inProgressOrders.some(o => o.id === order37.id);
        console.log(`Order 37: Pending=${isInPending}, InProgress=${isInProgress}, Status=${order37.status}`);
      }
      
      if (order39) {
        const isInPending = pendingOrders.some(o => o.id === order39.id);
        const isInProgress = inProgressOrders.some(o => o.id === order39.id);
        console.log(`Order 39: Pending=${isInPending}, InProgress=${isInProgress}, Status=${order39.status}`);
      }
    }
  }, [orders, pendingOrders, inProgressOrders, loading]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Loading incoming orders...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <p className="text-red-600 font-medium mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="hidden lg:block"><Sidebar /></div>
      <MobileSidebarDrawer isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      <div className="lg:hidden sticky top-0 z-30 bg-white border-b px-4 py-3 flex items-center gap-3 shadow-sm">
        <button onClick={() => setIsSidebarOpen(true)} className="p-2 -ml-2 hover:bg-gray-100 rounded-lg">
          <Menu size={24} className="text-gray-700" />
        </button>
        <h1 className="text-lg font-semibold text-gray-900">Incoming Orders</h1>
      </div>

      <div className="lg:ml-64 transition-all duration-300">
        <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
          <div className="mb-8 hidden lg:block">
            <h1 className="text-4xl font-bold text-gray-900">Incoming Orders</h1>
            <p className="text-lg text-gray-600 mt-2">Batch orders with remaining books for picking</p>
          </div>

          {/* View tabs */}
          <div className="mb-6 flex flex-wrap gap-4">
            <button
              onClick={() => setActiveView('pending')}
              className={`flex-1 sm:flex-none px-6 py-3 rounded-lg font-medium transition shadow-sm ${
                activeView === 'pending' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Pending ({pendingOrders.length})
            </button>

            <button
              onClick={() => setActiveView('inprogress')}
              className={`flex-1 sm:flex-none px-6 py-3 rounded-lg font-medium transition relative shadow-sm ${
                activeView === 'inprogress' ? 'bg-orange-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              In Progress / Broken
              {inProgressOrders.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full px-2.5 py-1 min-w-[24px] flex items-center justify-center">
                  {inProgressOrders.length}
                </span>
              )}
            </button>
          </div>

          {activeView === 'inprogress' && (
            <div className="mb-8 p-5 bg-orange-50 border border-orange-200 rounded-xl flex items-start gap-4">
              <Info className="text-orange-600 mt=1 flex-shrink-0" size={28} />
              <div>
                <h3 className="font-medium text-orange-800 text-lg mb-1">
                  Orders with picked or packed items
                </h3>
                <p className="text-orange-700">
                  Shows incomplete and broken batches. Fully delivered orders appear as Review-Only.
                </p>
              </div>
            </div>
          )}

          {/* Stats cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
              <div className="p-3 bg-blue-50 text-blue-600 rounded-lg"><Package size={24} /></div>
              <div>
                <p className="text-sm text-gray-500">Pending Orders</p>
                <p className="text-2xl font-bold text-gray-900">{filteredOrders.length}</p>
              </div>
            </div>
            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
              <div className="p-3 bg-green-50 text-green-600 rounded-lg"><Package size={24} /></div>
              <div>
                <p className="text-sm text-gray-500">Pending Value</p>
                <p className="text-2xl font-bold text-gray-900">
                  OMR {totalPendingValue.toFixed(3)}
                </p>
              </div>
            </div>
          </div>

          {/* Batch size config */}
          <div className="mb-6 bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
            <h3 className="text-lg font-semibold mb-3">Batch Configuration</h3>
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium">Batch Size:</span>
              <input
                type="number"
                min="1"
                max="20"
                value={batchSize}
                onChange={(e) => {
                  const value = parseInt(e.target.value) || 1;
                  setBatchSize(Math.max(1, Math.min(20, value)));
                }}
                className="w-24 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-center font-semibold"
              />
              <span className="text-sm text-gray-600">books per batch</span>
            </div>
          </div>

          {/* Search */}
          <div className="mb-6 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search by Order ID, Customer Name, or Phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          {batches.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
              <Package size={48} className="mx-auto text-gray-300 mb-4" />
              <p className="text-lg font-medium text-gray-700">
                {activeView === 'pending' 
                  ? "No pending books to pick" 
                  : "No incomplete or broken batches"}
              </p>
              <p className="text-sm text-gray-500 mt-2">
                {activeView === 'pending'
                  ? "All orders are either fully delivered or out of stock."
                  : "No orders have PICKED or PACKED fulfillments that still need completion."}
              </p>
            </div>
          ) : (
            <div className="space-y-8">
              {batches.map((batch) => (
                <div key={batch.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                  <div
                    className={`px-6 py-4 flex justify-between items-center cursor-pointer hover:bg-gray-50 ${batch.isFull ? 'bg-green-50' : 'bg-yellow-50'}`}
                    onClick={() => toggleBatch(batch.id)}
                  >
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900">
                        {batch.id} 
                        {batch.isFull && <span className="text-green-600 font-medium ml-2">✓ Full Batch</span>}
                        {batch.isReviewOnly && <span className="text-blue-600 font-medium ml-2">Review Only</span>}
                      </h3>
                      <p className="text-lg font-semibold text-gray-700 mt-1">
                        {batch.totalBooks} / {batchSize} books • {batch.items.length} order{batch.items.length > 1 ? 's' : ''}
                      </p>
                      <p className="text-xs text-gray-500 mt-2">
                        Created at {batch.id.slice(9, 15).replace(/(\d{2})(\d{2})(\d{2})/, '$1:$2:$3')}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      {batch.isReviewOnly ? (
                        <span className="px-5 py-3 text-gray-500 font-medium">
                          Completed - Review Only
                        </span>
                      ) : (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleProceedBatch(batch);
                          }}
                          disabled={!batch.isFull}
                          className={`flex items-center gap-2 px-5 py-3 rounded-lg font-semibold transition ${
                            batch.isFull
                              ? 'bg-green-600 hover:bg-green-700 text-white'
                              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          }`}
                        >
                          <CheckCircle size={20} />
                          Proceed to Pick & Pack
                        </button>
                      )}
                      {expandedBatches.has(batch.id) ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
                    </div>
                  </div>

                  {/* Expanded batch content */}
                  {expandedBatches.has(batch.id) && (
                    <>
                      <div className="hidden md:grid grid-cols-10 bg-gray-50 border-y px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        <div className="col-span-2">Order ID / Date</div>
                        <div className="col-span-3">Customer</div>
                        <div className="col-span-2">Amount / Books</div>
                        <div className="col-span-1">Stock</div>
                        <div className="col-span-2 text-right">Progress</div>
                      </div>

                      <div className="divide-y divide-gray-100">
                        {batch.items.map((batchItem, idx) => {
                          const { order, booksUsed } = batchItem;
                          
                          // FIXED: Calculate delivered books correctly
                          const deliveredBooks = (order.fulfillments || [])
                            .filter(f => f.status === 'DELIVERED')
                            .reduce((sum, f) => sum + f.booksFulfilled, 0);

                          return (
                            <div key={idx} className="group hover:bg-gray-50 transition-colors">
                              <div className="hidden md:grid grid-cols-10 px-6 py-4 items-center">
                                <div className="col-span-2">
                                  <span className="block font-bold text-gray-900 text-lg">{order.id}</span>
                                  <div className="text-xs text-gray-500 mt-1">
                                    Status: <span className="font-medium">{order.status}</span> • 
                                    Fulfillments: {order.fulfillments?.length || 0} • 
                                    Remaining: {order.remainingBooks}
                                  </div>
                                  <span className="text-sm text-gray-500">{order.orderDate.split(',')[0]}</span>
                                  {order.isPartiallyFulfilled && (
                                    <div className="mt-1">
                                      <ProgressBadge fulfilled={deliveredBooks} total={order.totalBooks} />
                                    </div>
                                  )}
                                </div>
                                <div className="col-span-3">
                                  <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-700 font-bold">
                                      {order.customerName.charAt(0)}
                                    </div>
                                    <div>
                                      <span className="block font-semibold text-gray-900">{order.customerName}</span>
                                      <span className="text-sm text-gray-500">{order.customerPhone}</span>
                                    </div>
                                  </div>
                                </div>
                                <div className="col-span-2">
                                  <span className="block font-bold text-gray-900 text-lg">OMR {order.totalAmount.toFixed(3)}</span>
                                  <span className="text-sm text-gray-500">
                                    {booksUsed > 0 ? `${booksUsed} book${booksUsed > 1 ? 's' : ''} in batch` : 'Review only'}
                                  </span>
                                </div>
                                <div className="col-span-1">
                                  {order.allInStock ? (
                                    <StatusBadge status="In Stock" />
                                  ) : (
                                    <StatusBadge status="Low Stock" />
                                  )}
                                </div>
                                <div className="col-span-2 text-right flex flex-col items-end gap-1">
                                  {order.priority === 'Urgent' && (
                                    <span className="text-orange-600 font-bold text-sm">Urgent (Today)</span>
                                  )}
                                  {order.isPartiallyFulfilled && (
                                    <ProgressBadge fulfilled={deliveredBooks} total={order.totalBooks} />
                                  )}
                                </div>
                              </div>

                              {/* Mobile view */}
                              <div className="md:hidden p-5">
                                <div className="flex justify-between items-start mb-4">
                                  <div>
                                    <span className="font-bold text-gray-900 text-xl">{order.id}</span>
                                    <div className="text-xs text-gray-500 mt-1">
                                      Status: {order.status} • Fulfillments: {order.fulfillments?.length || 0} • Remaining: {order.remainingBooks}
                                    </div>
                                    <p className="text-sm text-gray-500 mt-1">{order.orderDate}</p>
                                    {order.isPartiallyFulfilled && (
                                      <div className="mt-2">
                                        <ProgressBadge fulfilled={deliveredBooks} total={order.totalBooks} />
                                      </div>
                                    )}
                                  </div>
                                  {order.allInStock ? <StatusBadge status="In Stock" /> : <StatusBadge status="Low Stock" />}
                                </div>

                                <div className="flex items-center gap-4 mb-4">
                                  <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center font-bold text-lg text-gray-700">
                                    {order.customerName.charAt(0)}
                                  </div>
                                  <div>
                                    <p className="font-bold text-gray-900 text-lg">{order.customerName}</p>
                                    <p className="text-sm text-gray-500">{order.customerPhone}</p>
                                  </div>
                                </div>

                                <div className="grid grid-cols-3 gap-3 bg-gray-50 p-4 rounded-lg">
                                  <div>
                                    <p className="text-xs text-gray-500 uppercase font-semibold">Total</p>
                                    <p className="font-bold text-gray-900 text-lg">OMR {order.totalAmount.toFixed(3)}</p>
                                  </div>
                                  <div>
                                    <p className="text-xs text-gray-500 uppercase font-semibold">Books in Batch</p>
                                    <p className="font-bold text-gray-900 text-lg text-center">
                                      {booksUsed > 0 ? booksUsed : 'Review'}
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-xs text-gray-500 uppercase font-semibold">Priority</p>
                                    <p className={`font-bold text-lg text-right ${order.priority === 'Urgent' ? 'text-orange-600' : 'text-gray-900'}`}>
                                      {order.priority === 'Urgent' ? 'Urgent' : 'Normal'}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      
      
    </div>
  );
};

export default IncomingOrdersPage;