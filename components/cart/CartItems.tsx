"use client";

import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Trash2, Plus, Minus, ShoppingBag } from "lucide-react";
import { useCart } from "@/lib/context/CartContext";

const ease = [0.4, 0, 0.2, 1] as const;

export default function CartItems() {
  const { items, removeItem, updateQty } = useCart();

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="w-20 h-20 bg-stone-100 rounded-full flex items-center
                        justify-center mb-5">
          <ShoppingBag className="w-8 h-8 text-stone-300" strokeWidth={1.5} />
        </div>
        <h3 className="font-semibold text-ink text-lg mb-2">Your cart is empty</h3>
        <p className="text-stone-400 text-sm mb-7">
          Add something beautiful to get started.
        </p>
        <Link href="/shop" className="btn-primary px-8 py-3.5 text-sm">
          Browse Products
        </Link>
      </div>
    );
  }

  return (
    <ul className="space-y-3">
      <AnimatePresence initial={false}>
        {items.map((item) => (
          <motion.li
            key={item.product.id}
            layout
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: 20, height: 0, marginBottom: 0 }}
            transition={{ duration: 0.28, ease }}
            className="bg-white rounded-3xl p-4 sm:p-5 flex items-center gap-4
                       shadow-soft border border-stone-100"
          >
            {/* Thumbnail */}
            <Link
              href={`/shop/${item.product.slug}`}
              className="w-16 h-16 sm:w-20 sm:h-20 bg-stone-100 rounded-2xl
                         flex items-center justify-center shrink-0 hover:opacity-80 transition-opacity overflow-hidden"
              aria-label={item.product.name}
            >
              {item.product.images && item.product.images.length > 0 ? (
                <img
                  src={item.product.images[0]}
                  alt={item.product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-stone-400 text-xs">No Image</span>
              )}
            </Link>

            {/* Name + price */}
            <div className="flex-1 min-w-0">
              <Link href={`/shop/${item.product.slug}`}>
                <h3 className="font-semibold text-ink text-sm sm:text-base
                               hover:text-sage-dark transition-colors truncate">
                  {item.product.name}
                </h3>
              </Link>
              <div className="flex items-baseline gap-1.5 mt-0.5">
                <span className="text-sm font-bold text-ink">
                  ₹{(item.product.price * item.quantity).toLocaleString("en-IN")}
                </span>
                {item.quantity > 1 && (
                  <span className="text-xs text-stone-400">
                    (₹{item.product.price} each)
                  </span>
                )}
              </div>
              {item.product.originalPrice && (
                <span className="text-xs text-stone-400 line-through">
                  ₹{item.product.originalPrice}
                </span>
              )}
            </div>

            {/* Qty stepper */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => updateQty(item.product.id, item.quantity - 1)}
                aria-label="Decrease quantity"
                disabled={item.quantity <= 1}
                className="w-7 h-7 rounded-full border border-stone-200
                           flex items-center justify-center
                           hover:bg-stone-100 transition-colors
                           disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Minus className="w-3 h-3" />
              </button>
              <span className="w-6 text-center text-sm font-bold text-ink">
                {item.quantity}
              </span>
              <button
                onClick={() => updateQty(item.product.id, item.quantity + 1)}
                aria-label="Increase quantity"
                className="w-7 h-7 rounded-full border border-stone-200
                           flex items-center justify-center
                           hover:bg-stone-100 transition-colors"
              >
                <Plus className="w-3 h-3" />
              </button>
            </div>

            {/* Remove */}
            <button
              onClick={() => removeItem(item.product.id)}
              aria-label={`Remove ${item.product.name}`}
              className="text-stone-300 hover:text-red-400 transition-colors
                         ml-1 shrink-0 p-1"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </motion.li>
        ))}
      </AnimatePresence>
    </ul>
  );
}
