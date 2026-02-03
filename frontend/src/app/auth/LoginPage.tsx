"use client";

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Mail } from 'lucide-react';
import { login, resendVerificationEmail } from '../../lib/auth'; // Updated imports
import TermsPopup from "../../components/layout/TermsPopup";

export default function LoginPage() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showTerms, setShowTerms] = useState(false);
  const [unverifiedEmail, setUnverifiedEmail] = useState<string | null>(null);
  const [isResending, setIsResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);

  const [errors, setErrors] = useState<{
    email?: string;
    password?: string;
    server?: string;
  }>({});

  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear related errors
    if (errors[name as keyof typeof errors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined, server: undefined }));
    }
    
    // Reset unverified email state when user types
    if (unverifiedEmail) {
      setUnverifiedEmail(null);
      setResendSuccess(false);
    }
  };

  const validateForm = () => {
    const newErrors: typeof errors = {};
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }
    if (!formData.password) {
      newErrors.password = 'Password is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleResendVerification = async () => {
    if (!unverifiedEmail) return;
    
    setIsResending(true);
    try {
      await resendVerificationEmail(unverifiedEmail);
      setResendSuccess(true);
      setTimeout(() => setResendSuccess(false), 5000);
    } catch (err: any) {
      setErrors({ 
        server: `Failed to resend verification: ${err.message}` 
      });
    } finally {
      setIsResending(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    setErrors({});
    setUnverifiedEmail(null);
    setResendSuccess(false);

    try {
      // Login returns full response now (with role)
      const response = await login(formData.email.trim(), formData.password);

      // Extract role safely (backend returns it as response.role)
      const userRole = response.role?.toLowerCase();

      if (userRole === 'admin' || userRole === 'administrator') {
        // Block admin login on customer page
        setErrors({
          server:
            'Admin accounts cannot log in from here. Please use the admin portal at /admin/login.',
        });
        // Optional: clear token so admin is logged out
        localStorage.removeItem('authToken');
      } else {
        // Normal customer → success
        navigate('/');
      }
    } catch (err: any) {
      const message = err.message || 'Login failed. Please try again.';
      
      // Special handling for email not verified
      if (err.message === 'EMAIL_NOT_VERIFIED') {
        setUnverifiedEmail(formData.email);
        setErrors({ 
          server: 'Please verify your email before logging in.' 
        });
      } else {
        setErrors({ server: message });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    console.log("Google login clicked");
    // Add Google OAuth logic here if needed
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FAF9F6] px-4 font-serif">
      <div
        className="
          w-full max-w-6xl
          bg-white
          rounded-3xl
          shadow-md
          transition-all duration-300
          hover:shadow-2xl
          overflow-hidden
          border border-[#F5EBDD]
        "
      >
        <div className="flex flex-col lg:flex-row min-h-[650px]">
          {/* LEFT SECTION - Form */}
          <div className="w-full lg:w-1/2 flex items-center justify-center px-6 py-12 lg:px-20">
            <div className="w-full max-w-[450px]">
              <h1 className="text-3xl lg:text-[40px] font-bold text-[#2E4A3D] leading-tight mb-3">
                Welcome Back
              </h1>
              <p className="text-sm lg:text-base text-[#333333] mb-8 lg:mb-10">
                Join and get personalized book recommendations
              </p>

              {/* Server Error Display */}
              {errors.server && (
                <div className={`mb-6 p-4 rounded-lg text-sm ${
                  unverifiedEmail 
                    ? 'bg-blue-50 border border-blue-200 text-blue-800' 
                    : 'bg-red-50 border border-red-200 text-[#B85C38]'
                }`}>
                  <div className="flex items-start gap-3">
                    {unverifiedEmail && (
                      <Mail className="w-5 h-5 mt-0.5 flex-shrink-0" />
                    )}
                    <div>
                      <p className="font-medium">{errors.server}</p>
                      
                      {/* Unverified Email Actions */}
                      {unverifiedEmail && (
                        <div className="mt-3 space-y-3">
                          <p className="text-sm">
                            We sent a verification link to <span className="font-semibold">{unverifiedEmail}</span>.
                          </p>
                          
                          <div className="space-y-2">
                            <button
                              type="button"
                              onClick={handleResendVerification}
                              disabled={isResending}
                              className="w-full py-2.5 bg-[#A3B18A] text-white rounded-full text-sm font-semibold hover:bg-[#2E4A3D] transition-colors disabled:opacity-70 flex items-center justify-center gap-2"
                            >
                              {isResending ? (
                                <>
                                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                  Sending...
                                </>
                              ) : (
                                'Resend Verification Email'
                              )}
                            </button>
                            
                            {resendSuccess && (
                              <p className="text-sm text-green-600 text-center">
                                ✓ New verification email sent!
                              </p>
                            )}
                            
                            <div className="text-xs text-gray-600 pt-2 border-t border-gray-200">
                              <p className="font-medium">Still not working?</p>
                              <ul className="list-disc pl-4 mt-1 space-y-1">
                                <li>Check your spam folder</li>
                                <li>Make sure you entered the correct email</li>
                                <li>Try a different email address</li>
                              </ul>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-bold text-[#333333] mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="Enter your email"
                    className={`w-full px-4 py-3.5 rounded-xl border text-[#333333] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#A3B18A] text-sm ${
                      errors.email ? 'border-[#B85C38]' : 'border-[#F5EBDD]'
                    }`}
                  />
                  {errors.email && <p className="text-[#B85C38] text-xs mt-1">{errors.email}</p>}
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-sm font-bold text-[#333333]">
                      Password
                    </label>
                  </div>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      placeholder="Enter your password"
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
                </div>

                <button
                  type="submit"
                  disabled={isLoading || !!unverifiedEmail}
                  className="w-full bg-[#B85C38] hover:bg-[#2E4A3D] text-white font-semibold py-3.5 rounded-[32px] transition-colors mt-6 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Logging in...
                    </>
                  ) : (
                    'Login'
                  )}
                </button>
              </form>

              {/* New User Section */}
              <div className="mt-8 pt-6 border-t border-gray-200">
                <div className="text-center">
                  <p className="text-[#333333] text-sm mb-3">
                    New to BookStore? Create an account to:
                  </p>
                  <ul className="text-xs text-gray-600 space-y-1 mb-4">
                    <li className="flex items-center justify-center gap-2">
                      <div className="w-1.5 h-1.5 bg-[#D4A373] rounded-full"></div>
                      Save your favorite books
                    </li>
                    <li className="flex items-center justify-center gap-2">
                      <div className="w-1.5 h-1.5 bg-[#D4A373] rounded-full"></div>
                      Get personalized recommendations
                    </li>
                    <li className="flex items-center justify-center gap-2">
                      <div className="w-1.5 h-1.5 bg-[#D4A373] rounded-full"></div>
                      Track your orders
                    </li>
                  </ul>
                </div>
                
                <div className="text-center space-y-2.5">
                  <Link 
                    to="/signup" 
                    className="inline-block w-full py-3 border-2 border-[#D4A373] text-[#D4A373] rounded-[32px] font-bold hover:bg-[#FAF9F6] transition-colors"
                  >
                    Create New Account
                  </Link>
                  
                  <button
                    onClick={() => setShowTerms(true)}
                    className="text-[#333333] hover:text-[#B85C38] underline text-sm"
                  >
                    Terms & Conditions
                  </button>
                </div>
              </div>

              {/* Email Verification Notice */}
              {!unverifiedEmail && (
                <div className="mt-6 p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="text-xs text-gray-600 text-center">
                    <span className="font-semibold">Note:</span> After signing up, you'll receive a verification email. 
                    You must verify your email before logging in.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT SECTION – IMAGE BACKGROUND */}
          <div className="hidden lg:flex w-full lg:w-1/2 bg-[#F5EBDD] overflow-hidden relative">
            <img
              src="https://www.christianitytoday.com/wp-content/uploads/2023/12/137931.jpg"
              alt="Open book"
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 min-w-full min-h-full object-cover opacity-80"
            />
            <div className="absolute inset-0 bg-[#2E4A3D] opacity-10"></div>
            {/* Overlay Text */}
            <div className="absolute inset-0 flex items-center justify-center p-8">
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-8 max-w-md">
                <h3 className="text-2xl font-bold text-[#2E4A3D] mb-4">
                  Secure Login
                </h3>
                <p className="text-[#333333] mb-6">
                  Your account security is our priority. We use email verification 
                  to ensure only you can access your account.
                </p>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-[#B85C38]/20 rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-[#B85C38]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                    <span className="text-sm text-[#333333]">Secure password encryption</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-[#B85C38]/20 rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-[#B85C38]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <span className="text-sm text-[#333333]">Email verification required</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-[#B85C38]/20 rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-[#B85C38]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                    </div>
                    <span className="text-sm text-[#333333]">Your data is protected</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <TermsPopup isOpen={showTerms} onClose={() => setShowTerms(false)} />
    </div>
  );
}