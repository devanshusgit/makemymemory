"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Smartphone, Truck,
  AlertTriangle, Check,
  ShieldCheck, Lock, BadgePercent, ChevronRight, X,
} from "lucide-react";
import axios from "axios";
import { useCart, lineKeyOf } from "@/lib/context/CartContext";
import LineItemDetails from "@/components/cart/LineItemDetails";
import CouponInput from "./CouponInput";
import { calculateOffers, PREPAID_OFFER, COMBO_OFFER, type CheckoutOffer } from "@/lib/coupon/offers";
import {
  loadRazorpayScript,
  openRazorpayCheckout,
  type RazorpayPaymentResponse,
} from "@/lib/utils/razorpay";
import { COD_ADVANCE_INR } from "@/lib/razorpay/validation";

/* ─────────────────────────────────────────────
   Types
───────────────────────────────────────────── */
type PaymentMethod = "razorpay" | "cod";

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
  title, subtitle, amount, children,
}: {
  id: PaymentMethod; selected: boolean; onSelect: () => void;
  icon: React.ElementType; iconColor: string;
  title: string; subtitle: string; amount?: string;
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
          <p className="text-sm font-semibold text-ink">{title}</p>
          <p className="text-xs text-stone-400 mt-0.5">{subtitle}</p>
        </div>

        {amount && <p className="text-sm font-bold text-ink shrink-0">{amount}</p>}
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
   Main checkout client
───────────────────────────────────────────── */
export default function CheckoutClient() {
  const router = useRouter();
  const { items, subtotal, shipping, total, clearCart } = useCart();
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("razorpay");
  const [submitError, setSubmitError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [appliedCouponCode, setAppliedCouponCode] = useState("");
  // Both offers below are opt-in — the customer must apply them, they never
  // silently discount the price on their own.
  const [prepaidApplied, setPrepaidApplied] = useState(false);
  const [comboApplied, setComboApplied]     = useState(false);
  // Orders need an account: guests see a sign-in card instead of the form.
  const [authState, setAuthState] = useState<"checking" | "in" | "out">("checking");
  // Coupons and offers live in a sheet behind one "Apply Coupon Code /
  // Discount Offers" row, so the checkout itself stays simple.
  const [offersOpen, setOffersOpen] = useState(false);
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
          setAuthState("in");
          setUserEmail(data.user.email);
          setUserName(data.user.name);
          setUserPhone(data.user.phone || "");
          localStorage.setItem("user_email", data.user.email);

          if (data.user.addresses && data.user.addresses.length > 0) {
            const defaultAddr = data.user.addresses.find((a: UserAddress) => a.isDefault);
            setDefaultAddress(defaultAddr || data.user.addresses[0]);
          }
        }
        else setAuthState("out");
      } catch (err) {
        setAuthState("out");
      }
    };

    fetchUserProfile();
  }, []);

  const afterCoupon = Math.max(0, total - couponDiscount);
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const comboEligible = itemCount >= 2;
  const prepaidEligible = paymentMethod === "razorpay";
  const offerCodes: CheckoutOffer[] = [];
  if (prepaidEligible && prepaidApplied) offerCodes.push(PREPAID_OFFER);
  if (comboEligible && comboApplied) offerCodes.push(COMBO_OFFER);
  const { prepaidDiscount, comboDiscount } = calculateOffers({ subtotal, itemCount, paymentMethod, offerCodes });
  // COD never includes the prepaid discount, and costs ₹149 extra (the COD
  // charge, paid upfront). Online payment has no extra charge.
  const codTotal = Math.round((Math.max(0, afterCoupon - comboDiscount) + COD_ADVANCE_INR) * 100) / 100;
  const finalTotal = paymentMethod === "cod"
    ? codTotal
    : Math.max(0, Math.round((afterCoupon - prepaidDiscount - comboDiscount) * 100) / 100);

  // Un-apply an offer the moment it stops being eligible (payment method
  // cart dropped back under 2 items, or Pay Online was switched off).
  useEffect(() => {
    if (!prepaidEligible) setPrepaidApplied(false);
  }, [prepaidEligible]);
  useEffect(() => {
    if (!comboEligible) setComboApplied(false);
  }, [comboEligible]);

  // What each payment row shows. Pay Online includes the prepaid 5% only
  // once the customer has applied it.
  const onlineTotal = paymentMethod === "razorpay"
    ? finalTotal
    : Math.max(0, Math.round((afterCoupon - comboDiscount) * 100) / 100);

  // COD advance = the ₹149 COD charge, paid online upfront.
  const codAdvance = Math.min(COD_ADVANCE_INR, codTotal);

  const {
    register,
    watch,
    handleSubmit,
    formState: { errors },
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

  const customerEmail = watch("email") || userEmail;

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

  /* ── Create order (Razorpay path) ── */
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

  /* ── Razorpay flow ──────────────────────────────────────────────────────
     1. Call server to create a Razorpay order (Key Secret stays server-side)
     2. Load checkout.js, open modal with typed options
     3. On success, POST response to /api/payment/verify (HMAC check server-side)
     4. Return the verified payment response so the caller can create the order
  ── */
  const handleRazorpay = async (
    data: FormData,
    amountINR: number,
    description = "Personalised Gift Order"
  ): Promise<RazorpayPaymentResponse> => {
    const loaded = await loadRazorpayScript();
    if (!loaded) throw new Error("Could not load payment SDK. Check your connection and try again.");

    // Create order server-side — Key Secret never leaves the server
    const { data: order } = await axios.post<{
      id: string; amount: number; currency: string; keyId?: string;
    }>("/api/payment/create-order", {
      amount:  amountINR,
      paymentMethod, subtotal, shippingCharge: shipping, items,
      couponCode: appliedCouponCode, offerCodes, userId: data.email,
      receipt: `rcpt_${Date.now()}`,
      notes: {
        customerName:  data.fullName,
        customerEmail: data.email,
        couponCode:    appliedCouponCode,
        discount:      couponDiscount,
      },
    });

    // Use the key the server created this order with. The build-time
    // NEXT_PUBLIC_ value is only a fallback for an older server response: it
    // is baked in when the site is built, so it goes stale the moment the keys
    // change, and it is a second copy that can silently disagree with the
    // server's — which is exactly how checkout broke twice.
    const keyId = order.keyId || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
    if (!keyId) throw new Error("Payment is not configured. Please contact support.");

    // Open Razorpay modal — typed, no @ts-expect-error needed
    const paymentResponse = await openRazorpayCheckout({
      key:         keyId,
      amount:      order.amount,
      currency:    order.currency,
      name:        "Make My Memory",
      description,
      order_id:    order.id,
      prefill:     { name: data.fullName, email: data.email, contact: `+91${data.phone}` },
      theme:       { color: "#C9A84C" },
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

  /* ── COD flow ──────────────────────────────────────────────────────────────
     COD still takes a small ₹149 advance upfront via Razorpay (same modal +
     verify step as the online path, just for a fixed amount) — only the
     remaining balance is paid in cash on delivery.
  ── */
  const handleCOD = async (data: FormData): Promise<string> => {
    const advance = Math.min(COD_ADVANCE_INR, finalTotal);
    const paymentResponse = await handleRazorpay(data, advance, "COD Advance Payment");

    const { data: codResult } = await axios.post<{ success: boolean; orderId?: string; error?: string }>(
      "/api/payment/cod",
      {
        razorpayOrderId:   paymentResponse.razorpay_order_id,
        razorpayPaymentId: paymentResponse.razorpay_payment_id,
        razorpaySignature: paymentResponse.razorpay_signature,
        shippingAddress:   data,
        items,
        subtotal,
        shippingCharge: shipping,
        total: finalTotal,
        couponCode: appliedCouponCode,
        offerCodes,
        userId: data.email,
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
    setIsSubmitting(true);
    try {
      let orderId = "";

      if (paymentMethod === "razorpay") {
        const paymentResponse = await handleRazorpay(data, finalTotal);
        const result = await createOrder({
          paymentMethod:      "razorpay",
          razorpayOrderId:    paymentResponse.razorpay_order_id,
          razorpayPaymentId:  paymentResponse.razorpay_payment_id,
          razorpaySignature:  paymentResponse.razorpay_signature,
          shippingAddress:    data,
          items,
          subtotal,
          shippingCharge:     shipping,
          total:              finalTotal,
          couponCode:         appliedCouponCode,
          offerCodes,
          userId:             data.email,
        });
        orderId = result ?? "";
      } else {
        orderId = await handleCOD(data);
      }

      clearCart();
      const remainingQs = paymentMethod === "cod" ? `&remaining=${finalTotal - codAdvance}` : "";
      router.push(`/checkout/success?method=${paymentMethod}&orderId=${orderId}${remainingQs}`);
    } catch (err) {
      const msg = axios.isAxiosError<{ error?: string }>(err)
        ? err.response?.data?.error ?? err.message
        : err instanceof Error ? err.message : "Something went wrong. Please try again.";
      if (msg !== "Payment cancelled") setSubmitError(msg);
      setIsSubmitting(false);
    }
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
      ? `Pay ₹${codAdvance.toLocaleString("en-IN")} COD Charge`
      : `Pay ₹${finalTotal.toLocaleString("en-IN")}`;

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <div className="flex flex-col lg:grid lg:grid-cols-[1fr_400px] gap-6 lg:gap-8 items-start">

        {/* ── LEFT: Details + Payment ── */}
        {authState !== "in" ? (
        <div className="flex-1 min-w-0 w-full order-1 lg:order-1">
          <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-soft border border-stone-100 text-center">
            {authState === "checking" ? (
              <p className="text-sm text-stone-500 py-8">Loading…</p>
            ) : (
              <>
                <Lock className="w-8 h-8 mx-auto mb-4 text-[#A07C2E]" strokeWidth={1.75} />
                <h2 className="font-serif font-bold text-ink text-2xl mb-2">Sign in to place your order</h2>
                <p className="text-sm text-stone-500 mb-6 max-w-sm mx-auto">
                  Please sign in or create an account to continue to payment. Your cart is saved.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <a href="/login?redirect=/checkout"
                    className="inline-flex items-center justify-center px-8 py-3.5 rounded-full text-sm font-semibold bg-ink text-canvas">
                    Sign In
                  </a>
                  <a href="/login?mode=signup&redirect=/checkout"
                    className="inline-flex items-center justify-center px-8 py-3.5 rounded-full text-sm font-semibold"
                    style={{ border: "1.5px solid #C9A84C", color: "#A07C2E" }}>
                    Create Account
                  </a>
                </div>
              </>
            )}
          </div>
        </div>
        ) : (
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
                        let clean = val.replace(/[\s\-+]/g, "");
                        // Only strip a "91" country-code prefix when it's clearly one (12 digits
                        // total) — otherwise a number that legitimately starts with 91 (e.g.
                        // 9145586706) gets wrongly truncated to 8 digits and fails below.
                        if (clean.length === 12 && clean.startsWith("91")) {
                          clean = clean.slice(2);
                        }
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

          {/* ── Coupons & offers: one row, opens a sheet ── */}
          <button
            type="button"
            onClick={() => setOffersOpen(true)}
            disabled={isSubmitting}
            className="w-full bg-white rounded-3xl px-6 py-5 sm:px-8 shadow-soft border border-stone-100
                       flex items-center gap-4 text-left hover:border-stone-200 transition-colors"
          >
            <BadgePercent className="w-6 h-6 text-[#A07C2E] shrink-0" strokeWidth={1.75} />
            <span className="flex-1 min-w-0">
              <span className="block text-sm sm:text-base font-semibold text-ink">Apply Coupon Code / Discount Offers</span>
              <span className={`block text-xs mt-0.5 ${couponDiscount + prepaidDiscount + comboDiscount > 0 ? "text-green-600 font-semibold" : "text-stone-400"}`}>
                {couponDiscount + prepaidDiscount + comboDiscount > 0
                  ? `You save ₹${(couponDiscount + prepaidDiscount + comboDiscount).toLocaleString("en-IN")}`
                  : "You can apply coupons inside"}
              </span>
            </span>
            <ChevronRight className="w-5 h-5 text-stone-400 shrink-0" />
          </button>

          <AnimatePresence>
            {offersOpen && (
              <motion.div
                key="offers-sheet"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center bg-black/50 sm:px-4"
                onClick={(e) => { if (e.target === e.currentTarget) setOffersOpen(false); }}
              >
                <motion.div
                  initial={{ y: 40 }} animate={{ y: 0 }} exit={{ y: 40 }}
                  transition={{ duration: 0.25, ease }}
                  role="dialog" aria-modal="true" aria-label="Coupons and offers"
                  className="w-full sm:max-w-lg bg-white rounded-t-3xl sm:rounded-3xl max-h-[85vh] flex flex-col"
                >
                  <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100">
                    <h2 className="font-semibold text-ink text-base">Coupons &amp; Offers</h2>
                    <button type="button" onClick={() => setOffersOpen(false)} aria-label="Close"
                      className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-stone-100">
                      <X className="w-4 h-4 text-stone-500" />
                    </button>
                  </div>
                  <div className="p-6 overflow-y-auto">
                    <CouponInput
                      subtotal={subtotal}
                      items={items.map((item) => ({
                        productId: item.product.id,
                        category: item.product.category,
                        quantity: item.quantity,
                      }))}
                      userId={customerEmail}
                      paymentMethod={paymentMethod}
                      disabled={isSubmitting}
                      offerCodes={offerCodes}
                      onOfferToggle={(code) => {
                        if (code === PREPAID_OFFER) setPrepaidApplied(value => !value);
                        if (code === COMBO_OFFER) setComboApplied(value => !value);
                      }}
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
                  <div className="px-6 pb-6">
                    <button type="button" onClick={() => setOffersOpen(false)}
                      className="w-full py-3 rounded-full text-sm font-semibold bg-ink text-canvas">
                      Done
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

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
                onSelect={() => { if (!isSubmitting) setPaymentMethod("razorpay"); }}
                icon={Smartphone} iconColor="bg-[#C9A84C]/10 text-[#A07C2E]"
                title="Pay Online"
                subtitle="UPI, Credit / Debit Card, Net Banking, Wallets"
                amount={`₹${onlineTotal.toLocaleString("en-IN")}`}
              />

              {/* COD */}
              <PaymentCard
                id="cod" selected={paymentMethod === "cod"}
                onSelect={() => { if (!isSubmitting) setPaymentMethod("cod"); }}
                icon={Truck} iconColor="bg-amber-50 text-amber-600"
                title="Partial Cash on Delivery"
                subtitle={`Pay ₹${codAdvance.toLocaleString("en-IN")} now and rest on delivery`}
                amount={`₹${codTotal.toLocaleString("en-IN")}`}
              />
            </div>
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

        )}

        {/* ── RIGHT: Order summary (sticky on desktop, static on mobile) ── */}
        <aside className="w-full lg:w-[400px] shrink-0 order-3 lg:order-2">
          <CheckoutOrderSummary
            paymentMethod={paymentMethod}
            couponDiscount={couponDiscount}
            prepaidDiscount={prepaidDiscount}
            comboDiscount={comboDiscount}
            codAdvance={codAdvance}
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
  couponDiscount,
  prepaidDiscount,
  comboDiscount,
  codAdvance,
  finalTotal,
}: {
  paymentMethod: PaymentMethod;
  couponDiscount: number;
  prepaidDiscount: number;
  comboDiscount: number;
  codAdvance: number;
  finalTotal: number;
}) {
  const { items, subtotal } = useCart();
  const isCOD = paymentMethod === "cod";

  return (
    <div className="bg-white rounded-3xl p-6 shadow-soft border border-stone-100 lg:sticky lg:top-24">
      <h2 className="font-semibold text-ink text-base mb-5">Order Summary</h2>

      {/* Items */}
      <ul className="space-y-3 mb-5">
        {items.map((item) => {
          const addOns = item.surcharges?.total || 0;
          // Line total INCLUDING the customisation add-ons. It used to show the
          // base price only, so the lines never added up to the subtotal.
          const lineTotal = (item.product.price + addOns) * item.quantity;
          return (
            <li key={lineKeyOf(item)} className="flex items-start gap-3">
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
                <div className="flex items-start justify-between gap-2">
                  <p className="text-xs font-semibold text-ink">{item.product.name}</p>
                  <p className="text-xs font-bold text-ink shrink-0">
                    ₹{lineTotal.toLocaleString("en-IN")}
                  </p>
                </div>
                <p className="text-[11px] text-stone-400">
                  Qty {item.quantity} · Base ₹{item.product.price.toLocaleString("en-IN")}
                  {addOns > 0 && ` + ₹${addOns.toLocaleString("en-IN")} customisation`}
                </p>
                <LineItemDetails selections={item.selections} customization={item.customization} />
              </div>
            </li>
          );
        })}
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
        {comboDiscount > 0 && (
          <div className="flex justify-between text-green-600">
            <span>Buy 2 Offer (5%)</span>
            <span className="font-semibold">-₹{comboDiscount.toLocaleString("en-IN")}</span>
          </div>
        )}
        {prepaidDiscount > 0 && (
          <div className="flex justify-between text-green-600">
            <span>Prepaid Discount (5%)</span>
            <span className="font-semibold">-₹{prepaidDiscount.toLocaleString("en-IN")}</span>
          </div>
        )}
        {isCOD && (
          <div className="flex justify-between text-stone-500">
            <span>COD Charge</span>
            <span className="text-ink font-medium">+₹{codAdvance.toLocaleString("en-IN")}</span>
          </div>
        )}
      </div>

      <div className="divider mb-4" />

      <div className="flex justify-between font-bold text-ink text-base mb-1">
        <span>Order Total</span>
        <span>₹{finalTotal.toLocaleString("en-IN")}</span>
      </div>

      {/* COD advance/remaining breakdown */}
      {isCOD && (
        <div className="mt-3 rounded-xl bg-amber-50 border border-amber-200 p-3 space-y-1.5">
          <div className="flex justify-between text-xs">
            <span className="text-amber-700 font-semibold">COD charge (pay now)</span>
            <span className="text-amber-800 font-bold">₹{codAdvance.toLocaleString("en-IN")}</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-amber-700 font-semibold">Remaining (on delivery)</span>
            <span className="text-amber-800 font-bold">₹{(finalTotal - codAdvance).toLocaleString("en-IN")}</span>
          </div>
        </div>
      )}

      {/* Trust */}
      <div className="mt-5 pt-4 border-t border-stone-100 space-y-2">
        {[
          { icon: <Lock className="w-3.5 h-3.5" />, text: "Secure checkout" },
          { icon: <Truck className="w-3.5 h-3.5" />, text: "Free shipping on all orders" },
        ].map((b) => (
          <p key={b.text} className="text-[11px] text-stone-400 flex items-center gap-2">
            {b.icon}{b.text}
          </p>
        ))}
      </div>
    </div>
  );
}
