"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { CheckCircle2, Clock, MessageCircle, Copy, Check, Package, MapPin, Printer } from "lucide-react";
import { Suspense, useEffect, useState } from "react";

const ease = [0.4, 0, 0.2, 1] as const;

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
  const params  = useSearchParams();
  const orderId = params.get("orderId") ?? "";
  const waUrl   = params.get("wa") ?? "";

  // Best-effort convenience redirect for a fresh landing — the <a> button
  // below is the guaranteed fallback if a popup blocker eats this.
  useEffect(() => {
    if (waUrl) {
      window.open(waUrl, "_blank");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
            📝
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.15, ease }}
          >
            <span className="inline-block bg-amber-100 text-amber-700 text-xs font-bold
                             tracking-wide uppercase px-3 py-1 rounded-full mb-3">
              Awaiting Payment
            </span>
            <h1 className="section-heading mb-3">Order Received!</h1>
            <p className="text-stone-500 leading-relaxed text-sm sm:text-base max-w-md mx-auto">
              We&apos;ve saved your order — now confirm payment on WhatsApp so we can start crafting it.
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

        {/* ── WhatsApp CTA ── */}
        {waUrl && (
          <motion.a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.25, ease }}
            className="btn-primary w-full py-4 text-sm mb-6 flex items-center justify-center gap-2"
          >
            <MessageCircle className="w-4 h-4" />
            Confirm Payment on WhatsApp
          </motion.a>
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
              { Icon: MessageCircle, color: "bg-sage/10 text-sage-dark",
                title: "Confirm on WhatsApp",
                desc: "Send the pre-filled message so we know you're ready to pay." },
              { Icon: CheckCircle2, color: "bg-stone-100 text-stone-600",
                title: "We confirm your order",
                desc: "Once payment's received, we'll mark your order confirmed." },
              { Icon: Clock, color: "bg-sage/10 text-sage-dark",
                title: "Production begins",
                desc: "We start crafting your personalised item right after confirmation." },
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
          <button onClick={() => window.print()} className="underline hover:text-ink transition-colors inline-flex items-center gap-1"><Printer className="w-3 h-3" /> Print this page</button>
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
