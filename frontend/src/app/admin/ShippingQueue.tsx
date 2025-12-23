import React, { useState, useEffect, useMemo } from "react";
import { Menu, Package, MapPin, Clock, CheckCircle } from "lucide-react"; 
import { Sidebar, MobileSidebarDrawer } from '../../components/layout/AdminSidebar';
import { useLocation } from "react-router-dom";

// Define the specific workflow stages in order (Removed 'Picked Up')
const SHIPMENT_STAGES = [
  "Shipped",
  "In Transit",
  "Out for Delivery",
  "Delivered"
] as const;

type ShipmentStatus = typeof SHIPMENT_STAGES[number] | "Waiting";

interface Order {
  id: string;
  trackingNumber: string;
  courier: string;
  assignedPickupTime: string;
  status: ShipmentStatus;
}

const ShippingQueue: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  // Default to 'Shipped' to see new arrivals
  const [activeTab, setActiveTab] = useState<ShipmentStatus>("Shipped");
  const location = useLocation();

  // Initial Mock Data
  const [orders, setOrders] = useState<Order[]>([
    {
      id: "#12346",
      trackingNumber: "9876543211",
      courier: "Swift Couriers",
      assignedPickupTime: "11:30 AM",
      status: "Shipped", 
    },
    {
      id: "#12347",
      trackingNumber: "9876543212",
      courier: "BlueDart",
      assignedPickupTime: "12:00 PM",
      status: "Shipped", // Changed from Picked Up to Shipped for consistency
    },
    {
      id: "#12348",
      trackingNumber: "9876543213",
      courier: "Delhivery",
      assignedPickupTime: "Yesterday",
      status: "In Transit",
    },
    {
      id: "#12349",
      trackingNumber: "9876543214",
      courier: "Express Delivery",
      assignedPickupTime: "Today",
      status: "Out for Delivery",
    },
    {
      id: "#12350",
      trackingNumber: "9876543215",
      courier: "Swift Couriers",
      assignedPickupTime: "Completed",
      status: "Delivered",
    },
  ]);

  const [selectedOrders, setSelectedOrders] = useState<Set<string>>(new Set());

  // Listen for new shipment data passed from GenerateLabelPage
  useEffect(() => {
    if (location.state && location.state.newShipment) {
        const newShipment = location.state.newShipment as Order;
        
        setOrders(prev => {
            // Prevent duplicates
            if (prev.find(o => o.id === newShipment.id)) return prev;
            return [newShipment, ...prev];
        });

        // Ensure we switch to the tab where the new item is
        setActiveTab(newShipment.status);
        
        // Clean up history state
        window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  // Filter orders based on the active tab
  const filteredOrders = useMemo(() => {
    return orders.filter(order => order.status === activeTab);
  }, [orders, activeTab]);

  const toggleOrderSelection = (orderId: string) => {
    const updated = new Set(selectedOrders);
    updated.has(orderId) ? updated.delete(orderId) : updated.add(orderId);
    setSelectedOrders(updated);
  };

  // Determine the next status based on current active tab
  const getNextStatus = (): ShipmentStatus | null => {
    const currentIndex = SHIPMENT_STAGES.indexOf(activeTab as any);
    if (currentIndex >= 0 && currentIndex < SHIPMENT_STAGES.length - 1) {
        return SHIPMENT_STAGES[currentIndex + 1];
    }
    return null; // No next status (e.g., if Delivered)
  };

  const nextStatus = getNextStatus();

  const handleUpdateStatus = () => {
    if (!nextStatus) return;

    setOrders((prev) =>
      prev.map((order) =>
        selectedOrders.has(order.id)
          ? { ...order, status: nextStatus }
          : order
      )
    );
    setSelectedOrders(new Set());
  };

  // Helper for Status Badge
  const StatusBadge = ({ status }: { status: Order['status'] }) => {
    const styles = {
        "Waiting": "bg-gray-100 text-gray-800",
        "Shipped": "bg-blue-50 text-blue-700 border border-blue-100",
        "In Transit": "bg-orange-50 text-orange-700 border border-orange-100",
        "Out for Delivery": "bg-yellow-50 text-yellow-700 border border-yellow-100",
        "Delivered": "bg-green-50 text-green-700 border border-green-100",
    };

    const icons = {
        "Shipped": <Package size={12} />,
        "In Transit": <MapPin size={12} />,
        "Out for Delivery": <Clock size={12} />,
        "Delivered": <CheckCircle size={12} />,
        "Waiting": <Clock size={12} />
    };

    return (
        <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap w-fit ${styles[status] || 'bg-gray-100'}`}>
          {icons[status]} {status}
        </span>
    );
  };

  // Mobile Order Card Component
  const MobileOrderCard = ({ order }: { order: Order }) => (
    <div className={`bg-white p-4 rounded-lg border mb-3 shadow-sm ${
      selectedOrders.has(order.id) ? 'border-blue-500 ring-1 ring-blue-500' : 'border-gray-200'
    }`}>
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={selectedOrders.has(order.id)}
            onChange={() => toggleOrderSelection(order.id)}
            className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <div>
            <span className="font-semibold text-gray-900 block">{order.id}</span>
            <span className="text-xs text-gray-500">{order.courier}</span>
          </div>
        </div>
        <StatusBadge status={order.status} />
      </div>
      
      <div className="pl-8 space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-500">Tracking:</span>
          <span className="text-blue-600 font-medium font-mono">{order.trackingNumber}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">Pickup/Update:</span>
          <span className="text-gray-900">{order.assignedPickupTime}</span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <MobileSidebarDrawer
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-30 px-4 py-3 flex items-center gap-3">
        <button 
          onClick={() => setIsSidebarOpen(true)}
          className="p-2 -ml-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <Menu size={24} className="text-gray-700" />
        </button>
        <h1 className="text-lg font-semibold text-gray-900">Shipping Queue</h1>
      </div>

      <div className="lg:ml-64 pt-16 lg:pt-0 transition-all duration-300">
        <div className="p-4 sm:p-6 lg:p-8">
          
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-2xl sm:text-4xl font-bold text-gray-900 mb-2 hidden lg:block">
              Shipping Queue
            </h1>
            <p className="text-gray-600 text-sm sm:text-base">
              Track shipments across their delivery lifecycle.
            </p>
          </div>

          {/* Dynamic Tabs */}
          <div className="flex gap-2 mb-6 border-b border-gray-200 overflow-x-auto scrollbar-hide">
            {SHIPMENT_STAGES.map((tab) => (
              <button
                key={tab}
                onClick={() => {
                    setActiveTab(tab);
                    setSelectedOrders(new Set()); // Clear selection when switching tabs
                }}
                className={`pb-3 px-4 text-sm font-medium capitalize whitespace-nowrap transition-colors relative ${
                  activeTab === tab
                    ? "text-blue-600"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {tab}
                {activeTab === tab && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-t-full" />
                )}
                <span className="ml-2 text-xs bg-gray-100 text-gray-600 py-0.5 px-2 rounded-full">
                    {orders.filter(o => o.status === tab).length}
                </span>
              </button>
            ))}
          </div>

          {/* Mobile View */}
          <div className="block md:hidden mb-24">
            {filteredOrders.length === 0 ? (
                <div className="text-center py-10 text-gray-500 bg-white rounded-lg border border-dashed border-gray-300">
                    No orders in {activeTab} stage.
                </div>
            ) : (
                filteredOrders.map((order) => (
                  <MobileOrderCard key={order.id} order={order} />
                ))
            )}
          </div>

          {/* Desktop View */}
          <div className="hidden md:block bg-white rounded-lg border border-gray-200 overflow-hidden mb-20 shadow-sm">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-4 w-12">
                    <input
                      type="checkbox"
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                      onChange={(e) =>
                        setSelectedOrders(
                          e.target.checked
                            ? new Set(filteredOrders.map((o) => o.id))
                            : new Set()
                        )
                      }
                      checked={filteredOrders.length > 0 && selectedOrders.size === filteredOrders.length}
                    />
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Order ID</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Tracking</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Courier</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Last Update</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredOrders.length === 0 ? (
                    <tr>
                        <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                            No orders currently in <strong>{activeTab}</strong> stage.
                        </td>
                    </tr>
                ) : (
                    filteredOrders.map((order) => (
                      <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <input
                            type="checkbox"
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                            checked={selectedOrders.has(order.id)}
                            onChange={() => toggleOrderSelection(order.id)}
                          />
                        </td>
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">{order.id}</td>
                        <td className="px-6 py-4 text-sm text-blue-600 font-mono">{order.trackingNumber}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{order.courier}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{order.assignedPickupTime}</td>
                        <td className="px-6 py-4">
                          <StatusBadge status={order.status} />
                        </td>
                      </tr>
                    ))
                )}
              </tbody>
            </table>
          </div>

          {/* Workflow Action Bar */}
          {nextStatus && (
              <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4 lg:static lg:bg-transparent lg:border-0 lg:p-0 lg:mt-6 lg:flex lg:justify-end z-20">
                <button
                  onClick={handleUpdateStatus}
                  disabled={selectedOrders.size === 0}
                  className="w-full lg:w-auto px-6 py-3 bg-black text-white font-medium rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-800 transition-colors shadow-lg lg:shadow-none flex items-center justify-center gap-2"
                >
                  <CheckCircle size={18} />
                  Mark {selectedOrders.size > 0 ? `(${selectedOrders.size})` : ''} as {nextStatus}
                </button>
              </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default ShippingQueue;