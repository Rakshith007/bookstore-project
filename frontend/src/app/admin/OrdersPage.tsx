import React, { useState, useEffect, useMemo } from 'react';
import {
  Search,
  Menu,
  FileText,
  Table,
  Boxes,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  Package,
} from 'lucide-react';
import { Sidebar, MobileSidebarDrawer } from '../../components/layout/AdminSidebar';
import * as XLSX from 'xlsx';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
const PAGE_SIZE = 20;

/* --------------------------------------------------------------
   Types
   -------------------------------------------------------------- */
interface Fulfillment {
  id: number;
  batchId: string;
  booksFulfilled: number;
  status: 'PICKED' | 'PACKED' | 'DELIVERED';
  pickedAt: string | null;
  packedAt: string | null;
  deliveredAt: string | null;
  internalTrackingId: string | null;
  courier?: { name: string };
}

interface RawOrder {
  orderNumber: string;
  orderDate: string;
  user: {
    fullName: string;
    email: string;
    phoneNumber: string;
  } | null;
  totalAmount: number;
  paymentMethod: {
    methodType: string;
  } | null;
  status: string;
  fulfillments: Fulfillment[];
  // NEW: Added calculated fields from backend
  _calculated?: {
    totalBooks: number;
    pickedBooks: number;
    packedBooks: number;
    deliveredBooks: number;
    totalFulfilled: number;
    remainingBooks: number;
    isPartiallyFulfilled: boolean;
  };
}

interface OrderRecord {
  orderNumber: string;
  orderDate: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  totalAmount: number;
  paymentMethod: string;
  orderStatus: 'Processing' | 'Completed';
  // NEW: Show fulfillment details
  fulfillmentDetails?: string;
}

interface FulfillmentRecord {
  id: number;
  orderNumber: string;
  batchId: string;
  booksFulfilled: number;
  status: 'PICKED' | 'PACKED' | 'DELIVERED';
  deliveredAt: string | null;
  internalTrackingId: string | null;
  courier: string | null;
  orderDate: string;
  customerName: string;
  // NEW: Added original order status for context
  originalOrderStatus: string;
}

type ViewTab = 'orders' | 'fulfillments';

/* --------------------------------------------------------------
   Status Badge – updated to show correct status
   -------------------------------------------------------------- */
