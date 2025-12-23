import React, { useState } from 'react';
import { Search, Menu, Phone } from 'lucide-react';
import { Sidebar, MobileSidebarDrawer } from '../../components/layout/AdminSidebar';

/* ================= TYPES ================= */

interface User {
  id: string;
  name: string;
  email: string;
  mobile: string; // Added mobile field
  registrationDate: string;
  status: 'Active' | 'Inactive';
}

/* ================= MOCK DATA ================= */

const mockUsers: User[] = [
  { id: '1', name: 'Owen Bennett', email: 'owen.bennett@email.com', mobile: '+1 (555) 123-4567', registrationDate: '2023-01-15', status: 'Active' },
  { id: '2', name: 'Chloe Carter', email: 'chloe.carter@email.com', mobile: '+1 (555) 234-5678', registrationDate: '2023-02-20', status: 'Active' },
  { id: '3', name: 'Ethan Davis', email: 'ethan.davis@email.com', mobile: '+1 (555) 345-6789', registrationDate: '2023-03-10', status: 'Inactive' },
  { id: '4', name: 'Lily Foster', email: 'lily.foster@email.com', mobile: '+1 (555) 456-7890', registrationDate: '2023-04-05', status: 'Active' },
  { id: '5', name: 'Caleb Green', email: 'caleb.green@email.com', mobile: '+1 (555) 567-8901', registrationDate: '2023-05-12', status: 'Active' },
  { id: '6', name: 'Hannah Hill', email: 'hannah.hill@email.com', mobile: '+1 (555) 678-9012', registrationDate: '2023-06-18', status: 'Inactive' },
  { id: '7', name: 'Nathan Knight', email: 'nathan.knight@email.com', mobile: '+1 (555) 789-0123', registrationDate: '2023-07-22', status: 'Active' },
  { id: '8', name: 'Grace Lewis', email: 'grace.lewis@email.com', mobile: '+1 (555) 890-1234', registrationDate: '2023-08-30', status: 'Active' },
  { id: '9', name: 'Elijah Morgan', email: 'elijah.morgan@email.com', mobile: '+1 (555) 901-2345', registrationDate: '2023-09-14', status: 'Inactive' },
  { id: '10', name: 'Avery Reed', email: 'avery.reed@email.com', mobile: '+1 (555) 012-3456', registrationDate: '2023-10-01', status: 'Active' },
];

/* ================= COMPONENTS ================= */

// Status Badge
const StatusBadge = ({ status }: { status: User['status'] }) => (
  <span
    className={`inline-flex px-3 py-1 text-xs font-medium rounded-full ${
      status === 'Active'
        ? 'bg-green-100 text-green-700'
        : 'bg-gray-100 text-gray-700'
    }`}
  >
    {status}
  </span>
);

// Search Bar
const SearchBar: React.FC<{ value: string; onChange: (value: string) => void }> = ({
  value,
  onChange,
}) => (
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

// Desktop Row (Updated with Mobile Column)
const UserRow: React.FC<{ user: User }> = ({ user }) => (
  <tr className="border-b border-gray-200 hover:bg-gray-50">
    <td className="px-6 py-4 text-sm font-medium text-gray-900">{user.name}</td>
    <td className="px-6 py-4 text-sm text-gray-600">{user.email}</td>
    <td className="px-6 py-4 text-sm text-gray-600 font-mono">{user.mobile}</td> {/* Added Mobile Cell */}
    <td className="px-6 py-4 text-sm text-gray-600">{user.registrationDate}</td>
    <td className="px-6 py-4">
      <StatusBadge status={user.status} />
    </td>
  </tr>
);

// Mobile Card (Updated with Mobile Field)
const UserCard: React.FC<{ user: User }> = ({ user }) => (
  <div className="bg-white p-4 rounded-lg border border-gray-200 mb-3 shadow-sm">
    <div className="flex justify-between items-start mb-3">
      <div className="min-w-0 pr-4">
        <h3 className="font-semibold text-gray-900 truncate">{user.name}</h3>
        <p className="text-sm text-gray-500 truncate">{user.email}</p>
      </div>
      <StatusBadge status={user.status} />
    </div>

    <div className="space-y-2 text-sm text-gray-600 bg-gray-50 p-3 rounded">
       {/* Added Mobile Row */}
      <div className="flex items-center">
        <Phone size={14} className="text-gray-400 mr-2" />
        <span className="text-gray-700 font-medium">{user.mobile}</span>
      </div>
      <div className="flex items-center pt-2 border-t border-gray-200">
        <span className="text-gray-500 font-medium mr-2">Registered:</span>
        {user.registrationDate}
      </div>
    </div>
  </div>
);

// Table Wrapper
const UserTable: React.FC<{ users: User[] }> = ({ users }) => (
  <>
    {/* Mobile */}
    <div className="block lg:hidden">
      {users.map((user) => (
        <UserCard key={user.id} user={user} />
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
            {/* Added Mobile Header */}
            <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase">
              Mobile Number
            </th>
            <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase">
              Registration Date
            </th>
            <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase">
              Status
            </th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <UserRow key={user.id} user={user} />
          ))}
        </tbody>
      </table>
    </div>
  </>
);

/* ================= PAGE ================= */

const UserManagement: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const filteredUsers = mockUsers.filter(
    (user) =>
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.mobile.includes(searchQuery)
  );

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
          <div className="flex flex-col sm:flex-row sm:justify-between gap-4 mb-8">
            <h1 className="text-3xl font-bold hidden lg:block">User Management</h1>
            <div className="w-full sm:w-72">
              <SearchBar value={searchQuery} onChange={setSearchQuery} />
            </div>
          </div>

          <UserTable users={filteredUsers} />
        </div>
      </div>
    </div>
  );
};

export default UserManagement;