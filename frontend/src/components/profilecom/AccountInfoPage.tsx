import React, { useState, useEffect } from "react";
import { User } from "lucide-react"; // ← Add this import
import { getToken } from '../../lib/auth';

/* ================= TYPES ================= */

interface UserFromBackend {
  id: number;
  email: string;
  username: string;
  fullName: string;
  phoneNumber?: string;
}

export interface PersonalInfo {
  userName: string;
  email: string;
  phone: string;
  streetAddress: string;
  apartment: string;
  city: string;
  state: string;
  country: string;
}

/* ================= COMPONENT ================= */

const AccountInfopage: React.FC = () => {
  const [info, setInfo] = useState<PersonalInfo>({
    userName: "Loading...",
    email: "Loading...",
    phone: "Not provided yet",
    streetAddress: "Not provided yet",
    apartment: "Not provided yet",
    city: "Not provided yet",
    state: "Not provided yet",
    country: "Not provided yet",
  });

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      const token = getToken();

      if (!token) {
        setError("You are not logged in. Please log in to view your profile.");
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/auth/me`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          if (response.status === 401) {
            setError("Session expired. Please log in again.");
          } else {
            setError("Failed to load profile data.");
          }
          setIsLoading(false);
          return;
        }

        const data: UserFromBackend = await response.json();

        setInfo({
          userName: data.username || "No username set",
          email: data.email,
          phone: data.phoneNumber || "Not provided yet",
          streetAddress: "Not provided yet",
          apartment: "Not provided yet",
          city: "Not provided yet",
          state: "Not provided yet",
          country: "Not provided yet",
        });

        setIsLoading(false);
      } catch (err) {
        console.error("Error fetching profile:", err);
        setError("Network error. Please try again.");
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, []);

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto bg-white p-8 rounded-xl border shadow-sm text-center">
        <p className="text-gray-600">Loading your profile...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-5xl mx-auto bg-white p-8 rounded-xl border shadow-sm text-center">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  // Generate initials from username (e.g., "john_doe" → "JD")
  const getInitials = (username: string) => {
    if (!username || username === "No username set") return "?";
    return username
      .split(/[\s_.-]+/)
      .map((part) => part[0]?.toUpperCase() || "")
      .slice(0, 2)
      .join("");
  };

  return (
    <div className="max-w-5xl mx-auto bg-white p-8 rounded-xl border shadow-sm">
      {/* Header */}
      <div className="flex items-center gap-6 mb-10">
        {/* Profile Picture / Fallback Icon */}
        <div className="relative w-24 h-24 rounded-full bg-gray-200 border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden">
          {/* If you add real avatar URL later, put it here as <img> */}
          {/* For now: show initials or default icon */}
          {info.userName !== "No username set" ? (
            <span className="text-2xl font-semibold text-gray-600">
              {getInitials(info.userName)}
            </span>
          ) : (
            <User className="w-12 h-12 text-gray-400" />
          )}
        </div>

        <div>
          <h2 className="text-2xl font-[ui-serif] font-semibold">
            {info.userName}
          </h2>
          <p className="text-gray-500">{info.email}</p>
        </div>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <InfoCard label="Phone Number" value={info.phone} />
        <InfoCard label="Street Address" value={info.streetAddress} />
        <InfoCard label="Apartment" value={info.apartment} />
        <InfoCard label="City" value={info.city} />
        <InfoCard label="State" value={info.state} />
        <InfoCard label="Country" value={info.country} />
      </div>

      {/* Optional note */}
      <p className="text-sm text-gray-500 mt-8 text-center">
        Address and phone will be saved during checkout or can be added later.
      </p>
    </div>
  );
};

/* ================= INFO CARD ================= */

const InfoCard: React.FC<{ label: string; value: string }> = ({
  label,
  value,
}) => (
  <div className="bg-white border rounded-xl p-5 shadow-sm">
    <p className="text-sm text-gray-500 mb-1">{label}</p>
    <p className="font-medium text-gray-900">{value}</p>
  </div>
);

export default AccountInfopage;