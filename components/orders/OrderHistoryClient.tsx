"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  Package, Truck, MapPin, CheckCircle2, Clock,
  XCircle, AlertCircle, ChevronDown, ChevronUp,
  Eye, Search, Copy, Check, RefreshCw,
} from "lucide-react";

const ease = [0.4, 0, 0.2, 1] as const;

/* ─── Status config ─── */
type OrderStatus = "confirmed" | "processing" | "shipped" | "out_for_delivery" | "delivered" | "cancelled" | "payment_failed";

const STATUS_CONFIG: Record<OrderStatus, { label: string; icon: React.ElementType; classes: string; bg: string }> = {
  confirmed:        { label: "Confirmed",       icon: CheckCircle2, classes: "text-blue-700 border-blue-200",   bg: "bg-blue-50" },
  processing:       { label: "Processing",      icon: Package,      classes: "text-amber-700 border-amber-200", bg: "bg-amber-50" },
  shipped:          { label: "Shipped",         icon: Truck,        classes: "text-purple-700 border-purple-200", bg: "bg-purple-50" },
  out_for_delivery: { label: "Out for Delivery",icon: MapPin,       classes: "text-orange-700 border-orange-200", bg: "bg-orange-50" },
  delivered:        { label: "Delivered",       icon: CheckCircle2, classes: "text-green-700 border-green-200", bg: "bg-green-50" },
  cancelled:        { label: "Cancelled",       icon: XCircle,      classes: "text-red-700 border-red-200",     bg: "bg-red-50" },
  payment_failed:   { label: "Payment Failed",  icon: AlertCircle,  classes: "text-red-700 border-red-200",     bg: "bg-red-50" },
};

const CANCELLABLE = new Set<OrderStatus>(["confirmed", "processing"]);

