import React, { useState } from "react";
import { Link } from "react-router-dom";

import Navbar from "../../components/layout/Navbar";
// Optional (only if you want footer consistency)
// import Footer from "../../components/layout/Footer";

type PaymentMethodType = "card" | "upi" | "wallet";

interface Book {
  id: string;
  title: string;
  author: string;
  price: number;
  image: string;
}

const PaymentMethodPage: React.FC = () => {
  const [paymentMethod, setPaymentMethod] =
    useState<PaymentMethodType>("card");

  const [formData, setFormData] = useState({
    nameOnCard: "",
    cardNumber: "",
    expiryDate: "",
    cvv: "",
  });

  const books: Book[] = [
    {
      id: "1",
      title: "The Secret Garden",
      author: "Amelia Hayes",
      price: 12.99,
      image:
        "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=80&h=120&fit=crop",
    },
    {
      id: "2",
      title: "Echoes of the Past",
      author: "Ethan Carter",
      price: 9.99,
      image:
        "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=80&h=120&fit=crop",
    },
  ];

  const subtotal = books.reduce((sum, book) => sum + book.price, 0);
  const shipping = 4.99;
  const tax = 1.84;
  const total = subtotal + shipping + tax;

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="min-h-screen bg-white">
      {/* ✅ Shared Navbar */}
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <div className="mb-6">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span>Shopping Bag</span>
            <span>/</span>
            <span className="text-gray-900">Payment</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* LEFT SECTION */}
          <div className="lg:col-span-2">
            <h1 className="text-3xl font-semibold mb-6">
              Payment Method
            </h1>

            {/* Payment Options */}
            <div className="space-y-4 mb-6">
              {[
                { key: "card", label: "Credit/Debit Card" },
                { key: "upi", label: "UPI" },
                { key: "wallet", label: "Cash on Delivery" },
              ].map((method) => (
                <button
                  key={method.key}
                  onClick={() =>
                    setPaymentMethod(
                      method.key as PaymentMethodType
                    )
                  }
                  className={`w-full flex items-center gap-3 p-4 border rounded-lg ${
                    paymentMethod === method.key
                      ? "border-gray-900"
                      : "border-gray-300"
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      paymentMethod === method.key
                        ? "border-gray-900"
                        : "border-gray-300"
                    }`}
                  >
                    {paymentMethod === method.key && (
                      <div className="w-2.5 h-2.5 rounded-full bg-gray-900" />
                    )}
                  </div>
                  <span>{method.label}</span>
                </button>
              ))}
            </div>

            {/* Card Form */}
            {paymentMethod === "card" && (
              <div className="space-y-4">
                <input
                  name="nameOnCard"
                  placeholder="Name on Card"
                  value={formData.nameOnCard}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border rounded-lg"
                />
                <input
                  name="cardNumber"
                  placeholder="Card Number"
                  value={formData.cardNumber}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border rounded-lg"
                />
                <div className="grid grid-cols-2 gap-4">
                  <input
                    name="expiryDate"
                    placeholder="MM/YY"
                    value={formData.expiryDate}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border rounded-lg"
                  />
                  <input
                    name="cvv"
                    placeholder="CVV"
                    value={formData.cvv}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border rounded-lg"
                  />
                </div>
              </div>
            )}

            <div className="mt-8 flex justify-end">
              <Link to="/ordersuccess">
                <button className="px-8 py-3 bg-[#2D4A3E] text-white rounded-full">
                  Pay Now
                </button>
              </Link>
            </div>
          </div>

          {/* RIGHT SECTION */}
          <div>
            <div className="border rounded-lg p-6">
              <h2 className="text-2xl font-semibold mb-6">
                Order Summary
              </h2>

              {books.map((book) => (
                <div key={book.id} className="flex gap-4 mb-4">
                  <img
                    src={book.image}
                    alt={book.title}
                    className="w-16 h-24 object-cover rounded"
                  />
                  <div className="flex-1">
                    <h3>{book.title}</h3>
                    <p className="text-sm text-gray-600">
                      by {book.author}
                    </p>
                  </div>
                  <span>${book.price.toFixed(2)}</span>
                </div>
              ))}

              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span>${shipping.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax</span>
                  <span>${tax.toFixed(2)}</span>
                </div>
              </div>

              <div className="border-t pt-4 flex justify-between font-semibold">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Optional */}
      {/* <Footer /> */}
    </div>
  );
};

export default PaymentMethodPage;
