import React, { useState, useEffect, useMemo } from "react";
import { 
  Menu, Package, Clock, CheckCircle, Loader2, RefreshCw, MapPin, Building2
} from "lucide-react";
import { Sidebar, MobileSidebarDrawer } from "../../components/layout/AdminSidebar";
import { useLocation } from "react-router-dom";

const SHIPMENT_STAGES = ["Waiting", "Delivered"] as const;
type ShipmentStatus = typeof SHIPMENT_STAGES[number];

interface CharityAddressData {
  instituteName?: string;
  streetAddress?: string;
  displayStreetAddress?: string;
  apartment?: string;
  city: string;
  state?: string;
  country: string;
  phone?: string;
}

interface Shipment {
  id: string;
  batchId: number;
  trackingNumber: string | null;
  courier: string | null;
  assignedPickupTime: string;
  status: ShipmentStatus;
  totalBooks: number;
  charityAddress: CharityAddressData | string;
}

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000';

const ShippingQueue: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<ShipmentStatus>("Waiting");
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [loading, setLoading] = useState(true);

  const location = useLocation();

  const getToken = () => localStorage.getItem('authToken');

  const handleSessionExpired = () => {
    localStorage.removeItem('authToken');
    alert('Your session has expired. Please log in again.');
    window.location.href = '/login';
  };

  // ────────────────────────────────────────────────
  //   Improved address parser — handles string & object
  // ────────────────────────────────────────────────
  const parseCharityAddress = (address: CharityAddressData | string): { instituteName: string; fullAddress: string } => {
    if (typeof address === 'string') {
      const lines = address.trim().split('\n').filter(Boolean);
      if (lines.length === 0) return { instituteName: 'Unknown', fullAddress: 'No address' };
      const instituteName = lines[0].trim();
      const fullAddress = lines.slice(1).join(', ').trim() || 'Address details missing';
      return { instituteName, fullAddress };
    }

    // object case
    if (address && typeof address === 'object') {
      let instituteName = address.instituteName || 'Unknown Institute';

      const parts: string[] = [];
      if (address.displayStreetAddress) {
        parts.push(address.displayStreetAddress);
      } else if (address.streetAddress) {
        const streetLines = address.streetAddress.split('\n').map(l => l.trim()).filter(Boolean);
        if (streetLines.length > 0) {
          if (!instituteName || instituteName === 'Unknown Institute') {
            instituteName = streetLines[0];
            parts.push(...streetLines.slice(1));
          } else {
            parts.push(...streetLines);
          }
        }
      }

      if (address.apartment) parts.push(address.apartment);
      if (address.city) parts.push(address.city);
      if (address.state) parts.push(address.state);
      if (address.country) parts.push(address.country);

      const fullAddress = parts.filter(Boolean).join(', ') || 'Address not available';
      return { instituteName, fullAddress };
    }

    return { instituteName: 'Unknown Institute', fullAddress: 'Address not available' };
  };

  const fetchShipments = async () => {
    const token = getToken();
    if (!token) {
      handleSessionExpired();
      return;
    }

    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/shipments/charity-batches`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (res.status === 401) {
        handleSessionExpired();
        return;
      }

      if (!res.ok) throw new Error('Failed to load charity batches');

      const data = await res.json();
      console.log("Fetched batches:", data); // ← helpful for debugging

      const batchMap = new Map<number, Shipment>();

      data.forEach((s: any) => {
        const existing = batchMap.get(s.batchId);
        if (existing) {
          existing.totalBooks += s.totalBooks || 0;
        } else {
          batchMap.set(s.batchId, {
            id: s.id || `batch-${s.batchId}`,
            batchId: s.batchId,
            trackingNumber: s.trackingNumber || null,
            courier: s.courier || null,
            assignedPickupTime: s.assignedPickupTime || '—',
            status: s.status,
            totalBooks: s.totalBooks || 0,
            charityAddress: s.charityAddress || 'Address not available',
          });
        }
      });

      setShipments(Array.from(batchMap.values()));
    } catch (err) {
      console.error(err);
      alert('Could not load charity batches. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShipments();
  }, [activeTab]);

  useEffect(() => {
    if (location.state?.newShipment) {
      setActiveTab("Waiting");
      fetchShipments();
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const filteredShipments = useMemo(() => {
    return shipments.filter((s) => s.status === activeTab);
  }, [shipments, activeTab]);

  const StatusBadge = ({ status }: { status: ShipmentStatus }) => {
    const styles = {
      Waiting: "bg-gray-100 text-gray-800",
      Delivered: "bg-green-50 text-green-700 border border-green-100",
    };

    const icons = {
      Waiting: <Clock size={12} />,
      Delivered: <CheckCircle size={12} />,
    };

    return (
      <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${styles[status]}`}>
        {icons[status]} {status}
      </span>
    );
  };

  const AddressDisplay = ({ address }: { address: CharityAddressData | string }) => {
    const { instituteName, fullAddress } = parseCharityAddress(address);

    return (
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <Building2 size={16} className="text-gray-500" />
          <span className="font-semibold text-gray-900">{instituteName}</span>
        </div>
        <div className="flex items-start gap-2 text-sm text-gray-600">
          <MapPin size={16} className="mt-0.5 text-gray-500 flex-shrink-0" />
          <span className="leading-relaxed">{fullAddress}</span>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <MobileSidebarDrawer isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      <div className="lg:hidden fixed top-0 left-0 right-0 bg-white border-b z-30 px-4 py-3 flex items-center gap-3">
        <button onClick={() => setIsSidebarOpen(true)} className="p-2 hover:bg-gray-100 rounded-lg">
          <Menu size={24} className="text-gray-700" />
        </button>
        <h1 className="text-lg font-semibold">Charity Shipping Queue</h1>
      </div>

      <div className="lg:ml-64 pt-16 lg:pt-0">
        <div className="p-4 sm:p-6 lg:p-8">
          <div className="mb-6 flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold hidden lg:block">Charity Shipping Queue</h1>
              <p className="text-gray-600 mt-2">Track charity book deliveries</p>
            </div>
            <button
              onClick={fetchShipments}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
              Refresh
            </button>
          </div>

          <div className="flex gap-3 mb-6 overflow-x-auto border-b border-gray-200 pb-2">
            {SHIPMENT_STAGES.map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-5 py-2 text-sm font-medium rounded-t-lg transition whitespace-nowrap ${
                  activeTab === tab
                    ? "bg-white text-blue-600 border-t border-x border-blue-600"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                {tab}
                <span className="ml-2 text-xs bg-gray-200 px-2 py-0.5 rounded-full">
                  {filteredShipments.filter(s => s.status === tab).length}
                </span>
              </button>
            ))}
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="animate-spin" size={40} />
              <span className="ml-3 text-lg">Loading charity batches...</span>
            </div>
          ) : (
            <>
              {/* Mobile Cards */}
              <div className="block md:hidden space-y-4">
                {filteredShipments.length === 0 ? (
                  <div className="text-center py-12 bg-white rounded-lg border border-dashed border-gray-300">
                    <p className="text-gray-500">No batches in {activeTab} status</p>
                  </div>
                ) : (
                  filteredShipments.map(shipment => (
                    <div key={shipment.id} className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <p className="text-lg font-bold text-gray-900">Batch #{shipment.batchId}</p>
                          <p className="text-sm text-gray-600 mt-1">{shipment.totalBooks} books</p>
                        </div>
                        <StatusBadge status={shipment.status} />
                      </div>
                      <div className="mt-2">
                        <AddressDisplay address={shipment.charityAddress} />
                      </div>
                      <div className="mt-4 text-sm text-gray-600">
                        Updated: {shipment.assignedPickupTime}
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Desktop Table – simplified columns */}
              <div className="hidden md:block bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Batch ID</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Books</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Delivery To</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Updated</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredShipments.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="text-center py-16 text-gray-500">
                          No charity batches in <strong>{activeTab}</strong> status
                        </td>
                      </tr>
                    ) : (
                      filteredShipments.map(shipment => (
                        <tr key={shipment.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 font-medium text-gray-900">#{shipment.batchId}</td>
                          <td className="px-6 py-4">{shipment.totalBooks} books</td>
                          <td className="px-6 py-4 text-sm">
                            <AddressDisplay address={shipment.charityAddress} />
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">
                            {shipment.assignedPickupTime || '—'}
                          </td>
                          <td className="px-6 py-4">
                            <StatusBadge status={shipment.status} />
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ShippingQueue;