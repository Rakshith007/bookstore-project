import React, { useState, useEffect } from 'react';
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { Menu } from 'lucide-react';
import { Sidebar, MobileSidebarDrawer } from '../../components/layout/AdminSidebar';

interface StatCardProps {
  title: string;
  value: string | number;
}

interface ChartData {
  name: string;
  value: number;
}

interface Order {
  id: string;
  customer: string;
  date: string;
  status: 'Shipped' | 'Processing' | 'Delivered';
  total: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value }) => {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
      <div className="text-gray-600 text-sm mb-2 font-medium">{title}</div>
      <div className="text-3xl font-semibold text-gray-900">{value}</div>
    </div>
  );
};

const salesData: ChartData[] = [
  { name: 'Jan', value: 35000 },
  { name: 'Feb', value: 42000 },
  { name: 'Mar', value: 38000 },
  { name: 'Apr', value: 41000 },
  { name: 'May', value: 35000 },
  { name: 'Jun', value: 48000 },
  { name: 'Jul', value: 40000 },
];

const genreData: ChartData[] = [
  { name: 'Fiction', value: 1800 },
  { name: 'Mystery', value: 1500 },
  { name: 'Sci-Fi', value: 1200 },
  { name: 'Romance', value: 1400 },
  { name: 'Thriller', value: 1100 },
  { name: 'Biography', value: 1500 },
];

const orders: Order[] = [
  { id: '#12345', customer: 'Emily Carter', date: '2024-07-26', status: 'Shipped', total: '$55.00' },
  { id: '#12346', customer: 'David Lee', date: '2024-07-25', status: 'Processing', total: '$75.00' },
  { id: '#12347', customer: 'Olivia Brown', date: '2024-07-24', status: 'Delivered', total: '$120.00' },
  { id: '#12348', customer: 'Ethan Clark', date: '2024-07-23', status: 'Shipped', total: '$90.00' },
  { id: '#12349', customer: 'Sophia Green', date: '2024-07-22', status: 'Processing', total: '$60.00' },
];

