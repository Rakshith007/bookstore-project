// src/App.tsx
import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import BookProductPage from "./app/books/BookProductPage";
import BookSearchPage from "./app/books/BookSearchPage";
import BooksListingPage from "./app/books/BookListingPage";
import WishlistPage from "./app/wishlist/WishlistPage";
import CartPage from "./app/carts/CartPage";
import CheckoutPage from "./app/checkout/CheckoutPage";
import OldCheckoutPage from "./app/checkout/OldCheckoutPage";
import LoginPage from "./app/auth/LoginPage";
import UserProfilePage from "./app/auth/ProfilePage";
import SignupPage from "./app/auth/SignupPage";
import BookHaven from "./app/homepage/BookHaven";
import AboutPage from "./app/homepage/AboutPage";
import PaymentMethodPage from "./app/payment/PaymentMethod";
import OrderDetailsPage from "./app/settings/OrderDetailsPage";
import OrderSuccessPage from "./app/settings/OrderPlacedPage";
import AccountInfopage from "./components/profilecom/AccountInfoPage";
import EditProfileSection from "./components/profilecom/EditProfileSection";
import NotificationSettings from "./components/profilecom/NotificationSettings";
import PrivacySettings from "./components/profilecom/PrivacySettings";
import SecuritySettings from "./components/profilecom/SecuritySettings";
import DashboardPage from "./app/admin/DashboardPage";
import OrdersPage from "./app/admin/OrdersPage"
import UserManagement from "./app/admin/UserMangementPage";
import BooksManagementPage from "./app/admin/BooksManagementPage";
import ShippingQueue from "./app/admin/ShippingQueue";
import AddBookPage from "./app/admin/AddBookPage";
import IncomingOrdersPage from "./app/Warehouse/IncomingOrderPage";
import InventoryCheck from "./app/Warehouse/Inventorycheck";
import PickAndPackPage from "./app/Warehouse/PickandPackPage";
import GenerateLabelPage from "./app/Warehouse/GeneratelabelPage";
import  HomepageEditor  from "./app/admin/HomepageEditor";
import WishlistEmpty from "./app/wishlist/WishlistEmpty";
import CartEmptyContent from "./app/carts/CartEmptyContent";

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<BookHaven />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/profile" element={<UserProfilePage />} />
        <Route path="/books" element={<BooksListingPage />} />
        <Route path="/books/:id" element={<BookProductPage />} />
        <Route path="/search" element={<BookSearchPage />} />
        <Route path="/wishlist" element={<WishlistPage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/wishlist/empty" element={<WishlistEmpty />} />
        <Route path="/cart/empty" element={<CartEmptyContent />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/old-checkout" element={<OldCheckoutPage />} />
        <Route path="/payment" element={<PaymentMethodPage/>} />
        <Route path="/orderdetail" element={<OrderDetailsPage/>} />
        <Route path="/ordersuccess" element={<OrderSuccessPage/>} />
        <Route path="/accountinfo" element={<AccountInfopage />} />
        <Route path="/editprofile" element={<EditProfileSection />} />
        <Route path="/notification" element={<NotificationSettings />} />
        <Route path="/privacy" element={<PrivacySettings />} />
        <Route path="/security" element={<SecuritySettings />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/admin/homepageEditor" element={<HomepageEditor />} />
        <Route path="/admin/orders" element={<OrdersPage />} />
        <Route path="/admin/users" element={<UserManagement />} />
        <Route path="/admin/books" element={<BooksManagementPage />} />
        <Route path="/admin/shippingqueue" element={<ShippingQueue />} />
        <Route path="/admin/addbookpage" element={<AddBookPage />} />
        <Route path="/warehouse/incomingorders" element={<IncomingOrdersPage />} />
        <Route path="/warehouse/inventorycheck" element={<InventoryCheck />} />
        <Route path="/warehouse/pickandpack" element={<PickAndPackPage />} />
        <Route path="/warehouse/generatelabel" element={<GenerateLabelPage />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;