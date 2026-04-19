"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { CheckCircle2, Truck, Clock, Mail } from "lucide-react";
import { Suspense } from "react";

const ease = [0.4, 0, 0.2, 1] as const;
const COD_ADVANCE = 150;

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
    sub: `Your ₹${COD_ADVANCE} advance payment was received. Pay the remaining amount in cash on delivery.`,
    badge: "Cash on Delivery",
  },
};

function SuccessContent() {
  const params = useSearchParams();
  const method = (params.get("method") ?? "razorpay") as keyof typeof METHOD_COPY;
  const copy   = METHOD_COPY[method] ?? METHOD_COPY.razorpay;
  const isCOD  = method === "cod";

  return (
    <div className="bg-canvas min-h-screen flex items-center justify-center px-4 py-20">
      <div className="w-full max-w-lg">

        <motion.div
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, type: "spring", stiffness: 200 }}
          className="w-20 h-20 bg-sage/15 rounded-full flex items-center justify-center
                     text-4xl mx-auto mb-8"
        >
          {copy.icon}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.15, ease }}
          className="text-center mb-8"
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

        {/* What happens next */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.28, ease }}
          className="bg-white rounded-3xl p-6 shadow-soft border border-stone-100 mb-6"
        >
          <h2 className="font-semibold text-ink text-sm mb-4">What happens next</h2>
          <ul className="space-y-3">
            {[
              { Icon: Mail,  color: "bg-sage/10 text-sage-dark",
                title: "Confirmation email",
                desc: "You'll receive an order confirmation at your email address." },
              { Icon: Clock, color: "bg-stone-100 text-stone-600",
                title: "Production begins",
                desc: "We start crafting your personalised item within 1–2 business days." },
              { Icon: Truck,
                color: isCOD ? "bg-amber-50 text-amber-600" : "bg-sage/10 text-sage-dark",
                title: isCOD ? "Delivery & cash payment" : "Shipped to your door",
                desc: isCOD
                  ? `Pay the remaining amount in cash when your order arrives. Your ₹${COD_ADVANCE} advance has been adjusted.`
                  : "Your order will be delivered in 3–5 business days with a tracking link." },
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

        {/* COD reminder */}
        {isCOD && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.38, ease }}
            className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-4 mb-6
                       flex items-start gap-3"
          >
            <CheckCircle2 className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" strokeWidth={2} />
            <div>
              <p className="text-sm font-bold text-amber-800">₹{COD_ADVANCE} advance received</p>
              <p className="text-xs text-amber-700 mt-0.5 leading-relaxed">
                This amount will be adjusted in your final bill. Pay the remaining
                amount in cash to the delivery partner.
              </p>
            </div>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.42, ease }}
          className="flex flex-col sm:flex-row gap-3"
        >
          <Link href="/shop" className="btn-primary flex-1 py-4 text-sm justify-center">
            Continue Shopping
          </Link>
          <Link href="/" className="btn-outline flex-1 py-4 text-sm justify-center">
            Back to Home
          </Link>
        </motion.div>
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
