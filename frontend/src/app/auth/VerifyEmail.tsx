// frontend/src/pages/VerifyEmailPage.tsx
import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { verifyEmail, resendVerificationEmail } from '../../lib/auth';

const VerifyEmailPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState<string | null>(null);
  const [isResending, setIsResending] = useState(false);

  useEffect(() => {
    const verifyToken = async () => {
      const token = searchParams.get('token');
      
      if (!token) {
        setStatus('error');
        setMessage('Invalid verification link. No token provided.');
        return;
      }
      
      try {
        const result = await verifyEmail(token);
        
        if (result.success) {
          setStatus('success');
          setMessage(result.message);
          setEmail(result.email || null);
          
          // Auto-redirect to login after 5 seconds
          setTimeout(() => {
            navigate('/login');
          }, 5000);
        } else {
          setStatus('error');
          setMessage(result.message || 'Verification failed.');
        }
      } catch (err: any) {
        setStatus('error');
        setMessage(err.message || 'Failed to verify email. Please try again.');
      }
    };
    
    verifyToken();
  }, [searchParams, navigate]);

  const handleResend = async () => {
    if (!email) return;
    
    setIsResending(true);
    try {
      await resendVerificationEmail(email);
      setMessage('New verification email sent! Please check your inbox.');
    } catch (err: any) {
      setMessage(`Failed to resend: ${err.message}`);
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FAF9F6] px-4 font-serif">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-lg p-8">
        <div className="text-center">
          {/* Status Icon */}
          {status === 'verifying' && (
            <div className="w-16 h-16 border-4 border-[#A3B18A] border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
          )}
          
          {status === 'success' && (
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          )}
          
          {status === 'error' && (
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
          )}
          
          {/* Title */}
          <h2 className="text-2xl font-bold text-[#2E4A3D] mb-4">
            {status === 'verifying' && 'Verifying Your Email'}
            {status === 'success' && 'Email Verified!'}
            {status === 'error' && 'Verification Failed'}
          </h2>
          
          {/* Message */}
          <p className="text-gray-600 mb-6">
            {message}
          </p>
          
          {/* Actions based on status */}
          {status === 'success' && (
            <div className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                <p className="text-sm text-green-800">
                  You will be redirected to login in 5 seconds...
                </p>
              </div>
              <Link
                to="/login"
                className="block w-full py-3 bg-[#B85C38] text-white rounded-full font-bold hover:bg-[#2E4A3D] transition-colors text-center"
              >
                Go to Login Now
              </Link>
            </div>
          )}
          
          {status === 'error' && (
            <div className="space-y-4">
              <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                <p className="text-sm text-red-800">
                  Possible reasons:
                  <br />
                  • The link has expired (valid for 24 hours)
                  <br />
                  • The link was already used
                  <br />
                  • Invalid verification token
                </p>
              </div>
              
              {email && (
                <button
                  onClick={handleResend}
                  disabled={isResending}
                  className="w-full py-3 bg-[#A3B18A] text-white rounded-full font-bold hover:bg-[#2E4A3D] transition-colors disabled:opacity-70"
                >
                  {isResending ? 'Sending...' : 'Resend Verification Email'}
                </button>
              )}
              
              <div className="space-y-2">
                <Link
                  to="/signup"
                  className="block w-full py-3 border-2 border-[#D4A373] text-[#D4A373] rounded-full font-bold hover:bg-[#FAF9F6] transition-colors text-center"
                >
                  Create New Account
                </Link>
                
                <Link
                  to="/"
                  className="block w-full py-3 text-[#333333] rounded-full font-bold hover:text-[#B85C38] transition-colors text-center"
                >
                  Back to Home
                </Link>
              </div>
            </div>
          )}
          
          {/* Status info */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-500">
              {status === 'verifying' && 'Please wait while we verify your email...'}
              {status === 'success' && 'Your email has been successfully verified!'}
              {status === 'error' && 'Need help? Contact support@bookstore.com'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmailPage;