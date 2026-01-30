// src/app/admin/VerifyDeliveryPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { 
  CheckCircle, XCircle, Package, Building2, Calendar, Key, 
  Loader2, MapPin, Phone, Book, Check, Shield, AlertCircle,
  Clock, ArrowLeft
} from 'lucide-react';

const VerifyDeliveryPage = () => {
  const { batchId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);
  const [verificationSuccess, setVerificationSuccess] = useState(false);
  const [error, setError] = useState('');
  const [enteredCode, setEnteredCode] = useState('');
  
  const [deliveryData, setDeliveryData] = useState(null);
  const [securityCodeFromQR, setSecurityCodeFromQR] = useState('');
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    // Get ALL data from URL parameters
    const codeFromURL = searchParams.get('code');
    const instituteName = searchParams.get('institute');
    const address = searchParams.get('address');
    const city = searchParams.get('city');
    const state = searchParams.get('state');
    const country = searchParams.get('country');
    const phone = searchParams.get('phone');
    const totalBooks = searchParams.get('totalBooks');
    const expiryDate = searchParams.get('expiry');
    const itemsParam = searchParams.get('items');
    
    if (codeFromURL) {
      setSecurityCodeFromQR(codeFromURL);
    }
    
    // Check if QR code is expired
    if (expiryDate) {
      const expiry = new Date(expiryDate);
      const now = new Date();
      if (now > expiry) {
        setIsExpired(true);
        setError('This QR code has expired. Please contact the sender for a new code.');
      }
    }
    
    // Parse items from URL parameter
    let items = [];
    if (itemsParam) {
      try {
        items = JSON.parse(decodeURIComponent(itemsParam));
      } catch (err) {
        console.error('Error parsing items:', err);
      }
    }
    
    // Calculate total value
    const totalValue = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    // Set delivery data from URL parameters (ACTUAL DATA)
    setDeliveryData({
      batchId: batchId || 'Unknown',
      instituteName: decodeURIComponent(instituteName || ''),
      instituteAddress: decodeURIComponent(address || ''),
      city: decodeURIComponent(city || ''),
      state: decodeURIComponent(state || ''),
      country: decodeURIComponent(country || ''),
      phone: decodeURIComponent(phone || ''),
      items: items,
      totalBooks: parseInt(totalBooks || '0'),
      totalValue: totalValue,
      generatedDate: new Date().toLocaleDateString('en-GB', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }),
      expiryDate: expiryDate ? new Date(expiryDate).toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      }) : 'Unknown'
    });
    
    setLoading(false);
  }, [batchId, searchParams]);

  const handleVerify = () => {
    if (!enteredCode.trim()) {
      setError('Please enter the security code');
      return;
    }

    if (enteredCode.length !== 6) {
      setError('Security code must be 6 digits');
      return;
    }

    if (isExpired) {
      setError('Cannot verify: QR code has expired');
      return;
    }

    setVerifying(true);
    setError('');

    // Simulate verification process
    setTimeout(() => {
      // Check if entered code matches the one from QR
      if (enteredCode === securityCodeFromQR) {
        setVerificationSuccess(true);
        
        // In real app, update backend status here
        console.log('Delivery verified successfully!');
        
        // Auto redirect after 3 seconds
        setTimeout(() => {
          navigate('/');
        }, 3000);
      } else {
        setError('Invalid security code. Please check and try again.');
      }
      setVerifying(false);
    }, 1500);
  };

  const formatCurrency = (amount) => {
    return `OMR ${amount.toFixed(3)}`;
  };

  const calculateDaysRemaining = () => {
    const expiryDate = searchParams.get('expiry');
    if (!expiryDate) return 0;
    
    const expiry = new Date(expiryDate);
    const now = new Date();
    const diffTime = expiry.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="animate-spin mx-auto mb-4" size={48} color="#3B82F6" />
          <p className="text-gray-600">Loading delivery details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header with Back Button */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-4"
          >
            <ArrowLeft size={20} />
            <span>Back to Home</span>
          </button>
          
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
              <Package size={32} className="text-blue-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Delivery Verification</h1>
            <p className="text-gray-600 mt-2">Verify parcel delivery by entering the security code</p>
          </div>
        </div>

        {/* Expiry Warning */}
        {isExpired && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center gap-2 text-red-700 mb-2">
              <AlertCircle size={20} />
              <h3 className="font-bold">QR Code Expired</h3>
            </div>
            <p className="text-sm text-red-600">
              This QR code expired on {deliveryData?.expiryDate}.
              Please contact the sender for a new verification code.
            </p>
          </div>
        )}

        {/* Validity Info */}
        {!isExpired && deliveryData?.expiryDate && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock size={16} className="text-green-600" />
                <span className="text-sm font-medium text-green-800">Valid for</span>
              </div>
              <div className="text-right">
                <span className="text-lg font-bold text-green-800">
                  {calculateDaysRemaining()} days
                </span>
                <p className="text-xs text-green-600">Expires: {deliveryData.expiryDate}</p>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Delivery Details */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Delivery Details</h2>
                  <p className="text-sm text-gray-600">Batch ID: {deliveryData?.batchId}</p>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-2 text-green-600">
                    <Shield size={20} />
                    <span className="font-medium">Secure Verification</span>
                  </div>
                </div>
              </div>

              {/* Institute Information */}
              <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Building2 size={20} className="text-blue-600" />
                  </div>
                  <h3 className="font-bold text-lg text-blue-900">Delivering To</h3>
                </div>
                <div className="space-y-2 pl-12">
                  <p className="font-bold text-gray-900">{deliveryData?.instituteName}</p>
                  <div className="flex items-start gap-2">
                    <MapPin size={16} className="text-gray-500 mt-1 flex-shrink-0" />
                    <div>
                      <p className="text-gray-700">{deliveryData?.instituteAddress}</p>
                      <p className="text-gray-700">
                        {deliveryData?.city}{deliveryData?.state ? `, ${deliveryData.state}` : ''}, {deliveryData?.country}
                      </p>
                    </div>
                  </div>
                  {deliveryData?.phone && (
                    <div className="flex items-center gap-2">
                      <Phone size={16} className="text-gray-500" />
                      <p className="text-gray-700">{deliveryData.phone}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Order Items */}
              <div className="mb-6">
                <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Book size={20} />
                  Order Contents ({deliveryData?.items?.length || 0} items)
                </h3>
                {deliveryData?.items && deliveryData.items.length > 0 ? (
                  <div className="overflow-hidden rounded-lg border border-gray-200">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Item</th>
                          <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">ISBN</th>
                          <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Quantity</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {deliveryData.items.map((item, index) => (
                          <tr key={index} className="hover:bg-gray-50">
                            <td className="py-3 px-4">
                              <p className="font-medium text-gray-900">{item.title}</p>
                            </td>
                            <td className="py-3 px-4 text-sm text-gray-600">{item.isbn || 'N/A'}</td>
                            <td className="py-3 px-4">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                {item.quantity}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot className="bg-gray-50">
                        <tr>
                          <td colSpan={2} className="py-3 px-4">
                            <p className="text-sm font-medium text-gray-700">Total</p>
                          </td>
                          <td className="py-3 px-4">
                            <span className="font-bold text-gray-900">{deliveryData?.totalBooks} items</span>
                          </td>
                          
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Package size={48} className="mx-auto mb-3 opacity-20" />
                    <p>No items found in this delivery</p>
                  </div>
                )}
              </div>

              {/* Additional Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar size={16} className="text-gray-600" />
                    <span className="text-sm font-medium text-gray-700">Generated On</span>
                  </div>
                  <p className="font-medium text-gray-900">{deliveryData?.generatedDate}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock size={16} className="text-gray-600" />
                    <span className="text-sm font-medium text-gray-700">Valid Until</span>
                  </div>
                  <p className="font-medium text-gray-900">{deliveryData?.expiryDate}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Verification */}
          <div>
            <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-6">
              {!verificationSuccess ? (
                <>
                  <div className="mb-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-2 flex items-center gap-2">
                      <Key size={20} />
                      Enter Security Code
                    </h3>
                    <p className="text-sm text-gray-600 mb-4">
                      Enter the 6-digit security code received via WhatsApp
                    </p>
                    
                    <div className="relative">
                      <input
                        type="text"
                        value={enteredCode}
                        onChange={(e) => {
                          const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                          setEnteredCode(value);
                          if (error) setError('');
                        }}
                        placeholder="Enter 6-digit code"
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none text-center text-xl font-mono tracking-wider"
                        maxLength={6}
                        disabled={verifying || isExpired}
                      />
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        <div className="flex gap-1">
                          {[1, 2, 3, 4, 5, 6].map((digit) => (
                            <div
                              key={digit}
                              className={`w-2 h-2 rounded-full ${
                                enteredCode.length >= digit ? 'bg-blue-600' : 'bg-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                    
                    <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                      <AlertCircle size={12} />
                      The security code was sent to the institution via WhatsApp
                    </p>
                  </div>

                  {error && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-red-700 text-sm flex items-center gap-2">
                        <XCircle size={16} />
                        {error}
                      </p>
                    </div>
                  )}

                  <button
                    onClick={handleVerify}
                    disabled={verifying || enteredCode.length !== 6 || isExpired}
                    className="w-full py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {verifying ? (
                      <>
                        <Loader2 className="animate-spin" size={20} />
                        Verifying...
                      </>
                    ) : isExpired ? (
                      <>
                        <XCircle size={20} />
                        QR Code Expired
                      </>
                    ) : (
                      <>
                        <Check size={20} />
                        Verify Delivery
                      </>
                    )}
                  </button>
                </>
              ) : (
                <div className="text-center py-8">
                  <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4">
                    <CheckCircle size={40} className="text-green-600" />
                  </div>
                  <h3 className="text-xl font-bold text-green-900 mb-2">Delivery Verified Successfully!</h3>
                  <p className="text-gray-600 mb-4">The order status has been updated to "Delivered"</p>
                  
                  <div className="bg-green-50 rounded-lg p-4 mb-6">
                    <p className="text-sm text-green-800">
                      <span className="font-bold">Batch ID:</span> {deliveryData?.batchId}
                    </p>
                    <p className="text-sm text-green-800 mt-1">
                      <span className="font-bold">Verified at:</span> {new Date().toLocaleString('en-GB')}
                    </p>
                    <p className="text-sm text-green-800 mt-1">
                      <span className="font-bold">Institution:</span> {deliveryData?.instituteName}
                    </p>
                    <p className="text-sm text-green-800 mt-1">
                      <span className="font-bold">Items Delivered:</span> {deliveryData?.totalBooks}
                    </p>
                  </div>
                  
                  <p className="text-sm text-gray-500">Redirecting to home page...</p>
                </div>
              )}

              <div className="mt-6 pt-6 border-t border-gray-200">
                <h4 className="text-sm font-semibold text-gray-700 mb-2">Need Help?</h4>
                <p className="text-xs text-gray-600">
                  Contact support: support@charity.org<br />
                  Phone: +968 1234 5678
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyDeliveryPage;