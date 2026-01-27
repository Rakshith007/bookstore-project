import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signup } from '../../lib/auth';
import TermsPopup from "../../components/layout/TermsPopup"; // <-- Add this import

const SignupPage: React.FC = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    agreeToTerms: false,
  });

  const [showTerms, setShowTerms] = useState(false); // <-- Add state for popup

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

    if (errors[name as keyof typeof errors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined, server: undefined }));
    }
  };

  const validateForm = () => {
    const newErrors: typeof errors = {};

    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else {
      const pwd = formData.password;

      if (pwd.length < 6 || pwd.length > 8) {
        newErrors.password = 'Password must be 6–8 characters long';
      } else if (!/[A-Za-z]/.test(pwd)) {
        newErrors.password = 'Password must contain at least one letter';
      } else if (!/[0-9]/.test(pwd)) {
        newErrors.password = 'Password must contain at least one number';
      } else if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pwd)) {
        newErrors.password = 'Password must contain at least one special character';
      }
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

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

  const handleGoogleSignup = () => {
    console.log("Google Signup clicked");
  };

  return (
    <>
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
            {/* LEFT SIDE – FORM */}
            <div className="w-full lg:w-1/2 flex items-center justify-center px-6 py-12 lg:px-20">
              <div className="w-full max-w-[450px]">
                <h1 className="text-3xl font-bold text-[#2E4A3D] leading-tight mb-3">
                  Create Your Account
                </h1>
                <p className="text-sm text-[#333333] mb-8">
                  Join our bookstore and start your reading journey.
                </p>

                {errors.server && (
                  <div className="mb-6 p-4 bg-red-50 border border-red-200 text-[#B85C38] rounded-lg text-sm">
                    {errors.server}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                  {/* Username */}
                  <div>
                    <label className="block text-xs font-bold text-[#333333] mb-2 uppercase tracking-wide">
                      User Name <span className="text-[#B85C38]">*</span>
                    </label>
                    <input
                      type="text"
                      name="username"
                      value={formData.username}
                      onChange={handleInputChange}
                      placeholder="Enter your user name"
                      className={`w-full px-4 py-3 bg-[#FAF9F6] border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A3B18A] text-sm ${errors.username ? 'border-[#B85C38]' : 'border-[#F5EBDD]'
                        }`}
                    />
                    {errors.username && <p className="text-[#B85C38] text-xs mt-1">{errors.username}</p>}
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-xs font-bold text-[#333333] mb-2 uppercase tracking-wide">
                      Email <span className="text-[#B85C38]">*</span>
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="Enter your email"
                      className={`w-full px-4 py-3 bg-[#FAF9F6] border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A3B18A] text-sm ${errors.email ? 'border-[#B85C38]' : 'border-[#F5EBDD]'
                        }`}
                    />
                    {errors.email && <p className="text-[#B85C38] text-xs mt-1">{errors.email}</p>}
                  </div>

                  {/* Password */}
                  <div>
                    <label className="block text-xs font-bold text-[#333333] mb-2 uppercase tracking-wide">
                      Password <span className="text-[#B85C38]">*</span>
                    </label>
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      placeholder="Enter your password"
                      className={`w-full px-4 py-3 bg-[#FAF9F6] border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A3B18A] text-sm ${errors.password ? 'border-[#B85C38]' : 'border-[#F5EBDD]'
                        }`}
                    />
                    {errors.password ? (
                      <p className="text-[#B85C38] text-xs mt-1">{errors.password}</p>
                    ) : (
                      <p className="text-[#666666] text-xs mt-1">
                        6–8 characters • 1 letter • 1 number • 1 special char (!@#$%^&*)
                      </p>
                    )}
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <label className="block text-xs font-bold text-[#333333] mb-2 uppercase tracking-wide">
                      Confirm Password <span className="text-[#B85C38]">*</span>
                    </label>
                    <input
                      type="password"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      placeholder="Confirm your password"
                      className={`w-full px-4 py-3 bg-[#FAF9F6] border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A3B18A] text-sm ${errors.confirmPassword ? 'border-[#B85C38]' : 'border-[#F5EBDD]'
                        }`}
                    />
                    {errors.confirmPassword && (
                      <p className="text-[#B85C38] text-xs mt-1">{errors.confirmPassword}</p>
                    )}
                  </div>

                  {/* Terms Checkbox with clickable Terms link */}
                  <div className="flex items-start">
                    <input
                      type="checkbox"
                      name="agreeToTerms"
                      checked={formData.agreeToTerms}
                      onChange={handleInputChange}
                      className="w-4 h-4 mt-0.5 rounded border-[#F5EBDD] text-[#2E4A3D] focus:ring-[#A3B18A]"
                    />
                    <label className="ml-3 text-sm text-[#333333]">
                      I agree to the{' '}
                      <button
                        type="button"
                        onClick={() => setShowTerms(true)}
                        className="underline decoration-[#D4A373] text-[#333333] hover:text-[#2E4A3D] font-medium transition-colors"
                      >
                        Terms & Conditions
                      </button>{' '}
                      <span className="text-[#B85C38]">*</span>
                    </label>
                  </div>
                  {errors.agreeToTerms && (
                    <p className="text-[#B85C38] text-xs -mt-2 mb-4 ml-7">{errors.agreeToTerms}</p>
                  )}

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-[#B85C38] text-white py-3.5 rounded-full font-bold hover:bg-[#2E4A3D] transition-colors shadow-md text-sm disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {isLoading ? 'Creating Account...' : 'Sign Up'}
                  </button>
              
                </form>

                <p className="text-center text-sm text-[#333333] mt-6">
                  Already have an account?{' '}
                  <Link to="/login" className="font-bold underline decoration-[#D4A373] text-[#2E4A3D]">
                    Login
                  </Link>
                </p>
              </div>
            </div>

            {/* RIGHT SIDE – IMAGE */}
            <div className="hidden lg:flex w-full lg:w-1/2 bg-[#F5EBDD] overflow-hidden relative">
              <img
                src="https://images.unsplash.com/photo-1541963463532-d68292c34b19?q=80&w=688&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                alt="Cozy stack of vintage books"
                className="absolute inset-0 w-full h-full object-cover object-center opacity-90 scale-105"
              />
              <div className="absolute inset-0 bg-[#2E4A3D] opacity-10 pointer-events-none"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Terms Popup Modal */}
      <TermsPopup
        isOpen={showTerms}
        onClose={() => setShowTerms(false)}
      />
    </>
  );
};

export default SignupPage;