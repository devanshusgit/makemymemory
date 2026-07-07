"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { motion, AnimatePresence } from "framer-motion";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import axios from "axios";
import {
  Search, CheckCircle2, Package, Truck, MapPin,
  Star, ExternalLink, RefreshCw, AlertCircle,
  Clock, ShieldCheck,
} from "lucide-react";
import type { OrderTrackingResult } from "@/lib/types";

const ease = [0.4, 0, 0.2, 1] as const;

/* ─────────────────────────────────────────────
   Step config
───────────────────────────────────────────── */
type TrackStatus = OrderTrackingResult["status"];

const STEPS: Array<{
  key: TrackStatus;
  label: string;
  shortLabel: string;
  icon: React.ElementType;
  description: string;
}> = [
  {
    key:         "confirmed",
    label:       "Order Confirmed",
    shortLabel:  "Confirmed",
    icon:        CheckCircle2,
    description: "Payment received and order placed.",
  },
  {
    key:         "processing",
    label:       "Processing",
    shortLabel:  "Processing",
    icon:        Package,
    description: "Your item is being crafted by our team.",
  },
  {
    key:         "shipped",
    label:       "Shipped",
    shortLabel:  "Shipped",
    icon:        Truck,
    description: "Picked up by courier and in transit.",
  },
  {
    key:         "out_for_delivery",
    label:       "Out for Delivery",
    shortLabel:  "Out for Delivery",
    icon:        MapPin,
    description: "Your delivery partner is on the way.",
  },
  {
    key:         "delivered",
    label:       "Delivered",
    shortLabel:  "Delivered",
    icon:        Star,
    description: "Order delivered. Enjoy your memory!",
  },
];

const STATUS_ORDER: TrackStatus[] = [
  "confirmed", "processing", "shipped", "out_for_delivery", "delivered",
];

function getStepIndex(status: TrackStatus): number {
  return STATUS_ORDER.indexOf(status);
}

/* ─────────────────────────────────────────────
   Lookup form
───────────────────────────────────────────── */
interface LookupForm {
  orderId: string;
  contact: string;
}

