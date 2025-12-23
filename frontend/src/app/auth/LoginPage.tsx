import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { login } from '../../lib/auth'; // Adjust path if needed

export default function LoginPage() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

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

    // Clear field error when user types
    if (errors[name as keyof typeof errors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined, server: undefined }));
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);
    setErrors({});

    try {
      await login(formData.email.trim(), formData.password);

      // Success! Token is saved in localStorage by login()
      alert('Login successful! Welcome back.');
      navigate('/'); // Change to your dashboard route, e.g., '/dashboard' or '/books'
    } catch (err: any) {
      const message = err.message || 'Login failed. Please try again.';
      setErrors({ server: message });

      // Specific helpful messages from backend
      if (message.includes('Invalid credentials')) {
        setErrors({ server: 'Incorrect email or password.' });
      } else if (message.includes('Admins only')) {
        setErrors({ server: 'This account is not authorized to log in yet.' });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4 font-serif">
      {/* LOGIN CONTAINER BOX */}
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
          {/* LEFT SECTION – FORM */}
          <div className="w-full lg:w-1/2 flex items-center justify-center px-6 py-12 lg:px-20">
            <div className="w-full max-w-[450px]">
              {/* Title */}
              <h1 className="text-3xl lg:text-[40px] font-bold text-gray-900 leading-tight mb-3">
                Welcome Back
              </h1>
              <p className="text-sm lg:text-base text-gray-700 mb-8 lg:mb-10">
                Join and get personalized book recommendations
              </p>

              {/* Server Error */}
              {errors.server && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                  {errors.server}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Email */}
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="Enter your email"
                    className={`w-full px-4 py-3.5 rounded-xl border text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-100 text-sm ${
                      errors.email ? 'border-red-500' : 'border-gray-200'
                    }`}
                  />
                  {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                </div>

                {/* Password */}
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      placeholder="Enter your password"
                      className={`w-full px-4 py-3.5 rounded-xl border text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-100 text-sm ${
                        errors.password ? 'border-red-500' : 'border-gray-200'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                  {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
                </div>

                {/* Login Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-[#B85C38] hover:bg-[#8B5A3C] text-white font-semibold py-3.5 rounded-[32px] transition-colors mt-6 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Logging in...' : 'Login'}
                </button>

                {/* Optional: Social Logins (you can implement later) */}
                <button
                  type="button"
                  disabled
                  className="w-full bg-[#F5F5F5] text-gray-500 font-semibold py-3.5 rounded-[32px] cursor-not-allowed"
                >
                  Continue with Apple (Coming soon)
                </button>

                <button
                  type="button"
                  disabled
                  className="w-full bg-[#F5F5F5] text-gray-500 font-semibold py-3.5 rounded-[32px] cursor-not-allowed"
                >
                  Continue with Google (Coming soon)
                </button>
              </form>

              {/* Footer */}
              <div className="mt-8 text-center space-y-2.5">
                <p className="text-gray-700 text-sm">
                  Don't have an account?{' '}
                  <Link to="/signup" className="font-bold underline">
                    Sign up
                  </Link>
                </p>
                <p>
                  <a href="#" className="text-gray-700 underline text-sm">
                    Terms & Conditions
                  </a>
                </p>
              </div>
            </div>
          </div>

          {/* RIGHT SECTION – HALF IMAGE */}
          <div className="hidden lg:flex w-full lg:w-1/2 bg-[#F3F1EA] overflow-hidden">
            <div className="relative w-full h-full">
              <img
                src="https://images.unsplash.com/photo-1512820790803-83ca734da794?w=800&h=800&fit=crop"
                alt="Open book"
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
}