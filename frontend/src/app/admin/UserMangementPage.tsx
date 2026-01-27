"use client";

import React, { useEffect, useState } from "react";
import { Search, Menu, Phone, Trash2, User, Settings, Plus, ChevronLeft, ChevronRight } from "lucide-react";
import { Sidebar, MobileSidebarDrawer } from "../../components/layout/AdminSidebar";
import { fetchUsers, deleteUser, User as UserType } from "../../lib/usersapi";

// Admin Profile Interface - Updated to match backend response
interface AdminProfile {
  id: number;
  name: string;
  email: string;
  username: string | null;
  phoneNumber: string;
  role: string;
  emailVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

/* ================= COMPONENTS ================= */

// Admin Profile Modal Component
const AdminProfileModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  admin: AdminProfile | null;
  onUpdate: (updatedData: Partial<AdminProfile>) => Promise<void>;
  onChangePassword: (currentPassword: string, newPassword: string) => Promise<void>;
}> = ({ isOpen, onClose, admin, onUpdate, onChangePassword }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (admin) {
      setFormData({
        name: admin.name,
        email: admin.email,
      });
    }
    setError("");
    setSuccess("");
  }, [admin]);

  const handleProfileUpdate = async () => {
    if (!formData.name.trim() || !formData.email.trim()) {
      setError("Name and email are required");
      return;
    }

    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      setError("Please enter a valid email");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");
    try {
      await onUpdate(formData);
      setSuccess("Profile updated successfully!");
      setTimeout(() => {
        setIsEditing(false);
        setSuccess("");
      }, 1500);
    } catch (err: any) {
      setError(err.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async () => {
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      setError("All password fields are required");
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError("New passwords do not match");
      return;
    }

    if (passwordData.newPassword.length < 8) {
      setError("New password must be at least 8 characters");
      return;
    }

    // Password strength validation
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(passwordData.newPassword)) {
      setError(
        "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"
      );
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");
    try {
      await onChangePassword(passwordData.currentPassword, passwordData.newPassword);
      setSuccess("Password changed successfully!");
      setTimeout(() => {
        setIsChangingPassword(false);
        setSuccess("");
        setPasswordData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
      }, 1500);
    } catch (err: any) {
      setError(err.message || "Failed to change password. Please check your current password.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !admin) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Admin Profile</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              ×
            </button>
          </div>

          {/* Success Message */}
          {success && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm">
              {success}
            </div>
          )}

          {/* Profile Info */}
          {!isEditing && !isChangingPassword && (
            <>
              <div className="flex items-center gap-4 mb-6">
                <div className="w-20 h-20 bg-[#2E4A3D] rounded-full flex items-center justify-center text-white text-2xl font-bold">
                  {admin.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-xl font-semibold">{admin.name}</h3>
                  <p className="text-gray-600">{admin.email}</p>
                  <span className="inline-block px-3 py-1 bg-[#F5EBDD] text-[#2E4A3D] text-xs font-medium rounded-full mt-2">
                    {admin.role}
                  </span>
                </div>
              </div>

              <div className="space-y-4 mb-6">
                <div className="flex justify-between py-2 border-b">
                  <span className="text-gray-600">Role</span>
                  <span className="font-medium capitalize">{admin.role.toLowerCase()}</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-gray-600">Username</span>
                  <span className="font-medium">{admin.username || "Not set"}</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-gray-600">Email Verified</span>
                  <span className={`font-medium ${admin.emailVerified ? "text-green-600" : "text-yellow-600"}`}>
                    {admin.emailVerified ? "Verified" : "Not Verified"}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-gray-600">Member Since</span>
                  <span className="font-medium">
                    {new Date(admin.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-gray-600">Last Updated</span>
                  <span className="font-medium">
                    {new Date(admin.updatedAt).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex-1 bg-[#2E4A3D] text-white py-3 rounded-lg hover:bg-[#1a3528] transition-colors"
                >
                  Edit Profile
                </button>
                <button
                  onClick={() => setIsChangingPassword(true)}
                  className="flex-1 border border-[#2E4A3D] text-[#2E4A3D] py-3 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Change Password
                </button>
              </div>
            </>
          )}

          {/* Edit Profile Form */}
          {isEditing && (
            <>
              <h3 className="text-lg font-semibold mb-4">Edit Profile</h3>
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Name
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2E4A3D] focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2E4A3D] focus:border-transparent"
                  />
                </div>
              </div>
              {error && <p className="text-red-600 text-sm mb-4">{error}</p>}
              <div className="flex gap-3">
                <button
                  onClick={handleProfileUpdate}
                  disabled={loading}
                  className="flex-1 bg-[#2E4A3D] text-white py-3 rounded-lg hover:bg-[#1a3528] transition-colors disabled:opacity-50"
                >
                  {loading ? "Saving..." : "Save Changes"}
                </button>
                <button
                  onClick={() => {
                    setIsEditing(false);
                    setError("");
                    setSuccess("");
                  }}
                  className="flex-1 border border-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </>
          )}

          {/* Change Password Form */}
          {isChangingPassword && (
            <>
              <h3 className="text-lg font-semibold mb-4">Change Password</h3>
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Current Password
                  </label>
                  <input
                    type="password"
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                    placeholder="Enter your current password"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2E4A3D] focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    New Password
                  </label>
                  <input
                    type="password"
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                    placeholder="At least 8 characters with uppercase, lowercase, number, and special character"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2E4A3D] focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                    placeholder="Confirm your new password"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2E4A3D] focus:border-transparent"
                  />
                </div>
              </div>
              {error && <p className="text-red-600 text-sm mb-4">{error}</p>}
              <div className="flex gap-3">
                <button
                  onClick={handlePasswordChange}
                  disabled={loading}
                  className="flex-1 bg-[#2E4A3D] text-white py-3 rounded-lg hover:bg-[#1a3528] transition-colors disabled:opacity-50"
                >
                  {loading ? "Changing..." : "Change Password"}
                </button>
                <button
                  onClick={() => {
                    setIsChangingPassword(false);
                    setError("");
                    setSuccess("");
                    setPasswordData({
                      currentPassword: "",
                      newPassword: "",
                      confirmPassword: "",
                    });
                  }}
                  className="flex-1 border border-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

// Create Admin Modal Component
const CreateAdminModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onCreate: (adminData: { name: string; email: string; password: string }) => Promise<void>;
}> = ({ isOpen, onClose, onCreate }) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.email.trim() || !formData.password) {
      setError("All fields are required");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    // Password strength validation
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(formData.password)) {
      setError(
        "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"
      );
      return;
    }

    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      setError("Please enter a valid email");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");
    try {
      await onCreate({
        name: formData.name,
        email: formData.email,
        password: formData.password,
      });
      setSuccess("New admin created successfully!");
      setTimeout(() => {
        onClose();
        setFormData({
          name: "",
          email: "",
          password: "",
          confirmPassword: "",
        });
        setSuccess("");
      }, 1500);
    } catch (err: any) {
      setError(err.message || "Failed to create admin. The email might already be in use.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Create New Admin</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              ×
            </button>
          </div>

          {success && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter admin name"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2E4A3D] focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="admin@bookstore.com"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2E4A3D] focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="At least 8 characters with uppercase, lowercase, number, and special character"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2E4A3D] focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirm Password
              </label>
              <input
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                placeholder="Confirm password"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2E4A3D] focus:border-transparent"
                required
              />
            </div>

            {error && <p className="text-red-600 text-sm">{error}</p>}

            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-[#2E4A3D] text-white py-3 rounded-lg hover:bg-[#1a3528] transition-colors disabled:opacity-50"
              >
                {loading ? "Creating..." : "Create Admin"}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="flex-1 border border-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

// Search Bar Component
const SearchBar: React.FC<{
  value: string;
  onChange: (value: string) => void;
}> = ({ value, onChange }) => (
  <div className="relative">
    <Search
      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
      size={20}
    />
    <input
      type="text"
      placeholder="Search users..."
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-200 shadow-sm"
    />
  </div>
);

// Pagination Component
const Pagination: React.FC<{
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}> = ({ currentPage, totalPages, onPageChange }) => {
  const pages = [];
  const maxVisiblePages = 5;
  
  let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
  let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
  
  if (endPage - startPage + 1 < maxVisiblePages) {
    startPage = Math.max(1, endPage - maxVisiblePages + 1);
  }

  for (let i = startPage; i <= endPage; i++) {
    pages.push(i);
  }

  return (
    <div className="flex items-center justify-between border-t border-gray-200 px-4 py-3 sm:px-6">
      <div className="flex flex-1 justify-between sm:hidden">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Previous
        </button>
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next
        </button>
      </div>
      <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-gray-700">
            Showing page <span className="font-medium">{currentPage}</span> of{" "}
            <span className="font-medium">{totalPages}</span>
          </p>
        </div>
        <div>
          <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
            <button
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="sr-only">Previous</span>
              <ChevronLeft className="h-5 w-5" aria-hidden="true" />
            </button>
            
            {pages.map((page) => (
              <button
                key={page}
                onClick={() => onPageChange(page)}
                className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${
                  currentPage === page
                    ? "z-10 bg-[#2E4A3D] text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2E4A3D]"
                    : "text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0"
                }`}
              >
                {page}
              </button>
            ))}
            
            <button
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="sr-only">Next</span>
              <ChevronRight className="h-5 w-5" aria-hidden="true" />
            </button>
          </nav>
        </div>
      </div>
    </div>
  );
};

// Desktop Row Component
const UserRow: React.FC<{ user: UserType; onDelete: (id: string) => void }> = ({
  user,
  onDelete,
}) => (
  <tr className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
    <td className="px-6 py-4 text-sm font-medium text-gray-900">{user.name}</td>
    <td className="px-6 py-4 text-sm text-gray-600">{user.email}</td>
    <td className="px-6 py-4 text-sm text-gray-600 font-mono">
      {user.mobile}
    </td>
    <td className="px-6 py-4 text-sm text-gray-600">
      {user.registrationDate}
    </td>
    <td className="px-6 py-4 text-right">
      <button
        onClick={() => onDelete(user.id)}
        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
        title="Delete User"
      >
        <Trash2 size={18} />
      </button>
    </td>
  </tr>
);

// Mobile Card Component
const UserCard: React.FC<{ user: UserType; onDelete: (id: string) => void }> = ({
  user,
  onDelete,
}) => (
  <div className="bg-white p-4 rounded-lg border border-gray-200 mb-3 shadow-sm">
    <div className="flex justify-between items-start mb-3">
      <div className="min-w-0 pr-4">
        <h3 className="font-semibold text-gray-900 truncate">
          {user.name}
        </h3>
        <p className="text-sm text-gray-500 truncate">{user.email}</p>
      </div>
      <div className="flex flex-col items-end gap-2">
        {/* Delete Button for Mobile */}
        <button
          onClick={() => onDelete(user.id)}
          className="flex items-center gap-1 text-xs text-red-600 font-medium hover:underline mt-1"
        >
          <Trash2 size={14} />
          Delete
        </button>
      </div>
    </div>

    <div className="space-y-2 text-sm text-gray-600 bg-gray-50 p-3 rounded">
      <div className="flex items-center">
        <Phone size={14} className="text-gray-400 mr-2" />
        <span className="text-gray-700 font-medium">{user.mobile}</span>
      </div>

      <div className="flex items-center pt-2 border-t border-gray-200">
        <span className="text-gray-500 font-medium mr-2">
          Registered:
        </span>
        {user.registrationDate}
      </div>
    </div>
  </div>
);

// Table Wrapper Component
const UserTable: React.FC<{ users: UserType[]; onDelete: (id: string) => void }> = ({
  users,
  onDelete,
}) => (
  <>
    {/* Mobile */}
    <div className="block lg:hidden">
      {users.map((user) => (
        <UserCard key={user.id} user={user} onDelete={onDelete} />
      ))}
    </div>

    {/* Desktop */}
    <div className="hidden lg:block bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
      <table className="w-full">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase">
              Name
            </th>
            <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase">
              Email
            </th>
            <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase">
              Mobile Number
            </th>
            <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase">
              Registration Date
            </th>
            <th className="px-6 py-3 text-right text-sm font-medium text-gray-500 uppercase">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <UserRow key={user.id} user={user} onDelete={onDelete} />
          ))}
        </tbody>
      </table>
    </div>
  </>
);

/* ================= MAIN PAGE COMPONENT ================= */

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<UserType[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserType[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  // Modal states
  const [showAdminProfile, setShowAdminProfile] = useState(false);
  const [showCreateAdmin, setShowCreateAdmin] = useState(false);
  
  // Admin profile state
  const [adminProfile, setAdminProfile] = useState<AdminProfile | null>(null);

  // Fetch users
  useEffect(() => {
    const loadUsers = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchUsers();
        setUsers(data);
      } catch (err) {
        console.error("Failed to fetch users", err);
        setError("Couldn't load users—check your connection or login status.");
      } finally {
        setLoading(false);
      }
    };

    loadUsers();
  }, []);

  // Fetch admin profile - UPDATED ENDPOINT
  const fetchAdminProfile = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/auth/admin/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch admin profile');
      }
      
      const data = await response.json();
      setAdminProfile(data.data); // Note: backend returns { success: true, data: {...} }
    } catch (err: any) {
      console.error("Failed to fetch admin profile", err);
      alert(err.message || "Failed to load admin profile. Please try again.");
    }
  };

  // Filter users based on search
  useEffect(() => {
    const filtered = users.filter(
      (user) =>
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.mobile.includes(searchQuery)
    );
    setFilteredUsers(filtered);
    setCurrentPage(1); // Reset to first page when searching
  }, [searchQuery, users]);

  // Calculate pagination
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedUsers = filteredUsers.slice(startIndex, startIndex + itemsPerPage);

  // Handle delete user
  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this user? This cannot be undone.")) {
      return;
    }

    const previousUsers = [...users];
    setUsers((prevUsers) => prevUsers.filter((user) => user.id !== id));

    try {
      await deleteUser(id);
    } catch (error) {
      console.error("Delete failed:", error);
      alert("Failed to delete user. Please try again.");
      setUsers(previousUsers);
    }
  };

  // Handle update admin profile - UPDATED ENDPOINT
  const handleUpdateProfile = async (updatedData: Partial<AdminProfile>) => {
    const token = localStorage.getItem('authToken');
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/auth/admin/profile`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updatedData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to update profile');
    }

    const data = await response.json();
    setAdminProfile(data.data); // Update with new data
    return data.data;
  };

  // Handle change password - UPDATED ENDPOINT
  const handleChangePassword = async (currentPassword: string, newPassword: string) => {
    const token = localStorage.getItem('authToken');
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/auth/admin/change-password`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ currentPassword, newPassword }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to change password');
    }

    const data = await response.json();
    return data;
  };

  // Handle create new admin - UPDATED ENDPOINT
  const handleCreateAdmin = async (adminData: { name: string; email: string; password: string }) => {
    const token = localStorage.getItem('authToken');
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/auth/admin/create`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(adminData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to create admin');
    }

    const data = await response.json();
    return data;
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col lg:flex-row">
      <MobileSidebarDrawer
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      <div className="hidden lg:block lg:w-64 lg:fixed lg:inset-y-0 lg:z-50">
        <Sidebar />
      </div>

      <div className="flex-1 flex flex-col lg:ml-64">
        {/* Mobile Header */}
        <div className="lg:hidden sticky top-0 z-30 bg-white border-b px-4 py-3 flex items-center gap-3">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <Menu size={24} />
          </button>
          <h1 className="text-lg font-semibold">User Management</h1>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          {/* Header with Admin Profile and Create Admin buttons */}
          <div className="flex flex-col sm:flex-row sm:justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold hidden lg:block">
                User Management
              </h1>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => {
                  fetchAdminProfile();
                  setShowAdminProfile(true);
                }}
                className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <User size={20} />
                Admin Profile
              </button>
              <button
                onClick={() => setShowCreateAdmin(true)}
                className="flex items-center justify-center gap-2 px-4 py-2.5 bg-[#2E4A3D] text-white rounded-lg hover:bg-[#1a3528] transition-colors"
              >
                <Plus size={20} />
                Create Admin
              </button>
              <div className="w-full sm:w-72">
                <SearchBar value={searchQuery} onChange={setSearchQuery} />
              </div>
            </div>
          </div>

          {/* User Count */}
          <div className="mb-4 text-sm text-gray-600">
            Total Users: {filteredUsers.length}
          </div>

          {/* Main Content */}
          {loading ? (
            <p className="text-gray-500 text-center py-8">Loading users...</p>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
              {error}
              <button
                onClick={() => window.location.reload()}
                className="ml-2 underline hover:no-underline"
              >
                Retry
              </button>
            </div>
          ) : paginatedUsers.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 mb-2">
                {searchQuery ? `No users match "${searchQuery}".` : 'No users yet—time to invite some!'}
              </p>
            </div>
          ) : (
            <>
              <UserTable users={paginatedUsers} onDelete={handleDelete} />
              {totalPages > 1 && (
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                />
              )}
            </>
          )}
        </div>
      </div>

      {/* Admin Profile Modal */}
      <AdminProfileModal
        isOpen={showAdminProfile}
        onClose={() => setShowAdminProfile(false)}
        admin={adminProfile}
        onUpdate={handleUpdateProfile}
        onChangePassword={handleChangePassword}
      />

      {/* Create Admin Modal */}
      <CreateAdminModal
        isOpen={showCreateAdmin}
        onClose={() => setShowCreateAdmin(false)}
        onCreate={handleCreateAdmin}
      />
    </div>
  );
};

export default UserManagement;