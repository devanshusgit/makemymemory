"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ALL_PRODUCTS } from "@/lib/data/products";
import ProductCard from "./ProductCard";

const ease = [0.4, 0, 0.2, 1] as const;

const CATEGORIES = [
  {
    id:       "foil-imprints",
    title:    "Foil Imprints",
    desc:     "Delicate gold & silver foil impressions of tiny hands, feet, and paws — preserved forever.",
    emoji:    "🖐️",
    gradient: "linear-gradient(135deg, #1A1A1A 0%, #2d2520 100%)",
  },
  {
    id:       "3d-casting",
    title:    "3D Casting",
    desc:     "Lifelike three-dimensional casts of hands and feet — a tangible memory you can hold.",
    emoji:    "🏺",
    gradient: "linear-gradient(135deg, #2d2520 0%, #1A1A1A 100%)",
  },
];

export default function ShopClient() {
  const [active, setActive] = useState<string | null>(null);

  const filtered = active
    ? ALL_PRODUCTS.filter((p) => p.category === active)
    : ALL_PRODUCTS;

  return (
    <div className="section-wrap py-12 sm:py-16">

      {/* ── 2 Category filter cards ── */}
      <div className="grid sm:grid-cols-2 gap-5 mb-12 max-w-3xl mx-auto">
        {CATEGORIES.map((cat) => {
          const isActive = active === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setActive(isActive ? null : cat.id)}
              className="relative overflow-hidden rounded-2xl text-left transition-all duration-300
                         hover:-translate-y-1 group"
              style={{
                background:  cat.gradient,
                border:      isActive ? "2px solid #C9A84C" : "1px solid rgba(201,168,76,0.2)",
                minHeight:   "200px",
                boxShadow:   isActive ? "0 0 0 1px #C9A84C, 0 8px 32px rgba(201,168,76,0.2)" : "none",
              }}
            >
              {/* Background emoji */}
              <div className="absolute inset-0 flex items-center justify-center opacity-10
                              text-[7rem] select-none pointer-events-none
                              group-hover:opacity-15 transition-opacity duration-300">
                {cat.emoji}
              </div>

              {/* Gold shimmer on hover */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{ background: "linear-gradient(135deg, rgba(201,168,76,0.06) 0%, transparent 60%)" }} />

              {/* Active indicator */}
              {isActive && (
                <div className="absolute top-3 right-3 w-6 h-6 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: "#C9A84C" }}>
                  <span className="text-[#1A1A1A] text-xs font-bold">✓</span>
                </div>
              )}

              <div className="relative z-10 p-6">
                <div className="inline-flex items-center gap-1.5 text-xs font-semibold tracking-widest uppercase mb-3"
                  style={{ color: "#C9A84C" }}>
                  <span className="w-4 h-px" style={{ backgroundColor: "#C9A84C" }} />
                  Collection
                </div>
                <h2 className="font-serif font-bold text-white text-xl sm:text-2xl mb-2">
                  {cat.title}
                </h2>
                <p className="text-sm leading-relaxed mb-4" style={{ color: "rgba(232,213,163,0.65)" }}>
                  {cat.desc}
                </p>
                <span className="inline-flex items-center gap-1.5 text-sm font-semibold
                                 transition-all duration-300 group-hover:gap-2.5"
                  style={{ color: "#C9A84C" }}>
                  {isActive ? "Showing all →" : "Explore →"}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* ── Active filter label ── */}
      {active && (
        <div className="flex items-center justify-between mb-6">
          <p className="text-sm font-medium" style={{ color: "#6B6560" }}>
            Showing: <span className="font-semibold" style={{ color: "#1A1A1A" }}>
              {CATEGORIES.find((c) => c.id === active)?.title}
            </span>
            <span className="ml-2" style={{ color: "#C9A84C" }}>({filtered.length} products)</span>
          </p>
          <button onClick={() => setActive(null)}
            className="text-xs font-semibold transition-colors duration-200 hover:text-[#C9A84C]"
            style={{ color: "#6B6560" }}>
            Clear filter ×
          </button>
        </div>
      )}

      {/* ── Product grid ── */}
      <motion.div layout className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        <AnimatePresence mode="popLayout">
          {filtered.map((product, i) => (
            <motion.div
              key={product.id}
              layout
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ delay: (i % 8) * 0.05, duration: 0.4, ease }}
            >
              <ProductCard product={product} />
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      {filtered.length === 0 && (
        <div className="text-center py-20">
          <p className="text-4xl mb-3">🔍</p>
          <p className="text-sm" style={{ color: "#6B6560" }}>No products found.</p>
        </div>
      )}
    </div>
  );
}
