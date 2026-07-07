"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { CheckCircle2, Truck, Clock, Mail, Copy, Check, Package, MapPin, Printer } from "lucide-react";
import { Suspense, useState } from "react";

const ease = [0.4, 0, 0.2, 1] as const;

const METHOD_COPY = {
  razorpay: {
    icon: "🎉",
    heading: "Payment Successful!",
    sub: "Your payment was processed securely. We'll start crafting your memory right away.",
    badge: null,
  },
  paypal: {
    icon: "🎉",
    heading: "Payment Successful!",
    sub: "Your PayPal payment was confirmed. We'll start crafting your memory right away.",
    badge: null,
  },
  cod: {
    icon: "📦",
    heading: "Order Placed!",
    sub: "Your order has been confirmed. Pay in cash when your order arrives at your door.",
    badge: "Cash on Delivery",
  },
};

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };
  return (
    <button
      onClick={handleCopy}
      className="ml-2 inline-flex items-center gap-1 text-xs text-stone-400 hover:text-ink transition-colors"
      title="Copy Order ID"
    >
      {copied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
    </button>
  );
}

function SuccessContent() {
  const params = useSearchParams();
  const method  = (params.get("method") ?? "razorpay") as keyof typeof METHOD_COPY;
  const orderId = params.get("orderId") ?? "";
  const copy    = METHOD_COPY[method] ?? METHOD_COPY.razorpay;
  const isCOD   = method === "cod";

  return (
    <div className="bg-canvas min-h-screen px-4 py-12 sm:py-20">
      <div className="w-full max-w-2xl mx-auto">

        {/* ── Hero ── */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, type: "spring", stiffness: 200 }}
            className="w-20 h-20 bg-sage/15 rounded-full flex items-center justify-center
                       text-4xl mx-auto mb-6"
          >
            {copy.icon}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.15, ease }}
          >
            {copy.badge && (
              <span className="inline-block bg-amber-100 text-amber-700 text-xs font-bold
                               tracking-wide uppercase px-3 py-1 rounded-full mb-3">
                {copy.badge}
              </span>
            )}
            <h1 className="section-heading mb-3">{copy.heading}</h1>
            <p className="text-stone-500 leading-relaxed text-sm sm:text-base max-w-md mx-auto">
              {copy.sub}
            </p>
          </motion.div>
        </div>

        {/* ── Order ID Banner ── */}
        {orderId && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.2, ease }}
            className="bg-ink text-canvas rounded-2xl p-5 mb-6 flex items-center justify-between"
          >
            <div>
              <p className="text-xs text-stone-400 mb-1">Your Order ID</p>
              <p className="font-mono font-bold text-xl tracking-widest">{orderId}</p>
              <p className="text-xs text-stone-400 mt-1">Save this for tracking your order</p>
            </div>
            <div className="flex flex-col items-end gap-2">
              <CopyButton text={orderId} />
              <Link
                href={`/track?orderId=${orderId}`}
                className="text-xs bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded-full transition-colors"
              >
                Track →
              </Link>
            </div>
          </motion.div>
        )}

        {/* ── What Happens Next ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.28, ease }}
          className="bg-white rounded-3xl p-6 shadow-soft border border-stone-100 mb-5"
        >
          <h2 className="font-semibold text-ink text-sm mb-4">What happens next</h2>
          <ul className="space-y-3">
            {[
              { Icon: Mail,  color: "bg-sage/10 text-sage-dark",
                title: "Confirmation email sent",
                desc: "Check your inbox — we've sent your order details and receipt." },
              { Icon: Clock, color: "bg-stone-100 text-stone-600",
                title: "Production begins within 24h",
                desc: "We start crafting your personalised item right away." },
              { Icon: Truck,
                color: isCOD ? "bg-amber-50 text-amber-600" : "bg-sage/10 text-sage-dark",
                title: isCOD ? "Delivery & cash payment" : "Delivered in 3–5 business days",
                desc: isCOD
                  ? "Pay the full amount in cash when your order arrives."
                  : "You'll receive a tracking link once your order ships." },
            ].map(({ Icon, color, title, desc }) => (
              <li key={title} className="flex items-start gap-3">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${color}`}>
                  <Icon className="w-3.5 h-3.5" strokeWidth={1.75} />
                </div>
                <div>
                  <p className="text-xs font-semibold text-ink">{title}</p>
                  <p className="text-xs text-stone-400 mt-0.5 leading-relaxed">{desc}</p>
                </div>
              </li>
            ))}
          </ul>
        </motion.div>

        {/* ── COD payment reminder ── */}
        {isCOD && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.35, ease }}
            className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-5 flex items-start gap-3"
          >
            <Package className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-amber-800">Keep cash ready on delivery</p>
              <p className="text-xs text-amber-700 mt-0.5">
                No advance payment required. Pay the full amount to the delivery partner when your order arrives.
              </p>
            </div>
          </motion.div>
        )}

        {/* ── Actions ── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.42, ease }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5"
        >
          <Link href="/shop" className="btn-primary py-3.5 text-sm text-center">
            Continue Shopping
          </Link>
          {orderId && (
            <Link
              href={`/track?orderId=${orderId}`}
              className="btn-outline py-3.5 text-sm text-center flex items-center justify-center gap-2"
            >
              <MapPin className="w-3.5 h-3.5" /> Track Order
            </Link>
          )}
          <Link
            href="/account"
            className="btn-outline py-3.5 text-sm text-center flex items-center justify-center gap-2"
          >
            <Package className="w-3.5 h-3.5" /> My Orders
          </Link>
        </motion.div>

        {/* Print hint */}
        <p className="text-center text-xs text-stone-400">
          A confirmation email has been sent · <button onClick={() => window.print()} className="underline hover:text-ink transition-colors inline-flex items-center gap-1"><Printer className="w-3 h-3" /> Print this page</button>
        </p>
      </div>
    </div>
  );
}

export default function SuccessClient() {
  return (
    <Suspense fallback={
      <div className="bg-canvas min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-sage border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <SuccessContent />
    </Suspense>
  );
}
