import React from "react";
import { Link } from "react-router-dom";

const CartEmptyContent: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-paper dark:bg-background-dark transition-colors">
    <main className="flex-grow flex items-center justify-center px-6 pt-20 relative overflow-hidden">

      {/* Background blobs */}
     {/* Center blue background glow */}
<div
  className="absolute inset-0 flex items-center justify-center pointer-events-none"
>
  <div
    className="w-[600px] h-[600px] rounded-full 
               bg-blue-500/25
               blur-[160px]"
  />
</div>

      <div
  className="absolute left-1/2 top-1/2
             w-64 h-64
             -translate-x-1/2 -translate-y-1/2
             bg-slate-200/50 dark:bg-slate-700/20
             rounded-full
             blur-[80px]"
/>


      <div className="relative z-10 max-w-2xl w-full text-center py-16">

        {/* Illustration */}
        <div className="mb-10 p-8 rounded-full bg-white dark:bg-slate-800/50 shadow-soft ring-1 ring-slate-100 dark:ring-slate-700/50 inline-block">
          <svg
            className="text-slate-300 dark:text-slate-600"
            width="120"
            height="120"
            viewBox="0 0 120 120"
            fill="none"
          >
            <circle cx="60" cy="60" r="58" stroke="currentColor" strokeWidth="1.5" strokeDasharray="8 8" opacity="0.3" />
            <path d="M40 45H80L75 75H45L40 45Z" stroke="currentColor" strokeWidth="2" />
            <path d="M45 75V80C45 82.7 47.2 85 50 85H70C72.7 85 75 82.7 75 80V75" stroke="currentColor" strokeWidth="2" />
            <path d="M52 35H68V65C68 66 67 67 66 67H54C53 67 52 66 52 65V35Z" fill="currentColor" />
            <path d="M60 35V67" stroke="#195de6" strokeWidth="1.5" />
            <path d="M78 45L85 30H95" stroke="currentColor" strokeWidth="2" />
            <circle cx="50" cy="85" r="3" fill="currentColor" />
            <circle cx="70" cy="85" r="3" fill="currentColor" />
          </svg>
        </div>

        {/* Text */}
        <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">
          Your Cart Is Empty
        </h1>

        <p className="text-lg text-slate-500 dark:text-slate-400 max-w-md mx-auto mb-10 font-light">
          Looks like you haven’t added any books yet. Start exploring and add your next great read.
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/search"
            className="px-8 py-4 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-900 dark:text-white font-medium shadow-sm hover:shadow-md transition"
          >
            Start Shopping
          </Link>
          <Link to="/"
            className="px-8 py-4 rounded-full border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition"
          >
            View Bestsellers
          </Link>
        </div>

      </div>
    </main>
    </div>
  );
};

export default CartEmptyContent;
