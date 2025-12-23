import React, { useState } from "react";

const SecuritySettings: React.FC = () => {
  const [twoFA, setTwoFA] = useState(true);

  return (
    <div className="max-w-3xl font-[ui-serif]">
      {/* Title */}
      <h2 className="text-2xl font-semibold mb-8">
        Security Settings
      </h2>

      {/* ================= Change Password ================= */}
      <section className="bg-white border rounded-2xl p-6 mb-8 shadow-sm">
        <h3 className="text-lg font-medium mb-4">
          Change Password
        </h3>

        <div className="space-y-3">
          <input
            type="password"
            placeholder="Current Password"
            className="w-full h-11 px-4 border rounded-lg text-sm focus:ring-2 focus:ring-black"
          />
          <input
            type="password"
            placeholder="New Password"
            className="w-full h-11 px-4 border rounded-lg text-sm focus:ring-2 focus:ring-black"
          />
          <input
            type="password"
            placeholder="Confirm Password"
            className="w-full h-11 px-4 border rounded-lg text-sm focus:ring-2 focus:ring-black"
          />
        </div>

        <button className="mt-5 px-5 py-2.5 bg-black text-white rounded-lg text-sm hover:opacity-90 transition">
          Update Password
        </button>
      </section>

      {/* ================= Two Factor Auth ================= */}
      <section className="bg-white border rounded-2xl p-6 mb-8 shadow-sm">
        <h3 className="text-lg font-medium mb-4">
          Two-Factor Authentication
        </h3>

        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-sm">Enable 2FA</p>
            <p className="text-xs text-gray-500 mt-1">
              Adds extra security to your account
            </p>
          </div>

          {/* Toggle Switch */}
          <button
            onClick={() => setTwoFA(!twoFA)}
            className={`relative w-11 h-6 rounded-full transition ${
              twoFA ? "bg-blue-500" : "bg-gray-300"
            }`}
          >
            <span
              className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition ${
                twoFA ? "translate-x-5" : ""
              }`}
            />
          </button>
        </div>
      </section>

      {/* ================= Active Sessions ================= */}
      <section className="bg-white border rounded-2xl p-6 shadow-sm">
        <h3 className="text-lg font-medium mb-4">
          Active Sessions
        </h3>

        <div className="flex items-center justify-between border rounded-lg p-4 text-sm">
          <div>
            <p className="font-medium">Chrome · Windows · India</p>
            <p className="text-xs text-gray-500 mt-1">
              Last active: Just now
            </p>
          </div>

          <button className="text-red-600 text-sm hover:underline">
            Logout
          </button>
        </div>
      </section>
    </div>
  );
};

export default SecuritySettings;
