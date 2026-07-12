"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronDown, ChevronUp, Search, Save,
  Package, MapPin, CreditCard, Clock, ExternalLink,
  Truck, Gift,
} from "lucide-react";
import axios from "axios";

const STATUS_OPTIONS = [
  "pending", "confirmed", "kit_ready", "kit_shipped", "kit_delivered",
  "waiting_submission", "final_production", "final_ready", "final_shipped",
  "delivered", "completed", "cancelled", "payment_failed"
];

const STATUS_COLORS: Record<string, string> = {
  pending:              "bg-stone-100 text-stone-600",
  confirmed:            "bg-blue-100 text-blue-700",
  kit_ready:            "bg-sky-100 text-sky-700",
  kit_shipped:          "bg-cyan-100 text-cyan-700",
  kit_delivered:        "bg-teal-100 text-teal-700",
  waiting_submission:   "bg-amber-100 text-amber-700",
  final_production:     "bg-purple-100 text-purple-700",
  final_ready:          "bg-violet-100 text-violet-700",
  final_shipped:        "bg-indigo-100 text-indigo-700",
  delivered:            "bg-green-100 text-green-700",
  completed:            "bg-emerald-100 text-emerald-700",
  cancelled:            "bg-red-100 text-red-700",
  payment_failed:       "bg-red-100 text-red-700",
};

