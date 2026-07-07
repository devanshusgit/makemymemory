"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Smartphone, Globe, Truck,
  AlertTriangle, ChevronDown, ChevronUp, Check,
  ShieldCheck, Lock, RotateCcw,
} from "lucide-react";
import axios from "axios";
import { useCart } from "@/lib/context/CartContext";
import CouponInput from "./CouponInput";
import {
  loadRazorpayScript,
  openRazorpayCheckout,
  type RazorpayPaymentResponse,
} from "@/lib/utils/razorpay";

/* ─────────────────────────────────────────────
   Types
───────────────────────────────────────────── */
type PaymentMethod = "razorpay" | "paypal" | "cod";

interface FormData {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  landmark: string;
  pincode: string;
  city: string;
  state: string;
}

interface UserAddress {
  _id?: string;
  label: string;
  fullName: string;
  phone: string;
  address: string;
  landmark?: string;
  city: string;
  state: string;
  pincode: string;
  isDefault?: boolean;
}

const INDIAN_STATES = [
  "Andhra Pradesh","Arunachal Pradesh","Assam","Bihar","Chhattisgarh",
  "Goa","Gujarat","Haryana","Himachal Pradesh","Jharkhand","Karnataka",
  "Kerala","Madhya Pradesh","Maharashtra","Manipur","Meghalaya","Mizoram",
  "Nagaland","Odisha","Punjab","Rajasthan","Sikkim","Tamil Nadu","Telangana",
  "Tripura","Uttar Pradesh","Uttarakhand","West Bengal",
  "Andaman and Nicobar Islands","Chandigarh","Dadra and Nagar Haveli",
  "Daman and Diu","Delhi","Jammu and Kashmir","Ladakh","Lakshadweep","Puducherry",
];

const COD_ADVANCE = 0;
const ease = [0.4, 0, 0.2, 1] as const;

/* ─────────────────────────────────────────────
   Field wrapper
───────────────────────────────────────────── */
function Field({
  label, required, error, hint, children,
}: {
  label: string; required?: boolean; error?: string; hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="input-label">
        {label}{required && <span className="text-red-400 ml-0.5">*</span>}
      </label>
      {children}
      {hint && !error && <p className="text-[11px] text-stone-400 mt-1">{hint}</p>}
      {error && <p className="text-red-400 text-xs mt-1.5">{error}</p>}
    </div>
  );
}

/* ─────────────────────────────────────────────
   Payment method card
───────────────────────────────────────────── */
function PaymentCard({
  id, selected, onSelect, icon: Icon, iconColor,
  title, subtitle, badge, children,
}: {
  id: PaymentMethod; selected: boolean; onSelect: () => void;
  icon: React.ElementType; iconColor: string;
  title: string; subtitle: string; badge?: string;
  children?: React.ReactNode;
}) {
  return (
    <div
      onClick={onSelect}
      role="radio"
      aria-checked={selected}
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && onSelect()}
      className={`rounded-2xl border-2 cursor-pointer transition-all duration-200
                  ${selected
                    ? "border-ink bg-white shadow-card"
                    : "border-stone-200 bg-stone-50 hover:border-stone-300 hover:bg-white"
                  }`}
    >
      <div className="flex items-center gap-4 p-4">
        {/* Radio dot */}
        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0
                         transition-all duration-200
                         ${selected ? "border-ink" : "border-stone-300"}`}>
          {selected && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="w-2.5 h-2.5 rounded-full bg-ink"
            />
          )}
        </div>

        {/* Icon */}
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${iconColor}`}>
          <Icon className="w-4 h-4" strokeWidth={1.75} />
        </div>

        {/* Text */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-sm font-semibold text-ink">{title}</p>
            {badge && (
              <span className="text-[10px] font-bold tracking-wide uppercase
                               bg-sage/15 text-sage-dark px-2 py-0.5 rounded-full">
                {badge}
              </span>
            )}
          </div>
          <p className="text-xs text-stone-400 mt-0.5">{subtitle}</p>
        </div>
      </div>

      {/* Expanded content */}
      <AnimatePresence initial={false}>
        {selected && children && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 pt-0 border-t border-stone-100">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─────────────────────────────────────────────
   COD Warning banner
───────────────────────────────────────────── */
function CodWarning({ total }: { total: number }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.3, ease }}
      className="rounded-2xl border-2 border-green-300 bg-green-50 overflow-hidden"
    >
      {/* Header row */}
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-start gap-3 p-4 text-left"
      >
        <Check className="w-5 h-5 text-green-600 shrink-0 mt-0.5" strokeWidth={2} />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-green-800">
            Cash on Delivery — No Advance Payment
          </p>
          <p className="text-xs text-green-700 mt-0.5">
            Pay the full amount in cash when your order arrives.
          </p>
        </div>
        <span className="shrink-0 text-green-600 mt-0.5">
          {expanded
            ? <ChevronUp className="w-4 h-4" />
            : <ChevronDown className="w-4 h-4" />
          }
        </span>
      </button>

      {/* Expanded details */}
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: "auto" }}
            exit={{ height: 0 }}
            transition={{ duration: 0.22, ease }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 border-t border-green-200 pt-3 space-y-2">
              <div className="flex justify-between text-xs text-green-700">
                <span>Total to pay on delivery</span>
                <span className="font-bold">₹{total.toLocaleString("en-IN")}</span>
              </div>
              <div className="h-px bg-green-200 my-1" />
              <ul className="text-xs text-green-700 space-y-1 list-disc list-inside">
                <li>Pay the full amount in cash to the delivery partner.</li>
                <li>COD is available for orders up to ₹5,000.</li>
              </ul>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/* ─────────────────────────────────────────────
   Main checkout client
───────────────────────────────────────────── */
export default function CheckoutClient() {
  const router = useRouter();
  const { items, subtotal, shipping, total, clearCart } = useCart();
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("razorpay");
  const [submitError, setSubmitError] = useState("");
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [appliedCouponCode, setAppliedCouponCode] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [userName, setUserName] = useState("");
  const [userPhone, setUserPhone] = useState("");
  const [defaultAddress, setDefaultAddress] = useState<UserAddress | null>(null);

  // Fetch user profile and auto-fill form
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await fetch("/api/user/profile");
        const data = await response.json();
        
        if (data.success && data.user) {
          setUserEmail(data.user.email);
          setUserName(data.user.name);
          setUserPhone(data.user.phone || "");
          localStorage.setItem("user_email", data.user.email);
          
          // Get default address if available
          if (data.user.addresses && data.user.addresses.length > 0) {
            const defaultAddr = data.user.addresses.find((a: UserAddress) => a.isDefault);
            setDefaultAddress(defaultAddr || data.user.addresses[0]);
          }
        }
      } catch (err) {
        // Silently fail, form can still be filled manually
      }
    };

    fetchUserProfile();
  }, []);

  // Calculate final total with discount (no COD charge)
  const codCharge = 0; // No COD charge
  const finalTotal = Math.max(0, total - couponDiscount + codCharge);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
  } = useForm<FormData>({
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      address: "",
      landmark: "",
      pincode: "",
      city: "",
      state: "",
    },
  });

  // Auto-fill form with user data when available
  useEffect(() => {
    if (userName) {
      setValue("fullName", userName);
    }
    if (userEmail) {
      setValue("email", userEmail);
    }
    if (userPhone) {
      setValue("phone", userPhone);
    }
    if (defaultAddress) {
      setValue("fullName", defaultAddress.fullName);
      setValue("phone", defaultAddress.phone);
      setValue("address", defaultAddress.address);
      setValue("landmark", defaultAddress.landmark || "");
      setValue("city", defaultAddress.city);
      setValue("state", defaultAddress.state);
      setValue("pincode", defaultAddress.pincode);
    }
  }, [userName, userEmail, userPhone, defaultAddress, setValue]);

  /* ── Razorpay flow ──────────────────────────────────────────────────────
     1. Call server to create a Razorpay order (Key Secret stays server-side)
     2. Load checkout.js, open modal with typed options
     3. On success, POST response to /api/payment/verify (HMAC check server-side)
     4. Return the verified payment response for downstream use (e.g. COD)
  ── */
  const handleRazorpay = async (
    data: FormData,
    amountINR: number,
    description = "Personalised Gift Order"
  ): Promise<RazorpayPaymentResponse> => {
    const loaded = await loadRazorpayScript();
    if (!loaded) throw new Error("Could not load payment SDK. Check your connection and try again.");

    const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
    if (!keyId) throw new Error("Payment is not configured. Please contact support.");

    // Create order server-side — Key Secret never leaves the server
    const { data: order } = await axios.post<{
      id: string; amount: number; currency: string;
    }>("/api/payment/create-order", {
      amount:  amountINR,
      receipt: `rcpt_${Date.now()}`,
      notes:   { 
        customerName: data.fullName, 
        customerEmail: data.email,
        couponCode: appliedCouponCode,
        discount: couponDiscount,
      },
    });

    // Open Razorpay modal — typed, no @ts-expect-error needed
    const paymentResponse = await openRazorpayCheckout({
      key:         keyId,
      amount:      order.amount,
      currency:    order.currency,
      name:        "Make My Memory",
      description,
      order_id:    order.id,
      prefill:     { name: data.fullName, email: data.email, contact: `+91${data.phone}` },
      theme:       { color: "#8FBC8F" },
    });

    // Verify signature server-side — HMAC-SHA256 with timing-safe compare
    const { data: verification } = await axios.post<{ success: boolean; error?: string }>(
      "/api/payment/verify",
      {
        razorpay_order_id:   paymentResponse.razorpay_order_id,
        razorpay_payment_id: paymentResponse.razorpay_payment_id,
        razorpay_signature:  paymentResponse.razorpay_signature,
      }
    );

    if (!verification.success) {
      throw new Error(verification.error ?? "Payment verification failed. Please contact support.");
    }

    return paymentResponse;
  };

  /* ── PayPal flow ── */
  const handlePayPal = async (_data: FormData, amountINR: number) => {
    const { data: session } = await axios.post<{ approvalUrl?: string; error?: string }>(
      "/api/payment/paypal/create-order",
      { amount: amountINR }
    );
    if (session.error) throw new Error(session.error);
    if (!session.approvalUrl) throw new Error("PayPal is not configured yet.");
    window.location.href = session.approvalUrl;
  };

  /* ── COD flow ──────────────────────────────────────────────────────────────
     No COD charge — just place the order
  ── */
  const handleCOD = async (data: FormData): Promise<string> => {
    const COD_LIMIT = 5000;
    if (finalTotal > COD_LIMIT) {
      throw new Error(`COD is only available for orders up to ₹${COD_LIMIT.toLocaleString("en-IN")}. Please use Razorpay.`);
    }
    const { data: codResult } = await axios.post<{ success: boolean; orderId?: string; error?: string }>(
      "/api/payment/cod",
      {
        shippingAddress: data,
        items,
        subtotal,
        codCharge: 0,
        total: finalTotal,
        couponCode: appliedCouponCode,
        discount: couponDiscount,
        userId: userEmail,
      }
    );

    if (!codResult.success) {
      throw new Error(codResult.error ?? "Failed to place COD order.");
    }
    return codResult.orderId ?? "";
  };

  /* ── Form submit ── */
  const onSubmit = async (data: FormData) => {
    setSubmitError("");
    try {
      let orderId = "";

      switch (paymentMethod) {
        case "razorpay": {
          const paymentResponse = await handleRazorpay(data, finalTotal);
          const result = await createOrder({
            paymentMethod: "razorpay",
            razorpayOrderId: paymentResponse.razorpay_order_id,
            razorpayPaymentId: paymentResponse.razorpay_payment_id,
            shippingAddress: data,
            items,
            subtotal,
            shippingCharge: shipping,
            total: finalTotal,
            couponCode: appliedCouponCode,
            userId: userEmail,
          });
          orderId = result ?? "";
          break;
        }
        case "paypal":
          await handlePayPal(data, finalTotal);
          break;
        case "cod":
          orderId = await handleCOD(data);
          break;
      }
      clearCart();
      const qs = orderId ? `?method=${paymentMethod}&orderId=${orderId}` : `?method=${paymentMethod}`;
      router.push(`/checkout/success${qs}`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Something went wrong. Please try again.";
      if (msg !== "Payment cancelled") setSubmitError(msg);
    }
  };

  /* ── Create order ── */
  const createOrder = async (orderData: any): Promise<string | undefined> => {
    const { data: orderResult } = await axios.post<{ success: boolean; orderId?: string; error?: string }>(
      "/api/orders",
      orderData
    );
    if (!orderResult.success) {
      throw new Error(orderResult.error ?? "Failed to create order. Payment verified but order not saved.");
    }
    return orderResult.orderId;
  };

  /* ── Empty cart guard ── */
  if (items.length === 0) {
    return (
      <div className="text-center py-24">
        <p className="text-5xl mb-4">🛒</p>
        <p className="text-stone-500 text-base mb-6">Your cart is empty.</p>
        <a href="/shop" className="btn-primary px-8 py-3.5 text-sm">Browse Products</a>
      </div>
    );
  }

  const btnLabel = isSubmitting
    ? "Processing…"
    : paymentMethod === "cod"
      ? `Place COD Order (₹${finalTotal.toLocaleString("en-IN")})`
      : paymentMethod === "paypal"
        ? "Continue to PayPal"
        : `Pay ₹${finalTotal.toLocaleString("en-IN")}`;

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <div className="flex flex-col lg:grid lg:grid-cols-[1fr_400px] gap-6 lg:gap-8 items-start">

        {/* ── LEFT: Details + Payment ── */}
        <div className="flex-1 min-w-0 w-full space-y-6 order-1 lg:order-1">

          {/* ── Section 1: Delivery details ── */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-soft border border-stone-100">
            <div className="flex items-center gap-2.5 mb-6">
              <div className="w-6 h-6 rounded-full bg-ink text-canvas flex items-center
                              justify-center text-xs font-bold shrink-0">
                1
              </div>
              <h2 className="font-semibold text-ink text-base">Delivery Details</h2>
            </div>

            <div className="space-y-4">
              {/* Full name + email */}
              <div className="grid sm:grid-cols-2 gap-4">
                <Field label="Full Name" required error={errors.fullName?.message}>
                  <input
                    {...register("fullName", { required: "Full name is required" })}
                    className="input" placeholder="Priya Sharma"
                    autoComplete="name"
                  />
                </Field>
                <Field label="Email Address" required error={errors.email?.message}>
                  <input
                    type="email"
                    {...register("email", {
                      required: "Email is required",
                      pattern: { value: /^\S+@\S+\.\S+$/, message: "Enter a valid email" },
                    })}
                    className="input" placeholder="priya@example.com"
                    autoComplete="email"
                  />
                </Field>
              </div>

              {/* Phone */}
              <Field
                label="Phone Number" required
                error={errors.phone?.message}
                hint={!errors.phone ? "10-digit mobile number — we'll send order updates here" : undefined}
              >
                <div className="flex">
                  <span className="input rounded-r-none border-r-0 w-14 text-center
                                   text-stone-500 text-sm shrink-0 flex items-center justify-center
                                   bg-stone-100">
                    +91
                  </span>
                  <input
                    type="tel"
                    {...register("phone", {
                      required: "Phone number is required",
                      validate: (val) => {
                        const clean = val.replace(/[\s\-+]/g, "").replace(/^91/, "").replace(/^\+91/, "");
                        return /^[6-9]\d{9}$/.test(clean) || "Enter a valid 10-digit Indian mobile number (starts with 6-9)";
                      },
                    })}
                    className={`input rounded-l-none flex-1 ${errors.phone ? "border-red-300 focus:ring-red-200" : ""}`}
                    placeholder="9876543210"
                    autoComplete="tel"
                    maxLength={13}
                  />
                </div>
              </Field>

              {/* Full address */}
              <Field label="Full Address" required error={errors.address?.message}>
                <textarea
                  {...register("address", { required: "Address is required" })}
                  className="input resize-none" rows={3}
                  placeholder="House / Flat no., Building name, Street, Area"
                  autoComplete="street-address"
                />
              </Field>

              {/* Landmark */}
              <Field label="Landmark" hint="Optional — helps the delivery partner find you">
                <input
                  {...register("landmark")}
                  className="input" placeholder="Near City Mall, Opposite Park…"
                />
              </Field>

              {/* Pincode / City / State */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Field label="Pincode" required error={errors.pincode?.message}>
                  <input
                    {...register("pincode", {
                      required: "Pincode is required",
                      pattern: { value: /^\d{6}$/, message: "Enter a valid 6-digit pincode" },
                    })}
                    className="input" placeholder="400001"
                    autoComplete="postal-code"
                    maxLength={6}
                  />
                </Field>
                <Field label="City" required error={errors.city?.message}>
                  <input
                    {...register("city", { required: "City is required" })}
                    className="input" placeholder="Mumbai"
                    autoComplete="address-level2"
                  />
                </Field>
                <Field label="State" required error={errors.state?.message}>
                  <select
                    {...register("state", { required: "State is required" })}
                    className="input appearance-none"
                    autoComplete="address-level1"
                  >
                    <option value="">Select state…</option>
                    {INDIAN_STATES.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </Field>
              </div>
            </div>
          </div>

          {/* ── Section 1.5: Coupon Code ── */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-soft border border-stone-100">
            <div className="flex items-center gap-2.5 mb-6">
              <div className="w-6 h-6 rounded-full bg-ink text-canvas flex items-center
                              justify-center text-xs font-bold shrink-0">
                ✓
              </div>
              <h2 className="font-semibold text-ink text-base">Apply Coupon (Optional)</h2>
            </div>
            <CouponInput
              subtotal={subtotal}
              items={items.map((item) => ({
                productId: item.product.id,
                category: item.product.category,
                quantity: item.quantity,
              }))}
              userId={userEmail}
              onCouponApplied={(discount, code) => {
                setCouponDiscount(discount);
                setAppliedCouponCode(code);
              }}
              onCouponRemoved={() => {
                setCouponDiscount(0);
                setAppliedCouponCode("");
              }}
            />
          </div>

          {/* ── Section 2: Payment method ── */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-soft border border-stone-100">
            <div className="flex items-center gap-2.5 mb-6">
              <div className="w-6 h-6 rounded-full bg-ink text-canvas flex items-center
                              justify-center text-xs font-bold shrink-0">
                2
              </div>
              <h2 className="font-semibold text-ink text-base">Payment Method</h2>
            </div>

            <div className="space-y-3" role="radiogroup" aria-label="Payment method">

              {/* Razorpay */}
              <PaymentCard
                id="razorpay" selected={paymentMethod === "razorpay"}
                onSelect={() => setPaymentMethod("razorpay")}
                icon={Smartphone} iconColor="bg-sage/10 text-sage-dark"
                title="Razorpay" badge="Recommended"
                subtitle="UPI, Credit / Debit Cards, Net Banking, Wallets"
              >
                <div className="mt-3 flex flex-wrap gap-2">
                  {["UPI", "Visa", "Mastercard", "RuPay", "Net Banking", "Wallets"].map((m) => (
                    <span key={m}
                      className="text-[11px] font-medium bg-stone-100 text-stone-600
                                 px-2.5 py-1 rounded-full">
                      {m}
                    </span>
                  ))}
                </div>
                <p className="text-[11px] text-stone-400 mt-2 flex items-center gap-1">
                  <Lock className="w-3 h-3" /> 256-bit SSL encrypted · PCI-DSS compliant
                </p>
              </PaymentCard>

              {/* PayPal */}
              <PaymentCard
                id="paypal" selected={paymentMethod === "paypal"}
                onSelect={() => setPaymentMethod("paypal")}
                icon={Globe} iconColor="bg-blue-50 text-blue-600"
                title="PayPal"
                subtitle="For international customers — pay in your local currency"
              >
                <p className="text-xs text-stone-500 mt-3">
                  You&apos;ll be redirected to PayPal to complete your payment securely.
                  Currency conversion fees may apply.
                </p>
              </PaymentCard>

              {/* COD */}
              <PaymentCard
                id="cod" selected={paymentMethod === "cod"}
                onSelect={() => setPaymentMethod("cod")}
                icon={Truck} iconColor="bg-amber-50 text-amber-600"
                title="Cash on Delivery"
                subtitle={finalTotal > 5000 ? "Not available for orders above ₹5,000" : "Pay cash when your order arrives at your door"}
              >
                <div className="mt-3 space-y-2">
                  {finalTotal > 5000 ? (
                    <p className="text-xs text-red-500 font-medium">
                      COD is only available for orders up to ₹5,000. Please use Razorpay instead.
                    </p>
                  ) : (
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-stone-500">Total to pay on delivery</span>
                      <span className="font-bold text-ink">
                        ₹{finalTotal.toLocaleString("en-IN")}
                      </span>
                    </div>
                  )}
                </div>
              </PaymentCard>
            </div>

            {/* COD warning — shown prominently when COD is selected */}
            <AnimatePresence>
              {paymentMethod === "cod" && (
                <motion.div
                  key="cod-warning"
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.25, ease }}
                  className="mt-4"
                >
                  <CodWarning total={total} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* ── Submit error ── */}
          {submitError && (
            <div className="flex items-center gap-2.5 bg-red-50 border border-red-200
                            rounded-2xl px-4 py-3">
              <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" />
              <p className="text-sm text-red-600">{submitError}</p>
            </div>
          )}

          {/* ── Submit button ── */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="btn-primary w-full py-4 text-sm"
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10"
                    stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                Processing…
              </span>
            ) : btnLabel}
          </button>

          {/* Security note */}
          <p className="text-center text-xs text-stone-400 flex items-center justify-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5" />
            Your payment and personal data are always secure
          </p>
        </div>

        {/* ── RIGHT: Order summary (sticky on desktop, static on mobile) ── */}
        <aside className="w-full lg:w-[400px] shrink-0 order-3 lg:order-2">
          <CheckoutOrderSummary
            paymentMethod={paymentMethod}
            codAdvance={COD_ADVANCE}
            couponDiscount={couponDiscount}
            finalTotal={finalTotal}
          />
        </aside>
      </div>
    </form>
  );
}

/* ─────────────────────────────────────────────
   Inline order summary (reads from cart context)
───────────────────────────────────────────── */
function CheckoutOrderSummary({
  paymentMethod,
  codAdvance,
  couponDiscount,
  finalTotal,
}: {
  paymentMethod: PaymentMethod;
  codAdvance: number;
  couponDiscount: number;
  finalTotal: number;
}) {
  const { items, subtotal, shipping, total } = useCart();
  const isCOD = paymentMethod === "cod";

  return (
    <div className="bg-white rounded-3xl p-6 shadow-soft border border-stone-100 lg:sticky lg:top-24">
      <h2 className="font-semibold text-ink text-base mb-5">Order Summary</h2>

      {/* Items */}
      <ul className="space-y-3 mb-5">
        {items.map((item) => (
          <li key={item.product.id} className="flex items-center gap-3">
            <div className="w-10 h-10 bg-stone-100 rounded-xl flex items-center
                            justify-center shrink-0 overflow-hidden">
              {item.product.images && item.product.images.length > 0 ? (
                <img
                  src={item.product.images[0]}
                  alt={item.product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-stone-400 text-xs">No Image</span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-ink truncate">{item.product.name}</p>
              <p className="text-[11px] text-stone-400">× {item.quantity}</p>
            </div>
            <p className="text-xs font-bold text-ink shrink-0">
              ₹{(item.product.price * item.quantity).toLocaleString("en-IN")}
            </p>
          </li>
        ))}
      </ul>

      <div className="divider mb-4" />

      {/* Totals */}
      <div className="space-y-2.5 text-sm mb-4">
        <div className="flex justify-between text-stone-500">
          <span>Subtotal</span>
          <span className="text-ink font-medium">₹{subtotal.toLocaleString("en-IN")}</span>
        </div>
        {couponDiscount > 0 && (
          <div className="flex justify-between text-green-600">
            <span>Coupon Discount</span>
            <span className="font-semibold">-₹{couponDiscount.toLocaleString("en-IN")}</span>
          </div>
        )}
        {isCOD && (
          <div className="flex justify-between text-stone-500">
            <span>COD Charge</span>
            <span className="text-amber-700 font-semibold">Free</span>
          </div>
        )}
      </div>

      <div className="divider mb-4" />

      <div className="flex justify-between font-bold text-ink text-base mb-1">
        <span>Order Total</span>
        <span>₹{finalTotal.toLocaleString("en-IN")}</span>
      </div>

      {/* COD breakdown */}
      <AnimatePresence>
        {isCOD && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease }}
            className="overflow-hidden"
          >
            <div className="mt-3 rounded-xl bg-amber-50 border border-amber-200 p-3 space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-amber-700 font-semibold">Subtotal</span>
                <span className="text-amber-800 font-bold">₹{subtotal.toLocaleString("en-IN")}</span>
              </div>
              {couponDiscount > 0 && (
                <div className="flex justify-between text-xs">
                  <span className="text-amber-700">Discount</span>
                  <span className="text-amber-800 font-semibold">-₹{couponDiscount.toLocaleString("en-IN")}</span>
                </div>
              )}
              <div className="flex justify-between text-xs">
                <span className="text-amber-700">COD Charge</span>
                <span className="text-amber-800 font-semibold">Free</span>
              </div>
              <div className="h-px bg-amber-200 my-1" />
              <div className="flex justify-between text-xs font-bold">
                <span className="text-amber-800">Total to Pay</span>
                <span className="text-amber-800">₹{finalTotal.toLocaleString("en-IN")}</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Trust */}
      <div className="mt-5 pt-4 border-t border-stone-100 space-y-2">
        {[
          { icon: <Lock className="w-3.5 h-3.5" />, text: "Secure checkout" },
          { icon: <Truck className="w-3.5 h-3.5" />, text: "Free shipping on all orders" },
          { icon: <RotateCcw className="w-3.5 h-3.5" />, text: "Easy returns & replacements" },
        ].map((b) => (
          <p key={b.text} className="text-[11px] text-stone-400 flex items-center gap-2">
            {b.icon}{b.text}
          </p>
        ))}
      </div>
    </div>
  );
}
