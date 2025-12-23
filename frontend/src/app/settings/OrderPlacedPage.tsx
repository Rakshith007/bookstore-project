import React from "react";
import { Link } from "react-router-dom";
import {
  Package,
  Truck,
  CheckCircle,
} from "lucide-react";

import Navbar from "../../components/layout/Navbar";
import Footer from "../../components/layout/Footer";

interface TimelineStepProps {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  isCompleted: boolean;
  isLast?: boolean;
}

const TimelineStep: React.FC<TimelineStepProps> = ({
  icon,
  title,
  subtitle,
  isCompleted,
  isLast = false,
}) => (
  <div className="flex gap-4">
    <div className="flex flex-col items-center">
      <div
        className={`w-10 h-10 rounded-full flex items-center justify-center ${
          isCompleted
            ? "bg-gray-900 text-white"
            : "bg-gray-200 text-gray-500"
        }`}
      >
        {icon}
      </div>
      {!isLast && (
        <div className="w-0.5 h-16 bg-gray-200 mt-2" />
      )}
    </div>
    <div className="flex-1 pt-2 pb-8">
      <h3
        className={`font-semibold ${
          isCompleted ? "text-gray-900" : "text-gray-500"
        }`}
      >
        {title}
      </h3>
      <p className="text-sm text-gray-500 mt-1">
        {subtitle}
      </p>
    </div>
  </div>
);

const OrderSuccessPage: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* ✅ Shared Navbar */}
      <Navbar />

      {/* Main Content */}
      <main className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
        {/* Success Message */}
        <div className="text-center mb-12 sm:mb-16">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            Order Placed Successfully!
          </h1>
          <p className="text-gray-600 text-base sm:text-lg max-w-2xl mx-auto mb-4">
            Your order has been successfully placed and is now being processed.
            You will receive an email confirmation shortly with all the details
            of your purchase.
          </p>
          <p className="text-sm text-gray-500">
            Order ID: #1234567890
          </p>
        </div>

        {/* Timeline */}
        <div className="max-w-md mx-auto">
          <TimelineStep
            icon={<CheckCircle className="w-5 h-5" />}
            title="Order Placed"
            subtitle="Today"
            isCompleted={true}
          />
          <TimelineStep
            icon={<Truck className="w-5 h-5" />}
            title="Shipped"
            subtitle="Estimated: 2 days"
            isCompleted={false}
          />
          <TimelineStep
            icon={<Package className="w-5 h-5" />}
            title="Delivered"
            subtitle="Estimated: 4 days"
            isCompleted={false}
            isLast
          />
        </div>
      </main>

      {/* ✅ Shared Footer */}
      <Footer />
    </div>
  );
};

export default OrderSuccessPage;
