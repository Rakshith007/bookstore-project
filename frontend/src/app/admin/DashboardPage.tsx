'use client';

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
import { 
  Menu, 
  TrendingUp, 
  Package, 
  Users, 
  BookOpen, 
  HeartHandshake,
  DollarSign,
  ShoppingCart,
  AlertCircle,
  BookPlus,
  Import,
  Truck,
  ListChecks,
  Printer,
  ArrowRight,
  LogOut
} from 'lucide-react';
import { Sidebar, MobileSidebarDrawer } from '../../components/layout/AdminSidebar';
import { getUserRole, logout } from '../../lib/auth'; // ← Your auth helpers

// Reusable StatCard (unchanged)
interface StatCardProps {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  trend?: string;
  bgGradient?: string;
  iconBg?: string;
  highlight?: boolean;
}

const StatCard: React.FC<StatCardProps> = ({ 
  title, 
  value, 
  icon, 
  trend,
  bgGradient = "from-indigo-500 to-purple-600",
  iconBg = "bg-indigo-100",
  highlight = false
}) => {
  return (
    <div className={`group relative bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden ${
      highlight ? 'ring-4 ring-indigo-200 ring-opacity-60 shadow-xl' : ''
    }`}>
      <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${bgGradient} opacity-5 rounded-full blur-2xl group-hover:opacity-10 transition-opacity duration-300 -mr-16 -mt-16`}></div>
      
      <div className="relative">
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-gray-500 text-sm font-medium mb-1">{title}</p>
            <h3 className={`font-bold text-gray-900 tracking-tight ${highlight ? 'text-5xl' : 'text-3xl'}`}>
              {value}
            </h3>
            {trend && (
              <p className="text-sm text-gray-500 mt-2">{trend}</p>
            )}
          </div>
          {icon && (
            <div className={`${iconBg} p-4 rounded-2xl group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
              <div className={highlight ? 'text-indigo-700' : 'text-indigo-600'}>{icon}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// NavigationCard (unchanged)
interface NavigationCardProps {
  title: string;
  description: string;
  value?: string | number;
  icon: React.ReactNode;
  bgGradient: string;
  iconBg: string;
  onClick: () => void;
}

const NavigationCard: React.FC<NavigationCardProps> = ({ 
  title, 
  description,
  value,
  icon, 
  bgGradient,
  iconBg,
  onClick
}) => {
  return (
    <button
      onClick={onClick}
      className="group relative bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden text-left w-full"
    >
      <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${bgGradient} opacity-5 rounded-full blur-2xl group-hover:opacity-10 transition-opacity duration-300 -mr-16 -mt-16`}></div>
      
      <div className="relative">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="font-bold text-gray-900 text-2xl mb-2">
              {title}
            </h3>
            <p className="text-gray-500 text-sm mb-3">{description}</p>
            {value !== undefined && (
              <p className="text-3xl font-bold text-indigo-600">{value}</p>
            )}
          </div>
          <div className={`${iconBg} p-4 rounded-2xl group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
            {icon}
          </div>
        </div>
        <div className="flex items-center text-indigo-600 font-medium text-sm mt-4 group-hover:translate-x-2 transition-transform duration-300">
          <span>Open</span>
          <ArrowRight size={16} className="ml-2" />
        </div>
      </div>
    </button>
  );
};

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isChecking, setIsChecking] = useState(true); // Prevent UI flash

  // All your dashboard states (unchanged)
  const [dashboardLoading, setDashboardLoading] = useState(true);
  const [dashboardError, setDashboardError] = useState('');
  const [totalOrders, setTotalOrders] = useState(0);
  const [totalSales, setTotalSales] = useState(0);
  const [pendingShipments, setPendingShipments] = useState(0);
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalStock, setTotalStock] = useState(0);
  const [totalBooksDonated, setTotalBooksDonated] = useState(0);
  const [totalCharitiesReached, setTotalCharitiesReached] = useState(0);
  const [pendingCharityShipments, setPendingCharityShipments] = useState(0);
  const [salesData, setSalesData] = useState<any[]>([]);
  const [genreData, setGenreData] = useState<any[]>([]);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

  useEffect(() => {
    // Step 1: Immediate role check – do NOT render UI if not admin
    const role = getUserRole()?.toLowerCase();

    if (!role || role !== 'admin') {
      logout(); // Clear token for safety
      navigate('/'); // Redirect normal users to home (or '/login')
      return;
    }

    // Step 2: Only real admins reach here – proceed to load data
    setIsChecking(false);
    fetchDashboardData();
  }, [navigate]);

  const fetchDashboardData = async () => {
    setDashboardLoading(true);
    setDashboardError('');

    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        logout();
        navigate('/admin/login');
        return;
      }

      const ordersResponse = await fetch(`${API_URL}/admin/orders?limit=1000`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!ordersResponse.ok) {
        if (ordersResponse.status === 401 || ordersResponse.status === 403) {
          logout();
          navigate('/admin/login');
          return;
        }
        throw new Error('Failed to fetch orders');
      }

      const ordersResult = await ordersResponse.json();
      const orders = ordersResult.data || [];

      const ordersCount = orders.length;
      const salesTotal = orders.reduce((sum: number, o: any) => sum + (o.totalAmount || 0), 0);
      const pendingCustomer = orders.filter((o: any) => 
        ['PROCESSING', 'PICKED', 'PACKED'].includes(o.status)
      ).length;

      let booksDonated = 0;
      const charitiesReached = new Set<string>();
      let pendingCharity = 0;

      orders.forEach((order: any) => {
        order.fulfillments?.forEach((f: any) => {
          if (f.charityAddress) {
            booksDonated += f.booksFulfilled || 0;
            const addrStr = typeof f.charityAddress === 'string' 
              ? f.charityAddress 
              : JSON.stringify(f.charityAddress);
            charitiesReached.add(addrStr.toLowerCase().trim());
            if (!f.deliveredAt || f.status !== 'DELIVERED') {
              pendingCharity += 1;
            }
          }
        });
      });

      const monthlyMap = new Map<string, number>();
      orders.forEach((o: any) => {
        if (!o.orderDate) return;
        const date = new Date(o.orderDate);
        const monthKey = date.toLocaleString('default', { month: 'short', year: 'numeric' });
        monthlyMap.set(monthKey, (monthlyMap.get(monthKey) || 0) + (o.totalAmount || 0));
      });

      const monthlySales = Array.from(monthlyMap.entries())
        .sort((a, b) => new Date(a[0]).getTime() - new Date(b[0]).getTime())
        .slice(-12)
        .map(([name, value]) => ({ name, value: Math.round(value) }));

      const genreMap = new Map<string, number>();
      orders.forEach((o: any) => {
        o.orderItems?.forEach((item: any) => {
          const genreName = item.book?.genre?.name || 'Unknown';
          const revenue = (item.quantity || 0) * (item.unitPrice || 0);
          genreMap.set(genreName, (genreMap.get(genreName) || 0) + revenue);
        });
      });

      const topGenres = Array.from(genreMap.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 6)
        .map(([name, value]) => ({ name, value: Math.round(value) }));

      let usersCount = 0;
      try {
        const usersResponse = await fetch(`${API_URL}/users`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (usersResponse.ok) {
          const usersData = await usersResponse.json();
          usersCount = Array.isArray(usersData) ? usersData.length : 0;
        }
      } catch (err) {
        console.warn('Failed to fetch users count');
      }

      let stockSum = 0;
      try {
        const booksResponse = await fetch(`${API_URL}/books?limit=1000`, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (booksResponse.ok) {
          const data = await booksResponse.json();
          const books: any[] = Array.isArray(data) 
            ? data 
            : data.data || data.books || [];

          stockSum = books.reduce((sum: number, book: any) => 
            sum + (book.stockQuantity || 0), 0
          );
        }
      } catch (err) {
        console.error('Error fetching total stock:', err);
      }

      setTotalOrders(ordersCount);
      setTotalSales(salesTotal);
      setPendingShipments(pendingCustomer);
      setTotalUsers(usersCount);
      setTotalStock(stockSum);
      setTotalBooksDonated(booksDonated);
      setTotalCharitiesReached(charitiesReached.size);
      setPendingCharityShipments(pendingCharity);
      setSalesData(monthlySales.length > 0 ? monthlySales : [{ name: 'No data', value: 0 }]);
      setGenreData(topGenres.length > 0 ? topGenres : [{ name: 'No data', value: 0 }]);

    } catch (err: any) {
      setDashboardError(err.message || 'Failed to load dashboard data');
      console.error(err);
    } finally {
      setDashboardLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  // Show loading/checking state (prevents UI flash for non-admins)
  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="hidden lg:block">
        <Sidebar onLogout={handleLogout} />
      </div>
      <MobileSidebarDrawer 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
        onLogout={handleLogout} 
      />
      
      <div className="lg:hidden fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-md border-b border-gray-200 z-30 px-4 py-4 flex items-center justify-between shadow-sm">
        <button onClick={() => setIsSidebarOpen(true)} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
          <Menu size={24} className="text-gray-700" />
        </button>
        <span className="text-lg font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
          Bookstore Admin
        </span>
        <div className="w-10"></div>
      </div>

      <div className="lg:ml-64 pt-20 lg:pt-0">
        <div className="px-4 py-8 sm:px-8 max-w-[1800px] mx-auto">
          <div className="mb-10">
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-3 tracking-tight">
              Dashboard Overview
            </h1>
            <p className="text-gray-600 text-lg">Monitor your bookstore performance at a glance</p>
          </div>

          {dashboardLoading && (
            <div className="text-center py-32">
              <div className="relative inline-block">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600"></div>
                <div className="absolute inset-0 rounded-full blur-xl bg-indigo-400/30 animate-pulse"></div>
              </div>
              <p className="mt-8 text-gray-600 text-lg font-medium">Loading your dashboard...</p>
            </div>
          )}

          {dashboardError && (
            <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-6 py-5 rounded-xl mb-8 flex items-start gap-4 shadow-sm">
              <AlertCircle size={24} className="flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-lg mb-1">Error Loading Dashboard</h3>
                <p className="text-sm">{dashboardError}</p>
              </div>
            </div>
          )}

          {!dashboardLoading && !dashboardError && (
            <>
              {/* Business Metrics */}
              <div className="mb-8">
                <h2 className="text-xl font-bold text-gray-800 mb-5 flex items-center gap-2">
                  <ShoppingCart size={24} className="text-indigo-600" />
                  Business Metrics
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  <StatCard title="Total Orders" value={totalOrders.toLocaleString()} icon={<TrendingUp size={24} />} bgGradient="from-blue-500 to-cyan-600" iconBg="bg-blue-100" />
                  <StatCard title="Total Revenue" value={`OMR `} icon={<DollarSign size={24} />} bgGradient="from-emerald-500 to-teal-600" iconBg="bg-emerald-100" />
                  <StatCard title="Total Customers" value={totalUsers.toLocaleString()} icon={<Users size={24} />} bgGradient="from-purple-500 to-pink-600" iconBg="bg-purple-100" />
                  <StatCard title="Books in Stock" value={totalStock.toLocaleString()} icon={<BookOpen size={32} />} trend="Current available inventory" bgGradient="from-indigo-600 to-blue-700" iconBg="bg-indigo-100" highlight={true} />
                </div>
              </div>

              {/* Management Navigation Cards */}
              <div className="mb-12">
                <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                  <Package size={24} className="text-indigo-600" />
                  Management
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <NavigationCard
                    title="Users"
                    description="Manage customer accounts and permissions"
                    icon={<Users size={28} className="text-purple-600" />}
                    bgGradient="from-purple-500 to-pink-600"
                    iconBg="bg-purple-100"
                    onClick={() => handleNavigation('/admin/users')}
                  />

                  <NavigationCard
                    title="Books"
                    description="View and manage book inventory"
                    icon={<BookOpen size={28} className="text-indigo-600" />}
                    bgGradient="from-indigo-500 to-purple-600"
                    iconBg="bg-indigo-100"
                    onClick={() => handleNavigation('/admin/books')}
                  />

                  <NavigationCard
                    title="Add Books"
                    description="Add new books to your catalog"
                    icon={<BookPlus size={28} className="text-teal-600" />}
                    bgGradient="from-teal-500 to-cyan-600"
                    iconBg="bg-teal-100"
                    onClick={() => handleNavigation('/admin/addbookpage')}
                  />

                  <NavigationCard
                    title="Orders"
                    description="Track and manage customer orders"
                    icon={<ShoppingCart size={28} className="text-blue-600" />}
                    bgGradient="from-blue-500 to-cyan-600"
                    iconBg="bg-blue-100"
                    onClick={() => handleNavigation('/admin/orders')}
                  />

                  <NavigationCard
                    title="Incoming Orders"
                    description="Process new incoming orders"
                    icon={<Import size={28} className="text-yellow-600" />}
                    bgGradient="from-yellow-500 to-orange-600"
                    iconBg="bg-yellow-100"
                    onClick={() => handleNavigation('/warehouse/incomingorders')}
                  />

                  <NavigationCard
                    title="Delivery Queue"
                    description="Manage shipping queue and deliveries"
                    icon={<Truck size={28} className="text-green-600" />}
                    bgGradient="from-green-500 to-emerald-600"
                    iconBg="bg-green-100"
                    onClick={() => handleNavigation('/admin/shippingqueue')}
                  />

                  <NavigationCard
                    title="Inventory Check"
                    description="Verify and audit stock levels"
                    icon={<ListChecks size={28} className="text-slate-600" />}
                    bgGradient="from-slate-500 to-gray-600"
                    iconBg="bg-slate-100"
                    onClick={() => handleNavigation('/warehouse/inventorycheck')}
                  />
                </div>
              </div>

              {/* Charity Impact */}
              <div className="mb-10">
                <h2 className="text-xl font-bold text-gray-800 mb-5 flex items-center gap-2">
                  <HeartHandshake size={24} className="text-rose-600" />
                  Charity Impact
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  <StatCard 
                    title="Books Donated" 
                    value={totalBooksDonated.toLocaleString()} 
                    icon={<HeartHandshake size={24} />} 
                    trend="Making a difference"
                    bgGradient="from-rose-500 to-pink-600"
                    iconBg="bg-rose-100"
                  />
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;