/* ─── Copy button ─── */
function CopyId({ id }: { id: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => { navigator.clipboard.writeText(id); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
      className="ml-1 text-stone-400 hover:text-ink transition-colors"
      title="Copy Order ID"
    >
      {copied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
    </button>
  );
}

/* ─── Cancel Modal ─── */
function CancelModal({
  order,
  onClose,
  onConfirm,
  loading,
}: {
  order: any;
  onClose: () => void;
  onConfirm: (reason: string) => void;
  loading: boolean;
}) {
  const [reason, setReason] = useState("");

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ duration: 0.25, ease }}
        className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-red-50 rounded-2xl flex items-center justify-center">
            <XCircle className="w-5 h-5 text-red-500" />
          </div>
          <div>
            <h2 className="font-semibold text-ink">Cancel Order?</h2>
            <p className="text-xs text-stone-500">{order.orderId}</p>
          </div>
        </div>

        <p className="text-sm text-stone-600 mb-4 leading-relaxed">
          This action cannot be undone. If you paid online, a refund will be initiated within 5–7 business days.
        </p>

        <div className="mb-5">
          <label className="text-xs font-semibold text-stone-600 block mb-2">Reason for cancellation (optional)</label>
          <select
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="w-full px-3 py-2.5 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-200"
          >
            <option value="">Select a reason…</option>
            <option value="changed_mind">Changed my mind</option>
            <option value="wrong_item">Ordered wrong item</option>
            <option value="too_late">Delivery too slow</option>
            <option value="found_better">Found a better option</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 py-3 rounded-2xl border border-stone-200 text-sm font-medium text-stone-600 hover:bg-stone-50 transition-colors"
          >
            Keep Order
          </button>
          <button
            onClick={() => onConfirm(reason)}
            disabled={loading}
            className="flex-1 py-3 rounded-2xl bg-red-500 text-white text-sm font-semibold hover:bg-red-600 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
            {loading ? "Cancelling…" : "Yes, Cancel"}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ─── Order Card ─── */
function OrderCard({ order, onCancelled }: { order: any; onCancelled: (orderId: string) => void }) {
  const [expanded, setExpanded] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [cancelError, setCancelError] = useState("");

  const status = order.status as OrderStatus;
  const cfg    = STATUS_CONFIG[status] ?? STATUS_CONFIG.confirmed;
  const Icon   = cfg.icon;
  const canCancel = CANCELLABLE.has(status);

  const createdAt = new Date(order.createdAt);
  const dateStr   = createdAt.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
  const timeStr   = createdAt.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true });

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
      setShowCancelModal(false);
      onCancelled(order.orderId);
    } catch (err: any) {
      setCancelError(err.message ?? "Something went wrong");
    } finally {
      setCancelLoading(false);
    }
  };

  return (
    <>
      <motion.div
        layout
        className="bg-white rounded-3xl border border-stone-100 shadow-soft overflow-hidden"
      >
        {/* Header */}
        <div className="p-5 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${cfg.bg}`}>
                <Icon className={`w-4.5 h-4.5 ${cfg.classes.split(" ")[0]}`} strokeWidth={1.75} />
              </div>
              <div>
                <div className="flex items-center gap-1">
                  <p className="font-mono font-bold text-ink text-sm">{order.orderId}</p>
                  <CopyId id={order.orderId} />
                </div>
                <p className="text-xs text-stone-400 mt-0.5">{dateStr} · {timeStr}</p>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <span className={`text-xs font-bold tracking-wide uppercase px-3 py-1.5 rounded-full border ${cfg.classes} ${cfg.bg}`}>
                {cfg.label}
              </span>
              <span className="text-sm font-bold text-ink">₹{order.total?.toLocaleString("en-IN")}</span>
            </div>
          </div>

          {/* Item preview */}
          <div className="mt-4 flex items-center gap-2">
            <div className="flex -space-x-2">
              {order.items?.slice(0, 3).map((item: any, i: number) => (
                <div
                  key={i}
                  className="w-8 h-8 rounded-lg bg-stone-100 border-2 border-white flex items-center justify-center overflow-hidden"
                >
                  <span className="text-[10px] text-stone-400 font-medium">{item.name?.charAt(0)}</span>
                </div>
              ))}
            </div>
            <p className="text-xs text-stone-500">
              {order.items?.length} item{order.items?.length !== 1 ? "s" : ""}
              {order.items?.length > 0 && ` · ${order.items[0].name}${order.items.length > 1 ? ` +${order.items.length - 1} more` : ""}`}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="px-5 sm:px-6 pb-4 flex flex-wrap gap-2 border-t border-stone-50 pt-4">
          <Link
            href={`/track?orderId=${order.orderId}`}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-ink text-canvas text-xs font-semibold hover:bg-stone-800 transition-colors"
          >
            <Search className="w-3.5 h-3.5" /> Track Order
          </Link>
          <button
            onClick={() => setExpanded(!expanded)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-stone-200 text-xs font-semibold text-stone-600 hover:bg-stone-50 transition-colors"
          >
            <Eye className="w-3.5 h-3.5" />
            {expanded ? "Hide Details" : "View Details"}
            {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
          {canCancel && (
            <button
              onClick={() => setShowCancelModal(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-red-200 text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors"
            >
              <XCircle className="w-3.5 h-3.5" /> Cancel Order
            </button>
          )}
        </div>

        {/* Cancel error */}
        {cancelError && (
          <div className="px-5 sm:px-6 pb-4">
            <p className="text-xs text-red-500 flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5" /> {cancelError}
            </p>
          </div>
        )}

        {/* Expanded details */}
        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease }}
              className="overflow-hidden"
            >
              <div className="px-5 sm:px-6 pb-6 border-t border-stone-100 pt-5 space-y-5">
                {/* Items */}
                <div>
                  <p className="text-xs font-semibold text-stone-500 uppercase tracking-wide mb-3">Items Ordered</p>
                  <ul className="space-y-2">
                    {order.items?.map((item: any, i: number) => (
                      <li key={i} className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2 min-w-0">
                          <div className="w-8 h-8 bg-stone-100 rounded-lg flex items-center justify-center shrink-0">
                            <span className="text-xs text-stone-400">{item.name?.charAt(0)}</span>
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-ink text-xs truncate">{item.name}</p>
                            {item.customization && typeof item.customization === "object" && Object.keys(item.customization).length > 0 && (
                              <p className="text-[11px] text-stone-400 truncate">
                                {Object.entries(item.customization).map(([k,v]) => `${k}: ${v}`).join(" · ")}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="text-right shrink-0 ml-2">
                          <p className="text-xs font-bold text-ink">₹{(item.price * item.quantity).toLocaleString("en-IN")}</p>
                          <p className="text-[11px] text-stone-400">× {item.quantity}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-3 pt-3 border-t border-stone-100 flex justify-between text-sm font-bold text-ink">
                    <span>Total</span>
                    <span>₹{order.total?.toLocaleString("en-IN")}</span>
                  </div>
                </div>

                {/* Shipping address */}
                {order.shippingAddress && (
                  <div>
                    <p className="text-xs font-semibold text-stone-500 uppercase tracking-wide mb-2">Shipping Address</p>
                    <div className="flex items-start gap-2 text-sm text-stone-600">
                      <MapPin className="w-3.5 h-3.5 mt-0.5 shrink-0 text-stone-400" />
                      <p className="leading-relaxed">
                        {order.shippingAddress.fullName}<br />
                        {order.shippingAddress.address}<br />
                        {order.shippingAddress.city}, {order.shippingAddress.state} — {order.shippingAddress.pincode}
                      </p>
                    </div>
                  </div>
                )}

                {/* Payment info */}
                <div className="flex items-center justify-between text-xs text-stone-500">
                  <span className="capitalize">Payment: {order.paymentMethod === "cod" ? "Cash on Delivery" : order.paymentMethod}</span>
                  {order.appliedCouponCode && (
                    <span className="bg-green-50 text-green-700 px-2 py-1 rounded-full font-medium">
                      Coupon: {order.appliedCouponCode}
                    </span>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      <AnimatePresence>
        {showCancelModal && (
          <CancelModal
            order={order}
            onClose={() => setShowCancelModal(false)}
            onConfirm={handleCancel}
            loading={cancelLoading}
          />
        )}
      </AnimatePresence>
    </>
  );
}

/* ─── Main Component ─── */
export default function OrderHistoryClient() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState("");

  useEffect(() => {
    fetch("/api/user/orders")
      .then(r => r.json())
      .then(d => {
        if (d.error) setError(d.error);
        else setOrders(d.orders ?? []);
      })
      .catch(() => setError("Failed to load orders"))
      .finally(() => setLoading(false));
  }, []);

  const handleCancelled = (orderId: string) => {
    setOrders(prev => prev.map(o =>
      o.orderId === orderId ? { ...o, status: "cancelled" } : o
    ));
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="bg-white rounded-3xl p-6 animate-pulse border border-stone-100">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-stone-200 rounded-2xl" />
              <div className="space-y-2">
                <div className="h-4 bg-stone-200 rounded w-32" />
                <div className="h-3 bg-stone-100 rounded w-20" />
              </div>
            </div>
            <div className="h-3 bg-stone-100 rounded w-2/3" />
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-3xl p-8 text-center">
        <AlertCircle className="w-8 h-8 text-red-400 mx-auto mb-3" />
        <p className="text-red-600 font-semibold mb-1">Failed to load orders</p>
        <p className="text-red-500 text-sm">{error}</p>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-20"
      >
        <p className="text-5xl mb-4">📦</p>
        <h2 className="font-semibold text-ink text-lg mb-2">No orders yet</h2>
        <p className="text-stone-500 text-sm mb-6">When you place your first order, it will appear here.</p>
        <Link href="/shop" className="btn-primary px-8 py-3.5 text-sm">
          Start Shopping
        </Link>
      </motion.div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-stone-500 mb-2">{orders.length} order{orders.length !== 1 ? "s" : ""} found</p>
      <AnimatePresence initial={false}>
        {orders.map((order, i) => (
          <motion.div
            key={order._id ?? order.orderId}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05, duration: 0.3, ease }}
          >
            <OrderCard order={order} onCancelled={handleCancelled} />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
