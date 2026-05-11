"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingCart, ArrowLeft, Plus, Minus, Check, Calendar, Clock, Weight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/lib/context/CartContext";
import type { Product } from "@/lib/types";
import ImageCarousel from "./ImageCarousel";

const ease = [0.4, 0, 0.2, 1] as const;

interface Props { slug: string }

// Variant options
const FRAME_TYPES = [
  { id: "with-pic", label: "Frame with Picture", price: 500 },
  { id: "without-pic", label: "Frame without Picture", price: 0 },
];

const FRAME_COLORS = [
  { id: "gold", label: "24k Gold", price: 0, color: "#FFD700" },
  { id: "silver", label: "Silver", price: 200, color: "#C0C0C0" },
  { id: "rose", label: "Rose Gold", price: 300, color: "#B76E79" },
];

const FINISHES = [
  { id: "24k", label: "24k Gold", price: 0 },
  { id: "silver", label: "Silver", price: 200 },
  { id: "rose", label: "Rose Gold", price: 300 },
];

const PAPER_COLORS = [
  { id: "white", label: "White", color: "#FFFFFF" },
  { id: "black", label: "Black", color: "#1A1A1A" },
  { id: "navy", label: "Navy", color: "#1B2A4A" },
  { id: "pink", label: "Pink", color: "#F4A7B9" },
];

const FONTS = [
  { id: "calligraphy", label: "Calligraphy", family: "cursive" },
  { id: "modern", label: "Modern", family: "sans-serif" },
  { id: "classic", label: "Classic", family: "serif" },
  { id: "playful", label: "Playful", family: "monospace" },
];

const LAYOUTS = [
  { id: "layered", label: "Layered" },
  { id: "simple", label: "Simple" },
];

