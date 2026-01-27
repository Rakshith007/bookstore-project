import React, { useState, useEffect } from "react";
import { Camera, Loader2 } from "lucide-react";
import { getToken } from '../../lib/auth';

interface UserData {
  id: number;
  username: string;
  fullName: string;
  email: string;
  phoneNumber: string;
}

interface AddressData {
  id: number;
  streetAddress: string;
  apartment?: string;
  city: string;
  state?: string;
  country: string;
  phone?: string;
  isDefault: boolean;
}

interface FormData {
  username: string;
  fullName: string;
  email: string;
  primaryPhone: string;
  streetAddress: string;
  apartment: string;
  city: string;
  state: string;
  country: string;
  alternativePhone: string;
}

const EditProfileSection: React.FC = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<FormData>({
    username: "",
    fullName: "",
    email: "",
    primaryPhone: "",
    streetAddress: "",
    apartment: "",
    city: "",
    state: "",
    country: "",
    alternativePhone: "",
  });

  const [originalData, setOriginalData] = useState<FormData | null>(null);

  const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:4000";

  // Fetch user and default address
  useEffect(() => {
    const fetchProfile = async () => {
      const token = getToken();
      if (!token) {
        setError("You must be logged in to edit your profile.");
        setIsLoading(false);
        return;
      }

      try {
        // Fetch user profile
        const profileRes = await fetch(`${API_BASE_URL}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!profileRes.ok) throw new Error("Failed to load profile");
        const profileJson = await profileRes.json();
        const user: UserData = profileJson.data;

        // Fetch addresses
        const addrRes = await fetch(`${API_BASE_URL}/addresses`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        let defaultAddress: AddressData | null = null;
        if (addrRes.ok) {
          const addrJson = await addrRes.json();
          if (addrJson.success && addrJson.data.length > 0) {
            defaultAddress = addrJson.data.find((a: AddressData) => a.isDefault) || addrJson.data[0];
          }
        }

        const data: FormData = {
          username: user.username || "",
          fullName: user.fullName || "",
          email: user.email,
          primaryPhone: user.phoneNumber || "",
          streetAddress: defaultAddress?.streetAddress || "",
          apartment: defaultAddress?.apartment || "",
          city: defaultAddress?.city || "",
          state: defaultAddress?.state || "",
          country: defaultAddress?.country || "",
          alternativePhone: defaultAddress?.phone || "",
        };

        setFormData(data);
        setOriginalData(data);
        setIsLoading(false);
      } catch (err) {
        setError("Failed to load profile data. Please try again.");
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleChange = (key: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    if (!originalData) return;

    setIsSaving(true);
    const token = getToken();

    try {
      // Update user profile (fullName, primary phone)
      const profileUpdates: any = {};
      if (formData.fullName !== originalData.fullName) profileUpdates.fullName = formData.fullName;
      if (formData.primaryPhone !== originalData.primaryPhone) profileUpdates.phoneNumber = formData.primaryPhone;

      if (Object.keys(profileUpdates).length > 0) {
        const profileRes = await fetch(`${API_BASE_URL}/auth/me`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(profileUpdates),
        });
        if (!profileRes.ok) throw new Error("Failed to update profile");
      }

      // Update address if exists
      const addrRes = await fetch(`${API_BASE_URL}/addresses`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (addrRes.ok) {
        const addrJson = await addrRes.json();
        const defaultAddr = addrJson.data.find((a: any) => a.isDefault) || addrJson.data[0];

        if (defaultAddr) {
          const addressUpdates: any = {};
          if (formData.streetAddress !== originalData.streetAddress) addressUpdates.streetAddress = formData.streetAddress;
          if (formData.apartment !== originalData.apartment) addressUpdates.apartment = formData.apartment;
          if (formData.city !== originalData.city) addressUpdates.city = formData.city;
          if (formData.state !== originalData.state) addressUpdates.state = formData.state;
          if (formData.country !== originalData.country) addressUpdates.country = formData.country;
          if (formData.alternativePhone !== originalData.alternativePhone) addressUpdates.phone = formData.alternativePhone;

          if (Object.keys(addressUpdates).length > 0) {
            const updateAddrRes = await fetch(`${API_BASE_URL}/addresses/${defaultAddr.id}`, {
              method: "PATCH",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify(addressUpdates),
            });
            if (!updateAddrRes.ok) throw new Error("Failed to update address");
          }
        }
      }

      setOriginalData(formData);
      setIsEditing(false);
      alert("Profile updated successfully!");
    } catch (err: any) {
      alert(err.message || "Failed to save changes. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    if (originalData) setFormData(originalData);
    setIsEditing(false);
  };

  const labelClass = "block text-sm font-medium text-gray-700 mb-1";
  const inputClass = "w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent";

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto p-8">
        <div className="bg-white rounded-2xl shadow-sm border p-16 text-center">
          <Loader2 className="w-10 h-10 animate-spin text-gray-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading your profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-8">
        <div className="bg-white rounded-2xl shadow-sm border p-12 text-center">
          <p className="text-red-600 text-lg">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-2xl shadow-sm border">
        {/* Header */}
        <div className="p-8 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="relative">
                <div className="w-24 h-24 bg-gray-200 rounded-full border-4 border-white shadow-lg flex items-center justify-center">
                  <Camera className="w-10 h-10 text-gray-400" />
                </div>
                {/* Profile photo upload will be added later */}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{formData.fullName || formData.username}</h1>
                <p className="text-gray-600">{formData.email}</p>
              </div>
            </div>

            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition"
              >
                Edit Profile
              </button>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="p-8">
          {!isEditing ? (
            /* ================= VIEW MODE ================= */
            <div className="space-y-8">
              <section>
                <h2 className="text-xl font-semibold mb-4">Personal Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <InfoDisplay label="Username" value={formData.username || "—"} />
                  <InfoDisplay label="Full Name" value={formData.fullName || "—"} />
                  <InfoDisplay label="Email" value={formData.email} />
                  <InfoDisplay label="Primary Phone" value={formData.primaryPhone || "Not provided"} />
                </div>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-4">Default Shipping Address</h2>
                {formData.streetAddress ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <InfoDisplay label="Street Address" value={formData.streetAddress} />
                    <InfoDisplay label="Apartment / Unit" value={formData.apartment || "—"} />
                    <InfoDisplay label="City" value={formData.city} />
                    <InfoDisplay label="State" value={formData.state || "—"} />
                    <InfoDisplay label="Country" value={formData.country} />
                    <InfoDisplay label="Alternative Phone" value={formData.alternativePhone || "—"} />
                  </div>
                ) : (
                  <p className="text-gray-500 italic">No shipping address saved yet</p>
                )}
              </section>
            </div>
          ) : (
            /* ================= EDIT MODE ================= */
            <div className="space-y-8">
              <section>
                <h2 className="text-xl font-semibold mb-6">Personal Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className={labelClass}>Username</label>
                    <input
                      value={formData.username}
                      onChange={(e) => handleChange("username", e.target.value)}
                      className={inputClass}
                      disabled // Username usually not editable
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Full Name</label>
                    <input
                      value={formData.fullName}
                      onChange={(e) => handleChange("fullName", e.target.value)}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Email</label>
                    <input
                      value={formData.email}
                      className={inputClass}
                      disabled
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Primary Phone</label>
                    <input
                      value={formData.primaryPhone}
                      onChange={(e) => handleChange("primaryPhone", e.target.value)}
                      className={inputClass}
                      placeholder="e.g. +1 555 123 4567"
                    />
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-6">Default Shipping Address</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className={labelClass}>Street Address</label>
                    <input
                      value={formData.streetAddress}
                      onChange={(e) => handleChange("streetAddress", e.target.value)}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Apartment / Unit</label>
                    <input
                      value={formData.apartment}
                      onChange={(e) => handleChange("apartment", e.target.value)}
                      className={inputClass}
                      placeholder="Optional"
                    />
                  </div>
                  <div>
                    <label className={labelClass}>City</label>
                    <input
                      value={formData.city}
                      onChange={(e) => handleChange("city", e.target.value)}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>State / Province</label>
                    <input
                      value={formData.state}
                      onChange={(e) => handleChange("state", e.target.value)}
                      className={inputClass}
                      placeholder="Optional"
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Country</label>
                    <input
                      value={formData.country}
                      onChange={(e) => handleChange("country", e.target.value)}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Alternative Phone</label>
                    <input
                      value={formData.alternativePhone}
                      onChange={(e) => handleChange("alternativePhone", e.target.value)}
                      className={inputClass}
                      placeholder="Optional"
                    />
                  </div>
                </div>
              </section>

              <div className="flex justify-end gap-4 pt-6">
                <button
                  onClick={handleCancel}
                  className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                  disabled={isSaving}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="px-8 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition disabled:opacity-70 flex items-center gap-2"
                >
                  {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
                  {isSaving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

/* Reusable Components */
const InfoDisplay: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div>
    <p className="text-sm font-medium text-gray-600 mb-1">{label}</p>
    <p className="text-base text-gray-900">{value}</p>
  </div>
);

export default EditProfileSection;