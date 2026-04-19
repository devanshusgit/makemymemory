"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Save } from "lucide-react";

const STATUS_OPTIONS = [
  "confirmed", "processing", "shipped", "out_for_delivery", "delivered", "cancelled",
];

const STATUS_COLORS: Record<string, string> = {
  confirmed:        "bg-blue-100 text-blue-700",
  processing:       "bg-yellow-100 text-yellow-700",
  shipped:          "bg-purple-100 text-purple-700",
  out_for_delivery: "bg-orange-100 text-orange-700",
  delivered:        "bg-green-100 text-green-700",
  cancelled:        "bg-red-100 text-red-700",
};

export default function AdminOrderDetailClient({ order }: { order: any }) {
  const [status, setStatus] = useState(order.status);
  const [trackingId, setTrackingId] = useState(order.courierTrackingId ?? "");
  const [trackingUrl, setTrackingUrl] = useState(order.courierTrackingUrl ?? "");
  const [courierName, setCourierName] = useState(order.courierName ?? "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  const handleSave = async () => {
    setSaving(true);
    setError("");
    try {
      const res = await fetch(`/api/admin/orders/${order.orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status,
          courierName,
          courierTrackingId: trackingId,
          courierTrackingUrl: trackingUrl,
          trackingEvent: {
            description: `Status updated to ${status.replace(/_/g, " ")}.`,
            location: courierName || "Warehouse",
          },
        }),
      });
      if (!res.ok) throw new Error("Failed to save");
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      setError("Failed to save changes.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link href="/admin/orders" className="text-stone-400 hover:text-[#2C2520] transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-xl font-serif font-bold text-[#2C2520]">{order.orderId}</h1>
          <p className="text-stone-400 text-sm">
            {new Date(order.createdAt).toLocaleString("en-IN")}
          </p>
        </div>
        <span className={`ml-auto px-3 py-1 rounded-full text-xs font-semibold capitalize
                          ${STATUS_COLORS[order.status] ?? "bg-stone-100 text-stone-600"}`}>
          {order.status.replace(/_/g, " ")}
        </span>
      </div>

      <div className="grid lg:grid-cols-2 gap-5">
        {/* Customer Info */}
        <div className="bg-white rounded-2xl p-5 border border-stone-100">
          <h2 className="font-semibold text-[#2C2520] text-sm mb-3">Customer</h2>
          <div className="space-y-1.5 text-sm">
            <p className="font-medium text-[#2C2520]">{order.shippingAddress?.fullName}</p>
            <p className="text-stone-500">{order.shippingAddress?.email}</p>
            <p className="text-stone-500">{order.shippingAddress?.phone}</p>
            <p className="text-stone-500 mt-2">
              {order.shippingAddress?.address}
              {order.shippingAddress?.landmark ? `, ${order.shippingAddress.landmark}` : ""}
            </p>
            <p className="text-stone-500">
              {order.shippingAddress?.city}, {order.shippingAddress?.state} — {order.shippingAddress?.pincode}
            </p>
          </div>
        </div>

        {/* Payment Info */}
        <div className="bg-white rounded-2xl p-5 border border-stone-100">
          <h2 className="font-semibold text-[#2C2520] text-sm mb-3">Payment</h2>
          <div className="space-y-2 text-sm">
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
            <div className="flex justify-between font-bold text-[#2C2520] border-t border-stone-100 pt-2 mt-2">
              <span>Total</span>
              <span>₹{order.total?.toLocaleString("en-IN")}</span>
            </div>
            {order.isCOD && (
              <>
                <div className="flex justify-between text-xs text-amber-700">
                  <span>Advance paid</span>
                  <span>₹{order.codAdvancePaid}</span>
                </div>
                <div className="flex justify-between text-xs text-amber-700">
                  <span>Remaining on delivery</span>
                  <span>₹{order.codRemainingAmount}</span>
                </div>
              </>
            )}
            {order.razorpayOrderId && (
              <p className="text-xs text-stone-400 font-mono mt-1">{order.razorpayOrderId}</p>
            )}
          </div>
        </div>

        {/* Items */}
        <div className="bg-white rounded-2xl p-5 border border-stone-100">
          <h2 className="font-semibold text-[#2C2520] text-sm mb-3">Items</h2>
          <ul className="space-y-3">
            {order.items?.map((item: any, i: number) => (
              <li key={i} className="flex items-center gap-3">
                <span className="text-2xl">{item.emoji}</span>
                <div className="flex-1">
                  <p className="text-sm font-medium text-[#2C2520]">{item.name}</p>
                  {item.customization && (
                    <p className="text-xs text-stone-400">"{item.customization}"</p>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold">₹{item.price?.toLocaleString("en-IN")}</p>
                  <p className="text-xs text-stone-400">× {item.quantity}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Update Status */}
        <div className="bg-white rounded-2xl p-5 border border-stone-100">
          <h2 className="font-semibold text-[#2C2520] text-sm mb-3">Update Order</h2>
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wide mb-1.5">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2.5
                           text-sm text-[#2C2520] focus:outline-none focus:ring-2 focus:ring-[#8FBC8F]/40"
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>{s.replace(/_/g, " ")}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wide mb-1.5">
                Courier Name
              </label>
              <input
                value={courierName}
                onChange={(e) => setCourierName(e.target.value)}
                className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2.5
                           text-sm focus:outline-none focus:ring-2 focus:ring-[#8FBC8F]/40"
                placeholder="Delhivery, BlueDart…"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wide mb-1.5">
                Tracking ID
              </label>
              <input
                value={trackingId}
                onChange={(e) => setTrackingId(e.target.value)}
                className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2.5
                           text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#8FBC8F]/40"
                placeholder="AWB123456789"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wide mb-1.5">
                Tracking URL
              </label>
              <input
                value={trackingUrl}
                onChange={(e) => setTrackingUrl(e.target.value)}
                className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2.5
                           text-sm focus:outline-none focus:ring-2 focus:ring-[#8FBC8F]/40"
                placeholder="https://track.delhivery.com/…"
              />
            </div>

            {error && <p className="text-red-500 text-xs">{error}</p>}
            {saved && <p className="text-green-600 text-xs">✓ Saved successfully</p>}

            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 bg-[#2C2520] text-white px-4 py-2.5
                         rounded-xl text-sm font-semibold hover:bg-stone-800 transition-colors
                         disabled:opacity-50 w-full justify-center"
            >
              <Save className="w-4 h-4" />
              {saving ? "Saving…" : "Save Changes"}
            </button>
          </div>
        </div>
      </div>

      {/* Tracking Events */}
      {order.trackingEvents?.length > 0 && (
        <div className="bg-white rounded-2xl p-5 border border-stone-100 mt-5">
          <h2 className="font-semibold text-[#2C2520] text-sm mb-3">Tracking History</h2>
          <ol className="space-y-3">
            {[...order.trackingEvents].reverse().map((evt: any, i: number) => (
              <li key={i} className="flex gap-3 text-sm">
                <div className="w-2 h-2 rounded-full bg-[#8FBC8F] mt-1.5 shrink-0" />
                <div>
                  <p className="font-medium text-[#2C2520] capitalize">{evt.status?.replace(/_/g, " ")}</p>
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
    </div>
  );
}
