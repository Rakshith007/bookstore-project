import React, { useState, useMemo } from 'react';
import { 
  Search, Menu, Filter, 
  Package, DollarSign, Calendar,
  CheckCircle, XCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Sidebar, MobileSidebarDrawer } from '../../components/layout/AdminSidebar';

// ================= TYPES =================

type PaymentMethod = 'UPI' | 'Card' | 'NetBanking' | 'COD';
type StockStatus = 'In Stock' | 'Low Stock' | 'Out of Stock';
type OrderStatus = 'Pending' | 'Processing' | 'On Hold' | 'Cancelled';
type Priority = 'Normal' | 'Urgent';

export interface OrderItem {
  id: string;
  title: string;
  quantity: number;
  isbn: string;
  image: string;
  price: number;
  stockStatus: StockStatus;
  specialNotes?: string;
}

export interface Order {
  id: string;
  orderDate: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  
  // Delivery
  shippingAddress: string;
  city: string;
  state: string;
  pincode: string;
  deliveryType: 'Standard' | 'Express';
  addressVerified: boolean;

  // Payment
  paymentStatus: 'Paid' | 'COD';
  paymentMethod: PaymentMethod;
  paymentId?: string;
  totalAmount: number;
  isHighValue: boolean;
  fraudFlag: boolean;

  // Order Details
  priority: Priority;
  status: OrderStatus;
  items: OrderItem[];
  
  // Admin/Internal
  assignedStaff?: string;
  adminNotes?: string;
  slaDeadline: string;
}

// ================= MOCK DATA =================

const mockOrders: Order[] = [
  {
    id: '#ORD-7829',
    orderDate: '2023-10-24 09:30 AM',
    customerName: 'Sophia Clark',
    customerEmail: 'sophia.c@example.com',
    customerPhone: '+1 987 654 3210',
    shippingAddress: '123 Maple Avenue, Apt 4B',
    city: 'Springfield',
    state: 'IL',
    pincode: '62704',
    deliveryType: 'Standard',
    addressVerified: true,
    paymentStatus: 'Paid',
    paymentMethod: 'Card',
    paymentId: 'TXN_123456789',
    totalAmount: 45.00,
    isHighValue: false,
    fraudFlag: false,
    priority: 'Normal',
    status: 'Pending',
    items: [
      { 
        id: '1', title: 'The Alchemist', quantity: 2, isbn: '978-0061122415', 
        image: '🌿', price: 15.00, stockStatus: 'In Stock' 
      },
      { 
        id: '2', title: 'Atomic Habits', quantity: 1, isbn: '978-0735211292', 
        image: '⚛️', price: 15.00, stockStatus: 'In Stock' 
      }
    ],
    slaDeadline: '2023-10-25 09:30 AM'
  },
  {
    id: '#ORD-7830',
    orderDate: '2023-10-24 10:15 AM',
    customerName: 'Liam Walker',
    customerEmail: 'liam.w@example.com',
    customerPhone: '+1 555 019 2834',
    shippingAddress: 'Unknown Street, Near Park',
    city: 'Metropolis',
    state: 'NY',
    pincode: '10001',
    deliveryType: 'Express',
    addressVerified: false,
    paymentStatus: 'COD',
    paymentMethod: 'COD',
    totalAmount: 120.50,
    isHighValue: true,
    fraudFlag: true,
    priority: 'Urgent',
    status: 'Pending',
    items: [
      { 
        id: '3', title: 'Harry Potter Box Set', quantity: 1, isbn: '978-0545162074', 
        image: '⚡', price: 120.50, stockStatus: 'Low Stock' 
      }
    ],
    slaDeadline: '2023-10-24 02:15 PM'
  },
  {
    id: '#ORD-7831',
    orderDate: '2023-10-24 11:00 AM',
    customerName: 'Noah Evans',
    customerEmail: 'noah.e@example.com',
    customerPhone: '+1 555 999 8888',
    shippingAddress: '456 Oak Lane',
    city: 'Gotham',
    state: 'NJ',
    pincode: '07001',
    deliveryType: 'Standard',
    addressVerified: true,
    paymentStatus: 'Paid',
    paymentMethod: 'UPI',
    paymentId: 'UPI_9988776655',
    totalAmount: 32.00,
    isHighValue: false,
    fraudFlag: false,
    priority: 'Normal',
    status: 'On Hold',
    items: [
      { 
        id: '4', title: 'Rare History Book', quantity: 1, isbn: '978-000000001', 
        image: '📜', price: 32.00, stockStatus: 'Out of Stock' 
      }
    ],
    slaDeadline: '2023-10-25 11:00 AM'
  }
];

