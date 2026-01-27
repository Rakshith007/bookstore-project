// src/pages/CheckYourEmail.tsx  (or wherever your pages live)
import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const CheckYourEmail: React.FC = () => {
  const location = useLocation();
  const email = (location.state as { email?: string })?.email || 'the email you provided';

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FAF9F6] px-4 font-serif">
      <div
        className="
          w-full max-w-md
          bg-white
          rounded-3xl
          shadow-md
          p-8 lg:p-10
          border border-[#F5EBDD]
          text-center
        "
      >
        <h1 className="text-3xl font-bold text-[#2E4A3D] mb-6">
          Check Your Email
        </h1>

        <div className="mb-8 text-[#333333] text-lg leading-relaxed">
          <p className="mb-4">
            We’ve sent a verification link to
          </p>
          <p className="font-medium text-[#2E4A3D] break-all">
            {email}
          </p>
        </div>

        <div className="mb-8 text-sm text-[#666666]">
          <p className="mb-3">
            Click the link in the email to activate your account.
          </p>
          <p>
            Be sure to check your <strong>spam</strong> or <strong>junk</strong> folder if you don’t see it.
          </p>
        </div>

        <div className="space-y-4">
          <Link
            to="/login"
            className="
              block w-full
              bg-[#B85C38] text-white
              py-3.5 rounded-full
              font-bold
              hover:bg-[#2E4A3D]
              transition-colors
              shadow-md
              text-sm
            "
          >
            Go to Login
          </Link>

          <p className="text-sm text-[#333333]">
            Didn’t receive the email?{' '}
            <Link
              to="/signup"
              className="font-bold underline decoration-[#D4A373] text-[#2E4A3D] hover:text-[#B85C38]"
            >
              Try signing up again
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default CheckYourEmail;