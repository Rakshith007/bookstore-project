// src/App.tsx
import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// New import - add this
import { useEffect } from "react";
import { useLocation } from "react-router-dom";

// Scroll to top helper component
function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    // Most reliable way in 2025 → instant jump to top
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });

    // Alternative (if you prefer smooth animation):
    // window.scrollTo({ top: 0, behavior: "smooth" });
  }, [pathname]);

  return null;
}

// ────────────────────────────────────────────────
// Your existing page imports (unchanged)
import BookProductPage from "./app/books/BookProductPage";
import BookSearchPage from "./app/books/BookSearchPage";
import BooksListingPage from "./app/books/BookListingPage";
import WishlistPage from "./app/wishlist/WishlistPage";
import CartPage from "./app/carts/CartPage";
import LoginPage from "./app/auth/LoginPage";
import UserProfilePage from "./app/auth/ProfilePage";
import SignupPage from "./app/auth/SignupPage";
import BookHaven from "./app/homepage/BookHaven";
import AboutPage from "./app/homepage/AboutPage";
import PaymentMethodPage from "./app/payment/PaymentMethod";
import OrderDetailsPage from "./app/settings/OrderDetailsPage";
import OrderSuccessPage from "./app/settings/OrderPlacedPage";
import OrderHistoryPage from "./app/settings/OrderHistoryPage";
import AccountInfopage from "./components/profilecom/AccountInfoPage";
import EditProfileSection from "./components/profilecom/EditProfileSection";
import TermsPage from "./app/auth/TermsPage";
import Privacy from "./app/auth/Privacy";
import NotificationSettings from "./components/profilecom/NotificationSettings";
import PrivacySettings from "./components/profilecom/PrivacySettings";
import SecuritySettings from "./components/profilecom/SecuritySettings";
import DashboardPage from "./app/admin/DashboardPage";
import OrdersPage from "./app/admin/OrdersPage";
import UserManagement from "./app/admin/UserMangementPage";
import BooksManagementPage from "./app/admin/BooksManagementPage";
import ShippingQueue from "./app/admin/ShippingQueue";
import AddBookPage from "./app/admin/AddBookPage";
import IncomingOrdersPage from "./app/Warehouse/IncomingOrderPage";
import InventoryCheck from "./app/Warehouse/Inventorycheck";
import PickAndPackPage from "./app/Warehouse/PickandPackPage";
import GenerateLabelPage from "./app/Warehouse/GeneratelabelPage";
import WishlistEmpty from "./app/wishlist/WishlistEmpty";
import CartEmptyContent from "./app/carts/CartEmptyContent";
import AdminLoginPage from "./app/admin/AdminLoginPage";
import ProtectedAdminRoute from './components/auth/ProtectedAdminRoute';
import VerifyEmailPage from "./app/auth/VerifyEmail";
import VerifyDeliveryPage from "./app/admin/VerifyDeliveryPage";


// Page Not Found Component (unchanged)
const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
      <div className="text-center max-w-md">
        <h1 className="text-6xl font-bold text-gray-800 mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-gray-700 mb-6">Page Not Found</h2>
        <p className="text-gray-600 mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="space-y-3">
          <a 
            href="/" 
            className="inline-block w-full px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go to Homepage
          </a>
          <button 
            onClick={() => window.history.back()}
            className="inline-block w-full px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <BrowserRouter>
      {/* Add this line – fixes scroll-to-top on navigation */}
      <ScrollToTop />

      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<BookHaven />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/verify-email" element={<VerifyEmailPage />} /> {/* NEW ROUTE */}
        <Route path="/terms" element={<TermsPage />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/verify-delivery/:batchId" element={<VerifyDeliveryPage />} />
        
        {/* Book Routes */}
        <Route path="/search" element={<BookSearchPage />} />
        <Route path="/books/:id" element={<BookProductPage />} />
        
        {/* User Routes */}
        <Route path="/profile" element={<UserProfilePage />} />
        <Route path="/wishlist" element={<WishlistPage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/wishlist/empty" element={<WishlistEmpty />} />
        <Route path="/cart/empty" element={<CartEmptyContent />} />
        
        {/* Order & Payment Routes */}
        <Route path="/payment" element={<PaymentMethodPage />} />
        <Route path="/orderdetail" element={<OrderDetailsPage />} />
        <Route path="/ordersuccess" element={<OrderSuccessPage />} />
        <Route path="/orders-history" element={<OrderHistoryPage />} />
        
        {/* Profile Settings Routes */}
        <Route path="/accountinfo" element={<AccountInfopage />} />
        <Route path="/editprofile" element={<EditProfileSection />} />
        <Route path="/notification" element={<NotificationSettings />} />
        <Route path="/privacy-settings" element={<PrivacySettings />} />
        <Route path="/security" element={<SecuritySettings />} />
        
        {/* Admin Routes */}
        <Route path="/admin/login" element={<AdminLoginPage />} />
        <Route element={<ProtectedAdminRoute />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/admin/orders" element={<OrdersPage />} />
          <Route path="/admin/users" element={<UserManagement />} />
          <Route path="/admin/books" element={<BooksManagementPage />} />
          <Route path="/admin/shippingqueue" element={<ShippingQueue />} />
          <Route path="/admin/addbookpage" element={<AddBookPage />} />
        </Route>
        
        {/* Warehouse Routes */}
        <Route path="/warehouse/incomingorders" element={<IncomingOrdersPage />} />
        <Route path="/warehouse/inventorycheck" element={<InventoryCheck />} />
        <Route path="/warehouse/pickandpack" element={<PickAndPackPage />} />
        <Route path="/warehouse/generatelabel" element={<GenerateLabelPage />} />
        
        {/* Redirect old privacy route to avoid conflict */}
        <Route path="/privacy-settings" element={<PrivacySettings />} />
        
        {/* 404 */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;