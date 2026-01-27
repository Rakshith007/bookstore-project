import React, { useState, useEffect } from "react";
import { Search, Menu, Loader2, Download, AlertCircle } from "lucide-react";
import { Sidebar, MobileSidebarDrawer } from "../../components/layout/AdminSidebar";
import { getToken } from "../../lib/auth";
import * as XLSX from "xlsx";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

/* =========================================================
   TYPES
========================================================= */
interface Book {
  id: number;
  title: string;
  sku: string;
  coverImage?: string | null;
  price: number;
  stockQuantity: number;
  restockAlertLevel?: string | null;
}

interface InventoryItem extends Book {
  stockLevel: "Critical" | "Low" | "In Stock";
  restockAlert: boolean;
}

/* =========================================================
   COMPONENT
========================================================= */
const InventoryCheck: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [inventoryData, setInventoryData] = useState<InventoryItem[]>([]);
  const [selectedRows, setSelectedRows] = useState<number[]>([]);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);

  const [updatedPrice, setUpdatedPrice] = useState<number | "">("");
  const [addedStock, setAddedStock] = useState<number | "">("");
  const [updating, setUpdating] = useState(false);

  const [globalThreshold, setGlobalThreshold] = useState<number | "">(() => {
    const saved = localStorage.getItem('inventoryGlobalThreshold');
    return saved ? Number(saved) : "";
  });

  useEffect(() => {
    if (globalThreshold !== "") {
      localStorage.setItem('inventoryGlobalThreshold', globalThreshold.toString());
    } else {
      localStorage.removeItem('inventoryGlobalThreshold');
    }
  }, [globalThreshold]);

  const PLACEHOLDER_IMAGE = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAiIGhlaWdodD0iODAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0iI2NjY2NjYyIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LXNpemU9IjEyIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSIgZmlsbD0iIzk5OSI+Tm8gQ292ZXI8L3RleHQ+PC9zdmc+';

  // Fetch data
  const fetchInventory = async () => {
    try {
      setLoading(true);
      const token = getToken();
      if (!token) {
        setError("Please log in as admin");
        return;
      }

      const response = await fetch(`${API_BASE_URL}/books?limit=1000`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) throw new Error("Failed to fetch inventory");

      const data = await response.json();
      const books: Book[] = Array.isArray(data) ? data : data.data || data.books || [];

      const threshold = globalThreshold !== "" && globalThreshold > 0 ? globalThreshold : null;

      const processed: InventoryItem[] = books.map((book) => {
        const stock = book.stockQuantity;
        let stockLevel: "Critical" | "Low" | "In Stock" = "In Stock";

        if (threshold !== null) {
          if (stock <= threshold) stockLevel = "Critical";
        } else {
          if (stock <= 5) stockLevel = "Critical";
          else if (stock <= 10) stockLevel = "Low";
        }

        const restockAlert = threshold !== null && stock <= threshold;

        return { ...book, stockLevel, restockAlert };
      });

      setInventoryData(processed);
      setError(null);
    } catch (err: any) {
      setError(err.message || "Failed to load inventory");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, [globalThreshold]);

  const filteredInventory = inventoryData.filter(
    (item) =>
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStockLevelColor = (level: string) => {
    switch (level) {
      case "Critical": return "bg-red-100 text-red-800 border-red-300";
      case "Low":      return "bg-orange-100 text-orange-800 border-orange-300";
      case "In Stock": return "bg-green-100 text-green-800 border-green-300";
      default:         return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  // ────────────────────────────────────────────────
  //  BULK UPDATE
  // ────────────────────────────────────────────────
  const handleUpdateStock = async () => {
    if (selectedRows.length === 0) return;
    setUpdating(true);

    try {
      const token = getToken();
      if (!token) throw new Error("Authentication required");

      const payload: { price?: number; addedStock?: number } = {};
      if (updatedPrice !== "") payload.price = updatedPrice;
      if (addedStock !== "") payload.addedStock = addedStock;

      if (Object.keys(payload).length === 0) {
        setError("Please enter price or stock to update");
        return;
      }

      await Promise.all(
        selectedRows.map(async (bookId) => {
          const res = await fetch(`${API_BASE_URL}/books/${bookId}/inventory`, {
            method: "PATCH",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
          });
          if (!res.ok) throw new Error(`Failed to update book ${bookId}`);
        })
      );

      await fetchInventory();
      setSelectedRows([]);
      setUpdatedPrice("");
      setAddedStock("");
      setShowUpdateModal(false);
      setError(null);
    } catch (err: any) {
      setError(err.message || "Update failed");
    } finally {
      setUpdating(false);
    }
  };

  // ────────────────────────────────────────────────
  //  EXPORT (same logic, just cleaner)
  // ────────────────────────────────────────────────
  const exportInventory = (period: "today" | "weekly" | "monthly") => {
    const now = new Date();
    let label = period === "today" ? "Today" :
                period === "weekly" ? "Last 7 Days" : "Last 30 Days";

    const thresholdText = globalThreshold !== ""
      ? `≤ ${globalThreshold} (Critical)`
      : "Default (≤5 Critical, ≤10 Low)";

    const headers = ["Book Title", "SKU", "Price (OMR)", "Current Stock", "Stock Level", "Restock Alert"];

    const dataRows = filteredInventory.map(item => [
      item.title,
      item.sku,
      item.price,
      item.stockQuantity,
      item.stockLevel,
      item.restockAlert ? "Yes" : "No",
    ]);

    const ws = XLSX.utils.aoa_to_sheet([
      ["INVENTORY REPORT"],
      [`Period: ${label}`],
      [`Generated: ${now.toLocaleString()}`],
      [`Global Threshold: ${thresholdText}`],
      [`Total Books: ${filteredInventory.length}`],
      [],
      headers,
      ...dataRows
    ]);

    ws['!cols'] = [
      { wch: 40 }, { wch: 18 }, { wch: 12 },
      { wch: 14 }, { wch: 14 }, { wch: 14 }
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Inventory");

    const fileName = `Inventory_${label.replace(/ /g, "_")}_${now.toISOString().slice(0,10)}.xlsx`;
    XLSX.writeFile(wb, fileName);

    setShowExportModal(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="hidden lg:block">
        <Sidebar />
      </div>

      <MobileSidebarDrawer isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      {/* Mobile top bar */}
      <div className="lg:hidden sticky top-0 z-30 bg-white border-b px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => setIsSidebarOpen(true)} className="p-2 -ml-2 hover:bg-gray-100 rounded-lg">
            <Menu size={24} />
          </button>
          <h1 className="text-lg font-bold">Inventory</h1>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:ml-64 min-h-screen pb-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">

          {/* Title + Global threshold */}
          <div className="mb-6 space-y-5">
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Inventory Check</h1>

            {/* Global Threshold */}
            <div className="bg-white border rounded-xl p-5 shadow-sm">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Global Restock Alert Threshold
              </label>
              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <input
                  type="number"
                  min="0"
                  placeholder="e.g. 15"
                  value={globalThreshold}
                  onChange={e => setGlobalThreshold(e.target.value ? Number(e.target.value) : "")}
                  className="w-full sm:w-32 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <p className="text-sm text-gray-600">
                  {globalThreshold !== ""
                    ? `Stock ≤ ${globalThreshold} → Critical`
                    : "Using default: ≤5 Critical, ≤10 Low"}
                </p>
              </div>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-800 rounded-xl flex items-center gap-3">
              <AlertCircle size={20} />
              {error}
            </div>
          )}

          {/* Search + Actions */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder="Search title or SKU..."
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                disabled={selectedRows.length === 0}
                onClick={() => setShowUpdateModal(true)}
                className={`px-5 py-2.5 rounded-lg font-medium flex items-center gap-2 transition ${
                  selectedRows.length === 0
                    ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                    : "bg-green-600 text-white hover:bg-green-700"
                }`}
              >
                Update ({selectedRows.length})
              </button>

              <button
                onClick={() => setShowExportModal(true)}
                className="px-5 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 flex items-center gap-2"
              >
                <Download size={18} />
                Export
              </button>
            </div>
          </div>

          {/* Loading */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="w-12 h-12 animate-spin text-blue-600 mb-4" />
              <p className="text-gray-600">Loading inventory...</p>
            </div>
          ) : filteredInventory.length === 0 ? (
            <div className="bg-white rounded-xl p-10 text-center border border-gray-200">
              <p className="text-gray-500 text-lg">No books found</p>
              {searchTerm && <p className="text-sm mt-2">Try different search term</p>}
            </div>
          ) : (
            <>
              {/* Desktop Table - md+ */}
              <div className="hidden md:block bg-white rounded-xl border shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3.5 text-left w-10">
                          <input
                            type="checkbox"
                            checked={selectedRows.length === filteredInventory.length && filteredInventory.length > 0}
                            onChange={e => {
                              setSelectedRows(e.target.checked ? filteredInventory.map(i => i.id) : []);
                            }}
                          />
                        </th>
                        <th className="px-4 py-3.5 text-left w-24">Cover</th>
                        <th className="px-4 py-3.5 text-left">Title</th>
                        <th className="px-4 py-3.5 text-left">SKU</th>
                        <th className="px-4 py-3.5 text-left">Price</th>
                        <th className="px-4 py-3.5 text-left">Stock</th>
                        <th className="px-4 py-3.5 text-left">Level</th>
                        <th className="px-4 py-3.5 text-left">Alert</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {filteredInventory.map(item => (
                        <tr key={item.id} className="hover:bg-gray-50">
                          <td className="px-4 py-4">
                            <input
                              type="checkbox"
                              checked={selectedRows.includes(item.id)}
                              onChange={() => setSelectedRows(prev =>
                                prev.includes(item.id) ? prev.filter(id => id !== item.id) : [...prev, item.id]
                              )}
                            />
                          </td>
                          <td className="px-4 py-4">
                            <div className="w-14 h-20 rounded overflow-hidden border bg-gray-50">
                              <img
                                src={item.coverImage || PLACEHOLDER_IMAGE}
                                alt={item.title}
                                className="w-full h-full object-cover"
                                loading="lazy"
                              />
                            </div>
                          </td>
                          <td className="px-4 py-4 font-medium text-gray-900 max-w-xs truncate">{item.title}</td>
                          <td className="px-4 py-4 text-sm font-mono text-gray-600">{item.sku}</td>
                          <td className="px-4 py-4 font-medium">OMR {item.price}</td>
                          <td className="px-4 py-4 font-medium">{item.stockQuantity}</td>
                          <td className="px-4 py-4">
                            <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium border ${getStockLevelColor(item.stockLevel)}`}>
                              {item.stockLevel}
                            </span>
                          </td>
                          <td className="px-4 py-4">
                            <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium border ${
                              item.restockAlert ? "bg-red-100 text-red-800 border-red-300" : "bg-gray-100 text-gray-600 border-gray-300"
                            }`}>
                              {item.restockAlert ? "Yes" : "No"}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Mobile Cards */}
              <div className="md:hidden space-y-4">
                {filteredInventory.map(item => (
                  <div
                    key={item.id}
                    className="bg-white rounded-xl border shadow-sm p-4 flex gap-4"
                  >
                    {/* Checkbox + Image */}
                    <div className="flex flex-col items-center gap-2">
                      <input
                        type="checkbox"
                        checked={selectedRows.includes(item.id)}
                        onChange={() => setSelectedRows(prev =>
                          prev.includes(item.id) ? prev.filter(id => id !== item.id) : [...prev, item.id]
                        )}
                        className="mt-1"
                      />
                      <div className="w-20 h-28 rounded overflow-hidden border bg-gray-50 flex-shrink-0">
                        <img
                          src={item.coverImage || PLACEHOLDER_IMAGE}
                          alt={item.title}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0 space-y-1.5">
                      <h3 className="font-medium text-gray-900 line-clamp-2">{item.title}</h3>
                      <p className="text-sm text-gray-600 font-mono">{item.sku}</p>
                      <p className="text-sm font-medium">OMR {item.price}</p>

                      <div className="flex flex-wrap gap-2 pt-1">
                        <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStockLevelColor(item.stockLevel)}`}>
                          {item.stockLevel}
                        </span>
                        <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                          item.restockAlert ? "bg-red-100 text-red-800 border-red-300" : "bg-gray-100 text-gray-600 border-gray-300"
                        }`}>
                          Alert: {item.restockAlert ? "Yes" : "No"}
                        </span>
                      </div>

                      <p className="text-sm text-gray-600 pt-1">
                        Stock: <span className="font-medium">{item.stockQuantity}</span>
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Update Modal */}
      {showUpdateModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <h2 className="text-xl font-bold mb-5">Bulk Update Selected Books</h2>

            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Add Stock (increment)</label>
                <input
                  type="number"
                  min="0"
                  placeholder="e.g. 50"
                  value={addedStock}
                  onChange={e => setAddedStock(e.target.value ? Number(e.target.value) : "")}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">New Price (override)</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="e.g. 12.99"
                  value={updatedPrice}
                  onChange={e => setUpdatedPrice(e.target.value ? Number(e.target.value) : "")}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-8">
              <button
                onClick={() => {
                  setShowUpdateModal(false);
                  setUpdatedPrice("");
                  setAddedStock("");
                }}
                className="px-6 py-2.5 border rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateStock}
                disabled={updating || (updatedPrice === "" && addedStock === "")}
                className={`px-6 py-2.5 rounded-lg text-white font-medium flex items-center gap-2 min-w-[100px] justify-center ${
                  updating || (updatedPrice === "" && addedStock === "")
                    ? "bg-green-400 cursor-not-allowed"
                    : "bg-green-600 hover:bg-green-700"
                }`}
              >
                {updating && <Loader2 className="w-4 h-4 animate-spin" />}
                Update
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Export Modal */}
      {showExportModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl">
            <h2 className="text-xl font-bold mb-5">Export Report</h2>
            <div className="space-y-2">
              {(["today", "weekly", "monthly"] as const).map(period => (
                <button
                  key={period}
                  onClick={() => exportInventory(period)}
                  className="w-full text-left px-5 py-3.5 rounded-xl hover:bg-gray-50 font-medium transition"
                >
                  {period === "today" ? "Today" :
                   period === "weekly" ? "Last 7 days" : "Last 30 days"}
                </button>
              ))}
            </div>
            <button
              onClick={() => setShowExportModal(false)}
              className="mt-6 w-full text-center text-gray-500 hover:text-gray-700 py-2"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default InventoryCheck;