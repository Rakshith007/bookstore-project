// src/app/auth/ProfilePage.tsx

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/layout/Navbar";
import AccountInfopage from "../../components/profilecom/AccountInfoPage";
import EditProfileSection from "../../components/profilecom/EditProfileSection";
import NotificationSettings from "../../components/profilecom/NotificationSettings";
import PrivacySettings from "../../components/profilecom/PrivacySettings";
import SecuritySettings from "../../components/profilecom/SecuritySettings";
import OrderDetailsPage from "../settings/OrderDetailsPage";
import OrderHistoryPage from "../settings/OrderHistoryPage";

// Optional: Orders pages when ready
// import CurrentOrders from "...";
// import OrderHistory from "...";

const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const [isCheckingAuth, setIsCheckingAuth] = useState<boolean>(true);
  
  // Track current section using the same keys as your Sidebar
  const [currentSection, setCurrentSection] = useState<"account" | "edit-profile" | "privacy" | "notifications" | "security" | "orders" | "orders-history">("account");

  // Check authentication on component mount
  useEffect(() => {
    // Function to check if user is logged in
    const checkIfUserIsLoggedIn = () => {
      // Check for authentication token in localStorage
      const token = localStorage.getItem("authToken");
      
      // Check for user data in localStorage
      const userData = localStorage.getItem("user");
      
      // Check for auth in sessionStorage (if you use it)
      const sessionToken = sessionStorage.getItem("authToken");
      const sessionUserData = sessionStorage.getItem("user");
      
      // If any authentication method exists, user is logged in
      const isLoggedIn = !!(token || userData || sessionToken || sessionUserData);
      console.log(isLoggedIn)
      console.log(token)
      console.log(userData)
      console.log(sessionUserData)
      console.log(sessionToken)
      if (!isLoggedIn) {
        // Redirect to login page immediately
        navigate("/login");
      } else {
        // User is authenticated, stop checking
        setIsCheckingAuth(false);
      }
    };
    
    checkIfUserIsLoggedIn();
  }, [navigate]);

  // Map section key to component
  const renderContent = () => {
    switch (currentSection) {
      case "account":
        return <AccountInfopage />;
      case "edit-profile":
        return <EditProfileSection />;
      case "privacy":
        return <PrivacySettings />;
      case "notifications":
        return <NotificationSettings />;
      case "security":
        return <SecuritySettings />;
      case "orders":
        return <OrderDetailsPage />;
      case "orders-history":
         return <OrderHistoryPage />;
      default:
        return <AccountInfopage />;
    }
  };

  // Show loading/checking state while verifying authentication
  if (isCheckingAuth) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
          <p className="mt-3 text-gray-600">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // Only render the profile content if user is authenticated
  // (If not authenticated, they would have been redirected already)
  return (
    <>
      <Navbar />
      <div className="flex min-h-screen bg-gray-50">
        {/* Main Content Area */}
        <main className="flex-1 p-8">
          <div className="max-w-5xl mx-auto">
            {renderContent()}
          </div>
        </main>
      </div>
    </>
  );
};

export default ProfilePage;