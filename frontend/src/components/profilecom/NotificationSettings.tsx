import React, { useState } from "react";

/* ===================== TYPES ===================== */

type NotificationKey =
  | "orderUpdates"
  | "deliveryAlerts"
  | "promotions"
  | "newReleases"
  | "smsAlerts";

/* ===================== MAIN COMPONENT ===================== */

const NotificationSettings: React.FC = () => {
  const [notifications, setNotifications] = useState<Record<NotificationKey, boolean>>({
    orderUpdates: true,
    deliveryAlerts: true,
    promotions: false,
    newReleases: true,
    smsAlerts: false,
  });

  const toggle = (key: NotificationKey) => {
    setNotifications((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  return (
    <div className="max-w-3xl font-[ui-serif]">
      <h2 className="text-2xl font-semibold mb-8">
        Notification Settings
      </h2>

      {/* ================= Email Notifications ================= */}
      <Section title="Email Notifications">
        <Toggle
          label="Order Updates"
          description="Get notified about order status changes"
          checked={notifications.orderUpdates}
          onChange={() => toggle("orderUpdates")}
        />
        <Toggle
          label="Delivery Alerts"
          description="Shipping and delivery confirmations"
          checked={notifications.deliveryAlerts}
          onChange={() => toggle("deliveryAlerts")}
        />
        <Toggle
          label="New Releases"
          description="Updates on newly added books"
          checked={notifications.newReleases}
          onChange={() => toggle("newReleases")}
        />
        <Toggle
          label="Promotions & Offers"
          description="Discounts, deals, and special offers"
          checked={notifications.promotions}
          onChange={() => toggle("promotions")}
        />
      </Section>

      {/* ================= SMS Notifications ================= */}
      <Section title="SMS Notifications">
        <Toggle
          label="SMS Alerts"
          description="Receive important alerts via SMS"
          checked={notifications.smsAlerts}
          onChange={() => toggle("smsAlerts")}
        />
      </Section>
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

    {/* Modern Toggle */}
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

export default NotificationSettings;
