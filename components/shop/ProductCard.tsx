"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingCart, Heart, Check } from "lucide-react";
import type { Product } from "@/lib/types";
import { useCart } from "@/lib/context/CartContext";

interface Props {
  product: Product;
}

export default function ProductCard({ product }: Props) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    addItem(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  return (
    <article className="card group flex flex-col">
      {/* Image area */}
      <Link href={`/shop/${product.slug}`} className="block relative overflow-hidden">
        <div className="aspect-square bg-stone-100">
          <div
            className="w-full h-full flex items-center justify-center text-6xl
                        group-hover:scale-105 transition-transform duration-500 ease-out"
          >
            {product.emoji}
          </div>
        </div>

        {/* Badge */}
        {product.badge && (
          <span className="absolute top-3 left-3 bg-sage text-white text-[11px]
                           font-semibold px-2.5 py-1 rounded-full tracking-wide z-10">
            {product.badge}
          </span>
        )}

        {/* Wishlist */}
        <button
          aria-label="Add to wishlist"
          onClick={(e) => e.preventDefault()}
          className="absolute top-3 right-3 z-10 w-8 h-8 bg-white rounded-full shadow-soft
                     flex items-center justify-center text-stone-400
                     opacity-0 group-hover:opacity-100 translate-y-1 group-hover:translate-y-0
                     transition-all duration-200 hover:text-red-400"
        >
          <Heart className="w-3.5 h-3.5" />
        </button>
      </Link>

      {/* Info */}
      <div className="p-4 sm:p-5 flex flex-col flex-1">
        <Link href={`/shop/${product.slug}`}>
          <h3 className="font-semibold text-ink text-sm sm:text-base hover:text-sage-dark
                         transition-colors line-clamp-1 mb-1">
            {product.name}
          </h3>
        </Link>
        <p className="text-stone-400 text-xs sm:text-sm leading-relaxed line-clamp-2 flex-1 mb-4">
          {product.description}
        </p>

        {/* Price + CTA */}
        <div className="flex items-center justify-between gap-2 mt-auto">
          <div className="flex items-baseline gap-1.5">
            <span className="font-bold text-ink text-base sm:text-lg">₹{product.price}</span>
            {product.originalPrice && (
              <span className="text-stone-400 text-xs line-through">
                ₹{product.originalPrice}
              </span>
            )}
          </div>

          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={handleAdd}
            aria-label={`Add ${product.name} to cart`}
            className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0
                        transition-colors duration-200
                        ${added
                          ? "bg-sage text-white"
                          : "bg-ink text-canvas hover:bg-sage-dark"
                        }`}
          >
            <AnimatePresence mode="wait" initial={false}>
              {added ? (
                <motion.span
                  key="check"
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  transition={{ duration: 0.15 }}
                >
                  <Check className="w-4 h-4" />
                </motion.span>
              ) : (
                <motion.span
                  key="cart"
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  transition={{ duration: 0.15 }}
                >
                  <ShoppingCart className="w-4 h-4" />
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>
        </div>
      </div>
    </article>
  );
}
