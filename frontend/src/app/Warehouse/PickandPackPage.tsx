import React, { useState, useEffect } from 'react';
import { 
  Menu, Check, X, AlertTriangle, 
  Clock, Package, User, Printer, 
  Filter, ClipboardList, ArrowLeft, Lock
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Sidebar, MobileSidebarDrawer } from '../../components/layout/AdminSidebar';

// ================= TYPES =================

type PaymentMethod = 'UPI' | 'Card' | 'NetBanking' | 'COD';
type StockStatus = 'In Stock' | 'Low Stock' | 'Out of Stock';
type OrderStatus = 'Pending' | 'Processing' | 'On Hold' | 'Cancelled';
type Priority = 'Normal' | 'Urgent';

// Incoming Data Structure (from IncomingOrdersPage)
interface OrderItemSource {
  id: string;
  title: string;
  quantity: number;
  isbn: string;
  image: string;
  price: number;
  stockStatus: StockStatus;
}

interface OrderSource {
  id: string;
  orderDate: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: string;
  city: string;
  state: string;
  pincode: string;
  deliveryType: 'Standard' | 'Express';
  paymentStatus: 'Paid' | 'COD';
  paymentMethod: PaymentMethod;
  totalAmount: number;
  priority: Priority;
  status: OrderStatus;
  items: OrderItemSource[];
  slaDeadline: string;
}

type ItemStatus = 'pending' | 'picked' | 'issue';

// Local State Interface
interface PickItem {
  id: string;
  title: string;
  isbn: string;
  image: string;
  location: string; 
  quantity: number;
  price: number; 
  stockStatus: string;
  status: ItemStatus;
}

interface OrderInfo {
  orderId: string;
  orderDate: string;
  customer: string;
  priority: Priority;
  slaDeadline: string;
  assignedPicker: string;
  assignedPacker: string;
}

// ================= SUB-COMPONENTS =================

const MetricsBar = () => (
  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
    <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm flex items-center justify-between">
      <div>
        <p className="text-xs text-gray-500 uppercase tracking-wide">To Pick Today</p>
        <p className="text-2xl font-bold text-gray-900">24</p>
      </div>
      <div className="p-2 bg-blue-50 rounded text-blue-600"><ClipboardList size={20}/></div>
    </div>
    <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm flex items-center justify-between">
      <div>
        <p className="text-xs text-gray-500 uppercase tracking-wide">Packed</p>
        <p className="text-2xl font-bold text-gray-900">12</p>
      </div>
      <div className="p-2 bg-green-50 rounded text-green-600"><Package size={20}/></div>
    </div>
  </div>
);

const OrderHeader = ({ info }: { info: OrderInfo }) => (
  <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6 shadow-sm">
    <div className="flex flex-col md:flex-row justify-between items-start gap-6">
      <div className="flex gap-4">
        <div className="w-16 h-16 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 text-2xl font-bold border border-gray-200">
            {info.customer.charAt(0)}
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{info.orderId}</h2>
          <p className="text-gray-600 font-medium">{info.customer}</p>
          <div className="flex items-center gap-2 text-sm text-gray-400 mt-1">
            <Clock size={14} /> {info.orderDate}
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-2 min-w-[200px]">
        <div className="flex justify-between items-center text-sm">
           <span className="text-gray-500">Priority:</span>
           <span className={`font-bold px-2 py-0.5 rounded text-xs ${info.priority === 'Urgent' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'}`}>
             {info.priority}
           </span>
        </div>
        <div className="flex justify-between items-center text-sm">
           <span className="text-gray-500">Deadline:</span>
           <span className="flex items-center gap-1 font-bold text-red-600">
             <Clock size={14} /> {info.slaDeadline}
           </span>
        </div>
      </div>
      <div className="bg-gray-50 p-3 rounded-lg text-sm min-w-[200px] border border-gray-200">
        <div className="flex items-center gap-2 mb-1">
          <User size={14} className="text-gray-400" />
          <span className="text-gray-500">Picker:</span>
          <span className="font-medium text-gray-900">{info.assignedPicker}</span>
        </div>
        <div className="flex items-center gap-2">
          <Package size={14} className="text-gray-400" />
          <span className="text-gray-500">Packer:</span>
          <span className="font-medium text-gray-900">{info.assignedPacker}</span>
        </div>
      </div>
    </div>
  </div>
);

