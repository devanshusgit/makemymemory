"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { ShoppingCart, Heart, SlidersHorizontal, X, ChevronDown, Check } from "lucide-react";
import { ALL_PRODUCTS } from "@/lib/data/products";
import { useCart } from "@/lib/context/CartContext";
import type { Product } from "@/lib/types";

const ease = [0.4, 0, 0.2, 1] as const;

const CATEGORIES = [
  { label: "All",         value: "all" },
  { label: "Photo Books", value: "photo-books" },
  { label: "Frames",      value: "frames" },
  { label: "Mugs",        value: "mugs" },
  { label: "Cushions",    value: "cushions" },
  { label: "Calendars",   value: "calendars" },
  { label: "Gift Sets",   value: "gift-sets" },
];

const SORT_OPTIONS = [
  { label: "Featured",        value: "featured"   },
  { label: "Price: Low–High", value: "price-asc"  },
  { label: "Price: High–Low", value: "price-desc" },
  { label: "Newest",          value: "newest"     },
];

/* ── Product card ── */
function ShopCard({ product, index }: { product: Product; index: number }) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    addItem(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ delay: (index % 9) * 0.05, duration: 0.45, ease }}
      className="group relative bg-white rounded-3xl overflow-hidden shadow-soft
                 hover:shadow-card hover:-translate-y-1 transition-all duration-300 flex flex-col"
    >
      {/* Image */}
      <Link href={`/shop/${product.slug}`} className="block relative overflow-hidden">
        <div className="relative aspect-[3/4] bg-stone-100">
          {product.image ? (
            <Image
              src={product.image}
              alt={product.name}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-7xl sm:text-8xl
                            group-hover:scale-105 transition-transform duration-500 ease-out">
              {product.emoji}
            </div>
          )}
        </div>

        {product.badge && (
          <span className="absolute top-3 left-3 z-10 bg-sage text-white
                           text-[11px] font-semibold px-2.5 py-1 rounded-full tracking-wide">
            {product.badge}
          </span>
        )}

        {!product.inStock && (
          <div className="absolute inset-0 bg-white/60 backdrop-blur-sm flex items-center justify-center z-10">
            <span className="text-xs font-semibold text-stone-500 tracking-widest uppercase">
              Out of Stock
            </span>
          </div>
        )}

        <button
          aria-label="Add to wishlist"
          onClick={(e) => e.preventDefault()}
          className="absolute top-3 right-3 z-10 w-8 h-8 bg-white/90 backdrop-blur-sm
                     rounded-full flex items-center justify-center text-stone-400
                     opacity-0 group-hover:opacity-100 translate-y-1 group-hover:translate-y-0
                     hover:text-red-400 transition-all duration-200 shadow-soft"
        >
          <Heart className="w-3.5 h-3.5" />
        </button>

        {/* Hover quick-add */}
        <div className="absolute inset-x-0 bottom-0 p-3 z-10
                        translate-y-full group-hover:translate-y-0
                        transition-transform duration-300 ease-out">
          <button
            onClick={handleAdd}
            aria-label={`Add ${product.name} to cart`}
            className="w-full flex items-center justify-center gap-2
                       bg-ink/90 backdrop-blur-sm text-canvas
                       py-2.5 rounded-2xl text-xs font-semibold tracking-wide
                       hover:bg-ink transition-colors duration-150"
          >
            {added
              ? <><Check className="w-3.5 h-3.5" /> Added!</>
              : <><ShoppingCart className="w-3.5 h-3.5" /> Add to Cart</>
            }
          </button>
        </div>
      </Link>

      {/* Info row */}
      <div className="px-4 py-3.5 flex items-center justify-between gap-2">
        <div className="min-w-0">
          <Link href={`/shop/${product.slug}`}>
            <p className="text-sm font-semibold text-ink hover:text-sage-dark
                          transition-colors truncate">
              {product.name}
            </p>
          </Link>
          <div className="flex items-baseline gap-1.5 mt-0.5">
            <span className="text-sm font-bold text-ink">₹{product.price}</span>
            {product.originalPrice && (
              <span className="text-xs text-stone-400 line-through">₹{product.originalPrice}</span>
            )}
            {product.originalPrice && (
              <span className="text-[11px] font-semibold text-sage-dark">
                {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% off
              </span>
            )}
          </div>
        </div>

        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={handleAdd}
          aria-label={`Add ${product.name} to cart`}
          className={`sm:hidden shrink-0 w-8 h-8 rounded-full flex items-center justify-center
                       transition-colors duration-200
                       ${added ? "bg-sage text-white" : "bg-ink text-canvas hover:bg-sage-dark"}`}
        >
          {added ? <Check className="w-3.5 h-3.5" /> : <ShoppingCart className="w-3.5 h-3.5" />}
        </motion.button>
      </div>
    </motion.article>
  );
}