function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold capitalize whitespace-nowrap
                      ${STATUS_COLORS[status] ?? "bg-stone-100 text-stone-600"}`}>
      {status.replace(/_/g, " ")}
    </span>
  );
}

/* ── Delhivery Shipment update panel ── */
function DelhiveryShipmentPanel({
  order,
  shipmentType,
  onRefresh,
}: {
  order: any;
  shipmentType: "shipment1" | "shipment2";
  onRefresh: () => void;
}) {
  const isShipment1 = shipmentType === "shipment1";
  const shipment = order[shipmentType] || { status: "pending", events: [] };
  const label = isShipment1 ? "📦 Shipment 1: DIY Kit" : "🎁 Shipment 2: Final Product";
  const hint = isShipment1
    ? "Raw materials kit sent to customer first"
    : "Finished customised product dispatched after customer uploads photos";

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPickupModal, setShowPickupModal] = useState(false);
  const [pickupDate, setPickupDate] = useState("");
  const [pickupTime, setPickupTime] = useState("14:00");
  const [packageCount, setPackageCount] = useState(1);

  const handleCreateShipment = async () => {
    setLoading(true);
    setError("");
    try {
      const endpoint = isShipment1
        ? `/api/admin/orders/${order.orderId}/shipment1/create`
        : `/api/admin/orders/${order.orderId}/shipment2/create`;
      await axios.post(endpoint);
      onRefresh();
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to manifest shipment.");
    } finally {
      setLoading(false);
    }
  };

  const handleBookPickup = async () => {
    setLoading(true);
    setError("");
    try {
      await axios.post(`/api/admin/orders/${order.orderId}/shipment/pickup`, {
        pickupDate,
        pickupTime,
        packageCount,
      });
      setShowPickupModal(false);
      alert("Pickup scheduled successfully!");
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to schedule pickup.");
    } finally {
      setLoading(false);
    }
  };

  const handleManualMark = async (nextStatus: string) => {
    setLoading(true);
    try {
      await axios.patch(`/api/admin/orders/${order.orderId}`, {
        status: nextStatus,
        trackingEvent: { description: `Manually marked order status as ${nextStatus}`, location: "Admin" }
      });
      onRefresh();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const isDisabled = !isShipment1 && (
    order.status === "pending" ||
    order.status === "confirmed" ||
    order.status === "kit_ready" ||
    order.status === "kit_shipped"
  );

  return (
    <div className={`rounded-2xl p-5 space-y-4 border-2 ${isDisabled ? "bg-stone-50 border-stone-100 opacity-60" : isShipment1 ? "bg-sky-50 border-sky-100" : "bg-amber-50 border-amber-100"}`}>
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm font-bold text-[#2C2520]">{label}</p>
          <p className="text-xs text-stone-500 mt-0.5">{hint}</p>
        </div>
        <StatusBadge status={shipment.status || "pending"} />
      </div>

      {error && (
        <div className="p-3 bg-red-100 text-red-700 text-xs rounded-xl font-medium">
          {error}
        </div>
      )}

      {shipment.awb ? (
        <div className="space-y-2 text-xs">
          <div className="bg-white rounded-xl p-3 border border-stone-200 space-y-1.5">
            <p className="text-stone-400">Delhivery AWB:</p>
            <p className="font-mono font-bold text-sm text-[#2C2520]">{shipment.awb}</p>
            <p className="text-stone-500 mt-1">Timeline: <strong>{shipment.deliveryTimeline || "Dispatched"}</strong></p>
            {shipment.dispatchDate && (
              <p className="text-stone-400 text-[10px]">Dispatched on: {new Date(shipment.dispatchDate).toLocaleDateString()}</p>
            )}
          </div>

          <div className="flex gap-2">
            <a
              href={`/api/admin/orders/${order.orderId}/shipment/label?awb=${shipment.awb}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 text-center bg-white border border-stone-200 py-2 rounded-xl font-semibold hover:bg-stone-50 text-[#2C2520]"
            >
              Print Label
            </a>
            <button
              onClick={() => setShowPickupModal(true)}
              className="flex-1 bg-white border border-stone-200 py-2 rounded-xl font-semibold hover:bg-stone-50 text-[#2C2520]"
            >
              Book Pickup
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          <button
            onClick={handleCreateShipment}
            disabled={loading || isDisabled}
            className={`w-full py-2.5 rounded-xl text-xs font-bold text-white transition-opacity disabled:opacity-50
              ${isShipment1 ? "bg-sky-600 hover:bg-sky-700" : "bg-amber-600 hover:bg-amber-700"}`}
          >
            {loading ? "Generating AWB..." : isDisabled ? "Waiting for Stage 1 Completion" : "Manifest Delhivery Shipment"}
          </button>
        </div>
      )}

      {/* Manual progression buttons */}
      <div className="flex gap-2 text-xs">
        {isShipment1 && !shipment.awb && order.status === "confirmed" && (
          <button
            onClick={() => handleManualMark("kit_ready")}
            className="flex-1 py-1.5 bg-stone-100 rounded-xl hover:bg-stone-200"
          >
            Mark Kit Ready
          </button>
        )}
        {isShipment1 && shipment.awb && order.status === "kit_shipped" && (
          <button
            onClick={() => handleManualMark("waiting_submission")}
            className="flex-1 py-1.5 bg-stone-100 rounded-xl hover:bg-stone-200"
          >
            Mark Kit Delivered
          </button>
        )}
        {!isShipment1 && order.status === "final_production" && (
          <button
            onClick={() => handleManualMark("final_ready")}
            className="flex-1 py-1.5 bg-stone-100 rounded-xl hover:bg-stone-200"
          >
            Mark Final Ready
          </button>
        )}
        {!isShipment1 && shipment.awb && order.status === "final_shipped" && (
          <button
            onClick={() => handleManualMark("completed")}
            className="flex-1 py-1.5 bg-green-600 text-white rounded-xl hover:bg-green-700"
          >
            Mark Order Completed
          </button>
        )}
      </div>

      {/* Modal for Booking Pickup */}
      {showPickupModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-5 max-w-sm w-full space-y-4 shadow-xl">
            <h3 className="font-bold text-[#2C2520]">Book Delhivery Pickup</h3>
            <div className="space-y-3 text-xs">
              <div>
                <label className="block mb-1 text-stone-500 font-semibold uppercase">Pickup Date</label>
                <input
                  type="date"
                  value={pickupDate}
                  onChange={(e) => setPickupDate(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-[#2C2520]"
                />
              </div>
              <div>
                <label className="block mb-1 text-stone-500 font-semibold uppercase">Pickup Time</label>
                <input
                  type="time"
                  value={pickupTime}
                  onChange={(e) => setPickupTime(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-[#2C2520]"
                />
              </div>
              <div>
                <label className="block mb-1 text-stone-500 font-semibold uppercase">Expected Package Count</label>
                <input
                  type="number"
                  min="1"
                  value={packageCount}
                  onChange={(e) => setPackageCount(parseInt(e.target.value))}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-[#2C2520]"
                />
              </div>
            </div>
            <div className="flex gap-2 text-xs font-semibold">
              <button
                onClick={() => setShowPickupModal(false)}
                className="flex-1 py-2 bg-stone-100 rounded-xl hover:bg-stone-200"
              >
                Cancel
              </button>
              <button
                onClick={handleBookPickup}
                disabled={loading}
                className="flex-1 py-2 bg-stone-900 text-white rounded-xl hover:bg-stone-800"
              >
                {loading ? "Booking..." : "Schedule Pickup"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Shipment Events */}
      {shipment.events?.length > 0 && (
        <div className="pt-2 border-t border-stone-100">
          <p className="text-[10px] font-semibold text-stone-400 uppercase tracking-wider mb-2">Shipment Milestones</p>
          <ol className="space-y-2">
            {[...shipment.events].reverse().map((evt: any, i: number) => (
              <li key={i} className="flex gap-2 text-[11px] leading-tight">
                <div className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${i === 0 ? "bg-sage" : "bg-stone-300"}`} />
                <div>
                  <p className="font-semibold text-[#2C2520] capitalize">{evt.status?.replace(/_/g, " ")}</p>
                  <p className="text-stone-500">{evt.description}</p>
                  {evt.location && <p className="text-stone-400 text-[9px]">{evt.location} · {new Date(evt.timestamp).toLocaleString("en-IN")}</p>}
                </div>
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
}

/* ── Order Row ── */
function OrderRow({ order, onRefresh }: { order: any; onRefresh: () => void }) {
  const [open, setOpen]           = useState(false);
  const [status, setStatus]       = useState(order.status);
  const [note, setNote]           = useState("");
  const [saving, setSaving]       = useState(false);
  const [saved, setSaved]         = useState(false);

  // Top-level order status update (overall status, not per-delivery)
  const handleSave = async () => {
    setSaving(true);
    try {
      await axios.patch(`/api/admin/orders/${order.orderId}`, {
        status,
        trackingEvent: note ? { description: note, location: "Admin" } : undefined,
      });
      setSaved(true);
      setNote("");
      setTimeout(() => setSaved(false), 2500);
      onRefresh();
    } catch { /* ignore */ } finally {
      setSaving(false);
    }
  };



  return (
    <div className="bg-white rounded-2xl border border-stone-100 overflow-hidden">
      {/* Row header */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-3 p-4 text-left hover:bg-stone-50 transition-colors"
      >
        <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2 min-w-0">
          <div>
            <p className="font-mono text-xs font-bold text-[#2C2520]">{order.orderId}</p>
            <p className="text-xs text-stone-400 mt-0.5">
              {new Date(order.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
              {" "}
              {new Date(order.createdAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
            </p>
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-medium text-[#2C2520] truncate">{order.shippingAddress?.fullName}</p>
            <p className="text-xs text-stone-400 truncate">{order.shippingAddress?.email}</p>
          </div>
          <div className="hidden sm:block">
            <p className="text-xs text-stone-500">{order.items?.length} item{order.items?.length !== 1 ? "s" : ""}</p>
            <p className="text-xs text-stone-400 truncate">
              {order.items?.slice(0, 2).map((i: any) => i.name).join(", ")}
              {order.items?.length > 2 ? "…" : ""}
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <StatusBadge status={order.status} />
            {order.isCOD && <span className="text-[10px] bg-amber-50 text-amber-600 border border-amber-200 px-1.5 py-0.5 rounded-full font-semibold">COD</span>}
          </div>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <p className="font-bold text-[#2C2520] text-sm">₹{order.total?.toLocaleString("en-IN")}</p>
          {open ? <ChevronUp className="w-4 h-4 text-stone-400" /> : <ChevronDown className="w-4 h-4 text-stone-400" />}
        </div>
      </button>

      {/* Expanded */}
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="border-t border-stone-100 p-4 sm:p-5 space-y-6">

              {/* ── Row 1: Customer info + Items + Payment ── */}
              <div className="grid sm:grid-cols-2 gap-6">
                <div className="space-y-5">
                  {/* Customer */}
                  <div>
                    <p className="text-xs font-semibold text-stone-400 uppercase tracking-wide mb-2">Customer</p>
                    <p className="text-sm font-medium text-[#2C2520]">{order.shippingAddress?.fullName}</p>
                    <p className="text-xs text-stone-500">{order.shippingAddress?.email}</p>
                    <p className="text-xs text-stone-500">{order.shippingAddress?.phone}</p>
                  </div>

                  {/* Address */}
                  <div>
                    <p className="text-xs font-semibold text-stone-400 uppercase tracking-wide mb-2 flex items-center gap-1">
                      <MapPin className="w-3 h-3" /> Address
                    </p>
                    <p className="text-xs text-stone-500 leading-relaxed">
                      {order.shippingAddress?.address}
                      {order.shippingAddress?.landmark ? `, ${order.shippingAddress.landmark}` : ""}<br />
                      {order.shippingAddress?.city}, {order.shippingAddress?.state} — {order.shippingAddress?.pincode}
                    </p>
                  </div>

                  {/* Items */}
                  <div>
                    <p className="text-xs font-semibold text-stone-400 uppercase tracking-wide mb-2 flex items-center gap-1">
                      <Package className="w-3 h-3" /> Items
                    </p>
                    <ul className="space-y-2">
                      {order.items?.map((item: any, i: number) => (
                        <li key={i} className="flex items-center gap-2 text-xs">
                          <span className="text-lg">{item.emoji}</span>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-[#2C2520]">{item.name}</p>
                            {item.customization && <p className="text-stone-400">"{item.customization}"</p>}
                          </div>
                          <div className="text-right shrink-0">
                            <p className="font-semibold">₹{item.price?.toLocaleString("en-IN")}</p>
                            <p className="text-stone-400">× {item.quantity}</p>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Payment + overall status panel */}
                <div className="space-y-4">
                  <div>
                    <p className="text-xs font-semibold text-stone-400 uppercase tracking-wide mb-2 flex items-center gap-1">
                      <CreditCard className="w-3 h-3" /> Payment
                    </p>
                    <div className="bg-stone-50 rounded-xl p-3 space-y-1 text-xs">
                      <div className="flex justify-between"><span className="text-stone-500">Method</span><span className="capitalize font-medium">{order.paymentMethod}</span></div>
                      <div className="flex justify-between"><span className="text-stone-500">Subtotal</span><span>₹{order.subtotal?.toLocaleString("en-IN")}</span></div>
                      <div className="flex justify-between"><span className="text-stone-500">Shipping</span><span>{order.shippingCharge === 0 ? "Free" : `₹${order.shippingCharge}`}</span></div>
                      <div className="flex justify-between font-bold text-[#2C2520] border-t border-stone-200 pt-1 mt-1"><span>Total</span><span>₹{order.total?.toLocaleString("en-IN")}</span></div>
                      {order.isCOD && <div className="flex justify-between text-amber-700"><span>COD remaining</span><span>₹{order.codRemainingAmount?.toLocaleString("en-IN")}</span></div>}
                      {order.razorpayOrderId && <p className="text-stone-400 font-mono pt-1">{order.razorpayOrderId}</p>}
                    </div>
                  </div>

                  {/* Overall status quick-update */}
                  <div className="bg-stone-50 rounded-2xl p-4 space-y-3">
                    <p className="text-xs font-semibold text-stone-400 uppercase tracking-wide">Overall Order Status</p>
                    <select value={status} onChange={(e) => setStatus(e.target.value)}
                      className="w-full bg-white border border-stone-200 rounded-xl px-3 py-2 text-sm text-[#2C2520]
                                 focus:outline-none focus:ring-2 focus:ring-sage/40">
                      {STATUS_OPTIONS.map((s) => (
                        <option key={s} value={s}>{s.replace(/_/g, " ")}</option>
                      ))}
                    </select>
                    <input value={note} onChange={(e) => setNote(e.target.value)}
                      className="w-full bg-white border border-stone-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sage/40"
                      placeholder="Add a note…" />
                    <button onClick={handleSave} disabled={saving}
                      className="flex items-center gap-2 bg-[#2C2520] text-white px-4 py-2.5 rounded-xl
                                 text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 w-full justify-center">
                      <Save className="w-4 h-4" />
                      {saving ? "Saving…" : saved ? "✓ Saved" : "Save Status"}
                    </button>
                  </div>
                </div>
              </div>

              {/* ── Row 2: The Two Deliveries ── */}
              <div>
                <p className="text-xs font-semibold text-stone-400 uppercase tracking-wide mb-3 flex items-center gap-1">
                  <Truck className="w-3 h-3" /> Delhivery Shipments
                </p>
                <div className="grid sm:grid-cols-2 gap-4">
                  <DelhiveryShipmentPanel
                    order={order}
                    shipmentType="shipment1"
                    onRefresh={onRefresh}
                  />
                  <DelhiveryShipmentPanel
                    order={order}
                    shipmentType="shipment2"
                    onRefresh={onRefresh}
                  />
                </div>
              </div>

              {/* ── Row 3: Overall tracking timeline ── */}
              {order.trackingEvents?.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-stone-400 uppercase tracking-wide mb-3 flex items-center gap-1">
                    <Clock className="w-3 h-3" /> Order Timeline
                  </p>
                  <ol className="space-y-3">
                    {[...order.trackingEvents].reverse().map((evt: any, i: number) => (
                      <li key={i} className="flex gap-2.5 text-xs">
                        <div className={`w-2 h-2 rounded-full mt-1 shrink-0 ${i === 0 ? "bg-sage" : "bg-stone-300"}`} />
                        <div>
                          <p className="font-medium text-[#2C2520] capitalize">{evt.status?.replace(/_/g, " ")}</p>
                          <p className="text-stone-500">{evt.description}</p>
                          <p className="text-stone-400">
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
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function AdminOrdersPage() {
  const [orders, setOrders]   = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [methodFilter, setMethodFilter] = useState("all");
  const [dateFilter, setDateFilter]     = useState("all");

  const fetchOrders = async () => {
    try {
      const res = await axios.get("/api/admin/orders");
      setOrders(res.data.orders || []);
    } catch { /* ignore */ } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchOrders(); }, []);

  const filtered = useMemo(() => {
    const now = new Date();
    return orders.filter((o) => {
      // Search
      if (search) {
        const q = search.toLowerCase();
        const match =
          o.orderId?.toLowerCase().includes(q) ||
          o.shippingAddress?.fullName?.toLowerCase().includes(q) ||
          o.shippingAddress?.email?.toLowerCase().includes(q) ||
          o.shippingAddress?.phone?.includes(q);
        if (!match) return false;
      }
      // Status
      if (statusFilter !== "all" && o.status !== statusFilter) return false;
      // Method
      if (methodFilter !== "all" && o.paymentMethod !== methodFilter) return false;
      // Date
      if (dateFilter !== "all") {
        const created = new Date(o.createdAt);
        if (dateFilter === "today") {
          if (created.toDateString() !== now.toDateString()) return false;
        } else if (dateFilter === "week") {
          const weekAgo = new Date(now); weekAgo.setDate(now.getDate() - 7);
          if (created < weekAgo) return false;
        } else if (dateFilter === "month") {
          const monthAgo = new Date(now); monthAgo.setMonth(now.getMonth() - 1);
          if (created < monthAgo) return false;
        }
      }
      return true;
    });
  }, [orders, search, statusFilter, methodFilter, dateFilter]);

  // Stats
  const totalRevenue = orders
    .filter((o) => !["cancelled", "payment_failed"].includes(o.status))
    .reduce((s, o) => s + (o.total ?? 0), 0);
  const pending    = orders.filter((o) => o.status === "pending_confirmation").length;
  const processing = orders.filter((o) => o.status === "processing").length;
  const delivered  = orders.filter((o) => o.status === "delivered").length;

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Total Orders",   value: orders.length,  color: "text-[#2C2520]" },
          { label: "Pending",        value: pending,        color: "text-amber-600" },
          { label: "Processing",     value: processing,     color: "text-purple-600" },
          { label: "Delivered",      value: delivered,      color: "text-green-600" },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-2xl p-4 border border-stone-100 shadow-sm">
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-stone-400 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Revenue */}
      <div className="bg-[#2C2520] rounded-2xl p-4 mb-6 flex items-center justify-between">
        <p className="text-white/60 text-sm">Total Revenue</p>
        <p className="text-white font-bold text-xl">₹{totalRevenue.toLocaleString("en-IN")}</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
          <input
            value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by order ID, name, email, phone…"
            className="w-full pl-9 pr-4 py-2.5 bg-white border border-stone-200 rounded-xl text-sm
                       focus:outline-none focus:ring-2 focus:ring-sage/40"
          />
        </div>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-white border border-stone-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sage/40">
          <option value="all">All Statuses</option>
          {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s.replace(/_/g, " ")}</option>)}
        </select>
        <select value={methodFilter} onChange={(e) => setMethodFilter(e.target.value)}
          className="bg-white border border-stone-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sage/40">
          <option value="all">All Methods</option>
          <option value="razorpay">Razorpay</option>
          <option value="cod">COD</option>
          <option value="paypal">PayPal</option>
        </select>
        <select value={dateFilter} onChange={(e) => setDateFilter(e.target.value)}
          className="bg-white border border-stone-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sage/40">
          <option value="all">All Time</option>
          <option value="today">Today</option>
          <option value="week">This Week</option>
          <option value="month">This Month</option>
        </select>
      </div>

      <p className="text-xs text-stone-400 mb-4">{filtered.length} order{filtered.length !== 1 ? "s" : ""}</p>

      {/* Orders list */}
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl h-16 animate-pulse border border-stone-100" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-stone-400 text-sm">No orders found.</div>
      ) : (
        <div className="space-y-3">
          {filtered.map((order) => (
            <OrderRow key={order._id} order={order} onRefresh={fetchOrders} />
          ))}
        </div>
      )}
    </div>
  );
}
