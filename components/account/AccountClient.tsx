"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  LogOut, Package, User, ChevronDown, ChevronUp,
  ExternalLink, MapPin, CreditCard, Clock,
} from "lucide-react";

const STATUS_COLORS: Record<string, string> = {
  pending_confirmation: "bg-amber-100 text-amber-700",
  confirmed:            "bg-blue-100 text-blue-700",
  processing:           "bg-purple-100 text-purple-700",
  shipped:              "bg-indigo-100 text-indigo-700",
  out_for_delivery:     "bg-orange-100 text-orange-700",
  delivered:            "bg-green-100 text-green-700",
  cancelled:            "bg-red-100 text-red-700",
  payment_failed:       "bg-red-100 text-red-700",
};

function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold capitalize
                      ${STATUS_COLORS[status] ?? "bg-stone-100 text-stone-600"}`}>
      {status.replace(/_/g, " ")}
    </span>
  );
}

function OrderCard({ order }: { order: any }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="bg-white rounded-2xl border border-stone-100 shadow-soft overflow-hidden">
      {/* Header row */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between p-4 sm:p-5 text-left hover:bg-stone-50 transition-colors"
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 bg-sage/10 rounded-xl flex items-center justify-center shrink-0">
            <Package className="w-4 h-4 text-sage-dark" />
          </div>
          <div className="min-w-0">
            <p className="font-mono text-xs font-bold text-ink">{order.orderId}</p>
            <p className="text-xs text-stone-400 mt-0.5">
              {new Date(order.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <StatusBadge status={order.status} />
          <p className="font-bold text-ink text-sm">₹{order.total?.toLocaleString("en-IN")}</p>
          {open ? <ChevronUp className="w-4 h-4 text-stone-400" /> : <ChevronDown className="w-4 h-4 text-stone-400" />}
        </div>
      </button>

      {/* Expanded details */}
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="border-t border-stone-100 p-4 sm:p-5 space-y-5">

              {/* Items */}
              <div>
                <p className="text-xs font-semibold text-stone-400 uppercase tracking-wide mb-3">Items</p>
                <ul className="space-y-2">
                  {order.items?.map((item: any, i: number) => (
                    <li key={i} className="flex items-center gap-3">
                      <span className="text-sm font-medium">{item.name}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-ink">{item.name}</p>
                        {item.customization && <p className="text-xs text-stone-400">"{item.customization}"</p>}
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-sm font-semibold text-ink">₹{item.price?.toLocaleString("en-IN")}</p>
                        <p className="text-xs text-stone-400">× {item.quantity}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Payment */}
              <div className="bg-stone-50 rounded-xl p-4">
                <p className="text-xs font-semibold text-stone-400 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                  <CreditCard className="w-3.5 h-3.5" /> Payment
                </p>
                <div className="space-y-1.5 text-sm">
                  <div className="flex justify-between">
                    <span className="text-stone-500">Method</span>
                    <span className="font-medium capitalize">{order.paymentMethod}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-500">Subtotal</span>
                    <span>₹{order.subtotal?.toLocaleString("en-IN")}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-500">Shipping</span>
                    <span>{order.shippingCharge === 0 ? "Free" : `₹${order.shippingCharge}`}</span>
                  </div>
                  <div className="flex justify-between font-bold text-ink border-t border-stone-200 pt-1.5 mt-1.5">
                    <span>Total</span>
                    <span>₹{order.total?.toLocaleString("en-IN")}</span>
                  </div>
                  {order.isCOD && (
                    <div className="flex justify-between text-xs text-amber-700 bg-amber-50 rounded-lg px-2 py-1.5 mt-1">
                      <span>COD remaining on delivery</span>
                      <span className="font-bold">₹{order.codRemainingAmount?.toLocaleString("en-IN")}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Address */}
              <div>
                <p className="text-xs font-semibold text-stone-400 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5" /> Delivery Address
                </p>
                <p className="text-sm text-ink font-medium">{order.shippingAddress?.fullName}</p>
                <p className="text-sm text-stone-500">{order.shippingAddress?.address}</p>
                {order.shippingAddress?.landmark && <p className="text-sm text-stone-500">{order.shippingAddress.landmark}</p>}
                <p className="text-sm text-stone-500">
                  {order.shippingAddress?.city}, {order.shippingAddress?.state} — {order.shippingAddress?.pincode}
                </p>
                <p className="text-sm text-stone-500">{order.shippingAddress?.phone}</p>
              </div>

              {/* Tracking */}
              {order.trackingEvents?.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-stone-400 uppercase tracking-wide mb-3 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" /> Order Timeline
                  </p>
                  <ol className="space-y-3">
                    {[...order.trackingEvents].reverse().map((evt: any, i: number) => (
                      <li key={i} className="flex gap-3 text-sm">
                        <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${i === 0 ? "bg-sage" : "bg-stone-300"}`} />
                        <div>
                          <p className="font-medium text-ink capitalize">{evt.status?.replace(/_/g, " ")}</p>
                          <p className="text-stone-500 text-xs">{evt.description}</p>
                          <p className="text-stone-400 text-xs">
                            {new Date(evt.timestamp).toLocaleString("en-IN")}
                            {evt.location ? ` · ${evt.location}` : ""}
                          </p>
                        </div>
                      </li>
                    ))}
                  </ol>
                </div>
              )}

              {/* Actions */}
              <div className="flex flex-wrap gap-2 pt-1">
                {order.courierTrackingUrl && (
                  <a href={order.courierTrackingUrl} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-1.5 px-4 py-2 bg-ink text-canvas rounded-full text-xs font-semibold hover:opacity-90 transition-opacity">
                    <ExternalLink className="w-3.5 h-3.5" /> Track Shipment
                  </a>
                )}
                <Link href={`/track?orderId=${order.orderId}`}
                  className="flex items-center gap-1.5 px-4 py-2 border border-stone-200 text-ink rounded-full text-xs font-semibold hover:bg-stone-50 transition-colors">
                  Track Order
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function AccountClient({ user }: { user: { name: string; email: string } }) {
  const router = useRouter();
  const [tab, setTab]       = useState<"orders" | "profile">("orders");
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/user/orders")
      .then((r) => r.ok ? r.json() : { orders: [] })
      .then((d) => setOrders(d.orders ?? []))
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  }, []);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  };

  const delivered   = orders.filter((o) => o.status === "delivered").length;
  const inProgress  = orders.filter((o) => !["delivered", "cancelled", "payment_failed"].includes(o.status)).length;

  return (
    <div className="bg-canvas min-h-screen">
      {/* Hero */}
      <div style={{ backgroundColor: "#1a1714" }} className="py-10 sm:py-14">
        <div className="section-wrap">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-sage flex items-center justify-center
                            text-white font-bold text-xl shrink-0">
              {user.name[0].toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="font-serif font-bold text-white text-xl sm:text-2xl">{user.name}</h1>
              <p className="text-white/50 text-sm">{user.email}</p>
            </div>
            <button onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 rounded-full border border-white/20
                         text-white/70 text-sm font-medium hover:bg-white/10 transition-colors">
              <LogOut className="w-4 h-4" /> Logout
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mt-8">
            {[
              { label: "Total Orders", value: orders.length },
              { label: "Delivered",    value: delivered },
              { label: "In Progress",  value: inProgress },
            ].map((s) => (
              <div key={s.label} className="bg-white/5 rounded-2xl p-4 text-center">
                <p className="font-bold text-white text-2xl">{loading ? "—" : s.value}</p>
                <p className="text-white/40 text-xs mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-stone-100 sticky top-16 z-20">
        <div className="section-wrap flex gap-1 py-2">
          {(["orders", "profile"] as const).map((t) => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-5 py-2 rounded-full text-sm font-semibold capitalize transition-all
                          ${tab === t ? "bg-ink text-canvas" : "text-stone-500 hover:text-ink hover:bg-stone-100"}`}>
              {t === "orders" ? "My Orders" : "Profile"}
            </button>
          ))}
        </div>
      </div>

      <div className="section-wrap py-8 sm:py-10 max-w-3xl mx-auto">

        {/* Orders tab */}
        {tab === "orders" && (
          <div className="space-y-4">
            {loading ? (
              Array.from({ length: 2 }).map((_, i) => (
                <div key={i} className="bg-white rounded-2xl h-20 animate-pulse border border-stone-100" />
              ))
            ) : orders.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-4xl mb-3">📦</p>
                <p className="text-stone-500 text-sm mb-5">No orders yet.</p>
                <Link href="/shop" className="btn-primary px-8 py-3 text-sm">Browse Products</Link>
              </div>
            ) : (
              orders.map((order) => <OrderCard key={order._id} order={order} />)
            )}
          </div>
        )}

        {/* Profile tab */}
        {tab === "profile" && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-soft border border-stone-100 space-y-5">
            <div>
              <label className="input-label">Full Name</label>
              <p className="input bg-stone-100 cursor-not-allowed">{user.name}</p>
            </div>
            <div>
              <label className="input-label">Email Address</label>
              <p className="input bg-stone-100 cursor-not-allowed">{user.email}</p>
            </div>
            <div className="pt-2 border-t border-stone-100">
              <Link href="/forgot-password"
                className="text-sm font-semibold text-sage-dark hover:underline">
                Change Password →
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
