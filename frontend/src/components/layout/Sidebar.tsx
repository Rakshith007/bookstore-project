// Sidebar.tsx

import React from "react";
import {
  User,
  Pencil,
  Lock,
  Bell,
  Shield,
  Package,
  History,
  LogOut,
} from "lucide-react";
import { useNavigate } from "react-router-dom"; // ← NEW
import { logout } from "../../lib/auth"; // ← NEW: Import logout function

export type SectionKey =
  | "account"
  | "edit-profile"
  | "privacy"
  | "notifications"
  | "security"
  | "orders"
  | "orders-history";

interface SidebarProps {
  currentSection: SectionKey;
  onSectionChange: (key: SectionKey) => void;
}

const sidebarItems = [
  { key: "account", label: "Account Info", icon: <User size={20} /> },
  { key: "edit-profile", label: "Edit Profile", icon: <Pencil size={20} /> },
  { key: "privacy", label: "Privacy Settings", icon: <Lock size={20} /> },
  { key: "notifications", label: "Notifications", icon: <Bell size={20} /> },
  { key: "security", label: "Security", icon: <Shield size={20} /> },
  { key: "orders", label: "Current Orders", icon: <Package size={20} /> },
  { key: "orders-history", label: "Order History", icon: <History size={20} /> },
];

const Sidebar: React.FC<SidebarProps> = ({ currentSection, onSectionChange }) => {
  const navigate = useNavigate(); // ← For redirecting after logout

  const handleLogout = () => {
    logout(); // Clears authToken from localStorage
    navigate('/login'); // Redirect to login page (change if needed)
    // Optional: You can also show a message
    // alert('You have been logged out successfully.');
  };

  return (
    <aside className="w-64 bg-white shadow-lg rounded-2xl m-4 p-5 flex flex-col h-[calc(100vh-32px)]">
      <h2 className="font-[ui-serif] font-semibold text-2xl mb-8 text-gray-900">
        Settings
      </h2>

      <nav className="space-y-1 flex-1">
        {sidebarItems.map((item) => (
          <button
            key={item.key}
            onClick={() => onSectionChange(item.key as SectionKey)}
            className={`w-full px-4 py-2.5 rounded-lg flex items-center gap-3 text-sm transition font-[ui-serif]
              ${
                currentSection === item.key
                  ? "bg-black text-white font-medium shadow-sm"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
          >
            {item.icon}
            <span>{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="pt-6 border-t mt-6">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-[ui-serif] font-medium text-red-600 hover:bg-red-50 transition"
        >
          <LogOut size={20} />
          Logout
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;