function TrackForm({
  onResult,
  defaultOrderId,
}: {
  onResult: (r: OrderTrackingResult) => void;
  defaultOrderId?: string;
}) {
  const [apiError, setApiError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LookupForm>({
    defaultValues: { orderId: defaultOrderId ?? "" },
  });

  const onSubmit = async (data: LookupForm) => {
    setApiError("");
    try {
      const { data: result } = await axios.get<OrderTrackingResult>(
        `/api/orders/track?orderId=${encodeURIComponent(data.orderId)}&contact=${encodeURIComponent(data.contact)}`
      );
      onResult(result);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setApiError(
          err.response?.data?.error ??
          "Something went wrong. Please try again."
        );
      } else {
        setApiError("Something went wrong. Please try again.");
      }
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="bg-white rounded-3xl p-6 sm:p-8 shadow-soft border border-stone-100"
    >
      <div className="grid sm:grid-cols-2 gap-4 mb-4">
        {/* Order ID */}
        <div>
          <label className="input-label">Order ID *</label>
          <input
            {...register("orderId", {
              required: "Order ID is required",
              minLength: { value: 4, message: "Enter a valid Order ID" },
            })}
            className="input font-mono tracking-wider uppercase"
            placeholder="MMM-12345"
            autoComplete="off"
            spellCheck={false}
          />
          {errors.orderId && (
            <p className="text-red-400 text-xs mt-1.5">{errors.orderId.message}</p>
          )}
          <p className="text-[11px] text-stone-400 mt-1">
            Found in your confirmation email
          </p>
        </div>

        {/* Phone or email */}
        <div>
          <label className="input-label">Phone or Email *</label>
          <input
            {...register("contact", {
              required: "Phone or email is required",
              validate: (v) => {
                const phone = /^[6-9]\d{9}$/.test(v);
                const email = /^\S+@\S+\.\S+$/.test(v);
                return phone || email || "Enter a valid phone number or email";
              },
            })}
            className="input"
            placeholder="9876543210 or you@email.com"
            autoComplete="off"
          />
          {errors.contact && (
            <p className="text-red-400 text-xs mt-1.5">{errors.contact.message}</p>
          )}
          <p className="text-[11px] text-stone-400 mt-1">
            Used when placing the order
          </p>
        </div>
      </div>

      {/* API error */}
      <AnimatePresence>
        {apiError && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="flex items-center gap-2.5 bg-red-50 border border-red-200
                       rounded-2xl px-4 py-3 mb-4"
          >
            <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
            <p className="text-sm text-red-600">{apiError}</p>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        type="submit"
        disabled={isSubmitting}
        className="btn-primary w-full py-4 text-sm"
      >
        {isSubmitting ? (
          <span className="flex items-center gap-2">
            <RefreshCw className="w-4 h-4 animate-spin" />
            Searching…
          </span>
        ) : (
          <span className="flex items-center gap-2">
            <Search className="w-4 h-4" />
            Track Order
          </span>
        )}
      </button>

      {/* Demo hint */}
      <p className="text-center text-[11px] text-stone-400 mt-4">
        Demo: try <span className="font-mono font-semibold">MMM-1234</span> through{" "}
        <span className="font-mono font-semibold">MMM-1239</span> with any phone/email
      </p>
    </form>
  );
}

/* ─────────────────────────────────────────────
   Visual step indicator
───────────────────────────────────────────── */
function StepIndicator({ status }: { status: TrackStatus }) {
  const currentIndex = getStepIndex(status);
  const isCancelled  = status === "cancelled";

  if (isCancelled) {
    return (
      <div className="flex items-center gap-3 bg-red-50 border border-red-200
                      rounded-2xl px-5 py-4">
        <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
        <div>
          <p className="text-sm font-bold text-red-700">Order Cancelled</p>
          <p className="text-xs text-red-500 mt-0.5">
            This order has been cancelled. Contact support if you need help.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* ── Desktop: horizontal stepper ── */}
      <div className="hidden sm:block">
        <div className="flex items-start">
          {STEPS.map((step, i) => {
            const Icon      = step.icon;
            const completed = i < currentIndex;
            const active    = i === currentIndex;
            const upcoming  = i > currentIndex;

            return (
              <div key={step.key} className="flex-1 flex flex-col items-center relative">
                {/* Connector line — left half */}
                {i > 0 && (
                  <div className="absolute top-5 right-1/2 left-0 h-0.5 -translate-y-1/2">
                    <div
                      className={`h-full transition-all duration-700
                                  ${completed || active ? "bg-sage" : "bg-stone-200"}`}
                    />
                  </div>
                )}
                {/* Connector line — right half */}
                {i < STEPS.length - 1 && (
                  <div className="absolute top-5 left-1/2 right-0 h-0.5 -translate-y-1/2">
                    <div
                      className={`h-full transition-all duration-700
                                  ${completed ? "bg-sage" : "bg-stone-200"}`}
                    />
                  </div>
                )}

                {/* Step circle */}
                <motion.div
                  initial={false}
                  animate={{
                    scale:           active ? 1.15 : 1,
                    backgroundColor: completed
                      ? "#8FBC8F"
                      : active
                        ? "#2C2520"
                        : "#EDE5DC",
                  }}
                  transition={{ duration: 0.4, ease }}
                  className="relative z-10 w-10 h-10 rounded-full flex items-center
                             justify-center mb-3 shadow-soft"
                >
                  <Icon
                    className={`w-4 h-4 transition-colors duration-300
                                ${completed || active ? "text-white" : "text-stone-400"}`}
                    strokeWidth={2}
                  />
                  {/* Pulse ring on active step */}
                  {active && (
                    <motion.div
                      className="absolute inset-0 rounded-full border-2 border-ink"
                      animate={{ scale: [1, 1.4, 1], opacity: [0.6, 0, 0.6] }}
                      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    />
                  )}
                </motion.div>

                {/* Label */}
                <p
                  className={`text-[11px] font-semibold text-center leading-tight px-1
                              transition-colors duration-300
                              ${active ? "text-ink" : completed ? "text-sage-dark" : "text-stone-400"}`}
                >
                  {step.shortLabel}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Mobile: vertical stepper ── */}
      <div className="sm:hidden space-y-0">
        {STEPS.map((step, i) => {
          const Icon      = step.icon;
          const completed = i < currentIndex;
          const active    = i === currentIndex;

          return (
            <div key={step.key} className="flex gap-4">
              {/* Left: icon + connector */}
              <div className="flex flex-col items-center">
                <motion.div
                  initial={false}
                  animate={{
                    backgroundColor: completed
                      ? "#8FBC8F"
                      : active
                        ? "#2C2520"
                        : "#EDE5DC",
                  }}
                  transition={{ duration: 0.4, ease }}
                  className="relative w-9 h-9 rounded-full flex items-center
                             justify-center shrink-0 shadow-soft"
                >
                  <Icon
                    className={`w-4 h-4 ${completed || active ? "text-white" : "text-stone-400"}`}
                    strokeWidth={2}
                  />
                  {active && (
                    <motion.div
                      className="absolute inset-0 rounded-full border-2 border-ink"
                      animate={{ scale: [1, 1.4, 1], opacity: [0.6, 0, 0.6] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                  )}
                </motion.div>
                {/* Vertical connector */}
                {i < STEPS.length - 1 && (
                  <div className="w-0.5 flex-1 my-1 min-h-[20px]">
                    <div
                      className={`w-full h-full transition-colors duration-700
                                  ${completed ? "bg-sage" : "bg-stone-200"}`}
                    />
                  </div>
                )}
              </div>

              {/* Right: text */}
              <div className={`pb-5 ${i === STEPS.length - 1 ? "pb-0" : ""}`}>
                <p
                  className={`text-sm font-semibold leading-none mb-1
                              ${active ? "text-ink" : completed ? "text-sage-dark" : "text-stone-400"}`}
                >
                  {step.label}
                </p>
                <p className="text-xs text-stone-400 leading-relaxed">
                  {step.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Timeline events
───────────────────────────────────────────── */
function Timeline({ events }: { events: OrderTrackingResult["events"] }) {
  const sorted = [...events].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  return (
    <div className="space-y-0">
      {sorted.map((event, i) => {
        const date = new Date(event.timestamp);
        const dateStr = date.toLocaleDateString("en-IN", {
          day: "numeric", month: "short", year: "numeric",
        });
        const timeStr = date.toLocaleTimeString("en-IN", {
          hour: "2-digit", minute: "2-digit", hour12: true,
        });
        const isLatest = i === 0;

        return (
          <motion.div
            key={event.timestamp}
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.07, duration: 0.4, ease }}
            className="flex gap-4"
          >
            {/* Dot + line */}
            <div className="flex flex-col items-center shrink-0">
              <div
                className={`w-2.5 h-2.5 rounded-full mt-1.5 shrink-0 ring-2 ring-canvas
                            ${isLatest ? "bg-sage" : "bg-stone-300"}`}
              />
              {i < sorted.length - 1 && (
                <div className="w-px flex-1 bg-stone-200 my-1 min-h-[24px]" />
              )}
            </div>

            {/* Content */}
            <div className={`pb-5 ${i === sorted.length - 1 ? "pb-0" : ""}`}>
              <p
                className={`text-sm font-semibold leading-snug
                            ${isLatest ? "text-ink" : "text-stone-500"}`}
              >
                {event.description}
              </p>
              {event.location && (
                <p className="text-xs text-stone-400 mt-0.5 flex items-center gap-1">
                  <MapPin className="w-3 h-3 shrink-0" />
                  {event.location}
                </p>
              )}
              <p className="text-[11px] text-stone-400 mt-1 flex items-center gap-1">
                <Clock className="w-3 h-3 shrink-0" />
                {dateStr} · {timeStr}
              </p>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

/* ─────────────────────────────────────────────
   Status badge
───────────────────────────────────────────── */
const STATUS_BADGE: Record<TrackStatus, { label: string; classes: string }> = {
  confirmed:        { label: "Order Confirmed",    classes: "bg-blue-50 text-blue-700 border-blue-200" },
  processing:       { label: "Processing",         classes: "bg-amber-50 text-amber-700 border-amber-200" },
  shipped:          { label: "Shipped",            classes: "bg-purple-50 text-purple-700 border-purple-200" },
  out_for_delivery: { label: "Out for Delivery",   classes: "bg-orange-50 text-orange-700 border-orange-200" },
  delivered:        { label: "Delivered ✓",        classes: "bg-sage/10 text-sage-dark border-sage/20" },
  cancelled:        { label: "Cancelled",          classes: "bg-red-50 text-red-700 border-red-200" },
};

/* ─────────────────────────────────────────────
   Tracking result card
───────────────────────────────────────────── */
function TrackingResult({
  result,
  onReset,
}: {
  result: OrderTrackingResult;
  onReset: () => void;
}) {
  const badge = STATUS_BADGE[result.status];
  const estimatedDate = result.estimatedDelivery
    ? new Date(result.estimatedDelivery).toLocaleDateString("en-IN", {
        weekday: "long", day: "numeric", month: "long",
      })
    : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease }}
      className="space-y-5"
    >
      {/* ── Header card ── */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-soft border border-stone-100">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
          <div>
            <p className="text-xs text-stone-400 mb-1">Order ID</p>
            <p className="font-mono font-bold text-ink text-lg tracking-wider">
              {result.orderId}
            </p>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <span
              className={`text-xs font-bold tracking-wide uppercase px-3 py-1.5
                          rounded-full border ${badge.classes}`}
            >
              {badge.label}
            </span>
            <button
              onClick={onReset}
              className="btn-ghost text-xs px-3 py-1.5 gap-1.5"
            >
              <Search className="w-3.5 h-3.5" />
              New Search
            </button>
          </div>
        </div>

        {/* Estimated delivery */}
        {estimatedDate && result.status !== "delivered" && (
          <div className="flex items-center gap-2.5 bg-sage/8 border border-sage/20
                          rounded-2xl px-4 py-3 mb-6">
            <Clock className="w-4 h-4 text-sage-dark shrink-0" />
            <p className="text-sm text-ink">
              Estimated delivery:{" "}
              <span className="font-semibold">{estimatedDate}</span>
            </p>
          </div>
        )}

        {/* Step indicator */}
        <StepIndicator status={result.status} />
      </div>

      {/* ── Courier tracking ── */}
      {result.courierTrackingUrl && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.4, ease }}
          className="bg-white rounded-3xl p-5 shadow-soft border border-stone-100
                     flex flex-col sm:flex-row sm:items-center justify-between gap-4"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-50 rounded-2xl flex items-center
                            justify-center shrink-0">
              <Truck className="w-4 h-4 text-purple-600" strokeWidth={1.75} />
            </div>
            <div>
              <p className="text-sm font-semibold text-ink">
                {result.courierName ?? "Courier"}
              </p>
              <p className="text-xs text-stone-400 font-mono mt-0.5">
                {result.courierTrackingId}
              </p>
            </div>
          </div>
          <a
            href={result.courierTrackingUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-ink text-canvas
                       px-5 py-2.5 rounded-full text-xs font-semibold
                       hover:bg-stone-800 hover:-translate-y-0.5 hover:shadow-lift
                       transition-all duration-200 shrink-0"
          >
            Track on {result.courierName ?? "Courier"}
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </motion.div>
      )}

      {/* ── Timeline + Order details ── */}
      <div className="grid lg:grid-cols-5 gap-5">

        {/* Timeline — 3 cols */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.4, ease }}
          className="lg:col-span-3 bg-white rounded-3xl p-6 shadow-soft border border-stone-100"
        >
          <h3 className="font-semibold text-ink text-sm mb-5">Tracking History</h3>
          <Timeline events={result.events} />
        </motion.div>

        {/* Order details — 2 cols */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.28, duration: 0.4, ease }}
          className="lg:col-span-2 space-y-4"
        >
          {/* Items */}
          <div className="bg-white rounded-3xl p-6 shadow-soft border border-stone-100">
            <h3 className="font-semibold text-ink text-sm mb-4">Items Ordered</h3>
            <ul className="space-y-3">
              {result.items.map((item) => (
                <li key={item.name} className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-stone-100 rounded-xl flex items-center
                                  justify-center shrink-0">
                    <span className="text-xs text-stone-400">Item</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-ink truncate">{item.name}</p>
                    <p className="text-[11px] text-stone-400">× {item.quantity}</p>
                  </div>
                  <p className="text-xs font-bold text-ink shrink-0">
                    ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                  </p>
                </li>
              ))}
            </ul>
            <div className="divider mt-4 mb-3" />
            <div className="flex justify-between text-sm font-bold text-ink">
              <span>Total</span>
              <span>₹{result.total.toLocaleString("en-IN")}</span>
            </div>
            {result.paymentMethod === "cod" && (
              <p className="text-[11px] text-green-600 mt-1.5 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" />
                Cash on Delivery — Pay full amount on delivery
              </p>
            )}
          </div>

          {/* Delivery address */}
          <div className="bg-white rounded-3xl p-6 shadow-soft border border-stone-100">
            <h3 className="font-semibold text-ink text-sm mb-3">Delivering To</h3>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-stone-100 rounded-xl flex items-center
                              justify-center shrink-0 mt-0.5">
                <MapPin className="w-3.5 h-3.5 text-stone-500" strokeWidth={1.75} />
              </div>
              <div>
                <p className="text-sm font-semibold text-ink">
                  {result.shippingAddress.fullName}
                </p>
                <p className="text-xs text-stone-500 mt-0.5 leading-relaxed">
                  {result.shippingAddress.city}, {result.shippingAddress.state}{" "}
                  — {result.shippingAddress.pincode}
                </p>
              </div>
            </div>
          </div>

          {/* Help */}
          <div className="bg-stone-50 rounded-3xl p-5 border border-stone-200">
            <p className="text-xs font-semibold text-ink mb-1">Need help?</p>
            <p className="text-[11px] text-stone-500 mb-3 leading-relaxed">
              If your order is delayed or you have a question, our team is here.
            </p>
            <a
              href="/contact"
              className="inline-flex items-center gap-1.5 text-xs font-semibold
                         text-sage-dark hover:text-ink transition-colors
                         underline underline-offset-2"
            >
              Contact Support →
            </a>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}

/* ─────────────────────────────────────────────
   Root client component
───────────────────────────────────────────── */
function TrackContent() {
  const searchParams = useSearchParams();
  const urlOrderId   = searchParams.get("orderId") ?? "";
  const [result, setResult] = useState<OrderTrackingResult | null>(null);

  return (
    <div className="section-wrap py-10 sm:py-14">
      <AnimatePresence mode="wait">
        {!result ? (
          <motion.div
            key="form"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.35, ease }}
            className="max-w-2xl mx-auto"
          >
            <TrackForm onResult={setResult} defaultOrderId={urlOrderId} />

            {/* Trust strip */}
            <div className="flex flex-wrap justify-center gap-6 mt-8">
              {[
                { icon: ShieldCheck, text: "Your data is private" },
                { icon: Clock,       text: "Real-time updates" },
                { icon: Truck,       text: "Live courier tracking" },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-1.5 text-xs text-stone-400">
                  <Icon className="w-3.5 h-3.5" />
                  {text}
                </div>
              ))}
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="result"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35, ease }}
          >
            <TrackingResult
              result={result}
              onReset={() => setResult(null)}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function TrackClient() {
  return (
    <Suspense fallback={
      <div className="section-wrap py-10 sm:py-14">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-3xl p-8 shadow-soft border border-stone-100 animate-pulse">
            <div className="h-4 bg-stone-200 rounded w-1/3 mb-4" />
            <div className="grid sm:grid-cols-2 gap-4 mb-4">
              <div className="h-10 bg-stone-100 rounded-xl" />
              <div className="h-10 bg-stone-100 rounded-xl" />
            </div>
            <div className="h-12 bg-stone-200 rounded-full" />
          </div>
        </div>
      </div>
    }>
      <TrackContent />
    </Suspense>
  );
}