const PickingTable = ({ items, onItemStatusChange }: { items: PickItem[], onItemStatusChange: (id: string, status: ItemStatus) => void }) => (
  <div className="bg-white rounded-xl border border-gray-200 overflow-hidden mb-6 shadow-sm">
    <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex justify-between items-center">
      <h3 className="font-bold text-gray-900 flex items-center gap-2">
        <ClipboardList size={18} /> Picking List ({items.length} items)
      </h3>
      <div className="flex gap-2">
         <button className="flex items-center gap-1 text-xs font-medium bg-white border border-gray-300 px-2 py-1 rounded text-gray-700 hover:bg-gray-50">
           <Filter size={12}/> Filter Status
         </button>
      </div>
    </div>
    
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-white border-b border-gray-200">
          <tr className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
            <th className="px-6 py-3">Book Details</th>
            <th className="px-6 py-3">Location</th>
            <th className="px-6 py-3">Stock</th>
            <th className="px-6 py-3 text-center">Qty</th>
            <th className="px-6 py-3 text-right">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {items.map((item) => (
            <tr key={item.id} className={item.status === 'picked' ? 'bg-green-50' : 'bg-white'}>
              <td className="px-6 py-4 flex gap-4 items-center">
                <div className="w-10 h-14 bg-gray-100 rounded flex items-center justify-center text-xl border border-gray-200 shadow-sm overflow-hidden">
                    {item.image.startsWith('http') || item.image.startsWith('/') ? (
                        <img src={item.image} alt="" className="w-full h-full object-cover" />
                    ) : (
                        <span className="text-2xl">{item.image}</span>
                    )}
                </div>
                <div>
                  <p className="font-medium text-gray-900">{item.title}</p>
                  <p className="text-xs text-gray-500 font-mono">ISBN: {item.isbn}</p>
                  <p className="text-xs text-gray-400 mt-1">₹{item.price}</p>
                </div>
              </td>
              <td className="px-6 py-4">
                <span className="px-2 py-1 bg-gray-100 rounded text-xs font-bold text-gray-700 border border-gray-200">
                  {item.location}
                </span>
              </td>
              <td className="px-6 py-4">
                {item.stockStatus === 'Low Stock' ? (
                  <span className="flex items-center gap-1 text-xs text-orange-600 font-bold">
                    <AlertTriangle size={12} /> Low Stock
                  </span>
                ) : (
                  <span className="text-xs text-green-700 bg-green-100 px-2 py-1 rounded">In Stock</span>
                )}
              </td>
              <td className="px-6 py-4 text-center font-bold text-lg text-gray-900">{item.quantity}</td>
              <td className="px-6 py-4 text-right">
                <div className="flex justify-end gap-2">
                  {item.status === 'picked' ? (
                      <button 
                        onClick={() => onItemStatusChange(item.id, 'pending')}
                        className="flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white rounded text-sm font-medium hover:bg-green-700 transition-colors"
                      >
                        <Check size={14} /> Picked
                      </button>
                   ) : item.status === 'issue' ? (
                      <button className="flex items-center gap-1 px-3 py-1.5 bg-red-600 text-white rounded text-sm font-medium">
                        <AlertTriangle size={14} /> Reported
                      </button>
                   ) : (
                    <>
                      <button 
                        onClick={() => onItemStatusChange(item.id, 'issue')}
                        title="Report Missing/Damaged"
                        className="p-2 text-red-600 bg-red-50 hover:bg-red-100 rounded transition-colors"
                      >
                        <X size={18} />
                      </button>
                      <button 
                        onClick={() => onItemStatusChange(item.id, 'picked')}
                        className="flex items-center gap-1 px-4 py-1.5 border border-black text-black hover:bg-black hover:text-white rounded text-sm font-medium transition-colors"
                      >
                        Mark Picked
                      </button>
                    </>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

// ================= MAIN COMPONENT =================

const PickAndPackPage: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [items, setItems] = useState<PickItem[]>([]);
  const [orderInfo, setOrderInfo] = useState<OrderInfo | null>(null);
  const [rawOrder, setRawOrder] = useState<OrderSource | null>(null);

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const incomingOrder = location.state?.order as OrderSource;

    if (incomingOrder) {
        setRawOrder(incomingOrder);
        setOrderInfo({
            orderId: incomingOrder.id,
            orderDate: incomingOrder.orderDate,
            customer: incomingOrder.customerName,
            priority: incomingOrder.priority,
            slaDeadline: incomingOrder.slaDeadline,
            assignedPicker: 'Current User',
            assignedPacker: 'Pending Assignment'
        });

        const mappedItems: PickItem[] = incomingOrder.items.map(item => ({
            id: item.id,
            title: item.title,
            isbn: item.isbn,
            image: item.image,
            location: `Zone ${Math.floor(Math.random() * 5) + 1} - Shelf ${String.fromCharCode(65 + Math.floor(Math.random() * 4))}`, 
            quantity: item.quantity,
            price: item.price,
            stockStatus: item.stockStatus,
            status: 'pending'
        }));
        setItems(mappedItems);
    }
  }, [location.state]);

  const handleItemStatusChange = (id: string, status: ItemStatus) => {
    setItems(items.map(item => item.id === id ? { ...item, status } : item));
  };

  const allItemsPicked = items.length > 0 && items.every(item => item.status === 'picked');

  const handleMoveToShipping = () => {
    if (!allItemsPicked) {
       // Logic Update: Navigate back to incoming orders with a specific error/notification
       navigate('/warehouse/incomingorders', { 
           state: { 
               notification: `Label Generation Failed for ${orderInfo?.orderId}: No items were picked.`,
               type: 'error'
           } 
       });
       return;
    }

    // Filter only picked items to send to the label page
    const pickedItems = items.filter(i => i.status === 'picked');

    navigate('/warehouse/generatelabel', { 
        state: { 
            order: rawOrder, 
            pickedItems: pickedItems 
        } 
    });
  };

  if (!orderInfo) {
      return (
          <div className="min-h-screen flex items-center justify-center flex-col gap-4">
              <p className="text-gray-500">No Order Selected.</p>
              <button onClick={() => navigate('/warehouse/incomingorders')} className="text-blue-600 hover:underline">Go to Incoming Orders</button>
          </div>
      );
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <div className="hidden lg:block"><Sidebar /></div>
      <MobileSidebarDrawer isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      <div className="lg:hidden sticky top-0 z-30 bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3 shadow-sm">
        <button onClick={() => setIsSidebarOpen(true)} className="p-2 -ml-2 hover:bg-gray-100 rounded-lg text-gray-700">
          <Menu size={24} />
        </button>
        <span className="font-bold text-gray-900">Pick & Pack</span>
      </div>

      <div className="lg:ml-64 transition-all duration-300">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          
          <div className="mb-6 flex justify-between items-end">
             <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-1">Pick & Pack</h1>
                <p className="text-sm text-gray-500">Fulfillment Center A • Picking Zone 2</p>
             </div>
             <button 
                onClick={() => navigate('/warehouse/incomingorders')}
                className="flex items-center gap-1 text-sm text-blue-600 font-bold hover:text-blue-800"
             >
                <ArrowLeft size={16} /> Back to Incoming
             </button>
          </div>
          
          <MetricsBar />
          <OrderHeader info={orderInfo} />
          <PickingTable items={items} onItemStatusChange={handleItemStatusChange} />
          
          <div className="flex flex-col sm:flex-row justify-between items-center bg-white border border-gray-200 p-4 rounded-xl shadow-sm gap-4 mt-8">
             <div className="text-sm text-gray-500">
                Action recorded by: <span className="font-bold text-gray-900">{orderInfo.assignedPicker}</span>
             </div>
             <div className="flex gap-3 w-full sm:w-auto">
                <button 
                  className="flex-1 sm:flex-none px-6 py-3 border border-red-200 text-red-600 font-bold rounded-lg hover:bg-red-50 transition-colors"
                  onClick={() => alert("Order placed on hold due to issue.")}
                >
                   Hold Order
                </button>
                <button
                  onClick={handleMoveToShipping}
                  title={!allItemsPicked ? "All items must be picked" : "Generate Shipping Label"}
                  className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-8 py-3 font-bold rounded-lg transition-colors shadow-sm ${
                      !allItemsPicked 
                      ? 'bg-gray-100 text-gray-400 border border-gray-200 hover:bg-gray-200' // Changed style to indicate it's clickable but acts as a cancel/back
                      : 'bg-black text-white hover:bg-gray-800'
                  }`}
                >
                  {!allItemsPicked ? <X size={18} /> : <Printer size={18} />}
                  {/* Changed text logic for clarity based on requirement */}
                  {!allItemsPicked ? "Return to Queue" : "Generate Label"}
                </button>
             </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default PickAndPackPage;