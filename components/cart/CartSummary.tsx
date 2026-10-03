"use client";

import Link from "next/link";
import { ArrowRight, ShieldCheck, Truck } from "lucide-react";
import { useCart } from "@/lib/context/CartContext";

const TRUST_BADGES = [
  { Icon: ShieldCheck, text: "Secure payment" },
  { Icon: Truck,       text: "Free delivery all across India" },
];

export default function CartSummary() {
  const { items, subtotal, shipping, total } = useCart();

  return (
    <div className="bg-white rounded-3xl p-6 shadow-soft border border-stone-100 sticky top-24">
      <h2 className="font-semibold text-ink text-base mb-5">Order Summary</h2>

      {/* Delivery is free on every order, so there is no threshold to reach. */}
      {items.length > 0 && (
        <p className="mb-5 p-3.5 bg-stone-50 rounded-2xl border border-stone-100 text-xs font-semibold text-sage-dark">
          🎉 Free delivery all across India
        </p>
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
      <div className="mt-5 pt-5 border-t border-stone-100 grid grid-cols-1 sm:grid-cols-3 gap-2">
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
