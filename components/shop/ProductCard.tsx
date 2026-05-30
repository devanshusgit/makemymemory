"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingCart, Heart, Check, Star } from "lucide-react";
import type { Product } from "@/lib/types";
import { useCart } from "@/lib/context/CartContext";
import { useWishlist } from "@/lib/context/WishlistContext";

interface Props {
  product: Product;
}

export default function ProductCard({ product }: Props) {
  const { addItem } = useCart();
  const { addItem: addToWishlist, removeItem: removeFromWishlist, isInWishlist } = useWishlist();
  const [added, setAdded] = useState(false);
  const inWishlist = isInWishlist(product.id);

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    addItem(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    if (inWishlist) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist(product);
    }
  };

  const avgRating = (product as any).avgRating || 0;
  const reviewCount = (product as any).reviewCount || 0;

  return (
    <article className="card group flex flex-col">
      {/* Image area */}
      <Link href={`/shop/${product.slug}`} className="block relative overflow-hidden">
        <div className="aspect-square bg-stone-100">
          {product.images && product.images.length > 0 ? (
            <img
              src={product.images[0]}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <div className="w-12 h-12 bg-stone-200 rounded-xl flex items-center justify-center">
                <span className="text-stone-400 text-sm font-medium">No Image</span>
              </div>
            </div>
          )}
        </div>

        {/* Badge */}
        {product.badge && (
          <span
            className="absolute top-3 left-3 text-[11px]
                           font-semibold px-2.5 py-1 rounded-full tracking-wide z-10"
            style={{ backgroundColor: "#C9A84C", color: "#1A1A1A" }}
          >
            {product.badge}
          </span>
        )}

        {/* Out of Stock Badge */}
        {!product.inStock && (
          <span
            className="absolute top-3 left-3 text-[11px]
                           font-semibold px-2.5 py-1 rounded-full tracking-wide z-10"
            style={{ backgroundColor: "#EF4444", color: "#FFFFFF" }}
          >
            Out of Stock
          </span>
        )}

        {/* Wishlist */}
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={handleWishlist}
          aria-label={inWishlist ? "Remove from wishlist" : "Add to wishlist"}
          className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full shadow-soft
                     flex items-center justify-center
                     opacity-0 group-hover:opacity-100 translate-y-1 group-hover:translate-y-0
                     transition-all duration-200"
          style={{
            backgroundColor: inWishlist ? "#FF6B6B" : "white",
            color: inWishlist ? "white" : "#C9A84C",
          }}
        >
          <Heart className={`w-3.5 h-3.5 ${inWishlist ? "fill-current" : ""}`} />
        </motion.button>
      </Link>

      {/* Info */}
      <div className="p-4 sm:p-5 flex flex-col flex-1">
        <Link href={`/shop/${product.slug}`}>
          <h3
            className="font-serif font-semibold text-sm sm:text-base
                         transition-colors line-clamp-1 mb-1"
            style={{ color: "#1A1A1A" }}
          >
            {product.name}
          </h3>
        </Link>
        <p className="text-stone-400 text-xs sm:text-sm leading-relaxed line-clamp-2 flex-1 mb-3">
          {product.description}
        </p>

        {/* Rating */}
        {reviewCount > 0 && (
          <div className="flex items-center gap-1.5 mb-3">
            <div className="flex gap-0.5">
              {[1, 2, 3, 4, 5].map((i) => (
                <Star
                  key={i}
                  className={`w-3 h-3 ${
                    i <= Math.round(avgRating)
                      ? "fill-amber-400 text-amber-400"
                      : "text-stone-300"
                  }`}
                />
              ))}
            </div>
            <span className="text-xs text-stone-500">
              {avgRating.toFixed(1)} ({reviewCount})
            </span>
          </div>
        )}

        {/* Price + CTA */}
        <div className="flex items-center justify-between gap-2 mt-auto">
          <div className="flex items-baseline gap-1.5">
            <span className="font-bold text-base sm:text-lg" style={{ color: "#1A1A1A" }}>
              ₹{product.price}
            </span>
            {product.originalPrice && (
              <span className="text-xs line-through" style={{ color: "#6B6560" }}>
                ₹{product.originalPrice}
              </span>
            )}
          </div>

          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={handleAdd}
            disabled={!product.inStock}
            aria-label={`Add ${product.name} to cart`}
            className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0
                        transition-all duration-200 ${!product.inStock ? 'opacity-50 cursor-not-allowed' : ''}`}
            style={{
              backgroundColor: added ? "#C9A84C" : "#1A1A1A",
              color: added ? "#1A1A1A" : "#ffffff",
            }}
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
