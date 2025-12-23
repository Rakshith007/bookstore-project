import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signup } from '../../lib/auth';

const SignupPage: React.FC = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    agreeToTerms: false,
  });

  const [errors, setErrors] = useState<{
    username?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
    agreeToTerms?: string;
    server?: string;
  }>({});

  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));

    // Clear error for this field when user starts typing/checking
    if (errors[name as keyof typeof errors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined, server: undefined }));
    }
  };

  const validateForm = () => {
    const newErrors: typeof errors = {};

    // Username - REQUIRED
    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    }

    // Email
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    // Password
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    // Confirm Password
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    // Terms & Conditions
    if (!formData.agreeToTerms) {
      newErrors.agreeToTerms = 'You must agree to the Terms & Conditions';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);
    setErrors({});

    try {
      await signup(
        formData.username.trim(),
        formData.email.trim(),
        formData.password
      );

      alert('Account created successfully! Please log in.');
      navigate('/login');
    } catch (err: any) {
      setErrors({ server: err.message || 'Signup failed. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4 font-serif">
      {/* MAIN SIGNUP CARD */}
      <div
        className="
          w-full max-w-6xl
          bg-white
          rounded-3xl
          shadow-md
          transition-all duration-300
          hover:shadow-2xl
          hover:bg-gray-50
          overflow-hidden
        "
      >
        <div className="flex flex-col lg:flex-row min-h-[650px]">
          {/* LEFT SIDE – FORM */}
          <div className="w-full lg:w-1/2 flex items-center justify-center px-6 py-12 lg:px-20">
            <div className="w-full max-w-[450px]">
              <h1 className="text-3xl font-bold text-gray-900 leading-tight mb-3">
                Create Your Account
              </h1>
              <p className="text-sm text-gray-700 mb-8">
                Join our bookstore and start your reading journey.
              </p>

              {/* Server Error */}
              {errors.server && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                  {errors.server}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* User Name */}
                <div>
                  <label className="block text-xs font-bold text-gray-900 mb-2">
                    User Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    placeholder="Enter your user name"
                    className={`w-full px-4 py-3 bg-gray-50 border rounded-lg focus:outline-none focus:ring-1 focus:ring-[#2d4a3e] text-sm ${
                      errors.username ? 'border-red-500' : 'border-gray-200'
                    }`}
                  />
                  {errors.username && <p className="text-red-500 text-xs mt-1">{errors.username}</p>}
                </div>

                {/* Email */}
                <div>
                  <label className="block text-xs font-bold text-gray-900 mb-2">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="Enter your email"
                    className={`w-full px-4 py-3 bg-gray-50 border rounded-lg focus:outline-none focus:ring-1 focus:ring-[#2d4a3e] text-sm ${
                      errors.email ? 'border-red-500' : 'border-gray-200'
                    }`}
                  />
                  {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                </div>

                {/* Password */}
                <div>
                  <label className="block text-xs font-bold text-gray-900 mb-2">
                    Password <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="Enter your password"
                    className={`w-full px-4 py-3 bg-gray-50 border rounded-lg focus:outline-none focus:ring-1 focus:ring-[#2d4a3e] text-sm ${
                      errors.password ? 'border-red-500' : 'border-gray-200'
                    }`}
                  />
                  {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-xs font-bold text-gray-900 mb-2">
                    Confirm Password <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    placeholder="Confirm your password"
                    className={`w-full px-4 py-3 bg-gray-50 border rounded-lg focus:outline-none focus:ring-1 focus:ring-[#2d4a3e] text-sm ${
                      errors.confirmPassword ? 'border-red-500' : 'border-gray-200'
                    }`}
                  />
                  {errors.confirmPassword && (
                    <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>
                  )}
                </div>

                {/* Terms & Conditions */}
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="agreeToTerms"
                    checked={formData.agreeToTerms}
                    onChange={handleInputChange}
                    className="w-4 h-4 rounded text-[#2d4a3e] focus:ring-[#2d4a3e]"
                  />
                  <label className="ml-2 text-sm text-gray-700">
                    I agree to the{' '}
                    <a href="#" className="underline">
                      Terms & Conditions
                    </a>{' '}
                    <span className="text-red-500">*</span>
                  </label>
                </div>
                {errors.agreeToTerms && (
                  <p className="text-red-500 text-xs -mt-4 mb-4">{errors.agreeToTerms}</p>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-[#2d4a3e] text-white py-3 rounded-full font-medium hover:bg-[#1a2e26] transition-colors text-sm disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Creating Account...' : 'Sign Up'}
                </button>
              </form>

              <p className="text-center text-sm text-gray-700 mt-6">
                Already have an account?{' '}
                <Link to="/login" className="font-bold underline">
                  Login
                </Link>
              </p>
            </div>
          </div>

          {/* RIGHT SIDE – IMAGE */}
          <div className="hidden lg:flex w-full lg:w-1/2 bg-[#F3F1EA] overflow-hidden">
            <div className="relative w-full h-full">
              <img
                src="https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=900&fit=crop"
                alt="Books aesthetic"
                className="
                  absolute
                  top-1/2
                  right-[-20%]
                  -translate-y-1/2
                  w-[120%]
                  h-auto
                  object-cover
                "
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;