const DashboardPage: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [needsAdminSetup, setNeedsAdminSetup] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [checkingAdmin, setCheckingAdmin] = useState(true);

  const API_URL = 'http://localhost:4000'; // Change if your backend runs on different port

  // Check if admin exists and user is logged in
  useEffect(() => {
    const checkInitialState = async () => {
      setCheckingAdmin(true);
      const token = localStorage.getItem('authToken');
      
      if (token) {
        setIsLoggedIn(true);
        setCheckingAdmin(false);
        return;
      }

      try {
        // Check if any admin exists
        const response = await fetch(`${API_URL}/auth/admin/check-exists`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const data = await response.json();
          if (!data.exists) {
            setNeedsAdminSetup(true);
          }
        } else {
          console.error('Failed to check admin status');
        }
      } catch (err) {
        console.error('Error checking admin:', err);
        // If backend is not reachable, show login form anyway
      } finally {
        setCheckingAdmin(false);
      }
    };

    checkInitialState();
  }, []);

  const handleAdminSetup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/auth/admin/setup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          fullName, 
          email, 
          password 
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create admin account');
      }

      // Save token and mark as logged in
      localStorage.setItem('authToken', data.access_token);
      setIsLoggedIn(true);
      setNeedsAdminSetup(false);
    } catch (err: any) {
      setError(err.message || 'Failed to create admin account');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Invalid credentials');
      }

      // Save token and mark as logged in
      localStorage.setItem('authToken', data.access_token || data.token);
      setIsLoggedIn(true);
    } catch (err: any) {
      setError(err.message || 'Login failed. Check email/password.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    setIsLoggedIn(false);
    setEmail('');
    setPassword('');
    setFullName('');
  };

  // Show loading while checking admin status
  if (checkingAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-10 max-w-md w-full border border-gray-100 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Checking system configuration...</p>
        </div>
      </div>
    );
  }

  // Show admin setup form if no admin exists
  if (needsAdminSetup && !isLoggedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-10 max-w-md w-full border border-gray-100">
          <div className="text-center mb-10">
            <h1 className="text-4xl font-bold text-gray-900 mb-3">Create Admin Account</h1>
            <p className="text-gray-600">No admin account found. Please create the first admin user.</p>
          </div>

          <form onSubmit={handleAdminSetup} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                placeholder="Enter your full name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                placeholder="Enter your email"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                placeholder="Create a password"
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 text-white py-3.5 rounded-lg font-semibold hover:bg-indigo-700 disabled:opacity-70 disabled:cursor-not-allowed transition shadow-lg"
            >
              {loading ? 'Creating Admin...' : 'Create Admin Account'}
            </button>
          </form>

          <div className="mt-8 text-center text-sm text-gray-500">
            <p>This will be the main administrator account for the bookstore system</p>
          </div>
        </div>
      </div>
    );
  }

  // Show login form if not logged in (and admin exists)
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-10 max-w-md w-full border border-gray-100">
          <div className="text-center mb-10">
            <h1 className="text-4xl font-bold text-gray-900 mb-3">Admin Login</h1>
            <p className="text-gray-600">Sign in to access the bookstore dashboard</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                placeholder="Enter your email"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                placeholder="Enter your password"
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 text-white py-3.5 rounded-lg font-semibold hover:bg-indigo-700 disabled:opacity-70 disabled:cursor-not-allowed transition shadow-lg"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-8 text-center text-sm text-gray-500">
            <p>Use the email and password from your admin account</p>
          </div>
        </div>
      </div>
    );
  }

  // Full Dashboard when logged in
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Shipped':
        return 'bg-blue-100 text-blue-700';
      case 'Processing':
        return 'bg-yellow-100 text-yellow-700';
      case 'Delivered':
        return 'bg-green-100 text-green-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Desktop Sidebar with Logout Prop */}
      <div className="hidden lg:block">
        <Sidebar onLogout={handleLogout} />
      </div>

      {/* Mobile Sidebar with Logout Prop */}
      <MobileSidebarDrawer 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
        onLogout={handleLogout}
      />

      {/* Mobile Header - Logout removed from here */}
      <div className="lg:hidden fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-30 px-4 py-3 flex items-center justify-between shadow-sm">
        <button onClick={() => setIsSidebarOpen(true)} className="p-2 hover:bg-gray-100 rounded-lg">
          <Menu size={24} className="text-gray-700" />
        </button>
        <span className="text-lg font-semibold text-gray-900">Bookstore Admin</span>
        <div className="w-8"></div> {/* Spacer for alignment */}
      </div>

      {/* Main Dashboard Content */}
      <div className="lg:ml-64 pt-16 lg:pt-0 transition-all duration-300">
        <div className="px-4 py-6 sm:px-8 sm:py-8 max-w-[1600px] mx-auto">
          {/* Header - Logout button removed */}
          <div className="mb-8 flex justify-between items-start">
            <div>
              <h1 className="text-3xl sm:text-4xl font-semibold text-gray-900 mb-2">Dashboard</h1>
              <p className="text-gray-500 text-sm">Welcome back, Admin</p>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-8">
            <StatCard title="Total Orders" value="1,250" />
            <StatCard title="Sales" value="$45,000" />
            <StatCard title="Stock Levels" value="8,500" />
            <StatCard title="New Users" value="320" />
            <StatCard title="Pending Shipments" value="75" />
          </div>

          {/* Overview Section */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Overview</h2>
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              {/* Sales Trends */}
              <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                <div className="mb-6">
                  <div className="text-sm text-gray-600 mb-2">Sales Trends</div>
                  <div className="text-3xl font-semibold text-gray-900 mb-1">$45,000</div>
                  <div className="text-sm text-gray-500">
                    Last 30 Days <span className="text-green-600 font-medium">+15%</span>
                  </div>
                </div>
                <div className="h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={salesData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} dy={10} />
                      <YAxis hide />
                      <Tooltip contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e5e7eb' }} />
                      <Line type="monotone" dataKey="value" stroke="#6366f1" strokeWidth={3} dot={{ fill: '#6366f1', r: 4 }} activeDot={{ r: 6 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Genre Performance */}
              <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                <div className="mb-6">
                  <div className="text-sm text-gray-600 mb-2">Genre Performance</div>
                  <div className="text-3xl font-semibold text-gray-900 mb-1">8,500</div>
                  <div className="text-sm text-gray-500">
                    This Month <span className="text-green-600 font-medium">+8%</span>
                  </div>
                </div>
                <div className="h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={genreData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} dy={10} />
                      <YAxis hide />
                      <Tooltip cursor={{ fill: '#f3f4f6' }} contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e5e7eb' }} />
                      <Bar dataKey="value" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={40} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;