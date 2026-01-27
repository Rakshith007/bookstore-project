import React from 'react';

interface PrivacyPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

const PrivacyPopup: React.FC<PrivacyPopupProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    // Overlay with smooth backdrop blur
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm transition-all duration-300"
      onClick={onClose}
    >
      {/* Modal Container */}
      <div
        className="relative w-full max-w-4xl mx-4 h-[90vh] max-h-[800px] bg-white rounded-2xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header - Sticky */}
        <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-8 py-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gray-900">Privacy Policy</h1>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
              aria-label="Close"
            >
              <svg
                className="w-6 h-6 text-gray-500 hover:text-gray-700"
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
          <p className="text-gray-600 mt-2">
            Last updated: {new Date().toLocaleDateString()}
          </p>
        </div>

        {/* Scrollable Content Area */}
        <div className="h-[calc(90vh-120px)] overflow-y-auto px-8 py-6">
          {/* Custom Scrollbar Styling */}
          <style>{`
            .scroll-area::-webkit-scrollbar {
              width: 6px;
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

          <div className="scroll-area space-y-6 pr-4">
            {/* Introduction */}
            <section className="space-y-3">
              <p className="text-gray-700 leading-relaxed">
                This Privacy Policy explains how we collect, use, disclose, and protect your personal information when you use our website to purchase books for charity distribution. We are committed to safeguarding your privacy and ensuring that your personal data is handled responsibly and in accordance with applicable data protection laws in the Sultanate of Oman.
              </p>
            </section>

            {/* Information We Collect */}
            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-900 border-l-4 border-[#B85C38] pl-4">
                1. Information We Collect
              </h2>
              <p className="text-gray-700">
                When you visit our website or make a purchase, we may collect the following information:
              </p>
              <ul className="space-y-2 pl-6">
                <li className="flex items-start">
                  <span className="inline-block w-2 h-2 bg-[#D4A373] rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  <span className="text-gray-700">Personal identification details (such as your name, email address, and contact number)</span>
                </li>
                <li className="flex items-start">
                  <span className="inline-block w-2 h-2 bg-[#D4A373] rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  <span className="text-gray-700">Billing information</span>
                </li>
                <li className="flex items-start">
                  <span className="inline-block w-2 h-2 bg-[#D4A373] rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  <span className="text-gray-700">Payment information (processed securely via our payment provider)</span>
                </li>
                <li className="flex items-start">
                  <span className="inline-block w-2 h-2 bg-[#D4A373] rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  <span className="text-gray-700">Details of your book purchases and donation preferences</span>
                </li>
                <li className="flex items-start">
                  <span className="inline-block w-2 h-2 bg-[#D4A373] rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  <span className="text-gray-700">Technical information (such as your IP address, browser type, and device information)</span>
                </li>
              </ul>
            </section>

            {/* How We Use Your Information */}
            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-900 border-l-4 border-[#B85C38] pl-4">
                2. How We Use Your Information
              </h2>
              <p className="text-gray-700">
                We use your information to:
              </p>
              <ul className="space-y-2 pl-6">
                <li className="flex items-start">
                  <span className="text-[#B85C38] mr-2">•</span>
                  <span className="text-gray-700">Process and fulfill your book purchase orders</span>
                </li>
                <li className="flex items-start">
                  <span className="text-[#B85C38] mr-2">•</span>
                  <span className="text-gray-700">Deliver books to the specified charity or recipient</span>
                </li>
                <li className="flex items-start">
                  <span className="text-[#B85C38] mr-2">•</span>
                  <span className="text-gray-700">Communicate with you about your orders, donations, and website updates</span>
                </li>
                <li className="flex items-start">
                  <span className="text-[#B85C38] mr-2">•</span>
                  <span className="text-gray-700">Improve our website's functionality and customer experience</span>
                </li>
                <li className="flex items-start">
                  <span className="text-[#B85C38] mr-2">•</span>
                  <span className="text-gray-700">Comply with legal and regulatory obligations</span>
                </li>
              </ul>
            </section>

            {/* Disclosure of Your Information */}
            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-900 border-l-4 border-[#B85C38] pl-4">
                3. Disclosure of Your Information
              </h2>
              <p className="text-gray-700">
                We will not sell, trade, or rent your personal information to third parties. We may share your data with trusted service providers who assist us in operating our website and processing payments, strictly for the purposes outlined above. Any such third parties are required to treat your information confidentially and comply with all relevant data protection regulations.
              </p>
            </section>

            {/* Security */}
            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-900 border-l-4 border-[#B85C38] pl-4">
                4. Security
              </h2>
              <p className="text-gray-700">
                We take reasonable steps to protect your personal information from unauthorized access, alteration, disclosure, or destruction. Our website uses secure protocols for processing sensitive data, and we regularly review our security measures.
              </p>
            </section>

            {/* Your Rights */}
            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-900 border-l-4 border-[#B85C38] pl-4">
                5. Your Rights
              </h2>
              <p className="text-gray-700">
                You have the right to access, correct, or delete your personal information held by us. You may also object to or restrict certain types of processing. To exercise these rights, please contact us using the details provided on our website.
              </p>
            </section>

            {/* Changes to This Policy */}
            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-900 border-l-4 border-[#B85C38] pl-4">
                6. Changes to This Policy
              </h2>
              <p className="text-gray-700">
                We may update this Privacy Policy from time to time. Any changes will be posted on this page, and we encourage you to review it periodically.
              </p>
            </section>

            {/* Contact Us */}
            <section className="space-y-4 bg-gray-50 p-6 rounded-xl border border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">
                7. Contact Us
              </h2>
              <p className="text-gray-700">
                If you have any questions or concerns about this Privacy Policy or how your information is handled, please contact us via the contact form on our website.
              </p>
              <div className="mt-4 p-4 bg-white rounded-lg border border-gray-300">
                <p className="text-sm text-gray-600">
                  <span className="font-semibold">Note:</span> This policy is compliant with the data protection regulations of the Sultanate of Oman.
                </p>
              </div>
            </section>

            {/* Footer Note */}
            <div className="pt-6 border-t border-gray-200">
              <p className="text-sm text-gray-500 text-center">
                By using our website, you acknowledge that you have read and understood this Privacy Policy.
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 px-8 py-4">
          <div className="flex justify-between items-center">
            <button
              onClick={onClose}
              className="px-6 py-2 text-gray-600 hover:text-gray-800 font-medium transition-colors duration-200"
            >
              Close
            </button>
            <button
              onClick={onClose}
              className="px-8 py-3 bg-[#2E4A3D] text-white font-semibold rounded-lg hover:bg-[#1e3529] transition-colors duration-200 shadow-md"
            >
              I Understand
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPopup;