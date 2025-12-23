import React, { useState, useMemo } from 'react';
import { 
  Search,
  Menu,
  FileText
} from 'lucide-react';
import { Sidebar, MobileSidebarDrawer } from '../../components/layout/AdminSidebar';

// ================= TYPES =================

type OrderStatus = 'Pending' | 'Packed' | 'Shipped' | 'Delivered' | 'Cancelled';

interface OrderItem {
  id: string;
  title: string;
  quantity: number;
  price: number;
}

interface Order {
  id: string;
  date: string;
  customer: string;
  email: string;
  phone: string;
  address: string;
  status: OrderStatus;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
  paymentMethod: string;
}

// ================= MOCK DATA =================

const mockOrders: Order[] = [
  { 
    id: '#1001', 
    date: '2023-09-15', 
    customer: 'Liam Harper', 
    email: 'liam@example.com',
    phone: '+1 234 567 8900',
    address: '123 Maple Ave, Springfield, IL',
    status: 'Pending', 
    items: [
      { id: 'b1', title: 'The Great Gatsby', quantity: 1, price: 15.00 },
      { id: 'b2', title: '1984', quantity: 2, price: 12.00 }
    ],
    subtotal: 39.00, tax: 2.00, shipping: 5.00, total: 46.00,
    paymentMethod: 'Credit Card ending 4242'
  },
  { 
    id: '#1002', 
    date: '2023-09-14', 
    customer: 'Olivia Bennett', 
    email: 'olivia@example.com',
    phone: '+1 234 567 8901',
    address: '456 Oak Dr, Chicago, IL',
    status: 'Pending',
    items: [{ id: 'b3', title: 'To Kill a Mockingbird', quantity: 1, price: 18.00 }],
    subtotal: 18.00, tax: 1.50, shipping: 5.00, total: 24.50,
    paymentMethod: 'PayPal'
  },
  { 
    id: '#1003', 
    date: '2023-09-13', 
    customer: 'Noah Carter', 
    email: 'noah@example.com',
    phone: '+1 234 567 8902',
    address: '789 Pine Ln, Seattle, WA',
    status: 'Packed', 
    items: [{ id: 'b4', title: 'Pride and Prejudice', quantity: 3, price: 14.00 }],
    subtotal: 42.00, tax: 3.00, shipping: 0.00, total: 45.00,
    paymentMethod: 'Credit Card ending 1234'
  },
  { 
    id: '#1004', 
    date: '2023-09-12', 
    customer: 'Emma Davis', 
    email: 'emma@example.com',
    phone: '+1 234 567 8903',
    address: '101 Elm St, Austin, TX',
    status: 'Shipped', 
    items: [{ id: 'b5', title: 'The Catcher in the Rye', quantity: 1, price: 10.00 }],
    subtotal: 10.00, tax: 0.80, shipping: 5.00, total: 15.80,
    paymentMethod: 'Credit Card ending 8888'
  },
  { 
    id: '#1005', 
    date: '2023-09-11', 
    customer: 'Ethan Foster', 
    email: 'ethan@example.com',
    phone: '+1 234 567 8904',
    address: '202 Birch Rd, Denver, CO',
    status: 'Delivered', 
    items: [{ id: 'b6', title: 'The Hobbit', quantity: 1, price: 20.00 }],
    subtotal: 20.00, tax: 1.60, shipping: 5.00, total: 26.60,
    paymentMethod: 'Apple Pay'
  },
  { 
    id: '#1006', 
    date: '2023-09-10', 
    customer: 'Ava Green', 
    email: 'ava@example.com',
    phone: '+1 234 567 8905',
    address: '303 Cedar Blvd, Miami, FL',
    status: 'Cancelled', 
    items: [{ id: 'b7', title: 'Moby Dick', quantity: 1, price: 22.00 }],
    subtotal: 22.00, tax: 1.80, shipping: 5.00, total: 28.80,
    paymentMethod: 'Credit Card ending 5555'
  },
];

type TabType = 'All' | OrderStatus;

// ================= COMPONENTS =================

const StatusBadge = ({ status }: { status: OrderStatus }) => {
  const styles = {
    Pending: 'bg-yellow-100 text-yellow-800',
    Packed: 'bg-indigo-100 text-indigo-800',
    Shipped: 'bg-purple-100 text-purple-800',
    Delivered: 'bg-green-100 text-green-800',
    Cancelled: 'bg-red-100 text-red-800',
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[status]}`}>
      {status}
    </span>
  );
};

// Removed OrderDetailsModal component completely

const MobileOrderCard = ({ order }: { order: Order }) => (
  <div className="bg-white p-4 rounded-lg border border-gray-200 mb-3 shadow-sm">
    <div className="flex justify-between items-start mb-3">
      <div>
        <span className="text-sm font-bold text-gray-900 block">{order.id}</span>
        <span className="text-xs text-gray-500">{order.date}</span>
      </div>
      <StatusBadge status={order.status} />
    </div>
    <div className="flex justify-between items-center border-t border-gray-100 pt-3">
      <div className="text-sm text-gray-700">
        <span className="text-gray-500 text-xs block">Customer</span>
        {order.customer}
      </div>
      {/* Total display removed */}
    </div>
  </div>
);

const OrdersTable = ({ orders }: { orders: Order[] }) => {
  return (
    <>
      <div className="block md:hidden">
        {orders.map((order) => (
          <MobileOrderCard key={order.id} order={order} />
        ))}
        {orders.length === 0 && <p className="text-center text-gray-500 py-8">No orders found.</p>}
      </div>

      <div className="hidden md:block bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Order ID</th>
              <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
              <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Customer</th>
              <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
              {/* Total header removed */}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {orders.map((order) => (
              <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 text-sm font-medium text-gray-900">{order.id}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{order.date}</td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  <div className="font-medium text-gray-900">{order.customer}</div>
                  <div className="text-xs text-gray-400">{order.email}</div>
                </td>
                <td className="px-6 py-4">
                  <StatusBadge status={order.status} />
                </td>
                {/* Total cell removed */}
              </tr>
            ))}
            {orders.length === 0 && (
               <tr>
                 <td colSpan={4} className="px-6 py-8 text-center text-gray-500">No orders found matching your criteria.</td>
               </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
};

// Main Page Component
const OrdersPage = () => {
  const [activeTab, setActiveTab] = useState<TabType>('All');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Removed selectedOrder state

  const tabs: TabType[] = ['All', 'Pending', 'Packed', 'Shipped', 'Delivered', 'Cancelled'];

  const filteredOrders = useMemo(() => {
    let filtered = mockOrders;

    if (activeTab !== 'All') {
      filtered = filtered.filter(order => order.status === activeTab);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        order =>
          order.id.toLowerCase().includes(query) ||
          order.customer.toLowerCase().includes(query) ||
          order.email.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [activeTab, searchQuery]);

  // === EXPORT FUNCTIONALITY ===
  const handleExportReport = () => {
    if (filteredOrders.length === 0) {
        alert('No data to export!');
        return;
    }

    // 1. Define Headers
    const headers = [
        'Order ID',
        'Date',
        'Customer Name',
        'Email',
        'Phone',
        'Address',
        'Status',
        'Payment Method',
        'Total Amount'
    ];

    // 2. Format Data Rows (Handle commas in strings by wrapping in quotes)
    const rows = filteredOrders.map(order => [
        order.id,
        order.date,
        `"${order.customer}"`, 
        order.email,
        order.phone,
        `"${order.address}"`,
        order.status,
        `"${order.paymentMethod}"`,
        order.total.toFixed(2)
    ]);

    // 3. Combine Headers and Rows
    const csvContent = [
        headers.join(','), 
        ...rows.map(row => row.join(','))
    ].join('\n');

    // 4. Create Blob and Download Link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `orders_report_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="lg:ml-72 min-h-screen bg-gray-50 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">Orders Management</h1>
            <p className="text-gray-500 text-sm">Track and manage order lifecycle.</p>
          </div>
          <button 
            onClick={handleExportReport}
            className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors shadow-sm"
          >
            <FileText size={16} />
            Export Report
          </button>
        </div>

        <div className="mb-6">
          <div className="flex gap-2 border-b border-gray-200 overflow-x-auto pb-1 scrollbar-hide">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-3 px-3 text-sm font-medium transition-colors relative whitespace-nowrap ${
                  activeTab === tab
                    ? 'text-black border-b-2 border-black'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-t-md'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search by ID, Customer, or Email"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-200 shadow-sm"
            />
          </div>
        </div>

        <OrdersTable orders={filteredOrders} />
      </div>

      {/* Modal rendering removed */}
    </div>
  );
};

export default function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <MobileSidebarDrawer
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      <div className="lg:hidden flex items-center justify-between p-4 bg-white border-b sticky top-0 z-20">
        <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 -ml-2 hover:bg-gray-100 rounded-md transition-colors"
            >
              <Menu size={24} className="text-gray-700" />
            </button>
            <h1 className="font-semibold text-lg text-gray-900">Orders</h1>
        </div>
      </div>

      <OrdersPage />
    </div>
  );
}