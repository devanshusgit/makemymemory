"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  LogOut, Trash2, Package, Truck, MapPin, CheckCircle2,
  XCircle, AlertCircle, ChevronDown, ChevronUp,
  Eye, Search, Copy, Check, RefreshCw,
} from "lucide-react";

const ease = [0.4, 0, 0.2, 1] as const;

/* ─────────────────────────────────────────────
   Order History types + helpers
───────────────────────────────────────────── */
type OrderStatus =
  | "confirmed" | "processing" | "shipped"
  | "out_for_delivery" | "delivered" | "cancelled" | "payment_failed";

const STATUS_CONFIG: Record<OrderStatus, { label: string; icon: React.ElementType; textClass: string; borderClass: string; bgClass: string }> = {
  confirmed:        { label: "Confirmed",        icon: CheckCircle2, textClass: "text-blue-700",   borderClass: "border-blue-200",   bgClass: "bg-blue-50" },
  processing:       { label: "Processing",       icon: Package,      textClass: "text-amber-700",  borderClass: "border-amber-200",  bgClass: "bg-amber-50" },
  shipped:          { label: "Shipped",          icon: Truck,        textClass: "text-purple-700", borderClass: "border-purple-200", bgClass: "bg-purple-50" },
  out_for_delivery: { label: "Out for Delivery", icon: MapPin,       textClass: "text-orange-700", borderClass: "border-orange-200", bgClass: "bg-orange-50" },
  delivered:        { label: "Delivered",        icon: CheckCircle2, textClass: "text-green-700",  borderClass: "border-green-200",  bgClass: "bg-green-50" },
  cancelled:        { label: "Cancelled",        icon: XCircle,      textClass: "text-red-700",    borderClass: "border-red-200",    bgClass: "bg-red-50" },
  payment_failed:   { label: "Payment Failed",   icon: AlertCircle,  textClass: "text-red-700",    borderClass: "border-red-200",    bgClass: "bg-red-50" },
};

const CANCELLABLE = new Set<OrderStatus>(["confirmed", "processing"]);

