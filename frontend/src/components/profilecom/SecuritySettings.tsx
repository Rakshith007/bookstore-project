import React, { useState } from "react";
import { Shield, Lock, Laptop, KeyRound } from "lucide-react";
import Navbar from "../layout/Navbar";

const SecuritySettings: React.FC = () => {
  const [twoFA, setTwoFA] = useState(true);

  return (
    <div className="min-h-screen bg-[#FAF9F6]">
      <Navbar />
      <main className="max-w-3xl mx-auto px-6 py-10">
        
        {/* Compact Header */}
        <header className="mb-8 text-center">
          <h2 className="text-2xl font-serif font-bold text-black mb-1">
            Security Settings
          </h2>
          <p className="text-sm text-black opacity-70">
            Keep your library and credentials safe with advanced protection.
          </p>
        </header>

        {/* ================= Change Password ================= */}
        <section className="bg-white border border-[#F5EBDD] rounded-xl p-6 mb-6 shadow-sm">
          <div className="flex items-center gap-2 mb-6">
            <KeyRound className="w-4 h-4 text-[#D4A373]" />
            <h3 className="text-xs font-bold text-[#2E4A3D] uppercase tracking-widest">
              Update Password
            </h3>
          </div>

          <div className="grid grid-cols-1 gap-4">
            <input
              type="password"
              placeholder="Current Password"
              className="w-full h-10 px-4 bg-[#FAF9F6] border border-[#F5EBDD] rounded-lg text-sm focus:outline-none focus:border-[#2E4A3D] transition-colors"
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <input
                type="password"
                placeholder="New Password"
                className="w-full h-10 px-4 bg-[#FAF9F6] border border-[#F5EBDD] rounded-lg text-sm focus:outline-none focus:border-[#2E4A3D] transition-colors"
              />
              <input
                type="password"
                placeholder="Confirm Password"
                className="w-full h-10 px-4 bg-[#FAF9F6] border border-[#F5EBDD] rounded-lg text-sm focus:outline-none focus:border-[#2E4A3D] transition-colors"
              />
            </div>
          </div>

          <button className="mt-6 px-6 py-2 bg-[#2E4A3D] text-[#FAF9F6] rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-[#A3B18A] hover:text-[#2E4A3D] transition-all shadow-md">
            Save New Password
          </button>
        </section>

        {/* ================= Two Factor Auth ================= */}
        <section className="bg-white border border-[#F5EBDD] rounded-xl p-6 mb-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-[#D4A373]" />
              <div>
                <h3 className="text-xs font-bold text-[#2E4A3D] uppercase tracking-widest">
                  Two-Factor Authentication
                </h3>
                <p className="text-[11px] text-[#333333] opacity-60 mt-0.5">
                  Adds an extra layer of scholarly protection to your account.
                </p>
              </div>
            </div>

            {/* Toggle Switch */}
            <button
              onClick={() => setTwoFA(!twoFA)}
              className={`relative w-10 h-5 rounded-full transition-colors duration-300 focus:outline-none ${
                twoFA ? "bg-[#2E4A3D]" : "bg-[#F5EBDD]"
              }`}
            >
              <span
                className={`absolute top-1 left-1 w-3 h-3 bg-white rounded-full transition-transform duration-300 ${
                  twoFA ? "translate-x-5" : ""
                }`}
              />
            </button>
          </div>
        </section>

        {/* ================= Active Sessions ================= */}
        <section className="bg-white border border-[#F5EBDD] rounded-xl p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-6">
            <Laptop className="w-4 h-4 text-[#D4A373]" />
            <h3 className="text-xs font-bold text-[#2E4A3D] uppercase tracking-widest">
              Current Sessions
            </h3>
          </div>

          <div className="flex items-center justify-between bg-[#FAF9F6] border border-[#F5EBDD] rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-[#F5EBDD] rounded-full flex items-center justify-center">
                <div className="w-2 h-2 bg-[#A3B18A] rounded-full animate-pulse" />
              </div>
              <div>
                <p className="text-sm font-bold text-[#333333]">Chrome · Windows · India</p>
                <p className="text-[10px] text-[#333333] opacity-50 uppercase tracking-tighter">
                  Current Device • Last active: Just now
                </p>
              </div>
            </div>

            <button className="text-[10px] font-bold text-[#B85C38] uppercase tracking-widest hover:text-[#2E4A3D] transition-colors">
              Terminate
            </button>
          </div>
        </section>
      </main>
    </div>
  );
};

export default SecuritySettings;