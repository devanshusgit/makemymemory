"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { LogOut, Lock, Bell, Trash2, ChevronRight } from "lucide-react";

export default function SettingsClient({ user }: { user: { name: string; email: string } }) {
  const router = useRouter();
  const [tab, setTab] = useState<"profile" | "password" | "notifications" | "danger">("profile");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Profile form
  const [profileData, setProfileData] = useState({
    name: user.name,
    phone: "",
  });

  // Password form
  const [passwordData, setPasswordData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // Notifications
  const [notifications, setNotifications] = useState({
    orderUpdates: false,
    promotions: false,
  });

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  };

  const handleProfileSave = async () => {
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profileData),
      });
      if (res.ok) {
        setMessage({ type: "success", text: "Profile updated successfully!" });
      } else {
        const error = await res.json();
        setMessage({ type: "error", text: error.error || "Failed to update profile" });
      }
    } catch (err) {
      setMessage({ type: "error", text: "Error updating profile" });
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
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          oldPassword: passwordData.oldPassword,
          newPassword: passwordData.newPassword,
        }),
      });
      if (res.ok) {
        setMessage({ type: "success", text: "Password changed successfully!" });
        setPasswordData({ oldPassword: "", newPassword: "", confirmPassword: "" });
      } else {
        const error = await res.json();
        setMessage({ type: "error", text: error.error || "Failed to change password" });
      }
    } catch (err) {
      setMessage({ type: "error", text: "Error changing password" });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!confirm("Are you sure? This action cannot be undone.")) return;

    setLoading(true);
    setMessage(null);
    try {
      console.log("Sending delete account request...");
      const res = await fetch("/api/user/delete-account", { method: "POST" });
      console.log("Delete account response status:", res.status);
      
      const data = await res.json();
      console.log("Delete account response:", data);
      
      if (res.ok) {
        console.log("Account deleted successfully, logging out...");
        setMessage({ type: "success", text: "Account deleted successfully. Redirecting..." });
        await new Promise(resolve => setTimeout(resolve, 1500));
        await fetch("/api/auth/logout", { method: "POST" });
        router.push("/");
        router.refresh();
      } else {
        // Build detailed error message
        let errorMsg = data.error || "Failed to delete account";
        if (data.type) {
          errorMsg += ` (${data.type})`;
        }
        if (data.details) {
          errorMsg += ` - ${data.details}`;
        }
        console.error("Delete failed:", errorMsg);
        setMessage({ type: "error", text: errorMsg });
      }
    } catch (err) {
      console.error("Delete account error:", err);
      const errorMsg = err instanceof Error ? err.message : "Error deleting account";
      setMessage({ type: "error", text: errorMsg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-canvas min-h-screen">
      {/* Hero */}
      <div style={{ backgroundColor: "#1a1714" }} className="py-10 sm:py-14">
        <div className="section-wrap">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-serif font-bold text-white text-2xl sm:text-3xl">Settings</h1>
              <p className="text-white/50 text-sm mt-1">Manage your account preferences</p>
            </div>
            <button onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 rounded-full border border-white/20
                         text-white/70 text-sm font-medium hover:bg-white/10 transition-colors">
              <LogOut className="w-4 h-4" /> Logout
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-stone-100 sticky top-16 z-20">
        <div className="section-wrap flex gap-1 py-2 overflow-x-auto">
          {(["profile", "password", "notifications", "danger"] as const).map((t) => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-4 py-2 rounded-full text-sm font-semibold capitalize transition-all whitespace-nowrap
                          ${tab === t ? "bg-ink text-canvas" : "text-stone-500 hover:text-ink hover:bg-stone-100"}`}>
              {t === "profile" ? "Profile" : t === "password" ? "Password" : t === "notifications" ? "Notifications" : "Danger Zone"}
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

        {/* Profile Tab */}
        {tab === "profile" && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-soft border border-stone-100 space-y-5">
            <div>
              <label className="input-label">Full Name</label>
              <input
                type="text"
                value={profileData.name}
                onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                className="input"
                placeholder="Your name"
              />
            </div>
            <div>
              <label className="input-label">Phone Number</label>
              <input
                type="tel"
                value={profileData.phone}
                onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                className="input"
                placeholder="+91 XXXXX XXXXX"
              />
            </div>
            <button
              onClick={handleProfileSave}
              disabled={loading}
              className="btn-primary w-full py-3 text-sm disabled:opacity-50"
            >
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        )}

        {/* Password Tab */}
        {tab === "password" && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-soft border border-stone-100 space-y-5">
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

        {/* Notifications Tab */}
        {tab === "notifications" && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-soft border border-stone-100 space-y-5">
            <div className="flex items-center justify-between p-4 bg-stone-50 rounded-xl">
              <div className="flex items-center gap-3">
                <Bell className="w-5 h-5 text-ink" />
                <div>
                  <p className="font-semibold text-ink">Order Updates</p>
                  <p className="text-xs text-stone-500">Get notified about your orders</p>
                </div>
              </div>
              <button
                onClick={() => setNotifications({ ...notifications, orderUpdates: !notifications.orderUpdates })}
                className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
                  notifications.orderUpdates ? "bg-green-600" : "bg-stone-300"
                }`}
              >
                <span
                  className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                    notifications.orderUpdates ? "translate-x-7" : "translate-x-1"
                  }`}
                />
              </button>
            </div>
            <div className="flex items-center justify-between p-4 bg-stone-50 rounded-xl">
              <div className="flex items-center gap-3">
                <Bell className="w-5 h-5 text-ink" />
                <div>
                  <p className="font-semibold text-ink">Promotions & Offers</p>
                  <p className="text-xs text-stone-500">Receive promotional emails and special offers</p>
                </div>
              </div>
              <button
                onClick={() => setNotifications({ ...notifications, promotions: !notifications.promotions })}
                className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
                  notifications.promotions ? "bg-green-600" : "bg-stone-300"
                }`}
              >
                <span
                  className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                    notifications.promotions ? "translate-x-7" : "translate-x-1"
                  }`}
                />
              </button>
            </div>
          </div>
        )}

        {/* Danger Zone Tab */}
        {tab === "danger" && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-soft border border-red-200 space-y-5">
            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <p className="text-sm text-red-700 font-medium">
                ⚠️ Deleting your account is permanent and cannot be undone. All your data will be removed.
              </p>
            </div>
            <button
              onClick={handleDeleteAccount}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-red-600 text-white rounded-full
                         font-semibold text-sm hover:bg-red-700 transition-colors disabled:opacity-50"
            >
              <Trash2 className="w-4 h-4" />
              {loading ? "Deleting..." : "Delete My Account"}
            </button>
          </div>
        )}

        {/* Back to Account */}
        <div className="mt-8 text-center">
          <Link href="/account"
            className="text-sm font-semibold text-sage-dark hover:underline flex items-center justify-center gap-1">
            ← Back to My Account
          </Link>
        </div>
      </div>
    </div>
  );
}