/* ─── Copy ID button ─── */
function CopyId({ id }: { id: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => { navigator.clipboard.writeText(id); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
      className="ml-1 text-stone-400 hover:text-ink transition-colors"
      title="Copy"
    >
      {copied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
    </button>
  );
}

/* ─── Cancel Modal ─── */
function CancelModal({ order, onClose, onConfirm, loading }: {
  order: any; onClose: () => void; onConfirm: (r: string) => void; loading: boolean;
}) {
  const [reason, setReason] = useState("");
  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }} transition={{ duration: 0.2, ease }}
        className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-red-50 rounded-2xl flex items-center justify-center shrink-0">
            <XCircle className="w-5 h-5 text-red-500" />
          </div>
          <div>
            <p className="font-semibold text-ink text-sm">Cancel Order?</p>
            <p className="text-xs text-stone-500 font-mono">{order.orderId}</p>
          </div>
        </div>
        <p className="text-sm text-stone-600 mb-4 leading-relaxed">
          This cannot be undone.{order.paymentMethod !== "cod" ? " A refund will be processed in 5–7 business days." : ""}
        </p>
        <div className="mb-4">
          <label className="text-xs font-semibold text-stone-600 block mb-1.5">Reason (optional)</label>
          <select value={reason} onChange={(e) => setReason(e.target.value)}
            className="w-full px-3 py-2.5 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-200">
            <option value="">Select a reason…</option>
            <option value="changed_mind">Changed my mind</option>
            <option value="wrong_item">Ordered wrong item</option>
            <option value="too_late">Delivery too slow</option>
            <option value="found_better">Found a better option</option>
            <option value="other">Other</option>
          </select>
        </div>
        <div className="flex gap-2">
          <button onClick={onClose} disabled={loading}
            className="flex-1 py-2.5 rounded-2xl border border-stone-200 text-sm font-medium text-stone-600 hover:bg-stone-50 transition-colors">
            Keep It
          </button>
          <button onClick={() => onConfirm(reason)} disabled={loading}
            className="flex-1 py-2.5 rounded-2xl bg-red-500 text-white text-sm font-semibold hover:bg-red-600 transition-colors flex items-center justify-center gap-2 disabled:opacity-50">
            {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
            {loading ? "Cancelling…" : "Cancel Order"}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ─── Single Order Card ─── */
function OrderCard({ order, onCancelled }: { order: any; onCancelled: (id: string) => void }) {
  const [expanded, setExpanded]         = useState(false);
  const [showModal, setShowModal]       = useState(false);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [cancelError, setCancelError]   = useState("");

  const status    = (order.status ?? "confirmed") as OrderStatus;
  const cfg       = STATUS_CONFIG[status] ?? STATUS_CONFIG.confirmed;
  const Icon      = cfg.icon;
  const canCancel = CANCELLABLE.has(status);

  const dateStr = new Date(order.createdAt).toLocaleDateString("en-IN", {
    day: "numeric", month: "short", year: "numeric",
  });

  const handleCancel = async (reason: string) => {
    setCancelLoading(true);
    setCancelError("");
    try {
      const res  = await fetch(`/api/user/orders/${order.orderId}/cancel`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error ?? "Failed to cancel");
      setShowModal(false);
      onCancelled(order.orderId);
    } catch (err: any) {
      setCancelError(err.message ?? "Something went wrong");
    } finally {
      setCancelLoading(false);
    }
  };

  return (
    <>
      <div className="bg-stone-50 rounded-2xl border border-stone-200 overflow-hidden">
        {/* Header row */}
        <div className="p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${cfg.bgClass}`}>
                <Icon className={`w-3.5 h-3.5 ${cfg.textClass}`} strokeWidth={1.75} />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-0.5">
                  <p className="font-mono font-bold text-ink text-xs">{order.orderId}</p>
                  <CopyId id={order.orderId} />
                </div>
                <p className="text-[11px] text-stone-400">{dateStr}</p>
              </div>
            </div>
            <div className="text-right shrink-0">
              <p className="text-sm font-bold text-ink">₹{order.total?.toLocaleString("en-IN")}</p>
              <span className={`text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full border ${cfg.textClass} ${cfg.borderClass} ${cfg.bgClass}`}>
                {cfg.label}
              </span>
            </div>
          </div>

          {/* Item count */}
          <p className="text-xs text-stone-500 mt-2 ml-10">
            {order.items?.length} item{order.items?.length !== 1 ? "s" : ""}
            {order.items?.[0] && ` · ${order.items[0].name}${order.items.length > 1 ? ` +${order.items.length - 1}` : ""}`}
          </p>
        </div>

        {/* Action buttons */}
        <div className="px-4 pb-3 flex flex-wrap gap-2">
          <Link
            href={`/track?orderId=${order.orderId}`}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-ink text-canvas text-xs font-semibold hover:bg-stone-800 transition-colors"
          >
            <Search className="w-3 h-3" /> Track
          </Link>
          <button
            onClick={() => setExpanded(!expanded)}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full border border-stone-200 text-xs font-semibold text-stone-600 hover:bg-stone-100 transition-colors"
          >
            <Eye className="w-3 h-3" />
            {expanded ? "Hide" : "Details"}
            {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
          {canCancel && (
            <button
              onClick={() => setShowModal(true)}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full border border-red-200 text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors"
            >
              <XCircle className="w-3 h-3" /> Cancel
            </button>
          )}
        </div>

        {cancelError && (
          <p className="px-4 pb-3 text-xs text-red-500 flex items-center gap-1">
            <AlertCircle className="w-3 h-3" /> {cancelError}
          </p>
        )}

        {/* Expanded details */}
        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2, ease }}
              className="overflow-hidden"
            >
              <div className="px-4 pb-4 border-t border-stone-200 pt-4 space-y-4">
                {/* Items */}
                <ul className="space-y-2">
                  {order.items?.map((item: any, i: number) => (
                    <li key={i} className="flex items-center justify-between">
                      <div className="min-w-0">
                        <p className="text-xs font-medium text-ink truncate">{item.name}</p>
                        {item.customization && typeof item.customization === "object" &&
                          Object.keys(item.customization).length > 0 && (
                          <p className="text-[11px] text-stone-400 truncate">
                            {Object.entries(item.customization).map(([k, v]) => `${k}: ${v}`).join(" · ")}
                          </p>
                        )}
                      </div>
                      <div className="text-right shrink-0 ml-4">
                        <p className="text-xs font-bold text-ink">₹{(item.price * item.quantity).toLocaleString("en-IN")}</p>
                        <p className="text-[11px] text-stone-400">× {item.quantity}</p>
                      </div>
                    </li>
                  ))}
                </ul>

                {/* Address */}
                {order.shippingAddress && (
                  <div className="flex items-start gap-2 text-xs text-stone-500">
                    <MapPin className="w-3.5 h-3.5 mt-0.5 shrink-0 text-stone-400" />
                    <span>
                      {order.shippingAddress.fullName}, {order.shippingAddress.city},{" "}
                      {order.shippingAddress.state} — {order.shippingAddress.pincode}
                    </span>
                  </div>
                )}

                {/* Payment */}
                <div className="flex items-center justify-between text-xs text-stone-500">
                  <span>
                    {order.paymentMethod === "cod" ? "Cash on Delivery" :
                     order.paymentMethod === "razorpay" ? "Razorpay" : order.paymentMethod}
                  </span>
                  {order.appliedCouponCode && (
                    <span className="bg-green-50 text-green-700 px-2 py-0.5 rounded-full font-medium border border-green-200">
                      {order.appliedCouponCode}
                    </span>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {showModal && (
          <CancelModal
            order={order}
            onClose={() => setShowModal(false)}
            onConfirm={handleCancel}
            loading={cancelLoading}
          />
        )}
      </AnimatePresence>
    </>
  );
}

/* ─── Orders Tab ─── */
function OrdersTab() {
  const [orders, setOrders]   = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState("");

  useEffect(() => {
    fetch("/api/user/orders")
      .then(r => r.json())
      .then(d => { if (d.error) setError(d.error); else setOrders(d.orders ?? []); })
      .catch(() => setError("Failed to load orders"))
      .finally(() => setLoading(false));
  }, []);

  const handleCancelled = (orderId: string) =>
    setOrders(prev => prev.map(o => o.orderId === orderId ? { ...o, status: "cancelled" } : o));

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map(i => (
          <div key={i} className="bg-stone-50 rounded-2xl p-4 animate-pulse border border-stone-200 h-20" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-2xl p-5 text-center">
        <AlertCircle className="w-6 h-6 text-red-400 mx-auto mb-2" />
        <p className="text-sm text-red-600 font-medium">{error}</p>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-4xl mb-3">📦</p>
        <p className="font-semibold text-ink mb-1">No orders yet</p>
        <p className="text-sm text-stone-500 mb-5">Your orders will appear here once you shop.</p>
        <Link href="/shop" className="btn-primary px-6 py-2.5 text-sm">Browse Products</Link>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-xs text-stone-500 mb-1">{orders.length} order{orders.length !== 1 ? "s" : ""}</p>
      {orders.map((order) => (
        <OrderCard key={order._id ?? order.orderId} order={order} onCancelled={handleCancelled} />
      ))}
    </div>
  );
}

/* ─────────────────────────────────────────────
   Main Settings Component
───────────────────────────────────────────── */
export default function SettingsClient({ user }: { user: { name: string; email: string } }) {
  const router = useRouter();
  const [tab, setTab]       = useState<"profile" | "password" | "orders" | "danger">("profile");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const [profileData, setProfileData] = useState({ name: user.name, phone: "" });
  const [passwordData, setPasswordData] = useState({ oldPassword: "", newPassword: "", confirmPassword: "" });

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
        setMessage({ type: "success", text: "Profile updated!" });
      } else {
        const err = await res.json();
        setMessage({ type: "error", text: err.error || "Failed to update" });
      }
    } catch {
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
        body: JSON.stringify({ oldPassword: passwordData.oldPassword, newPassword: passwordData.newPassword }),
      });
      if (res.ok) {
        setMessage({ type: "success", text: "Password changed!" });
        setPasswordData({ oldPassword: "", newPassword: "", confirmPassword: "" });
      } else {
        const err = await res.json();
        setMessage({ type: "error", text: err.error || "Failed to change password" });
      }
    } catch {
      setMessage({ type: "error", text: "Error changing password" });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!confirm("This permanently deletes your account. Continue?")) return;
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch("/api/user/delete-account", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: user.email }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage({ type: "success", text: "Account deleted. Redirecting…" });
        await new Promise(r => setTimeout(r, 1200));
        await fetch("/api/auth/logout", { method: "POST" });
        router.push("/");
        router.refresh();
      } else {
        setMessage({ type: "error", text: data.error || "Failed to delete account" });
      }
    } catch {
      setMessage({ type: "error", text: "Error deleting account" });
    } finally {
      setLoading(false);
    }
  };

  const TABS = [
    { key: "profile",  label: "Profile" },
    { key: "password", label: "Password" },
    { key: "orders",   label: "My Orders" },
    { key: "danger",   label: "Danger Zone" },
  ] as const;

  return (
    <div className="bg-canvas min-h-screen">
      {/* Hero */}
      <div style={{ backgroundColor: "#1a1714" }} className="py-10 sm:py-14">
        <div className="section-wrap">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-serif font-bold text-white text-2xl sm:text-3xl">Settings</h1>
              <p className="text-white/50 text-sm mt-1">{user.email}</p>
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
          {TABS.map(({ key, label }) => (
            <button key={key} onClick={() => { setTab(key); setMessage(null); }}
              className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all
                          ${tab === key ? "bg-ink text-canvas" : "text-stone-500 hover:text-ink hover:bg-stone-100"}`}>
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="section-wrap py-8 sm:py-10 max-w-2xl mx-auto">
        {/* Message banner */}
        <AnimatePresence>
          {message && (
            <motion.div
              key="msg"
              initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className={`mb-5 p-4 rounded-xl text-sm font-medium ${
                message.type === "success" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
              }`}
            >
              {message.text}
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Profile ── */}
        {tab === "profile" && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-soft border border-stone-100 space-y-5">
            <div>
              <label className="input-label">Full Name</label>
              <input type="text" value={profileData.name}
                onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                className="input" placeholder="Your name" />
            </div>
            <div>
              <label className="input-label">Phone Number</label>
              <input type="tel" value={profileData.phone}
                onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                className="input" placeholder="+91 XXXXX XXXXX" />
            </div>
            <div>
              <label className="input-label">Email</label>
              <input type="email" value={user.email} disabled
                className="input opacity-60 cursor-not-allowed" />
              <p className="text-[11px] text-stone-400 mt-1">Email cannot be changed</p>
            </div>
            <button onClick={handleProfileSave} disabled={loading}
              className="btn-primary w-full py-3 text-sm disabled:opacity-50">
              {loading ? "Saving…" : "Save Changes"}
            </button>
          </div>
        )}

        {/* ── Password ── */}
        {tab === "password" && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-soft border border-stone-100 space-y-5">
            {[
              { label: "Current Password",  key: "oldPassword",      ph: "Enter current password" },
              { label: "New Password",       key: "newPassword",      ph: "Enter new password" },
              { label: "Confirm Password",   key: "confirmPassword",  ph: "Confirm new password" },
            ].map(({ label, key, ph }) => (
              <div key={key}>
                <label className="input-label">{label}</label>
                <input type="password"
                  value={passwordData[key as keyof typeof passwordData]}
                  onChange={(e) => setPasswordData({ ...passwordData, [key]: e.target.value })}
                  className="input" placeholder={ph} />
              </div>
            ))}
            <button onClick={handlePasswordChange} disabled={loading}
              className="btn-primary w-full py-3 text-sm disabled:opacity-50">
              {loading ? "Updating…" : "Change Password"}
            </button>
          </div>
        )}

        {/* ── My Orders ── */}
        {tab === "orders" && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-soft border border-stone-100">
            <div className="flex items-center gap-2.5 mb-5">
              <Package className="w-5 h-5 text-ink" />
              <h2 className="font-semibold text-ink">My Orders</h2>
            </div>
            <OrdersTab />
          </div>
        )}

        {/* ── Danger Zone ── */}
        {tab === "danger" && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-soft border border-red-200 space-y-5">
            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <p className="text-sm text-red-700 font-medium leading-relaxed">
                ⚠️ Deleting your account is permanent and cannot be undone. Your order history will be retained by us but your login will stop working forever.
              </p>
            </div>
            <button onClick={handleDeleteAccount} disabled={loading}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-red-600 text-white rounded-full
                         font-semibold text-sm hover:bg-red-700 transition-colors disabled:opacity-50">
              <Trash2 className="w-4 h-4" />
              {loading ? "Deleting…" : "Permanently Delete Account"}
            </button>
          </div>
        )}

        <div className="mt-8 text-center">
          <Link href="/account"
            className="text-sm font-semibold text-sage-dark hover:underline">
            ← Back to Account
          </Link>
        </div>
      </div>
    </div>
  );
}
