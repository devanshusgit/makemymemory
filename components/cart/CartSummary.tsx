"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, ShieldCheck, Truck, RotateCcw } from "lucide-react";
import { useCart } from "@/lib/context/CartContext";

const FREE_SHIPPING = 999;
const ease = [0.4, 0, 0.2, 1] as const;

const TRUST_BADGES = [
  { Icon: ShieldCheck, text: "Secure payment" },
  { Icon: Truck,       text: "Free shipping ₹999+" },
  { Icon: RotateCcw,   text: "Easy returns" },
];

export default function CartSummary() {
  const { items, subtotal, shipping, total } = useCart();

  const toFreeShipping = Math.max(0, FREE_SHIPPING - subtotal);
  const progressPct    = Math.min((subtotal / FREE_SHIPPING) * 100, 100);

  return (
    <div className="bg-white rounded-3xl p-6 shadow-soft border border-stone-100 sticky top-24">
      <h2 className="font-semibold text-ink text-base mb-5">Order Summary</h2>

      {/* Free shipping progress */}
      {items.length > 0 && (
        <div className="mb-5 p-3.5 bg-stone-50 rounded-2xl border border-stone-100">
          {toFreeShipping > 0 ? (
            <p className="text-xs text-stone-500 mb-2">
              Add{" "}
              <span className="font-semibold text-ink">
                ₹{toFreeShipping.toLocaleString("en-IN")}
              </span>{" "}
              more for free shipping
            </p>
          ) : (
            <p className="text-xs font-semibold text-sage-dark mb-2">
              🎉 You&apos;ve unlocked free shipping!
            </p>
          )}
          <div className="h-1.5 bg-stone-200 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-sage rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progressPct}%` }}
              transition={{ duration: 0.6, ease }}
            />
          </div>
        </div>
      )}

      {/* Line items */}
      <div className="space-y-3 text-sm mb-5">
        <div className="flex justify-between text-stone-500">
          <span>Subtotal</span>
          <span className="text-ink font-medium">
            ₹{subtotal.toLocaleString("en-IN")}
          </span>
        </div>
        <div className="flex justify-between text-stone-500">
          <span>Shipping</span>
          <span className={shipping === 0 ? "text-sage-dark font-semibold" : "text-ink font-medium"}>
            {shipping === 0 ? "Free" : `₹${shipping}`}
          </span>
        </div>
      </div>

      <div className="divider mb-5" />

      <div className="flex justify-between font-bold text-ink text-base mb-6">
        <span>Total</span>
        <span>₹{total.toLocaleString("en-IN")}</span>
      </div>

      {/* CTA */}
      <Link
        href="/checkout"
        className={`btn-primary w-full py-4 text-sm group
                    ${items.length === 0 ? "pointer-events-none opacity-40" : ""}`}
        aria-disabled={items.length === 0}
        tabIndex={items.length === 0 ? -1 : 0}
      >
        Proceed to Checkout
        <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
      </Link>

      {/* Trust badges */}
      <div className="mt-5 pt-5 border-t border-stone-100 grid grid-cols-3 gap-2">
        {TRUST_BADGES.map(({ Icon, text }) => (
          <div key={text} className="flex flex-col items-center gap-1.5 text-center">
            <div className="w-7 h-7 rounded-xl bg-stone-50 flex items-center justify-center">
              <Icon className="w-3.5 h-3.5 text-stone-400" strokeWidth={1.75} />
            </div>
            <p className="text-[10px] text-stone-400 leading-tight">{text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
