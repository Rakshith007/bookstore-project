import React from 'react';
import { ShoppingCart, Download, Check } from 'lucide-react';

const OrderDetailsPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">Order Details</h1>
          <p className="text-sm text-gray-500">
            Order ID: #1234567890 · Placed on November 15, 2023
          </p>
        </div>

        {/* Delivery Status */}
        <div className="flex items-center space-x-2 mb-8">
          <span className="text-gray-900">Delivered</span>
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
        </div>

        {/* Order Summary */}
        <div className="mb-12">
          <h2 className="text-xl font-bold text-gray-900 mb-3">Order Summary</h2>
          <p className="text-sm text-gray-600 leading-relaxed">
            Order Number: #1234567890 · Order Date: November 15, 2023 · Payment Method: Credit Card · 
            Shipping Address: 123 Oak Street, Anytown, CA 91234 · Email: sarah.miller@email.com · Phone 
            Number: (555) 123-4567
          </p>
        </div>

        {/* Items */}
        <div className="mb-12">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Items</h2>
          <div className="space-y-6">
            {/* Item 1 */}
            <div className="flex items-start space-x-4">
              <div className="w-16 h-20 sm:w-20 sm:h-28 bg-gray-100 rounded flex-shrink-0 overflow-hidden">
                <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-100"></div>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-base font-semibold text-gray-900">The Secret Garden</h3>
                <p className="text-sm text-gray-500">By Amelia Hayes</p>
              </div>
              <div className="text-base font-semibold text-gray-900 flex-shrink-0">$12.99</div>
            </div>

            {/* Item 2 */}
            <div className="flex items-start space-x-4">
              <div className="w-16 h-20 sm:w-20 sm:h-28 bg-teal-700 rounded flex-shrink-0"></div>
              <div className="flex-1 min-w-0">
                <h3 className="text-base font-semibold text-gray-900">The Lost City</h3>
                <p className="text-sm text-gray-500">By Ethan Carter</p>
              </div>
              <div className="text-base font-semibold text-gray-900 flex-shrink-0">$14.99</div>
            </div>

            {/* Item 3 */}
            <div className="flex items-start space-x-4">
              <div className="w-16 h-20 sm:w-20 sm:h-28 bg-gray-100 rounded flex-shrink-0 overflow-hidden">
                <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-100"></div>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-base font-semibold text-gray-900">Whispers of the Wind</h3>
                <p className="text-sm text-gray-500">By Olivia Bennett</p>
              </div>
              <div className="text-base font-semibold text-gray-900 flex-shrink-0">$10.99</div>
            </div>
          </div>
        </div>

        {/* Delivery Timeline */}
        <div className="mb-12">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Delivery Timeline</h2>
          <div className="space-y-0">
            {/* Ordered */}
            <div className="flex items-start">
              <div className="flex flex-col items-center mr-4">
                <div className="w-5 h-5 rounded-full border-2 border-gray-900 bg-white flex items-center justify-center flex-shrink-0">
                  <Check className="w-3 h-3 text-gray-900" />
                </div>
                <div className="w-0.5 h-16 bg-gray-300"></div>
              </div>
              <div className="pb-16">
                <p className="font-semibold text-gray-900 text-sm">Ordered</p>
                <p className="text-sm text-gray-500">November 15, 2023</p>
              </div>
            </div>

            {/* Packed */}
            <div className="flex items-start">
              <div className="flex flex-col items-center mr-4">
                <div className="w-5 h-5 rounded-full border-2 border-gray-900 bg-white flex items-center justify-center flex-shrink-0">
                  <Check className="w-3 h-3 text-gray-900" />
                </div>
                <div className="w-0.5 h-16 bg-gray-300"></div>
              </div>
              <div className="pb-16">
                <p className="font-semibold text-gray-900 text-sm">Packed</p>
                <p className="text-sm text-gray-500">November 16, 2023</p>
              </div>
            </div>

            {/* Shipped */}
            <div className="flex items-start">
              <div className="flex flex-col items-center mr-4">
                <div className="w-5 h-5 rounded-full border-2 border-gray-900 bg-white flex items-center justify-center flex-shrink-0">
                  <Check className="w-3 h-3 text-gray-900" />
                </div>
                <div className="w-0.5 h-16 bg-gray-300"></div>
              </div>
              <div className="pb-16">
                <p className="font-semibold text-gray-900 text-sm">Shipped</p>
                <p className="text-sm text-gray-500">November 17, 2023</p>
              </div>
            </div>

            {/* Delivered */}
            <div className="flex items-start">
              <div className="flex flex-col items-center mr-4">
                <div className="w-5 h-5 rounded-full border-2 border-gray-900 bg-white flex items-center justify-center flex-shrink-0">
                  <Check className="w-3 h-3 text-gray-900" />
                </div>
              </div>
              <div>
                <p className="font-semibold text-gray-900 text-sm">Delivered</p>
                <p className="text-sm text-gray-500">November 20, 2023</p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <button className="px-6 py-2.5 bg-[#698778] text-white rounded font-medium text-sm hover:bg-green-800 transition-colors">
            Reorder
          </button>
          <button className="px-6 py-2.5 border border-gray-300 text-gray-900 rounded font-medium text-sm hover:bg-gray-50 transition-colors">
            Return Request
          </button>
        </div>

        {/* Download Invoice */}
        <button className="flex items-center space-x-2 text-sm text-gray-900 hover:text-gray-700 transition-colors">
          <Download className="w-4 h-4" />
          <span className="font-medium">Download Invoice</span>
        </button>
      </main>
    </div>
  );
};

export default OrderDetailsPage;