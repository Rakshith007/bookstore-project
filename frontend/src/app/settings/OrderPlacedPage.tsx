import React, { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import { CheckCircle, PartyPopper, Heart, Sparkles } from "lucide-react";
import Confetti from "react-confetti";

import Navbar from "../../components/layout/Navbar";
import Footer from "../../components/layout/Footer";

const OrderSuccessPage: React.FC = () => {
  const [showConfetti, setShowConfetti] = useState(true);
  const [showTick, setShowTick] = useState(false);
  const [showTitle, setShowTitle] = useState(false);
  const [showMessage, setShowMessage] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [showButtons, setShowButtons] = useState(false);
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  const tickRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener("resize", handleResize);

    // Staggered animations sequence
    const sequence = [
      () => setShowTick(true),
      () => setShowTitle(true),
      () => setShowMessage(true),
      () => setShowDetails(true),
      () => setShowButtons(true),
    ];

    sequence.forEach((step, index) => {
      setTimeout(step, index * 300);
    });

    // Stop confetti after 8 seconds
    const confettiTimer = setTimeout(() => {
      setShowConfetti(false);
    }, 8000);

    return () => {
      window.removeEventListener("resize", handleResize);
      clearTimeout(confettiTimer);
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 via-white to-emerald-50">
      {/* Enhanced Confetti with 3D effect */}
      {showConfetti && (
        <div className="fixed inset-0 z-50 pointer-events-none">
          <Confetti
            width={windowSize.width}
            height={windowSize.height}
            recycle={true}
            numberOfPieces={300}
            gravity={0.15}
            wind={0.01}
            opacity={0.9}
            colors={['#10B981', '#3B82F6', '#8B5CF6', '#EF4444', '#F59E0B', '#EC4899']}
            confettiSource={{
              x: windowSize.width / 2,
              y: windowSize.height / 2,
              w: 0,
              h: 0
            }}
            initialVelocityX={15}
            initialVelocityY={30}
            tweenDuration={8000}
          />
          
          {/* Sparkle particles */}
          <div className="absolute inset-0">
            {[...Array(30)].map((_, i) => (
              <div
                key={i}
                className="absolute animate-sparkle"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  width: `${Math.random() * 20 + 10}px`,
                  height: `${Math.random() * 20 + 10}px`,
                  animationDelay: `${Math.random() * 2}s`,
                }}
              >
                <Sparkles className="w-full h-full text-yellow-400" fill="currentColor" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ✅ Shared Navbar */}
      <Navbar />

      {/* Main Content */}
      <main className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20 relative z-10">
        {/* 3D Success Animation */}
        <div className="relative mb-12 sm:mb-16">
          {/* Animated Ring */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-48 h-48 rounded-full border-4 border-emerald-200 animate-ping-slow opacity-70"></div>
            <div className="absolute w-64 h-64 rounded-full border-2 border-emerald-100 animate-spin-slow"></div>
          </div>

          {/* Success Icon with 3D effect */}
          <div 
            ref={tickRef}
            className={`relative mx-auto w-40 h-40 mb-8 transform transition-all duration-1000 ${
              showTick 
                ? 'opacity-100 scale-100 rotate-0' 
                : 'opacity-0 scale-50 rotate-180'
            }`}
          >
            {/* Glow effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-green-500 rounded-full blur-xl opacity-60 animate-pulse"></div>
            
            {/* 3D Circle */}
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 via-green-500 to-emerald-600 rounded-full flex items-center justify-center shadow-2xl transform perspective-1000">
              <div className="relative w-full h-full rounded-full overflow-hidden">
                {/* Inner shadow for 3D effect */}
                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-transparent to-white opacity-10"></div>
                {/* Highlight */}
                <div className="absolute top-2 left-8 w-16 h-8 bg-gradient-to-b from-white to-transparent opacity-30 rounded-full blur-sm"></div>
              </div>
              
              {/* Tick with bounce animation */}
              <div className={`absolute inset-0 flex items-center justify-center transform transition-transform duration-500 ${
                showTick ? 'scale-110' : 'scale-0'
              }`}>
                <div className="relative">
                  <CheckCircle 
                    className="w-24 h-24 text-white drop-shadow-2xl animate-bounce-slow" 
                    strokeWidth={2}
                  />
                  {/* Subtle shine on tick */}
                  <div className="absolute top-1/4 left-1/4 w-8 h-12 bg-gradient-to-b from-white to-transparent opacity-20 rounded-full blur-sm"></div>
                </div>
              </div>
            </div>

            {/* Floating particles around circle */}
            {showTick && (
              <>
                {[...Array(8)].map((_, i) => (
                  <div
                    key={i}
                    className="absolute w-3 h-3 bg-yellow-400 rounded-full animate-float-around"
                    style={{
                      animationDelay: `${i * 0.2}s`,
                      left: `${50 + 60 * Math.cos((i * Math.PI) / 4)}%`,
                      top: `${50 + 60 * Math.sin((i * Math.PI) / 4)}%`,
                    }}
                  ></div>
                ))}
              </>
            )}
          </div>
        </div>

        {/* Success Message with staggered reveal */}
        <div className="text-center mb-12">
          {/* Success Badge */}
          <div className={`inline-flex items-center gap-3 bg-gradient-to-r from-emerald-500 to-green-600 px-8 py-4 rounded-full mb-8 shadow-lg transform transition-all duration-700 ${
            showTitle ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}>
            <PartyPopper className="w-6 h-6 text-white animate-wiggle" />
            <span className="text-white font-semibold text-lg tracking-wide">
              Donation Successful!
            </span>
          </div>

          {/* Main Title with gradient and 3D text effect */}
          <h1 className={`text-5xl sm:text-6xl lg:text-7xl font-bold mb-8 transform transition-all duration-800 delay-300 ${
            showTitle ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}>
            <span className="relative">
              <span className="text-gray-900 tracking-tight">
                Thank You for Your 
              </span>
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 via-green-500 to-emerald-700 relative inline-block">
                <span className="relative z-10">Generous Donation</span>
                {/* 3D text shadow effect */}
                <span className="absolute inset-0 text-transparent bg-clip-text bg-gradient-to-r from-emerald-800 via-green-700 to-emerald-900 transform translate-x-1 translate-y-1 ">
                  Generous Donation
                </span>
              </span>
              <span className="text-gray-900 tracking-tight">!</span>
            </span>
          </h1>

          {/* Heart Animation */}
          <div className={`flex justify-center mb-8 transform transition-all duration-700 delay-600 ${
            showMessage ? 'opacity-100 scale-100' : 'opacity-0 scale-50'
          }`}>
            <div className="relative">
              <Heart 
                className="w-12 h-12 text-red-500 animate-heartbeat" 
                fill="currentColor"
              />
              <div className="absolute inset-0 bg-red-500 rounded-full animate-ping opacity-20"></div>
            </div>
          </div>

          {/* Message */}
          <p className={`text-gray-700 text-xl sm:text-2xl max-w-3xl mx-auto mb-10 leading-relaxed transform transition-all duration-700 delay-900 ${
            showMessage ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}>
            Your generosity is creating waves of positive change. 
            We're honored by your trust and commitment to making the world better.
            
          </p>

          {/* Details Card with glass morphism effect */}
         

          {/* Action Buttons with hover effects */}
          <div className={`flex flex-col sm:flex-row gap-6 justify-center items-center mt-12 transform transition-all duration-800 delay-1500 ${
            showButtons ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}>
            <Link
              to="/"
              className="group relative px-10 py-4 bg-gray-900 text-white font-semibold rounded-2xl hover:bg-gray-800 transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:-translate-y-1"
            >
              <span className="relative z-10">Return to Home</span>
              <div className="absolute inset-0 bg-gradient-to-r from-gray-800 to-gray-900 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </Link>
            <Link
              to="/search"
              className="group relative px-10 py-4 bg-gradient-to-r from-emerald-500 to-green-600 text-white font-semibold rounded-2xl hover:from-emerald-600 hover:to-green-700 transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:-translate-y-1 hover:scale-105"
            >
              <span className="relative z-10 flex items-center gap-2">
                <Heart className="w-5 h-5" fill="currentColor" />
                Make Another Donation
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-600 to-green-700 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              {/* Shine effect */}
              <div className="absolute top-0 left-0 w-full h-full overflow-hidden rounded-2xl">
                <div className="absolute top-0 left-0 w-10 h-full bg-gradient-to-r from-transparent via-white/30 to-transparent -skew-x-12 animate-shine"></div>
              </div>
            </Link>
          </div>

          {/* Share Section */}
          
        </div>
      </main>

      {/* ✅ Shared Footer */}
      <Footer />
    </div>
  );
};

// Add CSS animations
const styles = `
  @keyframes float {
    0%, 100% { transform: translateY(0) rotate(0deg); }
    50% { transform: translateY(-20px) rotate(10deg); }
  }
  
  @keyframes float-around {
    0%, 100% { transform: rotate(0deg) translateX(60px) rotate(0deg); }
    100% { transform: rotate(360deg) translateX(60px) rotate(-360deg); }
  }
  
  @keyframes heartbeat {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.1); }
  }
  
  @keyframes wiggle {
    0%, 100% { transform: rotate(0deg); }
    25% { transform: rotate(-5deg); }
    75% { transform: rotate(5deg); }
  }
  
  @keyframes spin-slow {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
  
  @keyframes ping-slow {
    75%, 100% { transform: scale(2); opacity: 0; }
  }
  
  @keyframes bounce-slow {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-10px); }
  }
  
  @keyframes sparkle {
    0%, 100% { opacity: 0; transform: scale(0) rotate(0deg); }
    50% { opacity: 1; transform: scale(1) rotate(180deg); }
  }
  
  @keyframes shine {
    0% { transform: translateX(-100%) skewX(-12deg); }
    100% { transform: translateX(200%) skewX(-12deg); }
  }
  
  .animate-float {
    animation: float 3s ease-in-out infinite;
  }
  
  .animate-float-around {
    animation: float-around 4s linear infinite;
  }
  
  .animate-heartbeat {
    animation: heartbeat 1.5s ease-in-out infinite;
  }
  
  .animate-wiggle {
    animation: wiggle 1s ease-in-out infinite;
  }
  
  .animate-spin-slow {
    animation: spin-slow 20s linear infinite;
  }
  
  .animate-ping-slow {
    animation: ping-slow 2s cubic-bezier(0, 0, 0.2, 1) infinite;
  }
  
  .animate-bounce-slow {
    animation: bounce-slow 2s ease-in-out infinite;
  }
  
  .animate-sparkle {
    animation: sparkle 1s ease-in-out infinite;
  }
  
  .animate-shine {
    animation: shine 2s ease-in-out infinite;
  }
  
  .perspective-1000 {
    perspective: 1000px;
  }
  
  .transition-all {
    transition-property: all;
  }
  
  .duration-800 {
    animation-duration: 800ms;
  }
  
  .delay-300 {
    animation-delay: 300ms;
  }
  
  .delay-600 {
    animation-delay: 600ms;
  }
  
  .delay-900 {
    animation-delay: 900ms;
  }
  
  .delay-1200 {
    animation-delay: 1200ms;
  }
  
  .delay-1500 {
    animation-delay: 1500ms;
  }
  
  .delay-1800 {
    animation-delay: 1800ms;
  }
`;

// Inject styles
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement("style");
  styleSheet.innerText = styles;
  document.head.appendChild(styleSheet);
}

export default OrderSuccessPage;