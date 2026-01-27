import React from 'react';

interface TermsPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

const TermsPopup: React.FC<TermsPopupProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    // Overlay with smooth backdrop blur
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm transition-all duration-300 p-2 sm:p-4"
      onClick={onClose}
    >
      {/* Modal Container */}
      <div
        className="relative w-full max-w-4xl h-[95vh] sm:h-[90vh] max-h-[800px] bg-white rounded-xl sm:rounded-2xl shadow-2xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header - Sticky */}
        <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-4 sm:px-6 lg:px-8 py-4 sm:py-5 lg:py-6">
          <div className="flex items-center justify-between">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">
              Terms & Conditions
            </h1>
            <button
              onClick={onClose}
              className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
              aria-label="Close"
            >
              <svg
                className="w-5 h-5 sm:w-6 sm:h-6 text-gray-500 hover:text-gray-700"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
          <p className="text-gray-600 mt-1 sm:mt-2 text-xs sm:text-sm">
            Last updated: {new Date().toLocaleDateString()}
          </p>
        </div>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-5 lg:py-6">
          {/* Custom Scrollbar Styling */}
          <style>{`
            .scroll-area::-webkit-scrollbar {
              width: 4px;
            }
            @media (min-width: 640px) {
              .scroll-area::-webkit-scrollbar {
                width: 6px;
              }
            }
            .scroll-area::-webkit-scrollbar-track {
              background: #f1f1f1;
              border-radius: 10px;
            }
            .scroll-area::-webkit-scrollbar-thumb {
              background: #d4a373;
              border-radius: 10px;
            }
            .scroll-area::-webkit-scrollbar-thumb:hover {
              background: #b85c38;
            }
          `}</style>

          <div className="scroll-area space-y-4 sm:space-y-5 lg:space-y-6 pr-2 sm:pr-4">
            {/* Introduction */}
            <section className="space-y-2 sm:space-y-3">
              <p className="text-gray-700 leading-relaxed text-sm sm:text-base">
                Welcome to our website. By using this site, you agree to the following terms and conditions. Please read them carefully before making any purchases.
              </p>
            </section>

            {/* Purpose of the Website */}
            <section className="space-y-2 sm:space-y-3 lg:space-y-4">
              <h2 className="text-base sm:text-lg lg:text-xl font-semibold text-gray-900 border-l-4 border-[#B85C38] pl-3 sm:pl-4">
                1. Purpose of the Website
              </h2>
              <p className="text-gray-700 text-sm sm:text-base">
                This website is intended solely for the purchase of books, which will be distributed to charitable organizations and individuals in need. All purchases must be for charitable purposes only.
              </p>
            </section>

            {/* User Responsibilities */}
            <section className="space-y-2 sm:space-y-3 lg:space-y-4">
              <h2 className="text-base sm:text-lg lg:text-xl font-semibold text-gray-900 border-l-4 border-[#B85C38] pl-3 sm:pl-4">
                2. User Responsibilities
              </h2>
              <ul className="space-y-2 sm:space-y-3 pl-4 sm:pl-6">
                <li className="flex items-start">
                  <span className="inline-block w-1.5 h-1.5 sm:w-2 sm:h-2 bg-[#D4A373] rounded-full mt-1.5 sm:mt-2 mr-2 sm:mr-3 flex-shrink-0"></span>
                  <span className="text-gray-700 text-sm sm:text-base">
                    You agree to use this website only for lawful purposes and in a manner that does not infringe the rights of, or restrict the use of this site by, any third party.
                  </span>
                </li>
                <li className="flex items-start">
                  <span className="inline-block w-1.5 h-1.5 sm:w-2 sm:h-2 bg-[#D4A373] rounded-full mt-1.5 sm:mt-2 mr-2 sm:mr-3 flex-shrink-0"></span>
                  <span className="text-gray-700 text-sm sm:text-base">
                    You must ensure that your purchases are genuinely intended for charitable distribution and not for resale or personal profit.
                  </span>
                </li>
              </ul>
            </section>

            {/* Orders and Payment */}
            <section className="space-y-2 sm:space-y-3 lg:space-y-4">
              <h2 className="text-base sm:text-lg lg:text-xl font-semibold text-gray-900 border-l-4 border-[#B85C38] pl-3 sm:pl-4">
                3. Orders and Payment
              </h2>
              <p className="text-gray-700 text-sm sm:text-base">
                All orders placed through this website are subject to acceptance and availability. Payment must be made in full at the time of purchase. We reserve the right to cancel or refuse any order at our discretion.
              </p>
            </section>

            {/* Distribution */}
            <section className="space-y-2 sm:space-y-3 lg:space-y-4">
              <h2 className="text-base sm:text-lg lg:text-xl font-semibold text-gray-900 border-l-4 border-[#B85C38] pl-3 sm:pl-4">
                4. Distribution
              </h2>
              <p className="text-gray-700 text-sm sm:text-base">
                Books purchased via this website are to be distributed to registered charities or individuals in need. Proof of distribution may be requested to ensure compliance with our charitable mission.
              </p>
            </section>

            {/* Limitation of Liability */}
            <section className="space-y-2 sm:space-y-3 lg:space-y-4">
              <h2 className="text-base sm:text-lg lg:text-xl font-semibold text-gray-900 border-l-4 border-[#B85C38] pl-3 sm:pl-4">
                5. Limitation of Liability
              </h2>
              <p className="text-gray-700 text-sm sm:text-base">
                We are not liable for any loss or damage arising from your use of this website or from any books purchased, except as required by law.
              </p>
            </section>

            {/* Changes to Terms */}
            <section className="space-y-2 sm:space-y-3 lg:space-y-4">
              <h2 className="text-base sm:text-lg lg:text-xl font-semibold text-gray-900 border-l-4 border-[#B85C38] pl-3 sm:pl-4">
                6. Changes to Terms
              </h2>
              <p className="text-gray-700 text-sm sm:text-base">
                We reserve the right to update these terms from time to time. It is your responsibility to review the terms regularly.
              </p>
            </section>

            {/* Contact Information */}
            <section className="space-y-2 sm:space-y-3 lg:space-y-4 bg-gray-50 p-4 sm:p-5 lg:p-6 rounded-lg sm:rounded-xl border border-gray-200">
              <h2 className="text-base sm:text-lg lg:text-xl font-semibold text-gray-900">
                7. Contact Information
              </h2>
              <p className="text-gray-700 text-sm sm:text-base">
                If you have any questions regarding these terms, please contact us through the details provided on our website.
              </p>
              <div className="mt-3 sm:mt-4 p-3 sm:p-4 bg-white rounded-lg border border-gray-300">
                <p className="text-xs sm:text-sm text-gray-600">
                  <span className="font-semibold">Important:</span> These terms are governed by the laws of the Sultanate of Oman. Any disputes shall be subject to the exclusive jurisdiction of the Omani courts.
                </p>
              </div>
            </section>

            {/* Agreement Section */}
            <section className="space-y-2 sm:space-y-3 lg:space-y-4 border-t border-gray-200 pt-4 sm:pt-5 lg:pt-6">
              <div className="flex items-start space-x-2 sm:space-x-3 p-3 sm:p-4 bg-blue-50 rounded-lg border border-blue-100">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-blue-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <p className="text-gray-700 text-sm sm:text-base">
                    By using our website and making purchases, you acknowledge that you have read, understood, and agree to be bound by these Terms & Conditions.
                  </p>
                </div>
              </div>
            </section>

            {/* Footer Note */}
            <div className="pt-4 sm:pt-5 lg:pt-6 border-t border-gray-200">
              <p className="text-xs sm:text-sm text-gray-500 text-center">
                These terms are an agreement between you and our organization regarding the use of our charitable book purchasing platform.
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
          <div className="flex flex-col-reverse sm:flex-row justify-between items-stretch sm:items-center gap-2 sm:gap-0">
            <button
              onClick={onClose}
              className="px-4 sm:px-6 py-2 sm:py-2.5 text-gray-600 hover:text-gray-800 font-medium transition-colors duration-200 text-sm sm:text-base border border-gray-300 sm:border-0 rounded-lg sm:rounded-none"
            >
              Close
            </button>
            <button
              onClick={onClose}
              className="px-6 sm:px-8 py-2.5 sm:py-3 bg-[#2E4A3D] text-white font-semibold rounded-lg hover:bg-[#1e3529] transition-colors duration-200 shadow-md text-sm sm:text-base"
            >
              I Agree
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsPopup;