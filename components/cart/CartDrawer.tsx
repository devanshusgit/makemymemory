"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { X, ShoppingBag, Trash2, Plus, Minus, ArrowRight } from "lucide-react";
import { useCart, calcSubtotal } from "@/lib/context/CartContext";

const FREE_SHIPPING = 999;
const ease = [0.4, 0, 0.2, 1] as const;

export default function CartDrawer() {
  const {
    items,
    isDrawerOpen,
    closeDrawer,
    removeItem,
    updateQty,
    subtotal,
    shipping,
    total,
  } = useCart();

  /* Lock body scroll while drawer is open */
  useEffect(() => {
    document.body.style.overflow = isDrawerOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isDrawerOpen]);

  /* Close on Escape */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeDrawer();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [closeDrawer]);

  const toFreeShipping = Math.max(0, FREE_SHIPPING - subtotal);
  const progressPct    = Math.min((subtotal / FREE_SHIPPING) * 100, 100);

  return (
    <AnimatePresence>
      {isDrawerOpen && (
        <>
          {/* ── Backdrop ── */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-50 bg-ink/30 backdrop-blur-sm"
            onClick={closeDrawer}
            aria-hidden="true"
          />

          {/* ── Drawer panel ── */}
          <motion.aside
            key="drawer"
            role="dialog"
            aria-modal="true"
            aria-label="Shopping cart"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 340, damping: 34 }}
            className="fixed top-0 right-0 bottom-0 z-50
                       w-full sm:w-[420px] bg-canvas
                       flex flex-col shadow-lift"
          >
            {/* ── Header ── */}
            <div className="flex items-center justify-between px-5 sm:px-6 h-16
                            border-b border-stone-200 shrink-0">
              <div className="flex items-center gap-2.5">
                <ShoppingBag className="w-4 h-4 text-ink" strokeWidth={1.75} />
                <h2 className="font-semibold text-ink text-base">
                  Your Cart
                  {items.length > 0 && (
                    <span className="ml-2 text-xs font-normal text-stone-400">
                      ({items.reduce((s, i) => s + i.quantity, 0)} item
                      {items.reduce((s, i) => s + i.quantity, 0) !== 1 ? "s" : ""})
                    </span>
                  )}
                </h2>
              </div>
              <button
                onClick={closeDrawer}
                aria-label="Close cart"
                className="w-8 h-8 rounded-full flex items-center justify-center
                           text-stone-400 hover:text-ink hover:bg-stone-100
                           transition-colors duration-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* ── Free shipping progress ── */}
            {items.length > 0 && (
              <div className="px-5 sm:px-6 py-3 bg-white border-b border-stone-100 shrink-0">
                {toFreeShipping > 0 ? (
                  <p className="text-xs text-stone-500 mb-1.5">
                    Add{" "}
                    <span className="font-semibold text-ink">
                      ₹{toFreeShipping.toLocaleString("en-IN")}
                    </span>{" "}
                    more for free shipping
                  </p>
                ) : (
                  <p className="text-xs font-semibold text-sage-dark mb-1.5">
                    🎉 You&apos;ve unlocked free shipping!
                  </p>
                )}
                <div className="h-1.5 bg-stone-100 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-sage rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${progressPct}%` }}
                    transition={{ duration: 0.5, ease }}
                  />
                </div>
              </div>
            )}

            {/* ── Items list ── */}
            <div className="flex-1 overflow-y-auto px-5 sm:px-6 py-4">
              {items.length === 0 ? (
                /* Empty state */
                <div className="flex flex-col items-center justify-center h-full text-center gap-4 py-16">
                  <div className="w-20 h-20 bg-stone-100 rounded-full flex items-center
                                  justify-center text-4xl">
                    🛒
                  </div>
                  <div>
                    <p className="font-semibold text-ink mb-1">Your cart is empty</p>
                    <p className="text-stone-400 text-sm">
                      Add something beautiful to get started.
                    </p>
                  </div>
                  <button
                    onClick={closeDrawer}
                    className="btn-primary mt-2 px-8 py-3 text-sm"
                  >
                    Browse Products
                  </button>
                </div>
              ) : (
                <AnimatePresence initial={false}>
                  <ul className="space-y-3">
                    {items.map((item) => (
                      <motion.li
                        key={item.product.id}
                        layout
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20, height: 0, marginBottom: 0 }}
                        transition={{ duration: 0.25, ease }}
                        className="bg-white rounded-2xl p-3.5 flex gap-3.5
                                   border border-stone-100 shadow-soft"
                      >
                        {/* Thumbnail */}
                        <Link
                          href={`/shop/${item.product.slug}`}
                          onClick={closeDrawer}
                          className="w-16 h-16 bg-stone-100 rounded-xl flex items-center
                                     justify-center text-2xl shrink-0 hover:opacity-80
                                     transition-opacity"
                          aria-label={item.product.name}
                        >
                          {item.product.emoji}
                        </Link>

                        {/* Info */}
                        <div className="flex-1 min-w-0 flex flex-col justify-between">
                          <div className="flex items-start justify-between gap-2">
                            <Link
                              href={`/shop/${item.product.slug}`}
                              onClick={closeDrawer}
                              className="text-sm font-semibold text-ink hover:text-sage-dark
                                         transition-colors line-clamp-1"
                            >
                              {item.product.name}
                            </Link>
                            <button
                              onClick={() => removeItem(item.product.id)}
                              aria-label={`Remove ${item.product.name}`}
                              className="shrink-0 text-stone-300 hover:text-red-400
                                         transition-colors duration-200 mt-0.5"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <div className="flex items-center justify-between mt-2">
                            {/* Price */}
                            <p className="text-sm font-bold text-ink">
                              ₹{(item.product.price * item.quantity).toLocaleString("en-IN")}
                              {item.quantity > 1 && (
                                <span className="text-xs font-normal text-stone-400 ml-1">
                                  (₹{item.product.price} each)
                                </span>
                              )}
                            </p>

                            {/* Qty stepper */}
                            <div className="flex items-center gap-1.5">
                              <button
                                onClick={() => updateQty(item.product.id, item.quantity - 1)}
                                aria-label="Decrease quantity"
                                className="w-6 h-6 rounded-full border border-stone-200
                                           flex items-center justify-center
                                           hover:bg-stone-100 transition-colors
                                           disabled:opacity-40"
                                disabled={item.quantity <= 1}
                              >
                                <Minus className="w-2.5 h-2.5" />
                              </button>
                              <span className="w-5 text-center text-xs font-bold text-ink">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => updateQty(item.product.id, item.quantity + 1)}
                                aria-label="Increase quantity"
                                className="w-6 h-6 rounded-full border border-stone-200
                                           flex items-center justify-center
                                           hover:bg-stone-100 transition-colors"
                              >
                                <Plus className="w-2.5 h-2.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </motion.li>
                    ))}
                  </ul>
                </AnimatePresence>
              )}
            </div>

            {/* ── Order summary + CTA ── */}
            {items.length > 0 && (
              <div className="shrink-0 border-t border-stone-200 bg-white px-5 sm:px-6 py-5">
                {/* Line items */}
                <div className="space-y-2 mb-4 text-sm">
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
                  <div className="flex justify-between font-bold text-ink text-base pt-2
                                  border-t border-stone-100">
                    <span>Total</span>
                    <span>₹{total.toLocaleString("en-IN")}</span>
                  </div>
                </div>

                {/* Checkout button */}
                <Link
                  href="/checkout"
                  onClick={closeDrawer}
                  className="btn-primary w-full py-4 text-sm group"
                >
                  Proceed to Checkout
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </Link>

                {/* View full cart */}
                <Link
                  href="/cart"
                  onClick={closeDrawer}
                  className="block text-center text-xs text-stone-400 hover:text-ink
                             transition-colors mt-3 underline underline-offset-2"
                >
                  View full cart
                </Link>
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