const StatusBadge = ({ status, details }: { status: 'Processing' | 'Completed', details?: string }) => (
  <div className="flex flex-col gap-1">
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${
        status === 'Completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
      }`}
    >
      {status === 'Completed' ? <CheckCircle size={14} /> : <Package size={14} />}
      {status}
    </span>
    {details && (
      <span className="text-xs text-gray-500">{details}</span>
    )}
  </div>
);

/* --------------------------------------------------------------
   Pagination (unchanged)
   -------------------------------------------------------------- */
const Pagination = ({
  currentPage,
  totalItems,
  onPageChange,
}: {
  currentPage: number;
  totalItems: number;
  onPageChange: (page: number) => void;
}) => {
  const totalPages = Math.ceil(totalItems / PAGE_SIZE);

  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between mt-8 px-4 py-3 bg-white border border-gray-200 rounded-lg shadow-sm">
      <div className="text-sm text-gray-600">
        Showing {(currentPage - 1) * PAGE_SIZE + 1} to {Math.min(currentPage * PAGE_SIZE, totalItems)} of{' '}
        {totalItems} items
      </div>
      <div className="flex items-center gap-3">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="p-2 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          <ChevronLeft size={20} />
        </button>
        <span className="text-sm font-medium text-gray-900">
          Page {currentPage} of {totalPages}
        </span>
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="p-2 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          <ChevronRight size={20} />
        </button>
      </div>
    </div>
  );
};

/* --------------------------------------------------------------
   HELPER: Calculate correct order status based on fulfillments
   -------------------------------------------------------------- */
const calculateOrderStatus = (order: RawOrder): 'Processing' | 'Completed' => {
  // If backend already provides calculated fields, use them
  if (order._calculated) {
    const { totalFulfilled, totalBooks } = order._calculated;
    
    // Order is "Completed" if ALL books are fulfilled (PICKED, PACKED, or DELIVERED)
    if (totalFulfilled >= totalBooks) {
      return 'Completed';
    }
    
    // Otherwise, it's still "Processing"
    return 'Processing';
  }
  
  // Fallback: Calculate manually from fulfillments
  const totalBooks = 100; // Default - should come from orderItems calculation
  
  const totalFulfilled = order.fulfillments.reduce((sum, f) => {
    if (['PICKED', 'PACKED', 'DELIVERED'].includes(f.status)) {
      return sum + f.booksFulfilled;
    }
    return sum;
  }, 0);
  
  return totalFulfilled >= totalBooks ? 'Completed' : 'Processing';
};

/* --------------------------------------------------------------
   HELPER: Get fulfillment details for display
   -------------------------------------------------------------- */
const getFulfillmentDetails = (order: RawOrder): string | undefined => {
  if (!order._calculated) return undefined;
  
  const { totalBooks, totalFulfilled, remainingBooks } = order._calculated;
  
  if (totalFulfilled === 0) {
    return `${totalBooks} books pending`;
  } else if (totalFulfilled >= totalBooks) {
    return `All ${totalBooks} books fulfilled`;
  } else {
    return `${totalFulfilled}/${totalBooks} fulfilled, ${remainingBooks} remaining`;
  }
};

/* --------------------------------------------------------------
   Orders Table – shows CORRECT status now
   -------------------------------------------------------------- */
const OrdersView = ({ orders }: { orders: OrderRecord[] }) => (
  <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="bg-gray-50 border-b border-gray-200">
            <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Order ID
            </th>
            <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Date
            </th>
            <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Customer
            </th>
            <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Total Amount
            </th>
            <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Order Status
            </th>
            <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Fulfillment
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {orders.length === 0 ? (
            <tr>
              <td colSpan={6} className="px-6 py-16 text-center text-gray-500">
                No orders found
              </td>
            </tr>
          ) : (
            orders.map((o) => (
              <tr key={o.orderNumber} className="hover:bg-gray-50 transition">
                <td className="px-6 py-5 font-medium text-gray-900">{o.orderNumber}</td>
                <td className="px-6 py-5 text-sm text-gray-600">
                  {new Date(o.orderDate).toLocaleDateString('en-IN')}
                </td>
                <td className="px-6 py-5 text-sm text-gray-600">
                  <div className="font-medium">{o.customerName}</div>
                  <div className="text-xs text-gray-400">{o.customerEmail}</div>
                </td>
                <td className="px-6 py-5 text-sm font-medium">OMR {o.totalAmount.toFixed(2)}</td>
                <td className="px-6 py-5">
                  <StatusBadge status={o.orderStatus} details={o.fulfillmentDetails} />
                </td>
                <td className="px-6 py-5 text-sm text-gray-500">
                  {o.orderStatus === 'Completed' ? (
                    <span className="text-green-600 font-medium">✓ Fulfilled</span>
                  ) : (
                    <span className="text-orange-600 font-medium">In Progress</span>
                  )}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  </div>
);

/* --------------------------------------------------------------
   Fulfillments Table – unchanged
   -------------------------------------------------------------- */
const FulfillmentsView = ({ fulfillments }: { fulfillments: FulfillmentRecord[] }) => (
  <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="bg-gray-50 border-b border-gray-200">
            <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Order ID
            </th>
            <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Batch ID
            </th>
            <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Books
            </th>
            <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Customer
            </th>
            <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Tracking / Courier
            </th>
            <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Status
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {fulfillments.length === 0 ? (
            <tr>
              <td colSpan={6} className="px-6 py-16 text-center text-gray-500">
                No fulfillment records found
              </td>
            </tr>
          ) : (
            fulfillments.map((f) => (
              <tr key={f.id} className="hover:bg-gray-50 transition">
                <td className="px-6 py-5 font-medium text-gray-900">{f.orderNumber}</td>
                <td className="px-6 py-5 text-sm font-medium text-purple-600">{f.batchId}</td>
                <td className="px-6 py-5 text-sm text-center font-medium">{f.booksFulfilled}</td>
                <td className="px-6 py-5 text-sm text-gray-600">
                  <div className="font-medium">{f.customerName}</div>
                </td>
                <td className="px-6 py-5 text-sm">
                  {f.internalTrackingId && (
                    <div className="text-blue-600 text-xs">Tracking: {f.internalTrackingId}</div>
                  )}
                  {f.courier && (
                    <div className="text-gray-600 text-xs mt-1">Courier: {f.courier}</div>
                  )}
                  {!f.internalTrackingId && !f.courier && <span className="text-gray-400 text-xs">—</span>}
                </td>
                <td className="px-6 py-5">
                  <span
                    className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${
                      f.status === 'DELIVERED' ? 'bg-green-100 text-green-800' :
                      f.status === 'PACKED' ? 'bg-blue-100 text-blue-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}
                  >
                    {f.status}
                  </span>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  </div>
);

/* --------------------------------------------------------------
   Main Page
   -------------------------------------------------------------- */
const OrdersPage = () => {
  const [activeView, setActiveView] = useState<ViewTab>('orders');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [fulfillments, setFulfillments] = useState<FulfillmentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [showExportMenu, setShowExportMenu] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem('authToken');
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const resp = await fetch(`${API_BASE}/admin/orders`, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!resp.ok) throw new Error('Failed to fetch');

        const json = await resp.json();
        const rawOrders: RawOrder[] = json.success && Array.isArray(json.data) ? json.data : [];

        // ============ FIXED: CORRECT STATUS CALCULATION ============
        const orderRecords: OrderRecord[] = rawOrders.map((o) => {
          // Use the new correct logic to determine if order is completed
          const displayStatus = calculateOrderStatus(o);
          const fulfillmentDetails = getFulfillmentDetails(o);

          return {
            orderNumber: o.orderNumber,
            orderDate: o.orderDate,
            customerName: o.user?.fullName || 'Guest Customer',
            customerEmail: o.user?.email || 'N/A',
            customerPhone: o.user?.phoneNumber || 'N/A',
            totalAmount: Number(o.totalAmount),
            paymentMethod: o.paymentMethod?.methodType || 'Unknown',
            orderStatus: displayStatus, // CORRECT: "Completed" or "Processing"
            fulfillmentDetails,
          };
        });

        // Fulfillments stay raw
        const fulfillmentRecords: FulfillmentRecord[] = rawOrders.flatMap((o) =>
          o.fulfillments.map((f) => ({
            id: f.id,
            orderNumber: o.orderNumber,
            batchId: f.batchId,
            booksFulfilled: f.booksFulfilled,
            status: f.status,
            deliveredAt: f.deliveredAt,
            internalTrackingId: f.internalTrackingId,
            courier: f.courier?.name || null,
            orderDate: o.orderDate,
            customerName: o.user?.fullName || 'Guest',
            originalOrderStatus: o.status, // Show actual order status
          }))
        );

        setOrders(orderRecords);
        setFulfillments(fulfillmentRecords);
        
        // DEBUG: Log problematic orders
        console.log("=== ORDER STATUS DEBUG ===");
        rawOrders.forEach(o => {
          const calculated = calculateOrderStatus(o);
          console.log(`${o.orderNumber}: Backend status="${o.status}", Calculated="${calculated}"`);
        });
        
      } catch (e) {
        console.error(e);
        setOrders([]);
        setFulfillments([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [activeView, searchQuery]);

  const baseData = activeView === 'orders' ? orders : fulfillments;

  const filteredData = useMemo(() => {
    if (!searchQuery) return baseData;

    const q = searchQuery.toLowerCase();

    if (activeView === 'orders') {
      return (baseData as OrderRecord[]).filter(
        (o) =>
          o.orderNumber.toLowerCase().includes(q) ||
          o.customerName.toLowerCase().includes(q) ||
          o.customerEmail.toLowerCase().includes(q)
      );
    }

    return (baseData as FulfillmentRecord[]).filter(
      (f) =>
        f.orderNumber.toLowerCase().includes(q) ||
        f.batchId.toLowerCase().includes(q) ||
        f.customerName.toLowerCase().includes(q)
    );
  }, [baseData, searchQuery, activeView]);

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredData.slice(start, start + PAGE_SIZE);
  }, [filteredData, currentPage]);

  const totalItems = filteredData.length;

  const exportCurrentView = () => {
    let rows: any[] = [];
    let sheetName = '';
    let fileName = '';

    if (activeView === 'orders') {
      rows = (filteredData as OrderRecord[]).map((o) => ({
        'Order ID': o.orderNumber,
        'Date': new Date(o.orderDate).toLocaleDateString('en-IN'),
        'Customer': o.customerName,
        'Email': o.customerEmail,
        'Phone': o.customerPhone,
        'Total': o.totalAmount.toFixed(2),
        'Payment': o.paymentMethod,
        'Status': o.orderStatus,
        'Fulfillment Details': o.fulfillmentDetails || '',
      }));
      sheetName = 'Orders';
      fileName = 'Orders_Report';
    } else {
      rows = (filteredData as FulfillmentRecord[]).map((f) => ({
        'Order ID': f.orderNumber,
        'Batch ID': f.batchId,
        'Books': f.booksFulfilled,
        'Status': f.status,
        'Delivered': f.deliveredAt ? new Date(f.deliveredAt).toLocaleDateString('en-IN') : '—',
        'Tracking': f.internalTrackingId || '—',
        'Courier': f.courier || '—',
        'Order Status': f.originalOrderStatus,
      }));
      sheetName = 'Fulfillments';
      fileName = 'Fulfillments_Report';
    }

    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, sheetName.slice(0, 31));
    XLSX.writeFile(wb, `${fileName}_${new Date().toISOString().slice(0, 10)}.xlsx`);
    setShowExportMenu(false);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-lg text-gray-600">Loading data…</p>
      </div>
    );
  }

  return (
    <div className="lg:ml-72 min-h-screen bg-gray-50 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Orders Management</h1>
            <p className="text-gray-600 mt-2">View and track all customer orders and fulfillments</p>
          </div>

          <div className="relative">
            <button
              onClick={() => setShowExportMenu(!showExportMenu)}
              className="flex items-center gap-2 bg-black text-white px-5 py-3 rounded-lg font-medium hover:bg-gray-800 shadow-sm transition"
            >
              <FileText size={18} />
              Export Current View
            </button>

            {showExportMenu && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                <div className="px-4 py-2 text-sm text-gray-600 border-b">Exports current tab only</div>
                <button
                  onClick={exportCurrentView}
                  className="w-full text-left px-4 py-3 text-sm hover:bg-gray-100 flex items-center gap-3 transition"
                >
                  <FileText size={16} /> Download Report
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="mb-6">
          <div className="flex gap-1 border-b border-gray-200">
            <button
              onClick={() => setActiveView('orders')}
              className={`pb-3 px-6 text-sm font-medium transition-colors relative flex items-center gap-2 ${
                activeView === 'orders'
                  ? 'text-black border-b-2 border-black'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Table size={18} />
              Orders ({orders.length})
            </button>
            <button
              onClick={() => setActiveView('fulfillments')}
              className={`pb-3 px-6 text-sm font-medium transition-colors relative flex items-center gap-2 ${
                activeView === 'fulfillments'
                  ? 'text-black border-b-2 border-black'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Boxes size={18} />
              Fulfillments ({fulfillments.length})
            </button>
          </div>
        </div>

        <div className="mb-8">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder={
                activeView === 'fulfillments'
                  ? 'Search by order ID or batch ID...'
                  : 'Search orders by ID, customer name or email...'
              }
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black transition"
            />
          </div>
        </div>

        {activeView === 'orders' ? (
          <>
            <OrdersView orders={paginatedData as OrderRecord[]} />
            <Pagination currentPage={currentPage} totalItems={totalItems} onPageChange={setCurrentPage} />
          </>
        ) : (
          <>
            <FulfillmentsView fulfillments={paginatedData as FulfillmentRecord[]} />
            <Pagination currentPage={currentPage} totalItems={totalItems} onPageChange={setCurrentPage} />
          </>
        )}
      </div>
    </div>
  );
};

export default function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <MobileSidebarDrawer isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      <div className="lg:hidden sticky top-0 z-30 bg-white border-b px-4 py-4 flex items-center gap-3 shadow-sm">
        <button onClick={() => setIsSidebarOpen(true)} className="p-2 hover:bg-gray-100 rounded-lg transition">
          <Menu size={24} />
        </button>
        <h1 className="text-lg font-semibold">Orders Management</h1>
      </div>

      <OrdersPage />
    </div>
  );
}