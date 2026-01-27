"use client";

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { login, setUserRole, getUserRole, logout } from '../../lib/auth';

interface FormErrors {
  fullName?: string;
  email?: string;
  password?: string;
  general?: string;
}

const AdminLoginPage = () => {
  const [needsAdminSetup, setNeedsAdminSetup] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [dbCheckFailed, setDbCheckFailed] = useState(false);

  const navigate = useNavigate();
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

  // Initial check: redirect if already admin
  useEffect(() => {
    const checkInitialState = async () => {
      setChecking(true);
      setDbCheckFailed(false);

      const token = localStorage.getItem('authToken');
      const role = getUserRole()?.toLowerCase();

      if (token && role === 'admin') {
        navigate('/dashboard', { replace: true });
        return;
      }

      // If token exists but not admin → logout
      if (token && role !== 'admin') {
        logout();
        navigate('/');
        return;
      }

      try {
        // Set timeout for database check
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

        const res = await fetch(`${API_URL}/auth/admin/check-exists`, {
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (res.ok) {
          const { exists } = await res.json();
          setNeedsAdminSetup(!exists);
        } else {
          // If check fails but returns an error (like 500), show as db failure
          setDbCheckFailed(true);
          console.warn('Admin check returned error:', res.status);
        }
      } catch (err: any) {
        console.error('Failed to check admin existence:', err);
        
        // Handle timeout or network errors
        if (err.name === 'AbortError') {
          console.warn('Database check timeout - assuming no admin exists');
          setNeedsAdminSetup(true); // Safe default: show setup form
        } else {
          setDbCheckFailed(true);
        }
      } finally {
        setChecking(false);
      }
    };

    checkInitialState();
  }, [navigate, API_URL]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (needsAdminSetup) {
      if (!formData.fullName.trim()) newErrors.fullName = 'Full name is required';
      if (formData.fullName.length < 2) newErrors.fullName = 'Name is too short';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (needsAdminSetup && formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setErrors({});

    const endpoint = needsAdminSetup ? '/auth/admin/setup' : '/auth/admin/login';
    const body = needsAdminSetup
      ? formData
      : { email: formData.email, password: formData.password };

    try {
      const res = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.message?.includes('Invalid admin credentials')) {
          setErrors({ general: 'Invalid email or password' });
        } else if (data.message?.includes('already exists')) {
          setErrors({ general: 'Admin account already exists. Please log in below.' });
        } else {
          setErrors({ general: data.message || 'Login failed. Please try again.' });
        }
        throw new Error();
      }

      // Store token and role
      localStorage.setItem('authToken', data.access_token);
      if (data.role) {
        setUserRole(data.role);
      }

      navigate('/dashboard', { replace: true });
    } catch (err) {
      // Error already set
    } finally {
      setLoading(false);
    }
  };

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAF9F6] px-4 font-serif">
        <div className="w-full max-w-md bg-white rounded-3xl shadow-md p-8 text-center">
          <Loader2 className="h-12 w-12 text-[#2E4A3D] animate-spin mx-auto mb-4" />
          <p className="text-[#333333] font-medium">Checking admin setup...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FAF9F6] px-4 font-serif">
      <div className="w-full max-w-6xl bg-white rounded-3xl shadow-md hover:shadow-2xl transition-all duration-300 overflow-hidden border border-[#F5EBDD]">
        <div className="flex flex-col lg:flex-row min-h-[650px]">
          {/* LEFT SECTION - Form */}
          <div className="w-full lg:w-1/2 flex items-center justify-center px-6 py-12 lg:px-20">
            <div className="w-full max-w-[450px]">
              <h1 className="text-3xl lg:text-[40px] font-bold text-[#2E4A3D] leading-tight mb-3">
                {needsAdminSetup ? 'Setup Admin Account' : 'Admin Portal'}
              </h1>
              
              {dbCheckFailed && (
                <div className="mb-6 p-4 bg-orange-50 border border-orange-200 text-[#B85C38] rounded-lg text-sm">
                  <p className="font-semibold">⚠️ Database Connection Issue</p>
                  <p className="mt-1">Unable to verify existing admin accounts. You can still try to log in or set up a new admin.</p>
                </div>
              )}

              <p className="text-sm lg:text-base text-[#333333] mb-8 lg:mb-10">
                {needsAdminSetup 
                  ? 'Create the first administrator account for the bookstore management system'
                  : 'Sign in to access the bookstore management dashboard'}
              </p>

              {errors.general && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 text-[#B85C38] rounded-lg text-sm">
                  {errors.general}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                {needsAdminSetup && (
                  <div>
                    <label className="block text-sm font-bold text-[#333333] mb-2">
                      Full Name
                    </label>
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleChange}
                      placeholder="Enter admin full name"
                      className={`w-full px-4 py-3.5 rounded-xl border text-[#333333] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#A3B18A] text-sm ${
                        errors.fullName ? 'border-[#B85C38]' : 'border-[#F5EBDD]'
                      }`}
                    />
                    {errors.fullName && <p className="text-[#B85C38] text-xs mt-1">{errors.fullName}</p>}
                  </div>
                )}

                <div>
                  <label className="block text-sm font-bold text-[#333333] mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="admin@bookstore.com"
                    className={`w-full px-4 py-3.5 rounded-xl border text-[#333333] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#A3B18A] text-sm ${
                      errors.email ? 'border-[#B85C38]' : 'border-[#F5EBDD]'
                    }`}
                  />
                  {errors.email && <p className="text-[#B85C38] text-xs mt-1">{errors.email}</p>}
                </div>

                <div>
                  <label className="block text-sm font-bold text-[#333333] mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder={needsAdminSetup ? "Minimum 8 characters" : "Enter your password"}
                      className={`w-full px-4 py-3.5 rounded-xl border text-[#333333] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#A3B18A] text-sm ${
                        errors.password ? 'border-[#B85C38]' : 'border-[#F5EBDD]'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-[#D4A373] hover:text-[#2E4A3D]"
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                  {errors.password && <p className="text-[#B85C38] text-xs mt-1">{errors.password}</p>}
                  {needsAdminSetup && (
                    <p className="text-xs text-[#666] mt-1">Password must be at least 8 characters long</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#B85C38] hover:bg-[#2E4A3D] text-white font-semibold py-3.5 rounded-[32px] transition-colors mt-6 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading && <Loader2 className="h-5 w-5 animate-spin" />}
                  {loading 
                    ? (needsAdminSetup ? 'Creating Account...' : 'Signing In...')
                    : (needsAdminSetup ? 'Create Admin Account' : 'Login to Dashboard')
                  }
                </button>
              </form>

              {!needsAdminSetup && dbCheckFailed && (
                <div className="mt-8 p-4 bg-gray-50 rounded-xl border border-gray-200">
                  <p className="text-sm text-[#333333]">
                    <span className="font-semibold">Note:</span> If you believe an admin account exists but can't log in, 
                    please check your database connection and try again.
                  </p>
                  <button
                    onClick={() => window.location.reload()}
                    className="mt-3 text-sm text-[#2E4A3D] hover:text-[#B85C38] font-medium underline"
                  >
                    Retry Database Check
                  </button>
                </div>
              )}

              <div className="mt-8 text-center">
                <p className="text-[#333333] text-sm">
                  {needsAdminSetup ? (
                    <>
                      After creating the admin account, you'll be redirected to the dashboard.
                      Make sure to save your credentials securely.
                    </>
                  ) : (
                    "Bookstore Management System"
                  )}
                </p>
                <p className="text-xs text-[#666] mt-4">
                  © {new Date().getFullYear()} BookStore Admin Panel
                </p>
              </div>
            </div>
          </div>

          {/* RIGHT SECTION – IMAGE BACKGROUND */}
          <div className="hidden lg:flex w-full lg:w-1/2 bg-[#F5EBDD] overflow-hidden relative">
            {/* You'll add your image here */}
            <div className="absolute inset-0 bg-[#2E4A3D] opacity-10"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center p-8 max-w-md">
                <h2 className="text-3xl font-bold text-[#2E4A3D] mb-4">BookStore Management</h2>
                <p className="text-[#333333] mb-6">
                  {needsAdminSetup 
                    ? "Set up your administration panel to manage orders, inventory, customers, and reports."
                    : "Manage orders, track inventory, handle customer requests, and generate reports."
                  }
                </p>
                <div className="grid grid-cols-2 gap-4 text-left">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-[#B85C38] rounded-full"></div>
                    <span className="text-sm text-[#333333]">Order Management</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-[#B85C38] rounded-full"></div>
                    <span className="text-sm text-[#333333]">Inventory Tracking</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-[#B85C38] rounded-full"></div>
                    <span className="text-sm text-[#333333]">Customer Reports</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-[#B85C38] rounded-full"></div>
                    <span className="text-sm text-[#333333]">Batch Processing</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLoginPage;