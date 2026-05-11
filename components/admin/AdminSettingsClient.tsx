"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Lock, Store, Bell, Power } from "lucide-react";

export default function AdminSettingsClient() {
  const [tab, setTab] = useState<"store" | "notifications" | "password" | "maintenance">("store");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Store info
  const [storeData, setStoreData] = useState({
    storeName: "Make My Memory",
    phone: "",
    address: "",
  });

  // Password
  const [passwordData, setPasswordData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // Toggles
  const [toggles, setToggles] = useState({
    orderNotifications: false,
    maintenanceMode: false,
  });

  const handleStoreSave = async () => {
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/settings/store", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(storeData),
      });
      if (res.ok) {
        setMessage({ type: "success", text: "Store info updated!" });
      } else {
        setMessage({ type: "error", text: "Failed to update store info" });
      }
    } catch (err) {
      setMessage({ type: "error", text: "Error updating store info" });
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage({ type: "error", text: "Passwords don't match" });
      return;
    }
    if (passwordData.newPassword.length < 6) {
      setMessage({ type: "error", text: "Password must be at least 6 characters" });
      return;
    }

    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/settings/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          oldPassword: passwordData.oldPassword,
          newPassword: passwordData.newPassword,
        }),
      });
      if (res.ok) {
        setMessage({ type: "success", text: "Admin password changed!" });
        setPasswordData({ oldPassword: "", newPassword: "", confirmPassword: "" });
      } else {
        setMessage({ type: "error", text: "Failed to change password" });
      }
    } catch (err) {
      setMessage({ type: "error", text: "Error changing password" });
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (key: "orderNotifications" | "maintenanceMode") => {
    const newValue = !toggles[key];
    setToggles({ ...toggles, [key]: newValue });
    
    try {
      await fetch("/api/admin/settings/toggle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key, value: newValue }),
      });
    } catch (err) {
      setToggles({ ...toggles, [key]: !newValue });
      setMessage({ type: "error", text: "Failed to update setting" });
    }
  };

  return (
    <div className="bg-canvas min-h-screen">
      {/* Hero */}
      <div style={{ backgroundColor: "#1a1714" }} className="py-10 sm:py-14">
        <div className="section-wrap">
          <h1 className="font-serif font-bold text-white text-2xl sm:text-3xl">Admin Settings</h1>
          <p className="text-white/50 text-sm mt-1">Manage store configuration</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-stone-100 sticky top-16 z-20">
        <div className="section-wrap flex gap-1 py-2 overflow-x-auto">
          {(["store", "notifications", "password", "maintenance"] as const).map((t) => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-4 py-2 rounded-full text-sm font-semibold capitalize transition-all whitespace-nowrap
                          ${tab === t ? "bg-ink text-canvas" : "text-stone-500 hover:text-ink hover:bg-stone-100"}`}>
              {t === "store" ? "Store Info" : t === "notifications" ? "Notifications" : t === "password" ? "Password" : "Maintenance"}
            </button>
          ))}
        </div>
      </div>

      <div className="section-wrap py-8 sm:py-10 max-w-2xl mx-auto">
        {/* Message */}
        {message && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mb-6 p-4 rounded-xl text-sm font-medium ${
              message.type === "success"
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            {message.text}
          </motion.div>
        )}

        {/* Store Info Tab */}
        {tab === "store" && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-soft border border-stone-100 space-y-5">
            <div className="flex items-center gap-3 mb-6">
              <Store className="w-6 h-6 text-ink" />
              <h2 className="text-lg font-bold text-ink">Store Information</h2>
            </div>
            <div>
              <label className="input-label">Store Name</label>
              <input
                type="text"
                value={storeData.storeName}
                onChange={(e) => setStoreData({ ...storeData, storeName: e.target.value })}
                className="input"
                placeholder="Store name"
              />
            </div>
            <div>
              <label className="input-label">Phone Number</label>
              <input
                type="tel"
                value={storeData.phone}
                onChange={(e) => setStoreData({ ...storeData, phone: e.target.value })}
                className="input"
                placeholder="+91 XXXXX XXXXX"
              />
            </div>
            <div>
              <label className="input-label">Address</label>
              <textarea
                value={storeData.address}
                onChange={(e) => setStoreData({ ...storeData, address: e.target.value })}
                className="input min-h-24"
                placeholder="Store address"
              />
            </div>
            <button
              onClick={handleStoreSave}
              disabled={loading}
              className="btn-primary w-full py-3 text-sm disabled:opacity-50"
            >
              {loading ? "Saving..." : "Save Store Info"}
            </button>
          </div>
        )}

        {/* Notifications Tab */}
        {tab === "notifications" && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-soft border border-stone-100 space-y-5">
            <div className="flex items-center gap-3 mb-6">
              <Bell className="w-6 h-6 text-ink" />
              <h2 className="text-lg font-bold text-ink">Notification Settings</h2>
            </div>
            <div className="flex items-center justify-between p-4 bg-stone-50 rounded-xl">
              <div>
                <p className="font-semibold text-ink">Order Notifications</p>
                <p className="text-xs text-stone-500">Email/SMS coming soon</p>
              </div>
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-semibold">
                Coming Soon
              </div>
            </div>
          </div>
        )}

        {/* Password Tab */}
        {tab === "password" && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-soft border border-stone-100 space-y-5">
            <div className="flex items-center gap-3 mb-6">
              <Lock className="w-6 h-6 text-ink" />
              <h2 className="text-lg font-bold text-ink">Change Admin Password</h2>
            </div>
            <div>
              <label className="input-label">Current Password</label>
              <input
                type="password"
                value={passwordData.oldPassword}
                onChange={(e) => setPasswordData({ ...passwordData, oldPassword: e.target.value })}
                className="input"
                placeholder="Enter current password"
              />
            </div>
            <div>
              <label className="input-label">New Password</label>
              <input
                type="password"
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                className="input"
                placeholder="Enter new password"
              />
            </div>
            <div>
              <label className="input-label">Confirm New Password</label>
              <input
                type="password"
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                className="input"
                placeholder="Confirm new password"
              />
            </div>
            <button
              onClick={handlePasswordChange}
              disabled={loading}
              className="btn-primary w-full py-3 text-sm disabled:opacity-50"
            >
              {loading ? "Updating..." : "Change Password"}
            </button>
          </div>
        )}

        {/* Maintenance Tab */}
        {tab === "maintenance" && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-soft border border-stone-100 space-y-5">
            <div className="flex items-center gap-3 mb-6">
              <Power className="w-6 h-6 text-ink" />
              <h2 className="text-lg font-bold text-ink">Maintenance Mode</h2>
            </div>
            <div className="flex items-center justify-between p-4 bg-stone-50 rounded-xl">
              <div>
                <p className="font-semibold text-ink">Maintenance Mode</p>
                <p className="text-xs text-stone-500">Temporarily disable the store</p>
              </div>
              <button
                onClick={() => handleToggle("maintenanceMode")}
                className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
                  toggles.maintenanceMode ? "bg-red-600" : "bg-stone-300"
                }`}
              >
                <span
                  className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                    toggles.maintenanceMode ? "translate-x-7" : "translate-x-1"
                  }`}
                />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
