import React, { useState } from "react";
import Navbar from "../../components/layout/Navbar";

/* ===================== TYPES ===================== */

interface Address {
  phone: string;
  streetAddress: string;
  apartment: string;
  city: string;
  state: string;
  country: string;
  isDefault: boolean;
}

interface OrderItem {
  id: string;
  title: string;
  author: string;
  image: string;
  price: number;
}

/* ===================== COMPONENT ===================== */

const OldCheckoutPage: React.FC = () => {
  const [addresses, setAddresses] = useState<Address[]>([
    {
      phone: "555-0000",
      streetAddress: "123 Oak St",
      apartment: "Apt 1",
      city: "Anytown",
      state: "CA",
      country: "USA",
      isDefault: true,
    },
  ]);

  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);

  const [formData, setFormData] = useState({
    phone: "",
    streetAddress: "",
    apartment: "",
    city: "",
    state: "",
    country: "",
  });

  const [useBillingAddress, setUseBillingAddress] = useState(true);

  const orderItems: OrderItem[] = [
    {
      id: "1",
      title: "The Silent Observer",
      author: "Amelia Stone",
      image:
        "https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=300&h=450",
      price: 15,
    },
    {
      id: "2",
      title: "Echoes of the Past",
      author: "Charles Blackwood",
      image:
        "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&q=80&w=300&h=450",
      price: 18,
    },
    {
      id: "3",
      title: "Whispers in the Wind",
      author: "Olivia Reed",
      image:
        "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&q=80&w=300&h=450",
      price: 12,
    },
  ];

  const subtotal = orderItems.reduce((sum, item) => sum + item.price, 0);
  const total = subtotal;

  const resetForm = () =>
    setFormData({
      phone: "",
      streetAddress: "",
      apartment: "",
      city: "",
      state: "",
      country: "",
    });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectAndSetDefault = (index: number) => {
    setSelectedIndex(index);
    setAddresses((prev) =>
      prev.map((addr, i) => ({ ...addr, isDefault: i === index }))
    );
  };

  const handleAddAddress = () => {
    if (addresses.length >= 2) return;
    setEditingIndex(null);
    resetForm();
    setShowAddForm(true);
  };

  const handleOpenUpdate = () => {
    const addr = addresses[selectedIndex];
    setEditingIndex(selectedIndex);
    setFormData(addr);
    setShowAddForm(true);
  };

  const handleSaveAddress = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.streetAddress.trim()) return;

    if (editingIndex === null) {
      setAddresses((prev) => [
        ...prev,
        { ...formData, isDefault: false },
      ]);
    } else {
      setAddresses((prev) =>
        prev.map((a, i) => (i === editingIndex ? { ...a, ...formData } : a))
      );
    }

    setShowAddForm(false);
    setEditingIndex(null);
    resetForm();
  };

  const formatAddress = (a: Address) =>
    [a.streetAddress, a.apartment, a.city, a.state, a.country]
      .filter(Boolean)
      .join(", ");

  return (
    <>
    <Navbar/>
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* LEFT */}
          <div className="lg:col-span-2">
            <h1 className="text-4xl font-bold mb-4">Checkout</h1>
            <p className="text-gray-500 mb-8">
              Please fill in your shipping details.
            </p>

            {/* Address List */}
            {addresses.map((a, i) => (
              <div
                key={i}
                className="flex justify-between items-center mb-4 p-4 bg-white border rounded-lg"
              >
                <div>
                  <h3 className="font-semibold">{formatAddress(a)}</h3>
                  <p className="text-sm text-gray-500">
                    Phone: {a.phone || "—"}
                  </p>
                </div>

                <button
                  onClick={() => handleSelectAndSetDefault(i)}
                  className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                    a.isDefault
                      ? "bg-gray-900 border-gray-900"
                      : "border-gray-900"
                  }`}
                />
              </div>
            ))}

            {/* Controls */}
            <div className="flex items-center gap-4 mb-8">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={useBillingAddress}
                  onChange={(e) => setUseBillingAddress(e.target.checked)}
                />
                Use this address for billing
              </label>

              {addresses.length < 2 && (
                <button
                  onClick={handleAddAddress}
                  className="px-6 py-2 bg-gray-900 text-white rounded-full"
                >
                  Add Address
                </button>
              )}

              {addresses.length >= 2 && (
                <button
                  onClick={handleOpenUpdate}
                  className="px-6 py-2 bg-blue-600 text-white rounded-full"
                >
                  Update Address
                </button>
              )}
            </div>

            {/* Form */}
            {showAddForm && (
              <form
                onSubmit={handleSaveAddress}
                className="p-6 bg-white border rounded-lg mb-8"
              >
                <h3 className="text-xl font-bold mb-6">
                  {editingIndex === null ? "Add Address" : "Edit Address"}
                </h3>

                {["phone", "streetAddress", "apartment", "city", "state", "country"].map(
                  (field) => (
                    <input
                      key={field}
                      name={field}
                      placeholder={field.replace(/([A-Z])/g, " $1")}
                      value={(formData as any)[field]}
                      onChange={handleInputChange}
                      className="w-full mb-4 px-4 py-3 border rounded-lg"
                    />
                  )
                )}

                <div className="flex gap-4">
                  <button
                    type="submit"
                    className="px-6 py-2 bg-gray-900 text-white rounded-lg"
                  >
                    Save
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="px-6 py-2 bg-gray-200 rounded-lg"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}

            {!showAddForm && (
              <button className="px-8 py-3 bg-gray-900 text-white rounded-lg">
                Proceed to Payment
              </button>
            )}
          </div>

          {/* RIGHT */}
          <div className="bg-white p-6 rounded-lg h-fit sticky top-6">
            <h3 className="text-2xl font-bold mb-6">Order Summary</h3>

            {orderItems.map((item) => (
              <div key={item.id} className="flex gap-3 mb-4">
                <img
                  src={item.image}
                  className="w-14 h-20 object-cover rounded"
                />
                <div>
                  <p className="font-medium">{item.title}</p>
                  <p className="text-sm text-gray-500">{item.author}</p>
                </div>
              </div>
            ))}

            <div className="border-t pt-4 space-y-2">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-bold">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
    </>
  );
};

export default OldCheckoutPage;
