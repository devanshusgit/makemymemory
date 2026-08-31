"use client";

import { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import {
  Truck, AlertTriangle, ShieldCheck, Lock, RotateCcw,
} from "lucide-react";
import axios from "axios";
import { useCart } from "@/lib/context/CartContext";
import { buildOrderWhatsAppUrl } from "@/lib/utils/whatsapp";

/* ─────────────────────────────────────────────
   Types
───────────────────────────────────────────── */
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
   Main checkout client
───────────────────────────────────────────── */
export default function CheckoutClient() {
  const router = useRouter();
  const { items, subtotal, shipping, total, clearCart } = useCart();
  const [submitError, setSubmitError] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [userName, setUserName] = useState("");
  const [userPhone, setUserPhone] = useState("");
  const [defaultAddress, setDefaultAddress] = useState<UserAddress | null>(null);
  const submittingRef = useRef(false);

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

  const finalTotal = total;

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

  /* ── Create order ── */
  const createOrder = async (orderData: any): Promise<string | undefined> => {
    const { data: orderResult } = await axios.post<{ success: boolean; orderId?: string; error?: string }>(
      "/api/orders",
      orderData
    );
    if (!orderResult.success) {
      throw new Error(orderResult.error ?? "Failed to create order.");
    }
    return orderResult.orderId;
  };

  /* ── Form submit ──────────────────────────────────────────────────────────
     Order is saved as "pending_payment", then the customer is routed to the
     success page where a real click sends them to WhatsApp to pay — doing the
     wa.me redirect here (after an awaited request) risks a popup blocker.
  ── */
  const onSubmit = async (data: FormData) => {
    if (submittingRef.current) return;
    submittingRef.current = true;
    setSubmitError("");
    try {
      const orderId = await createOrder({
        paymentMethod: "whatsapp",
        shippingAddress: data,
        items,
        subtotal,
        shippingCharge: shipping,
        total: finalTotal,
        userId: userEmail,
      });

      if (!orderId) {
        throw new Error("Failed to create order. Please try again.");
      }

      const waUrl = buildOrderWhatsAppUrl({
        orderId,
        items: items.map((item) => ({ name: item.product.name, quantity: item.quantity })),
        total: finalTotal,
        shippingAddress: data,
      });

      clearCart();
      router.push(`/checkout/success?orderId=${orderId}&wa=${encodeURIComponent(waUrl)}`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Something went wrong. Please try again.";
      setSubmitError(msg);
      submittingRef.current = false;
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
    : `Place Order (₹${finalTotal.toLocaleString("en-IN")})`;

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <div className="flex flex-col lg:grid lg:grid-cols-[1fr_400px] gap-6 lg:gap-8 items-start">

        {/* ── LEFT: Details ── */}
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

          {/* ── Section 2: Payment ── */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-soft border border-stone-100">
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-6 h-6 rounded-full bg-ink text-canvas flex items-center
                              justify-center text-xs font-bold shrink-0">
                2
              </div>
              <h2 className="font-semibold text-ink text-base">Payment via WhatsApp</h2>
            </div>
            <p className="text-sm text-stone-500 leading-relaxed">
              After placing your order, you&apos;ll be sent to WhatsApp to complete payment
              directly with us. Your order is confirmed as soon as we receive it.
            </p>
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
            Your personal data is always secure
          </p>
        </div>

        {/* ── RIGHT: Order summary (sticky on desktop, static on mobile) ── */}
        <aside className="w-full lg:w-[400px] shrink-0 order-3 lg:order-2">
          <CheckoutOrderSummary
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
  finalTotal,
}: {
  finalTotal: number;
}) {
  const { items, subtotal } = useCart();

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
      </div>

      <div className="divider mb-4" />

      <div className="flex justify-between font-bold text-ink text-base mb-1">
        <span>Order Total</span>
        <span>₹{finalTotal.toLocaleString("en-IN")}</span>
      </div>

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