export default function ProductDetail({ slug }: Props) {
  const { addItem } = useCart();
  const [product, setProduct] = useState<Product | null>(
    ALL_PRODUCTS.find((p) => p.slug === slug) ?? null
  );
  const [qty, setQty]     = useState(1);
  const [added, setAdded] = useState(false);

  // Variant selections
  const [frameType, setFrameType] = useState("with-pic");
  const [frameColor, setFrameColor] = useState("gold");
  const [finish, setFinish] = useState("24k");
  const [paperColor, setPaperColor] = useState("white");
  const [font, setFont] = useState("calligraphy");
  const [layout, setLayout] = useState("layered");

  // Custom inputs
  const [name, setName] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [weight, setWeight] = useState("");

  useEffect(() => {
    fetch("/api/products")
      .then((r) => r.ok ? r.json() : null)
      .then((d) => {
        const found = d?.products?.find((p: Product) => p.slug === slug);
        if (found) setProduct(found);
      })
      .catch(() => {});
  }, [slug]);

  // Calculate total price
  const frameTypePrice = FRAME_TYPES.find(f => f.id === frameType)?.price || 0;
  const frameColorPrice = FRAME_COLORS.find(f => f.id === frameColor)?.price || 0;
  const finishPrice = FINISHES.find(f => f.id === finish)?.price || 0;
  const totalAddOns = frameTypePrice + frameColorPrice + finishPrice;
  const basePrice = product?.price || 0;
  const finalPrice = basePrice + totalAddOns;

  if (!product) {
    return (
      <div className="section-wrap py-24 text-center">
        <p className="text-stone-400 text-lg mb-6">Product not found.</p>
        <Link href="/shop" className="btn-outline">Back to Shop</Link>
      </div>
    );
  }

  const handleAdd = () => {
    addItem(product, qty);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#FAF8F4" }}>
      <div className="section-wrap py-10 sm:py-16">
        <Link href="/shop"
          className="inline-flex items-center gap-1.5 text-sm mb-8 transition-colors"
          style={{ color: "#6B6560" }}>
          <ArrowLeft className="w-4 h-4" /> Back to Shop
        </Link>

        <div className="grid md:grid-cols-2 gap-10 lg:gap-16 items-start">
          {/* Image Carousel */}
          <motion.div initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease }} className="md:sticky md:top-24">
            {product.images && product.images.length > 0 ? (
              <ImageCarousel images={product.images} productName={product.name} />
            ) : (
              <div
                className="relative aspect-square rounded-2xl overflow-hidden"
                style={{ backgroundColor: "rgba(201,168,76,0.08)", border: "1px solid rgba(201,168,76,0.2)" }}
              >
                <div className="w-full h-full flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-stone-200 rounded-xl flex items-center justify-center mx-auto mb-2">
                      <span className="text-stone-400 text-sm font-medium">No Image</span>
                    </div>
                    <p className="text-stone-400 text-sm">No image available</p>
                  </div>
                </div>
              </div>
            )}
          </motion.div>

          {/* Info & Variants */}
          <motion.div initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.1, ease }} className="flex flex-col gap-6">
            {product.badge && (
              <span className="self-start text-xs font-semibold px-3 py-1.5 rounded-full"
                style={{ backgroundColor: "#C9A84C", color: "#1A1A1A" }}>
                {product.badge}
              </span>
            )}

            <h1 className="font-serif font-bold"
              style={{ fontSize: "clamp(1.8rem, 4vw, 2.8rem)", lineHeight: 1.2, color: "#1A1A1A" }}>
              {product.name}
            </h1>
            <p className="leading-relaxed" style={{ color: "#6B6560" }}>{product.description}</p>

            {/* VARIANT OPTIONS */}
            <div className="space-y-6 py-6 border-y border-[#E8D5A3]">
              {/* Frame Type */}
              <div>
                <label className="input-label mb-3">Frame Type</label>
                <div className="flex flex-col gap-2">
                  {FRAME_TYPES.map((ft) => (
                    <button key={ft.id} onClick={() => setFrameType(ft.id)}
                      className="px-4 py-2.5 rounded-full text-sm font-medium transition-all text-left"
                      style={{
                        border: frameType === ft.id ? "2px solid #C9A84C" : "1px solid #E8D5A3",
                        backgroundColor: frameType === ft.id ? "rgba(201,168,76,0.1)" : "transparent",
                        color: "#1A1A1A",
                      }}>
                      {ft.label} {ft.price > 0 && `(+₹${ft.price})`}
                    </button>
                  ))}
                </div>
              </div>

              {/* Frame Color */}
              <div>
                <label className="input-label mb-3">Frame Colour</label>
                <div className="flex flex-wrap gap-3">
                  {FRAME_COLORS.map((fc) => (
                    <button key={fc.id} onClick={() => setFrameColor(fc.id)}
                      className="flex flex-col items-center gap-1.5 p-2 rounded-lg transition-all"
                      style={{
                        border: frameColor === fc.id ? "2px solid #C9A84C" : "1px solid #E8D5A3",
                      }}>
                      <div className="w-12 h-12 rounded-lg border-2 border-stone-200"
                        style={{ backgroundColor: fc.color }} />
                      <span className="text-xs font-medium text-center">{fc.label}</span>
                      {fc.price > 0 && <span className="text-[10px] text-stone-500">+₹{fc.price}</span>}
                    </button>
                  ))}
                </div>
              </div>

              {/* Metallic Finish */}
              <div>
                <label className="input-label mb-3">Metallic Finish</label>
                <div className="flex flex-wrap gap-3">
                  {FINISHES.map((f) => (
                    <button key={f.id} onClick={() => setFinish(f.id)}
                      className="px-4 py-2.5 rounded-full text-sm font-medium transition-all"
                      style={{
                        border: finish === f.id ? "2px solid #C9A84C" : "1px solid #E8D5A3",
                        backgroundColor: finish === f.id ? "rgba(201,168,76,0.1)" : "transparent",
                        color: "#1A1A1A",
                      }}>
                      {f.label} {f.price > 0 && `+₹${f.price}`}
                    </button>
                  ))}
                </div>
              </div>

              {/* Paper Color */}
              <div>
                <label className="input-label mb-3">Paper Colour</label>
                <div className="flex flex-wrap gap-3">
                  {PAPER_COLORS.map((pc) => (
                    <button key={pc.id} onClick={() => setPaperColor(pc.id)}
                      className="w-10 h-10 rounded-full border-2 transition-all"
                      style={{
                        backgroundColor: pc.color,
                        border: paperColor === pc.id ? "2px solid #C9A84C" : "2px solid #E8D5A3",
                        boxShadow: paperColor === pc.id ? "0 0 0 2px #FAF8F4, 0 0 0 4px #C9A84C" : "none",
                      }}
                      title={pc.label} />
                  ))}
                </div>
              </div>

              {/* Font */}
              <div>
                <label className="input-label mb-3">Name Font</label>
                <div className="grid grid-cols-2 gap-2">
                  {FONTS.map((f) => (
                    <button key={f.id} onClick={() => setFont(f.id)}
                      className="px-4 py-2.5 rounded-full text-sm font-medium transition-all"
                      style={{
                        fontFamily: f.family,
                        border: font === f.id ? "2px solid #C9A84C" : "1px solid #E8D5A3",
                        backgroundColor: font === f.id ? "rgba(201,168,76,0.1)" : "transparent",
                        color: "#1A1A1A",
                      }}>
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Layout */}
              <div>
                <label className="input-label mb-3">Detail Layout</label>
                <div className="flex gap-2">
                  {LAYOUTS.map((l) => (
                    <button key={l.id} onClick={() => setLayout(l.id)}
                      className="flex-1 px-4 py-2.5 rounded-full text-sm font-medium transition-all"
                      style={{
                        border: layout === l.id ? "2px solid #C9A84C" : "1px solid #E8D5A3",
                        backgroundColor: layout === l.id ? "rgba(201,168,76,0.1)" : "transparent",
                        color: "#1A1A1A",
                      }}>
                      {l.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* CUSTOM INPUTS */}
            <div className="space-y-4">
              <div>
                <label className="input-label">Name</label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)}
                  placeholder="Enter name" className="input" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="input-label">Date</label>
                  <input type="date" value={date} onChange={(e) => setDate(e.target.value)}
                    className="input" />
                </div>
                <div>
                  <label className="input-label">Time</label>
                  <input type="time" value={time} onChange={(e) => setTime(e.target.value)}
                    className="input" />
                </div>
              </div>
              <div>
                <label className="input-label">Weight (optional)</label>
                <input type="text" value={weight} onChange={(e) => setWeight(e.target.value)}
                  placeholder="e.g. 500g" className="input" />
              </div>
            </div>

            {/* PRICE & STOCK */}
            <div className="space-y-2 py-4 border-y border-[#E8D5A3]">
              <div className="flex items-baseline gap-3">
                <span className="font-bold text-3xl" style={{ color: "#C9A84C" }}>
                  ₹{finalPrice.toLocaleString("en-IN")}
                </span>
                {product.originalPrice && (
                  <span className="line-through text-lg" style={{ color: "#6B6560" }}>
                    ₹{product.originalPrice.toLocaleString("en-IN")}
                  </span>
                )}
              </div>
              <p className="text-xs" style={{ color: "#6B6560" }}>Tax included. Shipping calculated at checkout.</p>
              <p className="text-sm font-medium" style={{ color: "#6B6560" }}>1000 In stock, ready to ship</p>
            </div>

            {/* QUANTITY */}
            <div>
              <p className="input-label mb-3">Quantity</p>
              <div className="flex items-center gap-3">
                <button onClick={() => setQty((q) => Math.max(1, q - 1))} disabled={qty <= 1}
                  className="w-9 h-9 rounded-full border border-stone-200 flex items-center justify-center
                             hover:bg-stone-100 transition-colors disabled:opacity-40">
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="w-8 text-center font-bold text-ink text-base">{qty}</span>
                <button onClick={() => setQty((q) => q + 1)}
                  className="w-9 h-9 rounded-full border border-stone-200 flex items-center justify-center
                             hover:bg-stone-100 transition-colors">
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* ACTIONS */}
            <div className="flex flex-col gap-3">
              <motion.button whileTap={{ scale: 0.97 }} onClick={handleAdd} disabled={!product.inStock}
                className="w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300 disabled:opacity-50 mx-auto"
                style={{
                  backgroundColor: "#1A1A1A",
                  color: "#ffffff",
                }}
                title={product.inStock ? "Add to Cart" : "Out of Stock"}>
                <AnimatePresence mode="wait" initial={false}>
                  {added ? (
                    <motion.span key="added" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }} transition={{ duration: 0.2 }}>
                      <Check className="w-5 h-5" />
                    </motion.span>
                  ) : (
                    <motion.span key="add" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }} transition={{ duration: 0.2 }}>
                      <ShoppingCart className="w-5 h-5" />
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.button>

              <Link href="/checkout" onClick={() => { if (product.inStock) handleAdd(); }}
                className="w-full py-4 rounded-full flex items-center justify-center gap-2
                           text-sm font-semibold tracking-wide transition-all duration-300
                           hover:bg-[#C9A84C] hover:text-[#1A1A1A]"
                style={{ backgroundColor: "#1A1A1A", color: "#ffffff" }}>
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
