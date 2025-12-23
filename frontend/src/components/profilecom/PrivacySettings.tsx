import React, { useState } from "react";

/* ===================== TYPES ===================== */

type PrivacyKey =
  | "profilePublic"
  | "orderVisibleToSupport"
  | "searchEngineIndex"
  | "personalizedRecommendations"
  | "anonymousAnalytics";

/* ===================== MAIN COMPONENT ===================== */

const PrivacySettings: React.FC = () => {
  const [settings, setSettings] = useState<Record<PrivacyKey, boolean>>({
    profilePublic: false,
    orderVisibleToSupport: true,
    searchEngineIndex: false,
    personalizedRecommendations: true,
    anonymousAnalytics: true,
  });

  const toggle = (key: PrivacyKey) => {
    setSettings((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  return (
    <div className="max-w-3xl font-[ui-serif]">
      <h2 className="text-2xl font-semibold mb-8">
        Privacy Settings
      </h2>

      {/* ================= Profile Privacy ================= */}
      <Section title="Profile Privacy">
        <Toggle
          label="Public Profile"
          description="Allow others to view your profile"
          checked={settings.profilePublic}
          onChange={() => toggle("profilePublic")}
        />

        <Toggle
          label="Order History Visibility"
          description="Allow support team to view your order history"
          checked={settings.orderVisibleToSupport}
          onChange={() => toggle("orderVisibleToSupport")}
        />
      </Section>

      {/* ================= Data Usage ================= */}
      <Section title="Data Usage">
        <Toggle
          label="Personalized Recommendations"
          description="Use your activity to suggest books"
          checked={settings.personalizedRecommendations}
          onChange={() => toggle("personalizedRecommendations")}
        />

        <Toggle
          label="Anonymous Analytics"
          description="Share anonymous usage data to improve our services"
          checked={settings.anonymousAnalytics}
          onChange={() => toggle("anonymousAnalytics")}
        />
      </Section>

      {/* ================= Danger Zone ================= */}
      <section className="bg-white border border-red-200 rounded-2xl p-6 shadow-sm">
        <h3 className="text-lg font-medium text-red-600 mb-3">
          Danger Zone
        </h3>

        <p className="text-sm text-gray-600 mb-4">
          Request permanent deletion of your account and associated data.
        </p>

        <button className="px-5 py-2.5 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition">
          Request Account Deletion
        </button>
      </section>
    </div>
  );
};

/* ===================== SECTION ===================== */

interface SectionProps {
  title: string;
  children: React.ReactNode;
}

const Section: React.FC<SectionProps> = ({ title, children }) => (
  <section className="bg-white border rounded-2xl p-6 mb-8 shadow-sm">
    <h3 className="text-lg font-medium mb-4">{title}</h3>
    <div className="space-y-4">{children}</div>
  </section>
);

/* ===================== TOGGLE ===================== */

interface ToggleProps {
  label: string;
  description?: string;
  checked: boolean;
  onChange: () => void;
}

const Toggle: React.FC<ToggleProps> = ({
  label,
  description,
  checked,
  onChange,
}) => (
  <div className="flex items-center justify-between">
    <div>
      <p className="font-medium text-sm">{label}</p>
      {description && (
        <p className="text-xs text-gray-500 mt-1">{description}</p>
      )}
    </div>

    {/* Modern Toggle Switch */}
    <button
      onClick={onChange}
      className={`relative w-11 h-6 rounded-full transition ${
        checked ? "bg-blue-500" : "bg-gray-300"
      }`}
    >
      <span
        className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition ${
          checked ? "translate-x-5" : ""
        }`}
      />
    </button>
  </div>
);

export default PrivacySettings;
