import React, { useState, useEffect } from 'react';
import { 
  Menu, Printer, Download, 
  Search, Filter, Package, Barcode, User, Scissors, ArrowLeft, Truck
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Sidebar, MobileSidebarDrawer } from '../../components/layout/AdminSidebar';

// ================= TYPES =================

interface OrderItem {
  id: string;
  title: string;
  quantity: number;
  price: number;
  sku: string;
  location: string;
}

interface OrderDetails {
  orderId: string;
  orderDate: string;
  shipmentId: string | null;
  packedAt: string | null;
  
  sender: {
    storeName: string;
    address: string;
    contact: string;
    gstin: string;
  };
  
  receiver: {
    name: string;
    address: string;
    city: string;
    state: string;
    pincode: string;
    phone: string;
    email: string;
  };

  items: OrderItem[];
  
  payment: {
    method: 'Prepaid' | 'COD';
    amount: number;
    isCodEligible: boolean;
  };
}

interface PackageConfig {
  count: number;
  weight: number; 
  length: number;
  width: number;
  height: number;
  type: 'Box' | 'Envelope' | 'Flyer';
  service: 'Standard' | 'Express';
  courier: string;
}

// ================= MOCK DATA (Fallback) =================

const MOCK_ORDER: OrderDetails = {
  orderId: 'ORD-2025-8821',
  orderDate: '2025-10-24 14:30',
  shipmentId: null,
  packedAt: null,
  sender: {
    storeName: 'Bookstore Co. Warehouse A',
    address: '123 Logistics Park, Indiranagar, Bangalore, KA 560038',
    contact: '+91 98765 43210',
    gstin: '29ABCDE1234F1Z5',
  },
  receiver: {
    name: 'Aarav Sharma',
    address: 'Flat 402, Sunshine Apartments, MG Road',
    city: 'Mumbai',
    state: 'Maharashtra',
    pincode: '400001',
    phone: '+91 99887 76655',
    email: 'aarav.s@example.com',
  },
  items: [
    { id: '1', title: 'The Great Gatsby', quantity: 1, price: 350.00, sku: 'BK-001', location: 'A-12' },
  ],
  payment: {
    method: 'COD',
    amount: 1450.00,
    isCodEligible: true,
  },
};

// ================= COMPONENT =================

const GenerateLabelPage: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [order, setOrder] = useState<OrderDetails>(MOCK_ORDER);
  
  const navigate = useNavigate();
  const location = useLocation();
  
  const [pkg, setPkg] = useState<PackageConfig>({
    count: 1,
    weight: 1.2, 
    length: 30,
    width: 20,
    height: 10,
    type: 'Box',
    service: 'Standard',
    courier: 'BlueDart',
  });
  
  const [generatedLabel, setGeneratedLabel] = useState<{ trackingId: string; generatedAt: string } | null>(null);

  useEffect(() => {
    // We expect both 'order' (raw data) and 'pickedItems' (processed items)
    if (location.state && location.state.order && location.state.pickedItems) {
        
        const incomingOrder = location.state.order;
        const pickedItems = location.state.pickedItems;

        // Calculate total amount based on what was picked
        const itemsTotal = pickedItems.reduce((acc: number, item: any) => acc + (item.price * item.quantity), 0);

        const mappedOrder: OrderDetails = {
            orderId: incomingOrder.id,
            orderDate: incomingOrder.orderDate,
            shipmentId: `SHP-${Math.floor(Math.random() * 1000000)}`,
            packedAt: null,
            sender: MOCK_ORDER.sender, 
            receiver: {
                name: incomingOrder.customerName,
                address: incomingOrder.shippingAddress, 
                city: incomingOrder.city,
                state: incomingOrder.state,
                pincode: incomingOrder.pincode,
                phone: incomingOrder.customerPhone,
                email: incomingOrder.customerEmail,
            },
            // Map specifically the PICKED ITEMS including their specific locations
            items: pickedItems.map((item: any) => ({
                id: item.id,
                title: item.title,
                quantity: item.quantity,
                price: item.price,
                sku: item.isbn,
                location: item.location // Use the location generated in PickAndPack
            })),
            payment: {
                method: incomingOrder.paymentMethod === 'COD' ? 'COD' : 'Prepaid',
                amount: itemsTotal, // Recalculate based on picked items
                isCodEligible: true
            }
        };
        setOrder(mappedOrder);
    } 
  }, [location.state]);

  const handleGenerateLabel = () => {
    setGeneratedLabel({
      trackingId: `TRK${Math.floor(Math.random() * 90000000) + 10000000}`,
      generatedAt: new Date().toLocaleString(),
    });
    setOrder(prev => ({ ...prev, packedAt: new Date().toLocaleString() }));
  };

  const handleCancelLabel = () => {
    setGeneratedLabel(null);
    setOrder(prev => ({ ...prev, packedAt: null }));
  };

  const handlePrint = () => {
    window.print();
  };

  const handleMarkAsShipped = () => {
    if (!generatedLabel) return;

    // Create the shipment object to pass to the shipping queue
    const newShipment = {
        id: order.orderId,
        trackingNumber: generatedLabel.trackingId,
        courier: pkg.courier,
        assignedPickupTime: "Pending Pickup", // or calculate based on logic
        status: "Shipped" 
    };

    // Navigate to shipping queue and pass state
    navigate('/admin/shippingqueue', { state: { newShipment } });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <style>{`
        @media print {
          body * { visibility: hidden; }
          #printable-label-area, #printable-label-area * { visibility: visible; }
          #printable-label-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            margin: 0;
            padding: 0;
            background: white;
          }
          .no-print { display: none !important; }
        }
      `}</style>

      <div className="hidden lg:block no-print"><Sidebar /></div>
      <MobileSidebarDrawer isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      <div className="flex-1 lg:ml-64 transition-all duration-300">
        
        {/* Mobile Header */}
        <div className="lg:hidden sticky top-0 z-30 bg-white border-b px-4 py-3 flex items-center gap-3 shadow-sm no-print">
          <button onClick={() => setIsSidebarOpen(true)} className="p-2 -ml-2 hover:bg-gray-100 rounded-lg">
            <Menu size={24} className="text-gray-700" />
          </button>
          <h1 className="text-lg font-bold text-gray-900">Generate Label</h1>
        </div>

        <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
          
          {/* Top Bar */}
          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm mb-6 flex flex-col sm:flex-row gap-4 justify-between items-center no-print">
             <div className="flex items-center gap-4 w-full sm:w-auto">
                <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-full text-gray-600">
                    <ArrowLeft size={20} />
                </button>
                <div className="relative w-full sm:w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input 
                    type="text" 
                    placeholder="Search by Order ID..." 
                    className="w-full pl-10 pr-4 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    value={order.orderId}
                    readOnly
                    />
                </div>
             </div>
             <div className="flex gap-2 w-full sm:w-auto">
                <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg text-sm font-medium hover:bg-gray-200">
                   <Filter size={16} /> Filters
                </button>
             </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* LEFT COLUMN: Details (Inputs) */}
            <div className="lg:col-span-2 space-y-6 no-print">
              
              {/* Order Sender */}
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                <div className="flex justify-between items-start mb-4">
                   <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                     <Package className="text-blue-600" size={20} /> Order & Sender
                   </h2>
                   <span className="text-xs bg-gray-100 px-2 py-1 rounded font-mono text-gray-600">
                     ID: {order.shipmentId}
                   </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                   <div className="space-y-1">
                      <p className="text-xs text-gray-500 uppercase font-semibold">Order Reference</p>
                      <p className="font-medium text-gray-900">{order.orderId}</p>
                      <p className="text-sm text-gray-500">{order.orderDate}</p>
                   </div>
                   <div className="space-y-1">
                      <p className="text-xs text-gray-500 uppercase font-semibold">Ship From</p>
                      <p className="font-medium text-gray-900">{order.sender.storeName}</p>
                      <p className="text-xs text-gray-400">GSTIN: {order.sender.gstin}</p>
                   </div>
                </div>

                {/* Shipment Contents UI Block */}
                <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                   <div className="flex justify-between items-center mb-2">
                      <p className="text-xs font-bold text-gray-500 uppercase">Shipment Contents</p>
                      <p className="text-xs font-bold text-gray-500 uppercase">Price</p>
                   </div>
                   <ul className="text-sm text-gray-700 space-y-2">
                      {order.items.map(item => (
                         <li key={item.id} className="flex justify-between border-b border-gray-200 pb-2 last:border-0 last:pb-0">
                            <div className="flex items-start gap-2">
                               <span className="font-medium text-gray-900">• {item.title}</span>
                               <span className="text-xs text-gray-500 bg-white border rounded px-1.5 py-0.5">x{item.quantity}</span>
                               <span className="text-xs text-gray-400 italic">({item.location})</span>
                            </div>
                            <span className="font-medium text-gray-900">₹{item.price.toFixed(2)}</span>
                         </li>
                      ))}
                   </ul>
                   <div className="flex justify-end mt-2 pt-2 border-t border-gray-200">
                       <p className="text-xs text-gray-500 mr-2">Items Total:</p>
                       <p className="text-sm font-bold text-gray-900">
                          ₹{order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0).toFixed(2)}
                       </p>
                   </div>
                </div>
              </div>

              {/* Receiver Details */}
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                 <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-4">
                   <User className="text-blue-600" size={20} /> Receiver Details
                 </h2>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="col-span-2 md:col-span-1">
                       <label className="block text-xs font-medium text-gray-700 mb-1">Customer Name</label>
                       <input type="text" value={order.receiver.name} readOnly className="w-full p-2 bg-gray-50 border rounded text-sm" />
                    </div>
                    <div className="col-span-2 md:col-span-1">
                       <label className="block text-xs font-medium text-gray-700 mb-1">Phone Number</label>
                       <input type="text" value={order.receiver.phone} readOnly className="w-full p-2 bg-gray-50 border rounded text-sm" />
                    </div>
                    <div className="col-span-2">
                       <label className="block text-xs font-medium text-gray-700 mb-1">Address</label>
                       <input type="text" value={order.receiver.address} className="w-full p-2 border rounded text-sm" />
                    </div>
                    <div className="col-span-1">
                       <label className="block text-xs font-medium text-gray-700 mb-1">City</label>
                       <input type="text" value={order.receiver.city} className="w-full p-2 border rounded text-sm" />
                    </div>
                    <div className="col-span-1">
                       <label className="block text-xs font-medium text-gray-700 mb-1">Pincode</label>
                       <input type="text" value={order.receiver.pincode} className="w-full p-2 border rounded text-sm" />
                    </div>
                 </div>
              </div>
            </div>

            {/* RIGHT COLUMN: Preview & Actions */}
            <div className="space-y-6">

              {/* Courier Select */}
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 no-print">
                 <h3 className="font-semibold text-gray-900 mb-3">Service Details</h3>
                 <div className="grid grid-cols-2 gap-3">
                    <div>
                       <label className="block text-xs text-gray-500 mb-1">Courier</label>
                       <select value={pkg.courier} onChange={(e) => setPkg({...pkg, courier: e.target.value})} disabled={!!generatedLabel} className="w-full text-sm border rounded-lg p-2">
                          <option>BlueDart</option>
                          <option>Delhivery</option>
                       </select>
                    </div>
                    <div>
                       <label className="block text-xs text-gray-500 mb-1">Service</label>
                       <select value={pkg.service} onChange={(e) => setPkg({...pkg, service: e.target.value as any})} disabled={!!generatedLabel} className="w-full text-sm border rounded-lg p-2">
                          <option>Standard</option>
                          <option>Express</option>
                       </select>
                    </div>
                 </div>
              </div>

              {/* 4. LABEL PREVIEW & PRINTABLE AREA */}
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                 <div className="bg-gray-100 px-4 py-2 border-b flex justify-between items-center no-print">
                    <h3 className="text-sm font-bold text-gray-700">Print Preview</h3>
                    {generatedLabel && <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full font-medium">Ready</span>}
                 </div>
                 
                 <div className="p-4 bg-gray-200 flex justify-center">
                    
                    {/* THIS ID 'printable-label-area' IS TARGETED BY CSS FOR PRINTING */}
                    <div id="printable-label-area" className="w-full bg-white border-2 border-black text-xs font-mono shadow-lg relative print:shadow-none print:border-0">
                       {generatedLabel ? (
                          <>
                            {/* === TOP PART: SHIPPING LABEL === */}
                            <div className="p-4 pb-2">
                                {/* Header */}
                                <div className="flex justify-between items-start border-b-2 border-black pb-2 mb-2">
                                   <div>
                                      <h1 className="text-xl font-bold uppercase">{pkg.courier}</h1>
                                      <p className="font-bold">{pkg.service}</p>
                                   </div>
                                   <div className="text-right">
                                      <h2 className="text-2xl font-bold">BOM / DEL</h2>
                                      <p className="text-[10px]">Routing: 2901-A</p>
                                   </div>
                                </div>
                                
                                {/* Tracking Barcode */}
                                <div className="py-4 text-center border-b-2 border-black mb-2">
                                   <div className="h-12 bg-[url('https://upload.wikimedia.org/wikipedia/commons/thumb/5/5d/UPC-A-036000291452.svg/1200px-UPC-A-036000291452.svg.png')] bg-contain bg-center bg-no-repeat w-full opacity-80" />
                                   <p className="font-bold text-sm mt-1">{generatedLabel.trackingId}</p>
                                </div>

                                {/* Addresses */}
                                <div className="grid grid-cols-2 gap-2 border-b-2 border-black pb-2 mb-2">
                                   <div className="pr-2 border-r border-gray-300">
                                      <p className="text-[10px] text-gray-500 uppercase">Deliver To:</p>
                                      <p className="font-bold text-sm">{order.receiver.name}</p>
                                      <p>{order.receiver.address}, {order.receiver.city}</p>
                                      <p>{order.receiver.state} - <span className="font-bold">{order.receiver.pincode}</span></p>
                                      <p className="mt-1">Ph: {order.receiver.phone}</p>
                                   </div>
                                   <div className="pl-1">
                                      <p className="text-[10px] text-gray-500 uppercase">Return Address:</p>
                                      <p className="font-bold">{order.sender.storeName}</p>
                                      <p className="text-[10px]">{order.sender.address}</p>
                                   </div>
                                </div>

                                {/* Item List (Compact for Label) */}
                                <div className="border-b-2 border-black pb-2 mb-2">
                                   <p className="text-[10px] font-bold uppercase mb-1">Contents Summary:</p>
                                   <div className="text-[10px] space-y-0.5">
                                      {order.items.map(item => (
                                        <div key={item.id} className="flex justify-between">
                                           <span className="truncate pr-2">{item.quantity}x {item.title}</span>
                                           <span>₹{item.price.toFixed(0)}</span>
                                        </div>
                                      ))}
                                   </div>
                                </div>

                                {/* Footer: Payment */}
                                <div className="flex justify-end items-center">
                                   <div className="text-right">
                                      {order.payment.method === 'COD' ? (
                                         <div className="border-2 border-black p-1 inline-block">
                                            <p className="text-[10px] font-bold uppercase">COD Amount</p>
                                            <p className="text-lg font-bold">₹{order.payment.amount}</p>
                                         </div>
                                      ) : (
                                         <div className="border border-gray-300 p-1 inline-block">
                                            <p className="text-[10px] font-bold uppercase">Prepaid</p>
                                            <p className="text-lg font-bold">₹0.00</p>
                                         </div>
                                      )}
                                   </div>
                                </div>
                            </div>

                            {/* === CUT LINE SEPARATOR === */}
                            <div className="flex items-center gap-2 text-gray-400 px-2 py-1">
                                <Scissors size={14} />
                                <div className="border-b-2 border-dashed border-gray-400 w-full"></div>
                            </div>

                            {/* === BOTTOM PART: WAREHOUSE PACKING SLIP === */}
                            <div className="p-4 bg-gray-50 print:bg-white">
                                <div className="flex justify-between items-center mb-3">
                                   <h3 className="font-bold text-sm uppercase border-b-2 border-black inline-block">Warehouse Packing Slip</h3>
                                   <div className="text-right text-[10px]">
                                      <p>Date: {generatedLabel.generatedAt.split(',')[0]}</p>
                                      <p>Order: {order.orderId}</p>
                                   </div>
                                </div>

                                {/* Packing Table */}
                                <table className="w-full text-left text-[10px] border-collapse">
                                   <thead>
                                      <tr className="border-b border-black">
                                         <th className="py-1 w-8">Chk</th>
                                         <th className="py-1">Loc</th>
                                         <th className="py-1">SKU / Item</th>
                                         <th className="py-1 text-center">Qty</th>
                                         <th className="py-1 text-right">Price</th>
                                      </tr>
                                   </thead>
                                   <tbody>
                                      {order.items.map((item) => (
                                         <tr key={item.id} className="border-b border-gray-300">
                                            <td className="py-2"><div className="w-3 h-3 border border-black"></div></td>
                                            <td className="py-2 font-bold">{item.location}</td>
                                            <td className="py-2">
                                               <span className="block font-bold">{item.sku}</span>
                                               <span className="block">{item.title}</span>
                                            </td>
                                            <td className="py-2 text-center text-sm font-bold">{item.quantity}</td>
                                            <td className="py-2 text-right">₹{item.price.toFixed(2)}</td>
                                         </tr>
                                      ))}
                                   </tbody>
                                </table>

                                <div className="mt-4 text-[10px] flex justify-between items-end">
                                    <div className="w-1/2">
                                        <p className="mb-4">Packed By: _________________</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold">Total Items: {order.items.reduce((a,b)=>a+b.quantity,0)}</p>
                                    </div>
                                </div>
                            </div>
                            {/* === END PACKING SLIP === */}

                          </>
                       ) : (
                          <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400" style={{ height: '320px' }}>
                             <Barcode size={48} className="opacity-20 mb-2" />
                             <p>Label not generated</p>
                          </div>
                       )}
                    </div>
                 </div>
              </div>

              {/* 5. Admin Actions */}
              <div className="grid grid-cols-1 gap-3 no-print">
                 {!generatedLabel ? (
                    <button 
                      onClick={handleGenerateLabel}
                      className="w-full py-3 bg-gray-900 text-white font-medium rounded-lg hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
                    >
                      <Barcode size={18} /> Generate Label
                    </button>
                 ) : (
                    <>
                       <div className="grid grid-cols-2 gap-3">
                          <button onClick={handlePrint} className="py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2">
                             <Printer size={18} /> Print
                          </button>
                          <button onClick={handlePrint} className="py-2.5 bg-white border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 flex items-center justify-center gap-2">
                             <Download size={18} /> Download
                          </button>
                       </div>
                       
                       {/* Re-generate button removed as requested */}
                       
                       <button 
                          onClick={handleMarkAsShipped}
                          className="w-full py-2.5 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                       >
                          <Truck size={18} /> Mark as Shipped
                       </button>

                       <button onClick={handleCancelLabel} className="w-full py-2 text-red-600 text-sm font-medium hover:bg-red-50 rounded-lg transition-colors">
                          Cancel & Edit Details
                       </button>
                    </>
                 )}
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GenerateLabelPage;