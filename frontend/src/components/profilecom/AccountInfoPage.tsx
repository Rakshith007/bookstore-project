import React, { useState, useEffect, useRef } from "react";
import { User, Edit2, Check, X, Camera, Lock, Loader2 } from "lucide-react";
import { getToken } from '../../lib/auth';

/* ================= TYPES ================= */

interface UserFromBackend {
  id: number;
  email: string;
  username?: string;
  fullName: string;
  phoneNumber?: string;
  avatarUrl?: string;
}

interface AddressFromBackend {
  id: number;
  streetAddress: string;
  apartment?: string;
  city: string;
  state?: string;
  country: string;
  phone?: string;
  isDefault: boolean;
}

interface PersonalInfo {
  userName: string;
  fullName: string;
  email: string;
  phone: string;
  streetAddress: string;
  apartment: string;
  city: string;
  state: string;
  country: string;
  alternativePhone: string;
  avatarUrl?: string;
}

/* ================= COMPONENT ================= */

const AccountInfopage: React.FC = () => {
  const [info, setInfo] = useState<PersonalInfo>({
    userName: "Loading...",
    fullName: "Loading...",
    email: "Loading...",
    phone: "Not provided yet",
    streetAddress: "Not provided yet",
    apartment: "Not provided yet",
    city: "Not provided yet",
    state: "Not provided yet",
    country: "Not provided yet",
    alternativePhone: "Not provided yet",
    avatarUrl: undefined,
  });

  const [originalInfo, setOriginalInfo] = useState<PersonalInfo | null>(null);
  const [defaultAddressId, setDefaultAddressId] = useState<number | null>(null);

  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

  /* ================= FETCH DATA ================= */
  useEffect(() => {
    const fetchData = async () => {
      const token = getToken();
      if (!token) {
        setError("You are not logged in. Please log in to view your profile.");
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
        const user: UserFromBackend = profileJson.data || profileJson;

        // Fetch addresses
        let defaultAddress: AddressFromBackend | null = null;
        const addrRes = await fetch(`${API_BASE_URL}/addresses`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (addrRes.ok) {
          const addrJson = await addrRes.json();
          if (addrJson.success && addrJson.data?.length > 0) {
            const foundDefault = addrJson.data.find((a: AddressFromBackend) => a.isDefault);
            defaultAddress = foundDefault || addrJson.data[0];
            setDefaultAddressId(defaultAddress?.id ?? null);
          } else {
            setDefaultAddressId(null);
          }
        } else {
          setDefaultAddressId(null);
        }

        const loadedInfo: PersonalInfo = {
          userName: user.username || "No username set",
          fullName: user.fullName || "",
          email: user.email,
          phone: user.phoneNumber || "Not provided yet",
          streetAddress: defaultAddress?.streetAddress || "Not provided yet",
          apartment: defaultAddress?.apartment || "Not provided yet",
          city: defaultAddress?.city || "Not provided yet",
          state: defaultAddress?.state || "Not provided yet",
          country: defaultAddress?.country || "Not provided yet",
          alternativePhone: defaultAddress?.phone || "Not provided yet",
          avatarUrl: user.avatarUrl,
        };

        setInfo(loadedInfo);
        setOriginalInfo(loadedInfo);
        setIsLoading(false);
      } catch (err) {
        setError("Failed to load account information.");
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  /* ================= HANDLERS ================= */
  const handleEditToggle = () => {
    if (isEditing && originalInfo) {
      setInfo(originalInfo); // revert changes
    }
    setIsEditing(!isEditing);
    setError(null);
  };

  const handleInputChange = (field: keyof PersonalInfo, value: string) => {
    setInfo((prev) => ({ ...prev, [field]: value }));
  };

  const handleAvatarClick = () => {
    if (isEditing) fileInputRef.current?.click();
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const previewUrl = URL.createObjectURL(file);
    setInfo((prev) => ({ ...prev, avatarUrl: previewUrl }));
    setIsUploadingAvatar(true);
    setError(null);

    const token = getToken();
    if (!token) {
      setError("Authentication required.");
      setIsUploadingAvatar(false);
      return;
    }

    const formData = new FormData();
    formData.append("avatar", file);

    try {
      const response = await fetch(`${API_BASE_URL}/auth/me/avatar`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!response.ok) throw new Error("Failed to upload avatar");

      const result = await response.json();
      const newAvatarUrl = result.avatarUrl || result.data?.avatarUrl;

      setInfo((prev) => ({ ...prev, avatarUrl: newAvatarUrl }));
      if (originalInfo) {
        setOriginalInfo((prev) => ({ ...prev!, avatarUrl: newAvatarUrl }));
      }
    } catch (err: any) {
      setError(err.message || "Failed to upload avatar");
      if (originalInfo?.avatarUrl) {
        setInfo((prev) => ({ ...prev, avatarUrl: originalInfo.avatarUrl }));
      }
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleSave = async () => {
    if (!originalInfo) return;

    setIsSaving(true);
    setError(null);

    const token = getToken();
    if (!token) {
      setError("Authentication missing.");
      setIsSaving(false);
      return;
    }

    try {
      // 1. Update user profile
      const profileUpdates: Partial<UserFromBackend> = {};

      if (info.fullName !== originalInfo.fullName) {
        profileUpdates.fullName = info.fullName;
      }
      if (info.userName !== originalInfo.userName && info.userName !== "No username set") {
        profileUpdates.username = info.userName;
      }
      if (info.phone !== originalInfo.phone && info.phone !== "Not provided yet") {
        profileUpdates.phoneNumber = info.phone;
      }

      if (Object.keys(profileUpdates).length > 0) {
        const userRes = await fetch(`${API_BASE_URL}/auth/me`, {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(profileUpdates),
        });

        if (!userRes.ok) {
          const errData = await userRes.json().catch(() => ({}));
          throw new Error(errData.message || "Failed to update profile");
        }
      }

      // 2. Update default address (only if we have an address ID)
      if (defaultAddressId) {
        const addressUpdates: Partial<AddressFromBackend> = {};

        if (info.streetAddress !== originalInfo.streetAddress && info.streetAddress !== "Not provided yet") {
          addressUpdates.streetAddress = info.streetAddress;
        }
        if (info.apartment !== originalInfo.apartment && info.apartment !== "Not provided yet") {
          addressUpdates.apartment = info.apartment;
        }
        if (info.city !== originalInfo.city && info.city !== "Not provided yet") {
          addressUpdates.city = info.city;
        }
        if (info.state !== originalInfo.state && info.state !== "Not provided yet") {
          addressUpdates.state = info.state;
        }
        if (info.country !== originalInfo.country && info.country !== "Not provided yet") {
          addressUpdates.country = info.country;
        }
        if (info.alternativePhone !== originalInfo.alternativePhone && info.alternativePhone !== "Not provided yet") {
          addressUpdates.phone = info.alternativePhone;
        }

        if (Object.keys(addressUpdates).length > 0) {
          const addrRes = await fetch(`${API_BASE_URL}/addresses/${defaultAddressId}`, {
            method: "PATCH",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify(addressUpdates),
          });

          if (!addrRes.ok) {
            const errData = await addrRes.json().catch(() => ({}));
            throw new Error(errData.message || "Failed to update address");
          }
        }
      }

      // Success
      setOriginalInfo(info);
      setIsEditing(false);
    } catch (err: any) {
      setError(err.message || "Failed to save changes. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const getInitials = () => {
    const name = info.fullName || info.userName;
    if (!name || name === "No username set" || name === "Loading...") return "?";
    return name
      .trim()
      .split(/[\s_.-]+/)
      .map((p) => p[0]?.toUpperCase() || "")
      .slice(0, 2)
      .join("");
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto bg-[#FAF9F6] p-8 rounded-2xl border border-stone-200 shadow-sm flex flex-col items-center justify-center min-h-[300px]">
        <Loader2 className="w-10 h-10 animate-spin text-[#D4A373] mb-4" />
        <p className="text-stone-500 font-medium">Loading your profile...</p>
      </div>
    );
  }

  const hasAvatar = !!info.avatarUrl;

  return (
    <div className="max-w-4xl mx-auto bg-[#FAF9F6] p-6 md:p-8 rounded-2xl shadow-xl shadow-stone-200/50 border border-stone-100 text-[#333333]">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleAvatarChange}
        accept="image/*"
        className="hidden"
      />

      {/* Header */}
      <div className="flex flex-col md:flex-row items-center md:items-start justify-between mb-8 gap-6 border-b border-stone-200 pb-6">
        <div className="flex flex-col md:flex-row items-center gap-6">
          {/* Avatar */}
          <div className="relative group">
            <div
              onClick={handleAvatarClick}
              className={`
                relative w-28 h-28 md:w-32 md:h-32 rounded-full overflow-hidden transition-all duration-300
                ${isEditing ? 'cursor-pointer ring-2 ring-[#A3B18A] ring-offset-2 ring-offset-[#FAF9F6] shadow-lg' : 'ring-2 ring-white shadow-md'}
                ${hasAvatar ? '' : 'bg-stone-100 flex items-center justify-center'}
              `}
            >
              {isUploadingAvatar && (
                <div className="absolute inset-0 bg-stone-900/60 flex items-center justify-center z-10 backdrop-blur-sm">
                  <Loader2 className="w-6 h-6 text-white animate-spin" />
                </div>
              )}

              {hasAvatar ? (
                <img src={info.avatarUrl} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <span className="text-4xl font-serif font-bold text-[#2E4A3D]/80">{getInitials()}</span>
              )}

              {isEditing && !isUploadingAvatar && (
                <div className="absolute inset-0 bg-stone-900/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <Camera className="w-8 h-8 text-white drop-shadow-md" />
                </div>
              )}
            </div>
            {isEditing && (
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-[#2E4A3D] text-white text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full shadow-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                Change
              </div>
            )}
          </div>

          <div className="text-center md:text-left space-y-1">
            <h2 className="text-2xl md:text-3xl font-serif font-bold text-[#2E4A3D] tracking-tight">
              {info.fullName || info.userName}
            </h2>
            <div className="flex items-center justify-center md:justify-start gap-1.5 text-stone-500 font-medium">
              <User className="w-3.5 h-3.5" />
              <p className="text-sm">{info.userName}</p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 mt-4 md:mt-0">
          {isEditing ? (
            <>
              <button
                onClick={handleEditToggle}
                disabled={isSaving || isUploadingAvatar}
                className="flex items-center gap-2 px-4 py-2 rounded-lg border border-stone-300 text-stone-600 text-sm font-medium hover:bg-stone-100 hover:text-stone-900 transition-colors disabled:opacity-50"
              >
                <X className="w-3.5 h-3.5" /> Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving || isUploadingAvatar}
                className="flex items-center gap-2 px-4 py-2 bg-[#B85C38] text-white text-sm font-medium rounded-lg hover:bg-[#a04e2f] transition-all shadow-md active:scale-95 disabled:opacity-70 disabled:active:scale-100"
              >
                {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                {isSaving ? "Saving..." : "Save"}
              </button>
            </>
          ) : (
            <button
              onClick={handleEditToggle}
              className="flex items-center gap-2 px-4 py-2 bg-[#2E4A3D] text-[#FAF9F6] text-sm font-medium rounded-lg hover:bg-[#1a2f26] hover:shadow-lg transition-all active:scale-95"
            >
              <Edit2 className="w-3.5 h-3.5" /> Edit Profile
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-100 text-red-700 px-4 py-2 rounded-lg mb-6 text-sm font-medium flex items-center gap-2 justify-center">
          <div className="w-1.5 h-1.5 rounded-full bg-red-500" /> {error}
        </div>
      )}

      {/* Info Cards Grid - Unified Grid without Divider */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5">

        {/* Email - read only */}
        <div className="relative group">
          <div className="flex items-center justify-between mb-1.5">
            <p className="text-[10px] font-bold uppercase tracking-widest text-stone-400">Email Address</p>
            <Lock className="w-3 h-3 text-stone-400" />
          </div>
          <div className="w-full px-3 py-2.5 bg-stone-100/50 border border-stone-200 rounded-lg text-stone-500 font-mono text-sm cursor-not-allowed select-all">
            {info.email}
          </div>
          <p className="text-[10px] text-stone-400 mt-1 opacity-0 group-hover:opacity-100 transition-opacity absolute">Cannot be changed</p>
        </div>

        <EditableInfoCard
          label="Full Name"
          value={info.fullName}
          isEditing={isEditing}
          onChange={(v) => handleInputChange("fullName", v)}
        />
        <EditableInfoCard
          label="Username"
          value={info.userName === "No username set" ? "" : info.userName}
          isEditing={isEditing}
          onChange={(v) => handleInputChange("userName", v)}
          placeholder="Optional"
        />
        <EditableInfoCard
          label="Phone Number"
          value={info.phone}
          isEditing={isEditing}
          onChange={(v) => handleInputChange("phone", v)}
        />
        
        {/* Divider Removed - Flow continues naturally in grid */}

        <EditableInfoCard
          label="Street Address"
          value={info.streetAddress}
          isEditing={isEditing}
          onChange={(v) => handleInputChange("streetAddress", v)}
        />
        <EditableInfoCard
          label="Apartment, suite, etc."
          value={info.apartment}
          isEditing={isEditing}
          onChange={(v) => handleInputChange("apartment", v)}
          placeholder="Optional"
        />
        <EditableInfoCard
          label="City"
          value={info.city}
          isEditing={isEditing}
          onChange={(v) => handleInputChange("city", v)}
        />
        <EditableInfoCard
          label="State / Province"
          value={info.state}
          isEditing={isEditing}
          onChange={(v) => handleInputChange("state", v)}
          placeholder="Optional"
        />
        <EditableInfoCard
          label="Country"
          value={info.country}
          isEditing={isEditing}
          onChange={(v) => handleInputChange("country", v)}
        />
        <EditableInfoCard
          label="Alternative Phone"
          value={info.alternativePhone}
          isEditing={isEditing}
          onChange={(v) => handleInputChange("alternativePhone", v)}
          placeholder="Optional"
        />
      </div>

      <div className={`mt-8 text-center transition-all duration-300 ${isEditing ? 'opacity-100 translate-y-0' : 'opacity-50 translate-y-2'}`}>
        <p className="text-xs text-[#D4A373] italic">
          {isEditing
            ? "Fields marked with a lock cannot be edited directly."
            : "Click on edit to change information."}
        </p>
      </div>
    </div>
  );
};

/* ================= EDITABLE CARD ================= */
interface EditableInfoCardProps {
  label: string;
  value: string;
  isEditing: boolean;
  onChange: (value: string) => void;
  placeholder?: string;
}

const EditableInfoCard: React.FC<EditableInfoCardProps> = ({
  label,
  value,
  isEditing,
  onChange,
  placeholder,
}) => {
  const displayValue =
    value === "Not provided yet" || value === "No username set" ? "" : value;

  const displayText =
    value === "Not provided yet" ? "Not provided" : value || "—";

  const isPlaceholder = value === "Not provided yet" || !value;

  return (
    <div className="flex flex-col gap-1.5">
      <p className="text-[10px] font-bold uppercase tracking-widest text-[#D4A373] ml-1">
        {label}
      </p>

      {isEditing ? (
        <div className="relative">
          <input
            type="text"
            value={displayValue}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder || `Enter ${label.toLowerCase()}`}
            className="w-full px-3 py-2.5 bg-white border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2E4A3D]/20 focus:border-[#2E4A3D] transition-all duration-200 text-[#333333] placeholder:text-stone-300 text-sm font-medium shadow-sm"
          />
        </div>

      ) : (
        <div className={`
            px-3 py-2.5 border border-transparent rounded-lg text-sm
            ${isPlaceholder ? 'text-stone-400 italic' : 'text-[#333333] font-medium'}
        `}>
          {displayText}
        </div>
      )}
    </div>
  );
};

export default AccountInfopage;