import React, { useState, useEffect } from "react";
import { Search, Menu, Loader2 } from "lucide-react";
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

  // Persistent global threshold
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

  // Circular placeholder
  const PLACEHOLDER_IMAGE = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAiIGhlaWdodD0iODAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0iI2NjY2NjYyIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LXNpemU9IjEyIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSIgZmlsbD0iIzk5OSI+Tm8gQ292ZXI8L3RleHQ+PC9zdmc+';

  /* =========================================================
     FETCH INVENTORY DATA
  ========================================================= */
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
          if (stock <= threshold) {
            stockLevel = "Critical";
          }
        } else {
          if (stock <= 5) stockLevel = "Critical";
          else if (stock <= 10) stockLevel = "Low";
        }

        const restockAlert = threshold !== null && stock <= threshold;

        return {
          ...book,
          stockLevel,
          restockAlert,
        };
      });

      setInventoryData(processed);
      setError(null);
    } catch (err: any) {
      setError(err.message || "Failed to load inventory");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, [globalThreshold]);

  /* =========================================================
     HELPERS
  ========================================================= */
  const getStockLevelColor = (level: string) => {
    switch (level) {
      case "Critical":
        return "bg-red-50 text-red-700";
      case "Low":
        return "bg-orange-50 text-orange-700";
      case "In Stock":
        return "bg-green-50 text-green-700";
      default:
        return "bg-gray-50 text-gray-700";
    }
  };

  const filteredInventory = inventoryData.filter(
    (item) =>
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

  /* =========================================================
     BULK UPDATE STOCK & PRICE
  ========================================================= */
  const handleUpdateStock = async () => {
    if (selectedRows.length === 0) return;

    setUpdating(true);
    try {
      const token = getToken();
      if (!token) throw new Error("Authentication required");

      const payload: { price?: number; addedStock?: number } = {};

      if (updatedPrice !== "") {
        payload.price = updatedPrice;
      }
      if (addedStock !== "") {
        payload.addedStock = addedStock;
      }

      if (Object.keys(payload).length === 0) {
        setError("Please enter price or stock to update");
        return;
      }

      await Promise.all(
        selectedRows.map(async (bookId) => {
          const response = await fetch(`${API_BASE_URL}/books/${bookId}/inventory`, {
            method: "PATCH",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
          });

          if (!response.ok) {
            const err = await response.json().catch(() => ({}));
            throw new Error(err.message || `Failed to update book ${bookId}`);
          }
        })
      );

      await fetchInventory();

      setSelectedRows([]);
      setUpdatedPrice("");
      setAddedStock("");
      setShowUpdateModal(false);
      setError(null);
    } catch (err: any) {
      setError(err.message || "Failed to update inventory");
    } finally {
      setUpdating(false);
    }
  };

  /* =========================================================
     EXPORT INVENTORY - PROFESSIONAL & ALIGNED
  ========================================================= */
  const exportInventory = (period: "today" | "weekly" | "monthly") => {
    const now = new Date();
    let label = "Today";

    if (period === "weekly") {
      label = "Last 7 Days";
    }
    if (period === "monthly") {
      label = "Last 30 Days";
    }

    const thresholdText = globalThreshold !== "" 
      ? `≤ ${globalThreshold} (Critical)` 
      : "Default (≤5 Critical, ≤10 Low)";

    // Define exact headers
    const headers = [
      "Book Title",
      "SKU",
      "Price (₹)",
      "Current Stock",
      "Stock Level",
      "Restock Alert",
    ];

    // Map data exactly to headers
    const dataRows = filteredInventory.map((item) => [
      item.title,
      item.sku,
      item.price,
      item.stockQuantity,
      item.stockLevel,
      item.restockAlert ? "Yes" : "No",
    ]);

    // Create worksheet
    const ws = XLSX.utils.aoa_to_sheet([
      ["INVENTORY REPORT"],
      [`Period: ${label}`],
      [`Generated: ${now.toLocaleString()}`],
      [`Global Threshold: ${thresholdText}`],
      [`Total Books: ${filteredInventory.length}`],
      [], // Empty row
      headers, // Header row
      ...dataRows,
    ]);

    // Auto-size columns
    const colWidths = [
      { wch: 40 }, // Book Title
      { wch: 20 }, // SKU
      { wch: 15 }, // Price
      { wch: 15 }, // Stock
      { wch: 15 }, // Stock Level
      { wch: 15 }, // Restock Alert
    ];
    ws['!cols'] = colWidths;

    // Style header row (row 7 = index 6)
    const headerRange = { s: { c: 0, r: 6 }, e: { c: headers.length - 1, r: 6 } };
    for (let C = headerRange.s.c; C <= headerRange.e.c; ++C) {
      const cellAddress = XLSX.utils.encode_cell({ c: C, r: 6 });
      if (!ws[cellAddress]) ws[cellAddress] = {};
      ws[cellAddress].s = {
        font: { bold: true, color: { rgb: "FFFFFF" } },
        fill: { fgColor: { rgb: "1E40AF" } },
        alignment: { horizontal: "center", vertical: "center" },
      };
    }

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Inventory Report");

    const fileName = `Inventory_Report_${label.replace(/ /g, "_")}_${now.toISOString().slice(0, 10)}.xlsx`;
    XLSX.writeFile(wb, fileName);

    setShowExportModal(false);
  };

  /* =========================================================
     RENDER
  ========================================================= */
  return (
    <div className="min-h-screen bg-gray-50 font-serif">
      <div className="hidden lg:block font-sans">
        <Sidebar />
      </div>

      <MobileSidebarDrawer isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      {/* Mobile Header */}
      <div className="lg:hidden sticky top-0 z-30 bg-white border-b px-4 py-3 flex items-center gap-3 font-sans">
        <button onClick={() => setIsSidebarOpen(true)} className="p-2 hover:bg-gray-100 rounded-lg">
          <Menu size={22} />
        </button>
        <h1 className="text-lg font-bold font-serif">Inventory Check</h1>
      </div>

      {/* Main Content */}
      <div className="lg:ml-64 p-4 md:p-6 lg:p-8">
        <h1 className="hidden lg:block text-3xl font-bold mb-6">Inventory Check</h1>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-800 rounded-lg">
            {error}
          </div>
        )}

        {/* Global Threshold Input */}
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <label className="block text-sm font-medium text-blue-900 mb-2">
            Global Restock Threshold (applies to all books)
          </label>
          <div className="flex items-center gap-3">
            <input
              type="number"
              min="0"
              placeholder="e.g., 15"
              value={globalThreshold}
              onChange={(e) => setGlobalThreshold(e.target.value ? Number(e.target.value) : "")}
              className="w-32 px-4 py-2 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
            <p className="text-sm text-blue-800">
              {globalThreshold !== "" 
                ? `Books with stock ≤ ${globalThreshold} → Critical + Restock Alert = Yes`
                : "No threshold set — using default (≤5 Critical, ≤10 Low)"}
            </p>
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-6 font-sans">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-green-600" />
          <input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by book title or SKU..."
            className="w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none"
          />
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="flex flex-col items-center py-12">
            <Loader2 className="w-12 h-12 animate-spin text-green-600" />
            <p className="mt-4 text-gray-600">Loading inventory...</p>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden md:block bg-white rounded-lg border shadow-sm overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-4 py-4 text-left">
                      <input
                        type="checkbox"
                        checked={selectedRows.length === filteredInventory.length && filteredInventory.length > 0}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedRows(filteredInventory.map((i) => i.id));
                          } else {
                            setSelectedRows([]);
                          }
                        }}
                      />
                    </th>
                    <th className="px-4 py-4 text-left">Cover</th>
                    <th className="px-4 py-4 text-left">Book Title</th>
                    <th className="px-4 py-4 text-left">SKU</th>
                    <th className="px-4 py-4 text-left">Price</th>
                    <th className="px-4 py-4 text-left">Stock</th>
                    <th className="px-4 py-4 text-left">Stock Level</th>
                    <th className="px-4 py-4 text-left">Restock Alert</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredInventory.map((item, index) => (
                    <tr
                      key={item.id}
                      className={`hover:bg-gray-50 ${index !== filteredInventory.length - 1 ? "border-b" : ""}`}
                    >
                      <td className="px-4 py-4">
                        <input
                          type="checkbox"
                          checked={selectedRows.includes(item.id)}
                          onChange={() =>
                            setSelectedRows((prev) =>
                              prev.includes(item.id)
                                ? prev.filter((id) => id !== item.id)
                                : [...prev, item.id]
                            )
                          }
                        />
                      </td>
                      <td className="px-4 py-4">
                        <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-gray-200">
                          <img
                            src={item.coverImage || PLACEHOLDER_IMAGE}
                            alt={item.title}
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                        </div>
                      </td>
                      <td className="px-4 py-4 font-medium">{item.title}</td>
                      <td className="px-4 py-4 text-green-600 font-mono text-sm">{item.sku}</td>
                      <td className="px-4 py-4 font-medium">₹{item.price}</td>
                      <td className="px-4 py-4 font-medium">{item.stockQuantity}</td>
                      <td className="px-4 py-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${getStockLevelColor(
                            item.stockLevel
                          )}`}
                        >
                          {item.stockLevel}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            item.restockAlert
                              ? "bg-red-100 text-red-700"
                              : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {item.restockAlert ? "Yes" : "No"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-4 mt-6 font-sans">
              <button
                disabled={selectedRows.length === 0}
                onClick={() => setShowUpdateModal(true)}
                className={`px-6 py-3 rounded-lg font-medium transition ${
                  selectedRows.length === 0
                    ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                    : "bg-green-600 text-white hover:bg-green-700"
                }`}
              >
                Update Selected ({selectedRows.length})
              </button>

              <button
                onClick={() => setShowExportModal(true)}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
              >
                Export Inventory List
              </button>
            </div>
          </>
        )}
      </div>

      {/* UPDATE MODAL */}
      {showUpdateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl">
            <h2 className="text-xl font-bold mb-5">Update Selected Books</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Add Stock (increment)
                </label>
                <input
                  type="number"
                  min="0"
                  placeholder="e.g., 20"
                  value={addedStock}
                  onChange={(e) => setAddedStock(e.target.value ? Number(e.target.value) : "")}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none"
                />
                <p className="text-xs text-gray-500 mt-1">Leave blank to keep current stock</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  New Price (replace)
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="e.g., 499"
                  value={updatedPrice}
                  onChange={(e) => setUpdatedPrice(e.target.value ? Number(e.target.value) : "")}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none"
                />
                <p className="text-xs text-gray-500 mt-1">Leave blank to keep current price</p>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => {
                  setShowUpdateModal(false);
                  setUpdatedPrice("");
                  setAddedStock("");
                }}
                className="px-5 py-2 border rounded-lg hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateStock}
                disabled={updating || (updatedPrice === "" && addedStock === "")}
                className="px-5 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {updating && <Loader2 className="w-4 h-4 animate-spin" />}
                Update
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EXPORT MODAL */}
      {showExportModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-sm shadow-xl">
            <h2 className="text-xl font-bold mb-5">Export Inventory Report</h2>
            <div className="space-y-3">
              <button
                onClick={() => exportInventory("today")}
                className="w-full text-left px-4 py-3 rounded-lg hover:bg-gray-100 font-medium"
              >
                Today
              </button>
              <button
                onClick={() => exportInventory("weekly")}
                className="w-full text-left px-4 py-3 rounded-lg hover:bg-gray-100 font-medium"
              >
                Last 7 Days
              </button>
              <button
                onClick={() => exportInventory("monthly")}
                className="w-full text-left px-4 py-3 rounded-lg hover:bg-gray-100 font-medium"
              >
                Last 30 Days
              </button>
            </div>
            <button
              onClick={() => setShowExportModal(false)}
              className="mt-5 text-sm text-gray-500 w-full text-center"
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