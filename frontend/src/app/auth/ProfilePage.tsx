// src/app/auth/ProfilePage.tsx

import React, { useState } from "react";
import Navbar from "../../components/layout/Navbar";
import Sidebar from "../../components/layout/Sidebar"; // Your beautiful sidebar
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
  // Track current section using the same keys as your Sidebar
  const [currentSection, setCurrentSection] = useState<"account" | "edit-profile" | "privacy" | "notifications" | "security" | "orders" | "orders-history">("account");

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

  return (
    <>
      <Navbar />
      <div className="flex min-h-screen bg-gray-50">
        {/* Pass the setter to Sidebar so it can control the view */}
        <Sidebar currentSection={currentSection} onSectionChange={setCurrentSection} />

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