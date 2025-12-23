import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../../components/layout/Navbar";
import { isLoggedIn, getToken } from "../../lib/auth";

interface CartItem {
  id: number;
  title: string;
  author: string;
  image: string;
  price: number;
  quantity: number;
}

interface Address {
  id?: number;
  streetAddress: string;
  apartment?: string;
  city: string;
  state?: string;
  country: string;
  isDefault: boolean;
}

interface UserProfile {
  fullName: string;
  phoneNumber: string;
}

const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();

  // Redirect if not logged in
  useEffect(() => {
    if (!isLoggedIn()) {
      navigate("/login", { state: { from: "/checkout" } });
    }
  }, [navigate]);

  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile>({
    fullName: "",
    phoneNumber: "",
  });
  const [selectedAddressIndex, setSelectedAddressIndex] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [savingAddress, setSavingAddress] = useState(false);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    streetAddress: "",
    apartment: "",
    city: "",
    state: "",
    country: "",
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:4000";

  // Fetch cart, addresses, and user profile
  useEffect(() => {
    const fetchData = async () => {
      if (!isLoggedIn()) return;

      setLoading(true);
      const token = getToken();

      try {
        // === FIXED: Use /auth/me instead of /users/me ===
        const profileRes = await fetch(`${API_BASE_URL}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (profileRes.ok) {
          const profileData = await profileRes.json();
          if (profileData.success && profileData.data) {
            const { fullName = "", phoneNumber = "" } = profileData.data;
            setUserProfile({ fullName, phoneNumber });
            setFormData((prev) => ({
              ...prev,
              fullName,
              phone: phoneNumber,
            }));
          }
        }

        // Fetch cart
        const cartRes = await fetch(`${API_BASE_URL}/cart`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        let currentCart: CartItem[] = [];
        if (cartRes.ok) {
          const cartData = await cartRes.json();
          if (cartData.success && cartData.data) {
            currentCart = cartData.data.map((item: any) => ({
              id: item.book.id,
              title: item.book.title,
              author: item.book.author?.name || "Unknown",
              image: item.book.coverImageUrl || "",
              price: Number(item.book.price),
              quantity: item.quantity,
            }));
          }
        }
        setCartItems(currentCart);

        // Fetch addresses
        const addrRes = await fetch(`${API_BASE_URL}/addresses`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const addrData = await addrRes.json();
        if (addrData.success && Array.isArray(addrData.data)) {
          setAddresses(addrData.data);
          const defaultIdx = addrData.data.findIndex((a: Address) => a.isDefault);
          setSelectedAddressIndex(defaultIdx !== -1 ? defaultIdx : addrData.data.length > 0 ? 0 : null);
        }
      } catch (err) {
        console.error("Failed to load checkout data:", err);
        alert("Failed to load your information. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const validateForm = () => {
    const errors: Record<string, string> = {};

    if (!formData.fullName.trim()) errors.fullName = "Full name is required";
    if (!formData.phone.trim()) errors.phone = "Phone number is required";
    if (!formData.streetAddress.trim()) errors.streetAddress = "Street address is required";
    if (!formData.city.trim()) errors.city = "City is required";
    if (!formData.country.trim()) errors.country = "Country is required";

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSavingAddress(true);
    const token = getToken();

    try {
      // === FIXED: Use /auth/me for updating profile ===
      const updateProfileRes = await fetch(`${API_BASE_URL}/auth/me`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          fullName: formData.fullName.trim(),
          phoneNumber: formData.phone.trim(),
        }),
      });

      if (updateProfileRes.ok) {
        setUserProfile({
          fullName: formData.fullName.trim(),
          phoneNumber: formData.phone.trim(),
        });
      } else {
        console.error("Failed to update profile");
      }

      // Save physical address
      const method = editingIndex !== null ? "PATCH" : "POST";
      const url =
        editingIndex !== null
          ? `${API_BASE_URL}/addresses/${addresses[editingIndex].id}`
          : `${API_BASE_URL}/addresses`;

      const addressPayload = {
        streetAddress: formData.streetAddress.trim(),
        apartment: formData.apartment.trim() || undefined,
        city: formData.city.trim(),
        state: formData.state.trim() || undefined,
        country: formData.country.trim(),
        isDefault: addresses.length === 0,
      };

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(addressPayload),
      });

      if (!response.ok) throw new Error("Failed to save address");

      const savedAddr = await response.json();

      if (editingIndex !== null) {
        setAddresses((prev) =>
          prev.map((a, i) => (i === editingIndex ? savedAddr.data : a))
        );
      } else {
        setAddresses((prev) => {
          const updated = [...prev, savedAddr.data];
          setSelectedAddressIndex(updated.length - 1);
          return updated;
        });
      }

      setShowAddressForm(false);
      setEditingIndex(null);
      setFormData((prev) => ({
        ...prev,
        streetAddress: "",
        apartment: "",
        city: "",
        state: "",
        country: "",
      }));
    } catch (err) {
      alert("Failed to save address. Please try again.");
    } finally {
      setSavingAddress(false);
    }
  };

  const formatAddress = (a: Address) =>
    `${a.streetAddress}${a.apartment ? `, ${a.apartment}` : ""}, ${a.city}${a.state ? `, ${a.state}` : ""}, ${a.country}`;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-xl">Loading checkout...</p>
      </div>
    );
  }

  // First-time buyer
  if (addresses.length === 0 && !showAddressForm) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gray-50 font-serif">
          <main className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
              <div className="lg:col-span-2">
                <h2 className="text-4xl font-bold text-gray-900 mb-3">Checkout</h2>
                <p className="text-gray-500 mb-8">Please fill in your shipping details.</p>

                <form onSubmit={handleSaveAddress} className="space-y-6 max-w-3xl">
                  <div>
                    <input
                      name="fullName"
                      placeholder="Full Name *"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      className={`w-full h-12 px-4 rounded-lg border ${formErrors.fullName ? "border-red-500" : "border-gray-300"} focus:outline-none focus:ring-2 focus:ring-gray-900`}
                      required
                    />
                    {formErrors.fullName && <p className="text-red-500 text-sm mt-1">{formErrors.fullName}</p>}
                  </div>

                  <div>
                    <input
                      name="phone"
                      type="tel"
                      placeholder="Phone Number *"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className={`w-full h-12 px-4 rounded-lg border ${formErrors.phone ? "border-red-500" : "border-gray-300"} focus:outline-none focus:ring-2 focus:ring-gray-900`}
                      required
                    />
                    {formErrors.phone && <p className="text-red-500 text-sm mt-1">{formErrors.phone}</p>}
                  </div>

                  <div>
                    <input
                      name="streetAddress"
                      placeholder="Street Address *"
                      value={formData.streetAddress}
                      onChange={handleInputChange}
                      className={`w-full h-12 px-4 rounded-lg border ${formErrors.streetAddress ? "border-red-500" : "border-gray-300"} focus:outline-none focus:ring-2 focus:ring-gray-900`}
                      required
                    />
                    {formErrors.streetAddress && <p className="text-red-500 text-sm mt-1">{formErrors.streetAddress}</p>}
                  </div>

                  <input
                    name="apartment"
                    placeholder="Apartment / Unit (optional)"
                    value={formData.apartment}
                    onChange={handleInputChange}
                    className="w-full h-12 px-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-900"
                  />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <input
                        name="city"
                        placeholder="City *"
                        value={formData.city}
                        onChange={handleInputChange}
                        className={`h-12 px-4 rounded-lg border w-full ${formErrors.city ? "border-red-500" : "border-gray-300"} focus:outline-none focus:ring-2 focus:ring-gray-900`}
                        required
                      />
                      {formErrors.city && <p className="text-red-500 text-sm mt-1">{formErrors.city}</p>}
                    </div>
                    <input
                      name="state"
                      placeholder="State (optional)"
                      value={formData.state}
                      onChange={handleInputChange}
                      className="h-12 px-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-900"
                    />
                  </div>

                  <div>
                    <input
                      name="country"
                      placeholder="Country *"
                      value={formData.country}
                      onChange={handleInputChange}
                      className={`w-full h-12 px-4 rounded-lg border ${formErrors.country ? "border-red-500" : "border-gray-300"} focus:outline-none focus:ring-2 focus:ring-gray-900`}
                      required
                    />
                    {formErrors.country && <p className="text-red-500 text-sm mt-1">{formErrors.country}</p>}
                  </div>

                  <button
                    type="submit"
                    disabled={savingAddress}
                    className="mt-8 px-10 py-4 bg-gray-900 text-white rounded-lg hover:bg-gray-800 font-medium text-lg disabled:opacity-70"
                  >
                    {savingAddress ? "Saving..." : "Continue to Payment"}
                  </button>
                </form>
              </div>

              {/* Order Summary */}
              <div className="bg-white p-8 rounded-lg shadow-sm">
                <h3 className="text-2xl font-bold mb-6">Order Summary</h3>
                {cartItems.map((item) => (
                  <div key={item.id} className="flex gap-4 mb-6 pb-6 border-b last:border-0">
                    <img
                      src={item.image || "https://via.placeholder.com/150"}
                      alt={item.title}
                      className="w-16 h-20 object-cover rounded"
                    />
                    <div className="flex-1">
                      <p className="font-medium">{item.title}</p>
                      <p className="text-sm text-gray-500">by {item.author}</p>
                      <p className="text-sm mt-2">Qty: {item.quantity}</p>
                    </div>
                    <p className="font-medium text-lg">${(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                ))}
                <div className="border-t pt-6">
                  <div className="flex justify-between text-2xl font-bold">
                    <span>Total</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>
      </>
    );
  }

  // Returning user
  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 font-serif">
        <main className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            <div className="lg:col-span-2">
              <h1 className="text-4xl font-bold mb-4">Checkout</h1>
              <p className="text-gray-500 mb-8">Select or update your shipping address</p>

              <div className="mb-8 p-6 bg-blue-50 rounded-lg border border-blue-200">
                <p className="font-semibold text-gray-900">Shipping to:</p>
                <p className="text-lg font-medium">{userProfile.fullName || "Name not set"}</p>
                <p className="text-gray-700">Phone: {userProfile.phoneNumber || "Not provided"}</p>
              </div>

              {addresses.map((addr, i) => (
                <div
                  key={addr.id || i}
                  onClick={() => setSelectedAddressIndex(i)}
                  className={`p-6 mb-4 bg-white border rounded-lg cursor-pointer transition hover:shadow-md ${
                    selectedAddressIndex === i ? "ring-2 ring-gray-900" : ""
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">{formatAddress(addr)}</p>
                      {addr.isDefault && (
                        <span className="inline-block mt-2 px-3 py-1 bg-gray-200 text-xs rounded-full">
                          Default
                        </span>
                      )}
                    </div>
                    <div className="w-6 h-6 rounded-full border-2 border-gray-900 flex items-center justify-center">
                      {selectedAddressIndex === i && <div className="w-4 h-4 bg-gray-900 rounded-full" />}
                    </div>
                  </div>
                </div>
              ))}

              <div className="flex flex-wrap gap-4 mb-8">
                <button
                  onClick={() => {
                    setShowAddressForm(true);
                    setEditingIndex(null);
                    setFormData((prev) => ({
                      ...prev,
                      fullName: userProfile.fullName,
                      phone: userProfile.phoneNumber,
                      streetAddress: "",
                      apartment: "",
                      city: "",
                      state: "",
                      country: "",
                    }));
                  }}
                  className="px-6 py-3 bg-gray-900 text-white rounded-full hover:bg-gray-800"
                >
                  Add New Address
                </button>

                {selectedAddressIndex !== null && (
                  <button
                    onClick={() => {
                      const addr = addresses[selectedAddressIndex];
                      setFormData({
                        fullName: userProfile.fullName,
                        phone: userProfile.phoneNumber,
                        streetAddress: addr.streetAddress,
                        apartment: addr.apartment || "",
                        city: addr.city,
                        state: addr.state || "",
                        country: addr.country,
                      });
                      setEditingIndex(selectedAddressIndex);
                      setShowAddressForm(true);
                    }}
                    className="px-6 py-3 bg-blue-600 text-white rounded-full hover:bg-blue-700"
                  >
                    Edit Selected Address
                  </button>
                )}
              </div>

              {showAddressForm && (
                <form onSubmit={handleSaveAddress} className="p-8 bg-white border rounded-lg shadow-md">
                  <h3 className="text-2xl font-bold mb-6">
                    {editingIndex === null ? "Add New Address" : "Edit Address"}
                  </h3>

                  <div className="space-y-5">
                    <div>
                      <input
                        name="fullName"
                        placeholder="Full Name *"
                        value={formData.fullName}
                        onChange={handleInputChange}
                        className={`w-full h-12 px-4 rounded-lg border ${formErrors.fullName ? "border-red-500" : "border-gray-300"} focus:ring-2 focus:ring-gray-900`}
                        required
                      />
                      {formErrors.fullName && <p className="text-red-500 text-sm mt-1">{formErrors.fullName}</p>}
                    </div>

                    <div>
                      <input
                        name="phone"
                        placeholder="Phone Number *"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className={`w-full h-12 px-4 rounded-lg border ${formErrors.phone ? "border-red-500" : "border-gray-300"} focus:ring-2 focus:ring-gray-900`}
                        required
                      />
                      {formErrors.phone && <p className="text-red-500 text-sm mt-1">{formErrors.phone}</p>}
                    </div>

                    <div>
                      <input
                        name="streetAddress"
                        placeholder="Street Address *"
                        value={formData.streetAddress}
                        onChange={handleInputChange}
                        className={`w-full h-12 px-4 rounded-lg border ${formErrors.streetAddress ? "border-red-500" : "border-gray-300"} focus:ring-2 focus:ring-gray-900`}
                        required
                      />
                      {formErrors.streetAddress && <p className="text-red-500 text-sm mt-1">{formErrors.streetAddress}</p>}
                    </div>

                    <input
                      name="apartment"
                      placeholder="Apartment / Suite (optional)"
                      value={formData.apartment}
                      onChange={handleInputChange}
                      className="w-full h-12 px-4 rounded-lg border border-gray-300 focus:ring-2 focus:ring-gray-900"
                    />

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <input
                          name="city"
                          placeholder="City *"
                          value={formData.city}
                          onChange={handleInputChange}
                          className={`w-full h-12 px-4 rounded-lg border ${formErrors.city ? "border-red-500" : "border-gray-300"} focus:ring-2 focus:ring-gray-900`}
                          required
                        />
                        {formErrors.city && <p className="text-red-500 text-sm mt-1">{formErrors.city}</p>}
                      </div>
                      <input
                        name="state"
                        placeholder="State (optional)"
                        value={formData.state}
                        onChange={handleInputChange}
                        className="w-full h-12 px-4 rounded-lg border border-gray-300 focus:ring-2 focus:ring-gray-900"
                      />
                    </div>

                    <div>
                      <input
                        name="country"
                        placeholder="Country *"
                        value={formData.country}
                        onChange={handleInputChange}
                        className={`w-full h-12 px-4 rounded-lg border ${formErrors.country ? "border-red-500" : "border-gray-300"} focus:ring-2 focus:ring-gray-900`}
                        required
                      />
                      {formErrors.country && <p className="text-red-500 text-sm mt-1">{formErrors.country}</p>}
                    </div>
                  </div>

                  <div className="flex gap-4 mt-8">
                    <button
                      type="submit"
                      disabled={savingAddress}
                      className="px-8 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 disabled:opacity-70"
                    >
                      {savingAddress ? "Saving..." : "Save Address"}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowAddressForm(false);
                        setEditingIndex(null);
                        setFormErrors({});
                      }}
                      className="px-8 py-3 bg-gray-200 rounded-lg hover:bg-gray-300"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}

              {!showAddressForm && selectedAddressIndex !== null && (
                <div className="mt-10">
                  <Link to="/payment">
                    <button className="px-12 py-5 bg-gray-900 text-white rounded-lg hover:bg-gray-800 text-xl font-medium shadow-lg">
                      Proceed to Payment
                    </button>
                  </Link>
                </div>
              )}
            </div>

            {/* Order Summary */}
            <div className="bg-white p-8 rounded-lg shadow-sm sticky top-6">
              <h3 className="text-2xl font-bold mb-6">Order Summary</h3>
              {cartItems.map((item) => (
                <div key={item.id} className="flex gap-4 mb-6 pb-6 border-b last:border-0">
                  <img
                    src={item.image || "https://via.placeholder.com/150"}
                    alt={item.title}
                    className="w-16 h-20 object-cover rounded"
                  />
                  <div className="flex-1">
                    <p className="font-medium">{item.title}</p>
                    <p className="text-sm text-gray-500">by {item.author}</p>
                    <p className="text-sm mt-2">Qty: {item.quantity}</p>
                  </div>
                  <p className="font-medium text-lg">${(item.price * item.quantity).toFixed(2)}</p>
                </div>
              ))}
              <div className="border-t pt-6">
                <div className="flex justify-between text-2xl font-bold">
                  <span>Total</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
};

export default CheckoutPage;