import React from "react";
import { NavLink } from "react-router-dom";
import {
  Home,
  ShoppingCart,
  Users,
  Book,
  Truck,
  BookPlus,
  Printer,
  Import,
  ListChecks,
  Package,
  Pencil,
  LogOut // Added Icon
} from "lucide-react";

interface SidebarItem {
  icon: React.ReactNode;
  label: string;
  path: string;
}

// Added interface for props
interface SidebarProps {
  onLogout?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ onLogout }) => {
  const menuItems: SidebarItem[] = [
    { icon: <Home size={20} />, label: "Dashboard", path: "/dashboard" },
    { icon: <Pencil size={20} />, label: "Homepage Editor", path: "/admin/homepageEditor" },
    { icon: <Users size={20} />, label: "Users Management", path: "/admin/users" },
    { icon: <Book size={20} />, label: "Books Management", path: "/admin/books" },
    { icon: <BookPlus size={20} />, label: "Add Books", path: "/admin/addbookpage" },
    { icon: <ShoppingCart size={20} />, label: "Orders Management", path: "/admin/orders" },
    { icon: <Import size={20} />, label: "Incoming Orders", path: "/warehouse/incomingorders" },
    { icon: <Package size={20} />, label: "Pick and Pack", path: "/warehouse/pickandpack" },
    { icon: <Printer size={20} />, label: "Generate Label", path: "/warehouse/generatelabel" },
    { icon: <Truck size={20} />, label: "Shipping ", path: "/admin/shippingqueue" },
    { icon: <ListChecks size={20} />, label: "Inventory Check", path: "/warehouse/inventorycheck" },
  ];

  return (
    <div className="w-64 bg-white border-r border-gray-200 h-screen fixed left-0 top-0 hidden lg:flex flex-col justify-between">
      <div>
        <div className="p-6">
          <h1 className="text-xl font-semibold text-gray-900">
            Bookstore Admin
          </h1>
        </div>

        <nav className="px-3">
          {menuItems.map((item) => (
            <NavLink
              key={item.label}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 mb-1 rounded-lg transition-colors
                ${
                  isActive
                    ? "bg-gray-100 text-gray-900 font-medium"
                    : "text-gray-600 hover:bg-gray-50"
                }`
              }
            >
              {item.icon}
              <span className="text-sm font-medium">{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </div>

      {/* Logout Button Section */}
      <div className="p-4 border-t border-gray-200">
        <button
          onClick={onLogout}
          className="flex items-center gap-3 px-3 py-2.5 w-full rounded-lg transition-colors text-red-600 hover:bg-red-50"
        >
          <LogOut size={20} />
          <span className="text-sm font-medium">Logout</span>
        </button>
      </div>
    </div>
  );
};

// Updated props definition
interface MobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onLogout?: () => void;
}

const MobileSidebarDrawer: React.FC<MobileDrawerProps> = ({
  isOpen,
  onClose,
  onLogout
}) => {
  const menuItems: SidebarItem[] = [
    { icon: <Home size={20} />, label: "Dashboard", path: "/dashboard" },
    { icon: <Pencil size={20} />, label: "Homepage Editor", path: "/admin/homepageEditor" },
    { icon: <Users size={20} />, label: "Users Management", path: "/admin/users" },
    { icon: <Book size={20} />, label: "Books Management", path: "/admin/books" },
    { icon: <BookPlus size={20} />, label: "Add Books", path: "/admin/addbookpage" },
    { icon: <ShoppingCart size={20} />, label: "Orders Management", path: "/admin/orders" },
    { icon: <Import size={20} />, label: "Incoming Orders", path: "/warehouse/incomingorders" },
    { icon: <Package size={20} />, label: "Pick and Pack", path: "/warehouse/pickandpack" },
    { icon: <Printer size={20} />, label: "Generate Label", path: "/warehouse/generatelabel" },
    { icon: <Truck size={20} />, label: "Shipping ", path: "/admin/shippingqueue" },
    { icon: <ListChecks size={20} />, label: "Inventory Check", path: "/warehouse/inventorycheck" },
  ];

  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
        onClick={onClose}
      />
      <div className="fixed left-0 top-0 w-64 h-full bg-white z-50 lg:hidden flex flex-col justify-between">
        <div>
          <div className="p-6 flex items-center justify-between">
            <h1 className="text-xl font-semibold text-gray-900">
              Bookstore Admin
            </h1>
            <button onClick={onClose} className="p-1">
              {/* <X size={24} /> */}
            </button>
          </div>

          <nav className="px-3">
            {menuItems.map((item) => (
              <NavLink
                key={item.label}
                to={item.path}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 mb-1 rounded-lg transition-colors
                  ${
                    isActive
                      ? "bg-gray-100 text-gray-900 font-medium"
                      : "text-gray-600 hover:bg-gray-50"
                  }`
                }
              >
                {item.icon}
                <span className="text-sm font-medium">{item.label}</span>
              </NavLink>
            ))}
          </nav>
        </div>

        {/* Mobile Logout Button */}
        <div className="p-4 border-t border-gray-200">
          <button
            onClick={onLogout}
            className="flex items-center gap-3 px-3 py-2.5 w-full rounded-lg transition-colors text-red-600 hover:bg-red-50"
          >
            <LogOut size={20} />
            <span className="text-sm font-medium">Logout</span>
          </button>
        </div>
      </div>
    </>
  );
};

export { Sidebar, MobileSidebarDrawer };