// ================= HELPER COMPONENTS =================

const StatusBadge = ({ status }: { status: string }) => {
  const styles: Record<string, string> = {
    'Pending': 'bg-yellow-100 text-yellow-800',
    'Processing': 'bg-blue-100 text-blue-800',
    'On Hold': 'bg-red-100 text-red-800',
    'Cancelled': 'bg-gray-100 text-gray-800',
    'Paid': 'bg-green-100 text-green-800',
    'COD': 'bg-orange-100 text-orange-800',
    'In Stock': 'text-green-600 bg-green-50',
    'Low Stock': 'text-orange-600 bg-orange-50',
    'Out of Stock': 'text-red-600 bg-red-50',
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[status] || 'bg-gray-100'}`}>
      {status}
    </span>
  );
};

// ================= MAIN COMPONENT =================

const IncomingOrdersPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [orders] = useState<Order[]>(mockOrders);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  const navigate = useNavigate();

  const filteredOrders = useMemo(() => {
    return orders.filter(order =>
      order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customerPhone.includes(searchQuery)
    );
  }, [orders, searchQuery]);

  const metrics = {
    todayCount: orders.length,
    pendingValue: orders.reduce((sum, o) => sum + o.totalAmount, 0),
  };

  const handleAcceptOrder = (order: Order) => {
    // Navigate to PickAndPack and pass the order object in state
    navigate('/warehouse/pickandpack', { state: { order } });
  };

  const handleRejectOrder = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if(confirm(`Are you sure you want to reject order ${id}?`)) {
        alert("Order rejected (Demo only)");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="hidden lg:block"><Sidebar /></div>
      <MobileSidebarDrawer isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      {/* Header Mobile */}
      <div className="lg:hidden sticky top-0 z-30 bg-white border-b px-4 py-3 flex items-center gap-3 shadow-sm">
        <button onClick={() => setIsSidebarOpen(true)} className="p-2 -ml-2 hover:bg-gray-100 rounded-lg">
          <Menu size={24} className="text-gray-700" />
        </button>
        <h1 className="text-lg font-semibold text-gray-900">Incoming Orders</h1>
      </div>

      <div className="lg:ml-64 transition-all duration-300">
        <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">

          {/* Metrics Top Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
             <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
                <div className="p-3 bg-blue-50 text-blue-600 rounded-lg"><Package size={24} /></div>
                <div>
                   <p className="text-sm text-gray-500">Orders Today</p>
                   <p className="text-2xl font-bold text-gray-900">{metrics.todayCount}</p>
                </div>
             </div>
             <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
                <div className="p-3 bg-green-50 text-green-600 rounded-lg"><DollarSign size={24} /></div>
                <div>
                   <p className="text-sm text-gray-500">Pending Value</p>
                   <p className="text-2xl font-bold text-gray-900">${metrics.pendingValue.toFixed(2)}</p>
                </div>
             </div>
          </div>

          <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
             <div>
               <h2 className="text-2xl font-bold text-gray-900">Order Queue</h2>
               <p className="text-sm text-gray-500">Process incoming orders and assign to warehouse staff.</p>
             </div>
             <div className="flex gap-2">
               <button className="flex items-center gap-2 px-4 py-2 bg-white border rounded-lg text-sm font-medium hover:bg-gray-50">
                  <Calendar size={16} /> Date Range
               </button>
               <button className="flex items-center gap-2 px-4 py-2 bg-white border rounded-lg text-sm font-medium hover:bg-gray-50">
                  <Filter size={16} /> Filter
               </button>
             </div>
          </div>

          {/* Search Bar */}
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

          {/* LIST VIEW */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
            
            {/* Desktop Table Header */}
            <div className="hidden md:grid grid-cols-12 bg-gray-50 border-b px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
               <div className="col-span-2">Order ID / Date</div>
               <div className="col-span-3">Customer</div>
               <div className="col-span-2">Payment</div>
               <div className="col-span-2">Amount / Items</div>
               <div className="col-span-1">Status</div>
               <div className="col-span-2 text-right">Action</div>
            </div>

            {/* List Items */}
            <div className="divide-y divide-gray-100">
               {filteredOrders.map((order) => (
                  <div 
                    key={order.id} 
                    className="group hover:bg-gray-50 transition-colors"
                  >
                     {/* Desktop Row */}
                     <div className="hidden md:grid grid-cols-12 px-6 py-4 items-center">
                        <div className="col-span-2">
                           <span className="block font-medium text-gray-900">{order.id}</span>
                           <span className="text-xs text-gray-500">{order.orderDate.split(' ')[0]}</span>
                        </div>
                        <div className="col-span-3">
                           <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 font-bold text-xs">
                                 {order.customerName.charAt(0)}
                              </div>
                              <div>
                                 <span className="block text-sm font-medium text-gray-900">{order.customerName}</span>
                                 <span className="text-xs text-gray-500">{order.city}, {order.state}</span>
                              </div>
                           </div>
                        </div>
                        <div className="col-span-2">
                           <StatusBadge status={order.paymentStatus} />
                           <span className="text-xs text-gray-500 ml-2">{order.paymentMethod}</span>
                        </div>
                        <div className="col-span-2">
                           <span className="block font-medium text-gray-900">${order.totalAmount.toFixed(2)}</span>
                           <span className="text-xs text-gray-500">{order.items.reduce((acc, i) => acc + i.quantity, 0)} items</span>
                        </div>
                        <div className="col-span-1">
                           <StatusBadge status={order.status} />
                        </div>
                        <div className="col-span-2 text-right flex justify-end gap-2">
                            {/* Action Buttons */}
                            <button 
                                onClick={(e) => handleRejectOrder(e, order.id)}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Reject Order">
                                <XCircle size={20} />
                            </button>
                            <button 
                                onClick={() => handleAcceptOrder(order)}
                                className="flex items-center gap-1 bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-colors">
                                <CheckCircle size={16} /> Accept & Pick
                            </button>
                        </div>
                     </div>

                     {/* Mobile Card */}
                     <div className="md:hidden p-4">
                        <div className="flex justify-between items-start mb-3">
                           <div>
                              <span className="font-bold text-gray-900">{order.id}</span>
                              <p className="text-xs text-gray-500">{order.orderDate}</p>
                           </div>
                           <StatusBadge status={order.status} />
                        </div>
                        <div className="flex items-center gap-3 mb-3">
                           <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center font-bold text-gray-600">
                               {order.customerName.charAt(0)}
                           </div>
                           <div>
                              <p className="text-sm font-medium text-gray-900">{order.customerName}</p>
                              <p className="text-xs text-gray-500">{order.city}, {order.state}</p>
                           </div>
                        </div>
                        <div className="flex justify-between items-center bg-gray-50 p-3 rounded-lg mb-4">
                           <div>
                              <p className="text-xs text-gray-500 uppercase">Total</p>
                              <p className="font-bold text-gray-900">${order.totalAmount}</p>
                           </div>
                           <div>
                              <p className="text-xs text-gray-500 uppercase">Items</p>
                              <p className="font-medium text-gray-900 text-right">{order.items.length}</p>
                           </div>
                           <div>
                              <p className="text-xs text-gray-500 uppercase">Priority</p>
                              <p className={`font-medium text-right ${order.priority === 'Urgent' ? 'text-orange-600' : 'text-gray-900'}`}>{order.priority}</p>
                           </div>
                        </div>
                        
                        {/* Mobile Actions */}
                        <div className="grid grid-cols-2 gap-3">
                            <button 
                                onClick={(e) => handleRejectOrder(e, order.id)}
                                className="flex justify-center items-center gap-2 border border-red-200 text-red-600 py-2 rounded-lg font-medium hover:bg-red-50">
                                <XCircle size={16} /> Reject
                            </button>
                            <button 
                                onClick={() => handleAcceptOrder(order)}
                                className="flex justify-center items-center gap-2 bg-green-600 text-white py-2 rounded-lg font-medium hover:bg-green-700">
                                <CheckCircle size={16} /> Accept & Pick
                            </button>
                        </div>
                     </div>
                  </div>
               ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default IncomingOrdersPage;