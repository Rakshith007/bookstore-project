import React, { useState, useEffect, useMemo } from "react";
import { 
  Menu, Package, Clock, CheckCircle, Loader2, RefreshCw, MapPin, Truck, Building2
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
  const [saving, setSaving] = useState(false);
  const [selectedForDelivery, setSelectedForDelivery] = useState<Set<string>>(new Set());
  const [inlineEdits, setInlineEdits] = useState<Record<string, { trackingNumber: string; courier: string }>>({});

  const location = useLocation();

  const getToken = () => localStorage.getItem('authToken');

  const handleSessionExpired = () => {
    localStorage.removeItem('authToken');
    alert('Your session has expired. Please log in again.');
    window.location.href = '/login';
  };

  // Helper to extract institute name and clean address
  const parseCharityAddress = (address: CharityAddressData | string): { instituteName: string; fullAddress: string } => {
    if (typeof address === 'string') {
      const lines = address.trim().split('\n').map(l => l.trim()).filter(Boolean);
      const instituteName = lines[0] || 'Unknown Institute';
      const rest = lines.slice(1).join(', ');
      return { instituteName, fullAddress: rest || 'Address details missing' };
    }

    if (typeof address === 'object' && address !== null) {
      const instituteName = address.instituteName || 
        (address.streetAddress?.split('\n')[0]?.trim()) || 
        'Unknown Institute';

      const parts = [];
      if (address.displayStreetAddress) parts.push(address.displayStreetAddress);
      else if (address.streetAddress) {
        const lines = address.streetAddress.split('\n');
        parts.push(lines.slice(1).join(', ').trim());
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

      const batchMap = new Map<number, Shipment>();

      data.forEach((s: any) => {
        const existing = batchMap.get(s.batchId);
        if (existing) {
          existing.totalBooks += s.totalBooks || 0;
        } else {
          batchMap.set(s.batchId, {
            id: s.id,
            batchId: s.batchId,
            trackingNumber: s.trackingNumber || null,
            courier: s.courier || 'Pending Assignment',
            assignedPickupTime: s.assignedPickupTime || 'Today',
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

  const handleFieldChange = (id: string, field: "trackingNumber" | "courier", value: string) => {
    setInlineEdits(prev => ({
      ...prev,
      [id]: { ...prev[id], [field]: value }
    }));
  };

  const handleMarkAsDelivered = async (batchId: number, shipmentId: string) => {
    const edits = inlineEdits[shipmentId] ?? { trackingNumber: "", courier: "" };
    const tracking = edits.trackingNumber?.trim();
    const courier = edits.courier?.trim();

    const token = getToken();
    if (!token) return;

    try {
      setSaving(true);
      const res = await fetch(`${API_BASE_URL}/shipments/charity-batch/${batchId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          trackingNumber: tracking || undefined,
          courier: courier || undefined,
        })
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'Failed to update batch');
      }

      alert(`Batch #${batchId} marked as Delivered!`);
      setInlineEdits(prev => {
        const updated = { ...prev };
        delete updated[shipmentId];
        return updated;
      });
      fetchShipments();
      setActiveTab("Delivered");
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleBulkMarkAsDelivered = async () => {
    if (selectedForDelivery.size === 0) {
      alert("Please select at least one batch");
      return;
    }

    const token = getToken();
    if (!token) return;

    const batchIds = Array.from(selectedForDelivery).map(id => parseInt(id.split('-')[1]));

    try {
      setSaving(true);
      const res = await fetch(`${API_BASE_URL}/shipments/charity-bulk-delivered`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ batchIds })
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'Failed to mark as delivered');
      }

      alert(`${selectedForDelivery.size} batch(es) marked as Delivered`);
      setSelectedForDelivery(new Set());
      fetchShipments();
      setActiveTab("Delivered");
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  const toggleDeliverySelection = (id: string) => {
    const updated = new Set(selectedForDelivery);
    if (updated.has(id)) updated.delete(id);
    else updated.add(id);
    setSelectedForDelivery(updated);
  };

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
                onClick={() => {
                  setActiveTab(tab);
                  setSelectedForDelivery(new Set());
                  setInlineEdits({});
                }}
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
              {/* Mobile View */}
              <div className="block md:hidden space-y-4">
                {filteredShipments.length === 0 ? (
                  <div className="text-center py-12 bg-white rounded-lg border border-dashed border-gray-300">
                    <p className="text-gray-500">No batches in {activeTab} status</p>
                  </div>
                ) : (
                  filteredShipments.map(shipment => {
                    const isWaiting = shipment.status === "Waiting";
                    const edits = inlineEdits[shipment.id] ?? { trackingNumber: "", courier: "" };

                    return (
                      <div key={shipment.id} className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex-1">
                            <p className="text-xl font-bold text-gray-900">{shipment.id}</p>
                            <p className="text-sm text-gray-600 mt-1">{shipment.totalBooks} books</p>
                            <div className="mt-3">
                              <AddressDisplay address={shipment.charityAddress} />
                            </div>
                          </div>
                          <StatusBadge status={shipment.status} />
                        </div>

                        {isWaiting && (
                          <div className="space-y-3 mt-6 pt-4 border-t border-gray-200">
                            <input
                              type="text"
                              placeholder="Tracking Number (optional)"
                              value={edits.trackingNumber}
                              onChange={(e) => handleFieldChange(shipment.id, "trackingNumber", e.target.value)}
                              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-mono"
                            />
                            <input
                              type="text"
                              placeholder="Courier Name (optional)"
                              value={edits.courier}
                              onChange={(e) => handleFieldChange(shipment.id, "courier", e.target.value)}
                              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm"
                            />
                            <button
                              onClick={() => handleMarkAsDelivered(shipment.batchId, shipment.id)}
                              disabled={saving}
                              className="w-full py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                              {saving ? <Loader2 className="animate-spin" size={18} /> : null}
                              Mark as Delivered
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>

              {/* Desktop Table */}
              <div className="hidden md:block bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-4 w-12 text-left">
                        <input
                          type="checkbox"
                          checked={selectedForDelivery.size === filteredShipments.length && filteredShipments.length > 0}
                          onChange={(e) => setSelectedForDelivery(
                            e.target.checked ? new Set(filteredShipments.map(s => s.id)) : new Set()
                          )}
                          className="rounded border-gray-300 text-green-600"
                        />
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Batch ID</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Books</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Delivery To</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Tracking</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Courier</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Updated</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                      {activeTab === "Waiting" && <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Action</th>}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredShipments.length === 0 ? (
                      <tr>
                        <td colSpan={activeTab === "Waiting" ? 8 : 7} className="text-center py-16 text-gray-500">
                          No charity batches in <strong>{activeTab}</strong> status
                        </td>
                      </tr>
                    ) : (
                      filteredShipments.map(shipment => {
                        const isWaiting = shipment.status === "Waiting";
                        const edits = inlineEdits[shipment.id] ?? { trackingNumber: "", courier: "" };

                        return (
                          <tr key={shipment.id} className={isWaiting ? "bg-blue-50" : "hover:bg-gray-50"}>
                            <td className="px-6 py-4">
                              <input
                                type="checkbox"
                                checked={selectedForDelivery.has(shipment.id)}
                                onChange={() => toggleDeliverySelection(shipment.id)}
                                className="rounded border-gray-300 text-green-600"
                              />
                            </td>
                            <td className="px-6 py-4 font-semibold text-gray-900">{shipment.id}</td>
                            <td className="px-6 py-4">{shipment.totalBooks} books</td>
                            <td className="px-6 py-4 text-sm">
                              <AddressDisplay address={shipment.charityAddress} />
                            </td>
                            <td className="px-6 py-4">
                              {isWaiting ? (
                                <input
                                  type="text"
                                  value={edits.trackingNumber}
                                  onChange={(e) => handleFieldChange(shipment.id, "trackingNumber", e.target.value)}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono"
                                  placeholder="Optional"
                                />
                              ) : (
                                <span className="font-mono text-blue-600">{shipment.trackingNumber || "N/A"}</span>
                              )}
                            </td>
                            <td className="px-6 py-4">
                              {isWaiting ? (
                                <input
                                  type="text"
                                  value={edits.courier}
                                  onChange={(e) => handleFieldChange(shipment.id, "courier", e.target.value)}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                                  placeholder="Optional"
                                />
                              ) : (
                                <span>{shipment.courier}</span>
                              )}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-600">{shipment.assignedPickupTime}</td>
                            <td className="px-6 py-4"><StatusBadge status={shipment.status} /></td>
                            {isWaiting && (
                              <td className="px-6 py-4">
                                <button
                                  onClick={() => handleMarkAsDelivered(shipment.batchId, shipment.id)}
                                  disabled={saving}
                                  className="px-5 py-2.5 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-50 flex items-center gap-2"
                                >
                                  {saving ? <Loader2 className="animate-spin" size={16} /> : null}
                                  Mark as Delivered
                                </button>
                              </td>
                            )}
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {activeTab === "Waiting" && selectedForDelivery.size > 0 && (
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4 shadow-lg lg:static lg:shadow-none lg:mt-8">
              <button
                onClick={handleBulkMarkAsDelivered}
                disabled={saving}
                className="w-full lg:w-auto px-8 py-3 bg-green-600 text-white font-bold rounded-lg disabled:opacity-50 flex items-center justify-center gap-3 hover:bg-green-700 transition"
              >
                <Truck size={20} />
                {saving ? "Processing..." : `Mark Selected (${selectedForDelivery.size}) as Delivered`}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ShippingQueue;