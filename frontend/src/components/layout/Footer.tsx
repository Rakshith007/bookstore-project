import React from "react";
import { Link } from "react-router-dom";
import {
  Facebook,
  Twitter,
  Instagram,
  Send,
} from "lucide-react";

const Footer = () => {
  return (
    <footer className="border-t bg-white text-gray-800">
      {/* APPLY SAME TEXT STYLE */}
      <div className="font-serif">
        <div className="max-w-7xl mx-auto px-6 py-14">

          {/* GRID TOP SECTION */}
          <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4">

            {/* Newsletter */}
            <div>
              <h2 className="text-3xl font-bold mb-4">
                Stay Connected
              </h2>
              <p className="text-gray-500 mb-4">
                Join our newsletter for the latest updates and exclusive offers.
              </p>

              <div className="relative">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="w-full px-4 py-3 pr-12 border rounded-lg bg-gray-50 border-gray-300 focus:border-gray-400 focus:outline-none"
                />
                <button className="absolute right-2 top-2 bg-black text-white p-2 rounded-full hover:bg-gray-800 transition">
                  <Send className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="text-lg font-semibold mb-4">
                Quick Links
              </h3>
              <nav className="space-y-2 text-sm">
                <a href="#" className="block hover:text-gray-900">
                  Home
                </a>
                <Link to="/about" className="block hover:text-gray-900">
                  About Us
                </Link>
                <a href="#" className="block hover:text-gray-900">
                  Services
                </a>
                <a href="#" className="block hover:text-gray-900">
                  Products
                </a>
              </nav>
            </div>

            {/* Contact */}
            <div>
              <h3 className="text-lg font-semibold mb-4">
                Contact Us
              </h3>
              <p className="text-sm">
                123 Innovation Street
              </p>
              <p className="text-sm">
                Tech City, TC 12345
              </p>
              <p className="text-sm">
                Phone: (123) 456-7890
              </p>
              <p className="text-sm">
                Email: hello@example.com
              </p>
            </div>

            {/* Social Links */}
            <div>
              <h3 className="text-lg font-semibold mb-4">
                Follow Us
              </h3>

              <div className="flex gap-3 mb-6">
                <button className="w-10 h-10 border border-gray-300 rounded-full flex items-center justify-center hover:bg-gray-100 transition">
                  <Facebook className="h-4 w-4" />
                </button>

                <button className="w-10 h-10 border border-gray-300 rounded-full flex items-center justify-center hover:bg-gray-100 transition">
                  <Twitter className="h-4 w-4" />
                </button>

                <button className="w-10 h-10 border border-gray-300 rounded-full flex items-center justify-center hover:bg-gray-100 transition">
                  <Instagram className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Bottom Section */}
          <div className="mt-12 border-t pt-6 text-center md:text-left flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-gray-500">
              © 2025 Book Haven. All rights reserved.
            </p>

            <div className="flex gap-4 text-sm">
              <a href="#" className="hover:text-gray-900">
                Privacy Policy
              </a>
              <a href="#" className="hover:text-gray-900">
                Terms of Service
              </a>
              <a href="#" className="hover:text-gray-900">
                Cookie Settings
              </a>
            </div>
          </div>

        </div>
      </div>
    </footer>
  );
};

export default Footer;
