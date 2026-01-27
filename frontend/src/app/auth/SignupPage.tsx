// frontend/src/pages/SignupPage.tsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signup } from '../../lib/auth'; // Updated auth.ts
import TermsPopup from '../../components/layout/TermsPopup';

const SignupPage: React.FC = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    agreeToTerms: false,
  });
  
  const [showTerms, setShowTerms] = useState(false); 
  const [verificationSent, setVerificationSent] = useState(false);
  const [verificationEmail, setVerificationEmail] = useState('');

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

    // Clear related error when user starts typing
    if (errors[name as keyof typeof errors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined, server: undefined }));
    }
  };

  const validateForm = () => {
    const newErrors: typeof errors = {};

    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Enhanced password validation
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
      const result = await signup(
        formData.username.trim(),
        formData.email.trim(),
        formData.password
      );

      // Check if email verification is required
      if (result.requiresVerification || result.message?.includes('check your email')) {
        setVerificationSent(true);
        setVerificationEmail(formData.email);
        // Don't redirect - show verification message
      } else {
        // If immediate login after verification
        alert(result.message || 'Account created successfully!');
        navigate('/login');
      }
    } catch (err: any) {
      setErrors({ 
        server: err.message || 'Signup failed. Please try again.' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendVerification = async () => {
    try {
      setIsLoading(true);
      // You'll need to add resendVerificationEmail to your auth.ts
      // await resendVerificationEmail(verificationEmail);
      alert('Verification email resent! Please check your inbox.');
    } catch (err: any) {
      alert('Failed to resend verification email: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Render verification success modal
  if (verificationSent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAF9F6] px-4 font-serif">
        <div className="w-full max-w-md bg-white rounded-3xl shadow-lg p-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            
            <h2 className="text-2xl font-bold text-[#2E4A3D] mb-3">
              Check Your Email!
            </h2>
            
            <p className="text-gray-600 mb-6">
              We've sent a verification link to 
              <span className="font-semibold text-[#2E4A3D]"> {verificationEmail}</span>.
              Please click the link in the email to activate your account.
            </p>
            
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
              <p className="text-sm text-blue-800">
                <span className="font-semibold">Didn't receive the email?</span> 
                <br />
                • Check your spam folder
                <br />
                • Make sure you entered the correct email
                <br />
                • Wait a few minutes
              </p>
            </div>
            
            <div className="space-y-3">
              <button
                onClick={handleResendVerification}
                disabled={isLoading}
                className="w-full py-3 bg-[#A3B18A] text-white rounded-full font-bold hover:bg-[#2E4A3D] transition-colors disabled:opacity-70"
              >
                {isLoading ? 'Sending...' : 'Resend Verification Email'}
              </button>
              
              <button
                onClick={() => {
                  setVerificationSent(false);
                  navigate('/login');
                }}
                className="w-full py-3 border-2 border-[#D4A373] text-[#D4A373] rounded-full font-bold hover:bg-[#FAF9F6] transition-colors"
              >
                Back to Login
              </button>
            </div>
            
            <p className="text-sm text-gray-500 mt-6">
              Already verified?{' '}
              <Link to="/login" className="text-[#B85C38] font-semibold hover:underline">
                Login here
              </Link>
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Original form JSX (keep everything as is, but update the server error display)
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FAF9F6] px-4 font-serif">
      <div className="w-full max-w-6xl bg-white rounded-3xl shadow-md hover:shadow-2xl transition-all duration-300 overflow-hidden border border-[#F5EBDD]">
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

                {/* Terms Checkbox */}
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="agreeToTerms"
                    checked={formData.agreeToTerms}
                    onChange={handleInputChange}
                    className="w-4 h-4 rounded border-[#F5EBDD] text-[#2E4A3D] focus:ring-[#A3B18A]"
                  />
                  <label className="ml-2 text-sm text-[#333333]">
                    I agree to the{' '}
                    <a onClick={() => setShowTerms(true)} className="underline decoration-[#D4A373] hover:text-[#2E4A3D] cursor-pointer">
                      Terms & Conditions
                    </a>{' '}
                    <span className="text-[#B85C38]">*</span>
                  </label>
                </div>
                {errors.agreeToTerms && (
                  <p className="text-[#B85C38] text-xs -mt-4 mb-4">{errors.agreeToTerms}</p>
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
              src="https://www.quranreading.com/pages/blog/wp-content/uploads/2019/11/b2ap3_large_quran_peace.jpg"
              alt="Cozy stack of vintage books"
              className="absolute inset-0 w-full h-full object-cover object-center opacity-90 scale-105"
            />
            <div className="absolute inset-0 bg-[#2E4A3D] opacity-10 pointer-events-none"></div>
          </div>
        </div>
      </div>
      
      <TermsPopup
        isOpen={showTerms}
        onClose={() => setShowTerms(false)}
      />
    </div>
  );
};

export default SignupPage;