/* ── Main shop client ── */
export default function ShopClient() {
  const [activeCategory, setActiveCategory] = useState("all");
  const [sortBy, setSortBy]                 = useState("featured");
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [sortOpen, setSortOpen]             = useState(false);

  const filtered = useMemo(() => {
    let list = [...ALL_PRODUCTS];
    if (activeCategory !== "all") list = list.filter((p) => p.category === activeCategory);
    switch (sortBy) {
      case "price-asc":  list.sort((a, b) => a.price - b.price); break;
      case "price-desc": list.sort((a, b) => b.price - a.price); break;
      case "newest":     list.reverse(); break;
    }
    return list;
  }, [activeCategory, sortBy]);

  const activeSortLabel = SORT_OPTIONS.find((o) => o.value === sortBy)?.label ?? "Sort";

  return (
    <>
      {/* Filter bar */}
      <div className="bg-white border-b border-stone-100 sticky top-[65px] z-30">
        <div className="section-wrap">
          <div className="flex items-center gap-2 py-3 overflow-x-auto scrollbar-hide">
            <div className="hidden sm:flex items-center gap-1.5 flex-1 min-w-0">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.value}
                  onClick={() => setActiveCategory(cat.value)}
                  className={`shrink-0 px-4 py-2 rounded-full text-xs font-semibold
                               tracking-wide transition-all duration-200
                               ${activeCategory === cat.value
                                 ? "bg-ink text-canvas shadow-soft"
                                 : "bg-stone-100 text-stone-600 hover:bg-stone-200 hover:text-ink"
                               }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            <button
              onClick={() => setShowMobileFilters(true)}
              className="sm:hidden flex items-center gap-1.5 px-4 py-2 rounded-full
                         bg-stone-100 text-stone-600 text-xs font-semibold
                         hover:bg-stone-200 transition-colors shrink-0"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              Filter
              {activeCategory !== "all" && <span className="w-1.5 h-1.5 rounded-full bg-sage" />}
            </button>

            <div className="flex-1 sm:flex-none" />

            <span className="hidden sm:block text-xs text-stone-400 shrink-0 mr-2">
              {filtered.length} product{filtered.length !== 1 ? "s" : ""}
            </span>

            <div className="relative shrink-0">
              <button
                onClick={() => setSortOpen((v) => !v)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-full
                           bg-stone-100 text-stone-600 text-xs font-semibold
                           hover:bg-stone-200 transition-colors"
              >
                {activeSortLabel}
                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${sortOpen ? "rotate-180" : ""}`} />
              </button>
              <AnimatePresence>
                {sortOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -6, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -6, scale: 0.97 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 top-full mt-2 w-44 bg-white rounded-2xl
                               shadow-card border border-stone-100 overflow-hidden z-50"
                  >
                    {SORT_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => { setSortBy(opt.value); setSortOpen(false); }}
                        className={`w-full text-left px-4 py-2.5 text-xs font-medium
                                    transition-colors duration-150
                                    ${sortBy === opt.value
                                      ? "bg-stone-50 text-ink font-semibold"
                                      : "text-stone-600 hover:bg-stone-50 hover:text-ink"
                                    }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile filter drawer */}
      <AnimatePresence>
        {showMobileFilters && (
          <>
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-ink/20 backdrop-blur-sm sm:hidden"
              onClick={() => setShowMobileFilters(false)}
            />
            <motion.div
              key="drawer"
              initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
              transition={{ type: "spring", stiffness: 320, damping: 32 }}
              className="fixed inset-x-0 bottom-0 z-50 bg-canvas rounded-t-4xl shadow-lift p-6 sm:hidden"
            >
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-semibold text-ink">Filter by Category</h3>
                <button
                  onClick={() => setShowMobileFilters(false)}
                  className="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center
                             text-stone-500 hover:bg-stone-200 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.value}
                    onClick={() => { setActiveCategory(cat.value); setShowMobileFilters(false); }}
                    className={`px-4 py-3 rounded-2xl text-sm font-medium text-left
                                 transition-all duration-200
                                 ${activeCategory === cat.value
                                   ? "bg-ink text-canvas"
                                   : "bg-stone-100 text-stone-600 hover:bg-stone-200"
                                 }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Product grid */}
      <div className="section-wrap py-10 sm:py-14">
        {filtered.length === 0 && (
          <div className="text-center py-24">
            <p className="text-4xl mb-4">🔍</p>
            <p className="text-stone-500 text-base mb-6">No products found.</p>
            <button onClick={() => setActiveCategory("all")} className="btn-outline px-8 py-3 text-sm">
              Clear Filters
            </button>
          </div>
        )}

        <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          <AnimatePresence mode="popLayout">
            {filtered.map((product, i) => (
              <ShopCard key={product.id} product={product} index={i} />
            ))}
          </AnimatePresence>
        </motion.div>

        {filtered.length > 0 && (
          <div className="text-center mt-14 sm:mt-20 pt-10 border-t border-stone-200">
            <p className="text-stone-400 text-sm mb-5">Looking for something specific?</p>
            <Link href="/contact" className="btn-outline px-10 py-4 text-sm">
              Request a Custom Order
            </Link>
          </div>
        )}
      </div>
    </>
  );
}
