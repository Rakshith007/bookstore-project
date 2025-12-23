import React, { useState } from "react";
import { Camera } from "lucide-react";

/* ===================== TYPES ===================== */

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

/* ===================== MAIN COMPONENT ===================== */

const EditProfileSection: React.FC = () => {
  const [isEditing, setIsEditing] = useState(false);

  const [profilePhotoUrl, setProfilePhotoUrl] = useState(
    "https://via.placeholder.com/150"
  );

  const initialData: PersonalInfo = {
    userName: "ClaraB",
    email: "clara.bennett@email.com",
    phone: "+1 555 123 4567",
    streetAddress: "123 Oak Street",
    apartment: "Apt 4B",
    city: "New York",
    state: "NY",
    country: "USA",
  };

  const [formData, setFormData] = useState(initialData);
  const [originalData, setOriginalData] = useState(initialData);

  const handleChange = (key: keyof PersonalInfo, value: string) => {
    setFormData({ ...formData, [key]: value });
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => setProfilePhotoUrl(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    setOriginalData(formData);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setFormData(originalData);
    setIsEditing(false);
  };

  const inputStyle =
    "w-full h-11 px-4 border rounded-lg focus:ring-2 focus:ring-green-500";

  return (
    <div className="bg-white p-8 rounded-xl shadow-sm border max-w-4xl mx-auto min-h-[520px]">

      {/* ================= VIEW MODE ================= */}
      {!isEditing && (
        <>
          <div className="flex items-center gap-6 mb-8">
            <img
              src={profilePhotoUrl}
              alt="Profile"
              className="w-20 h-20 rounded-full object-cover border"
            />

            <div>
              <h2 className="text-2xl font-semibold">{formData.userName}</h2>
              <p className="text-gray-500">{formData.email}</p>
            </div>

            <button
              onClick={() => setIsEditing(true)}
              className="ml-auto px-5 py-2 bg-black text-white rounded-lg"
            >
              Edit Profile
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Object.entries(formData).map(([key, value]) => (
              <div key={key}>
                <p className="text-sm text-gray-500">
                  {key.replace(/([A-Z])/g, " $1")}
                </p>
                <p className="font-medium">{value}</p>
              </div>
            ))}
          </div>
        </>
      )}

      {/* ================= EDIT MODE ================= */}
      {isEditing && (
        <>
          {/* Profile Photo */}
          <div className="flex items-center gap-6 mb-10">
            <div className="relative">
              <img
                src={profilePhotoUrl}
                className="w-24 h-24 rounded-full object-cover border"
              />

              <label className="absolute bottom-0 right-0 bg-green-600 p-2 rounded-full cursor-pointer">
                <Camera size={16} className="text-white" />
                <input type="file" hidden onChange={handlePhotoChange} />
              </label>
            </div>
          </div>

          {/* Form */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Object.entries(formData).map(([key, value]) => (
              <div key={key}>
                <label className="block text-sm text-gray-600 mb-1">
                  {key.replace(/([A-Z])/g, " $1")}
                </label>
                <input
                  value={value}
                  onChange={(e) =>
                    handleChange(key as keyof PersonalInfo, e.target.value)
                  }
                  className={inputStyle}
                />
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-4 mt-8">
            <button
              onClick={handleCancel}
              className="px-6 py-2 border rounded-lg"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-6 py-2 bg-black text-white rounded-lg"
            >
              Save Changes
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default EditProfileSection;
