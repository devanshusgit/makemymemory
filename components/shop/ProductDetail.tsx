"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingCart, Heart, Share2, ArrowLeft, Plus, Minus, Check } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { ALL_PRODUCTS } from "@/lib/data/products";
import { useCart } from "@/lib/context/CartContext";

const ease = [0.4, 0, 0.2, 1] as const;

interface Props { slug: string }

export default function ProductDetail({ slug }: Props) {
  const product = ALL_PRODUCTS.find((p) => p.slug === slug);
  const { addItem } = useCart();
  const [qty, setQty]     = useState(1);
  const [added, setAdded] = useState(false);

  if (!product) {
    return (
      <div className="section-wrap py-24 text-center">
        <p className="text-stone-400 text-lg mb-6">Product not found.</p>
        <Link href="/shop" className="btn-outline">Back to Shop</Link>
      </div>
    );
  }

  const saving = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : null;

  const handleAdd = () => {
    addItem(product, qty);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div className="bg-canvas min-h-screen">
      <div className="section-wrap py-10 sm:py-16">

        <Link
          href="/shop"
          className="inline-flex items-center gap-1.5 text-sm text-stone-400
                     hover:text-ink transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Shop
        </Link>

        <div className="grid md:grid-cols-2 gap-10 lg:gap-16 items-start">

          {/* Image */}
          <motion.div
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease }}
            className="md:sticky md:top-24"
          >
            <div className="relative aspect-square bg-stone-100 rounded-4xl overflow-hidden">
              {product.image ? (
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover"
                  priority
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-[8rem]">
                  {product.emoji}
                </div>
              )}
            </div>
          </motion.div>

          {/* Info */}
          <motion.div
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.1, ease }}
            className="flex flex-col gap-6"
          >
            {product.badge && (
              <span className="self-start text-xs font-semibold px-3 py-1.5 rounded-full"
                style={{ backgroundColor: "#C9A84C", color: "#1A1A1A" }}>
                {product.badge}
              </span>
            )}

            <h1 className="font-serif font-bold text-[#1A1A1A]"
              style={{ fontSize: "clamp(1.8rem, 4vw, 2.8rem)", lineHeight: 1.2 }}>
              {product.name}
            </h1>
            <p className="leading-relaxed" style={{ color: "#6B6560" }}>{product.description}</p>

            <div className="flex items-baseline gap-3">
              <span className="font-bold text-3xl" style={{ color: "#C9A84C" }}>₹{product.price}</span>
              {product.originalPrice && (
                <>
                  <span className="line-through text-lg" style={{ color: "#6B6560" }}>₹{product.originalPrice}</span>
                  <span className="text-sm font-semibold px-2 py-0.5 rounded-full"
                    style={{ color: "#A07C2E", backgroundColor: "rgba(201,168,76,0.12)" }}>
                    {saving}% off
                  </span>
                </>
              )}
            </div>

            <div className="divider" />

            {/* Quantity */}
            <div>
              <p className="input-label mb-3">Quantity</p>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  disabled={qty <= 1}
                  aria-label="Decrease quantity"
                  className="w-9 h-9 rounded-full border border-stone-200 flex items-center
                             justify-center hover:bg-stone-100 transition-colors
                             disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="w-8 text-center font-bold text-ink text-base">{qty}</span>
                <button
                  onClick={() => setQty((q) => q + 1)}
                  aria-label="Increase quantity"
                  className="w-9 h-9 rounded-full border border-stone-200 flex items-center
                             justify-center hover:bg-stone-100 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
                <span className="text-sm text-stone-400 ml-1">
                  Total:{" "}
                  <span className="font-semibold text-ink">
                    ₹{(product.price * qty).toLocaleString("en-IN")}
                  </span>
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-3">
              {/* Add to Cart — outlined ink */}
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={handleAdd}
                disabled={!product.inStock}
                className="w-full py-4 rounded-full flex items-center justify-center gap-2
                           text-sm font-semibold tracking-wide transition-all duration-300
                           disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  border: "1.5px solid #1A1A1A",
                  color: added ? "#ffffff" : "#1A1A1A",
                  backgroundColor: added ? "#1A1A1A" : "transparent",
                }}
              >
                <AnimatePresence mode="wait" initial={false}>
                  {added ? (
                    <motion.span key="added" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.2 }} className="flex items-center gap-2">
                      <Check className="w-4 h-4" /> Added to Cart!
                    </motion.span>
                  ) : (
                    <motion.span key="add" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.2 }} className="flex items-center gap-2">
                      <ShoppingCart className="w-4 h-4" />
                      {product.inStock ? "Add to Cart" : "Out of Stock"}
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.button>

              {/* Buy it now — filled ink */}
              <Link
                href="/checkout"
                onClick={() => { if (product.inStock) handleAdd(); }}
                className="w-full py-4 rounded-full flex items-center justify-center gap-2
                           text-sm font-semibold tracking-wide transition-all duration-300
                           hover:bg-[#C9A84C] hover:text-[#1A1A1A]"
                style={{ backgroundColor: "#1A1A1A", color: "#ffffff" }}
              >
                Buy it now
              </Link>
            </div>

            {/* Trust badges */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { icon: "🚚", text: "Free delivery over ₹999" },
                { icon: "🔒", text: "Secure payment" },
                { icon: "↩️", text: "Easy returns" },
              ].map((b) => (
                <div key={b.text} className="bg-stone-50 rounded-2xl p-3 text-center border border-stone-100">
                  <div className="text-xl mb-1">{b.icon}</div>
                  <p className="text-[11px] text-stone-500 leading-tight">{b.text}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
