"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, ChevronDown, X } from "lucide-react";
import { useSearchParams } from "next/navigation";
import type { Product } from "@/lib/types";
import ProductCard from "./ProductCard";
import { useToast } from "@/lib/context/ToastContext";

const ease = [0.4, 0, 0.2, 1] as const;

const SORT_OPTIONS = [
  { value: "newest", label: "Newest" },
  { value: "price-low", label: "Price: Low to High" },
  { value: "price-high", label: "Price: High to Low" },
  { value: "popular", label: "Most Popular" },
  { value: "rating", label: "Highest Rated" },
];

export default function ShopClient() {
  const searchParams = useSearchParams();
  const categoryFromUrl = searchParams.get("category");
  const { showToast } = useToast();
  
  const [products, setProducts] = useState<Product[]>([]);

  const sortedProducts = useMemo(() => {
    return [...products].sort((a, b) => {
      const aIsAvailable = a.inStock && !(a.badge?.toLowerCase() === "coming soon");
      const bIsAvailable = b.inStock && !(b.badge?.toLowerCase() === "coming soon");
      if (aIsAvailable && !bIsAvailable) return -1;
      if (!aIsAvailable && bIsAvailable) return 1;
      return 0;
    });
  }, [products]);
  const [categories, setCategories] = useState<Array<{
    id: string;
    title: string;
    desc: string;
    gradient: string;
    productCount?: number;
  }>>([]);
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState<string | null>(categoryFromUrl);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("newest");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  // Fetch categories on mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch("/api/categories");
        const data = await res.json();
        const cats = data.categories || [];
        const gradients = [
          "linear-gradient(135deg, #1A1A1A 0%, #2d2520 100%)",
          "linear-gradient(135deg, #2d2520 0%, #1A1A1A 100%)",
          "linear-gradient(135deg, #1A1A1A 0%, #3d3228 100%)",
          "linear-gradient(135deg, #3d3228 0%, #2d2520 100%)",
        ];
        
        // Fetch product counts for each category
        const categoriesWithCounts = await Promise.all(
          cats.map(async (c: any, i: number) => {
            try {
              const countRes = await fetch(`/api/products?category=${c.id}`);
              const countData = await countRes.json();
              return {
                id: c.id,
                title: c.title,
                desc: c.description || "",
                gradient: gradients[i % gradients.length],
                productCount: countData.products?.length || 0,
              };
            } catch {
              return {
                id: c.id,
                title: c.title,
                desc: c.description || "",
                gradient: gradients[i % gradients.length],
                productCount: 0,
              };
            }
          })
        );
        
        setCategories(categoriesWithCounts);
      } catch (error) {
        console.error("Failed to fetch categories:", error);
      }
    };
    fetchCategories();
  }, []);

  // Fetch products with filters
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (search) params.append("search", search);
        if (active) params.append("category", active);
        if (minPrice) params.append("minPrice", minPrice);
        if (maxPrice) params.append("maxPrice", maxPrice);
        params.append("sort", sort);

        const res = await fetch(`/api/products?${params.toString()}`);
        const data = await res.json();
        setProducts(data.products ?? []);
      } catch (error) {
        console.error("Failed to fetch products:", error);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(fetchProducts, 300); // Debounce search
    return () => clearTimeout(timer);
  }, [search, active, sort, minPrice, maxPrice]);

  const hasActiveFilters = search || active || minPrice || maxPrice || sort !== "newest";

  const clearFilters = () => {
    setSearch("");
    setActive(null);
    setMinPrice("");
    setMaxPrice("");
    setSort("newest");
  };

  return (
    <div className="section-wrap py-12 sm:py-16">
      {/* Category filter cards */}
      <div className="flex flex-col sm:grid sm:grid-cols-2 gap-5 mb-12 max-w-3xl mx-auto">
        {categories.map((cat) => {
          const isActive = active === cat.id;
          const isEmpty = (cat.productCount || 0) === 0;
          const is3DCasting = cat.id === "3d-casting";
          
          const handleCategoryClick = () => {
            if (isEmpty) {
              showToast("This category is coming soon!", "info");
              return;
            }
            setActive(isActive ? null : cat.id);
          };
          
          return (
            <button
              key={cat.id}
              onClick={handleCategoryClick}
              className="relative overflow-hidden rounded-2xl text-left transition-all duration-300
                         hover:-translate-y-1 group"
              style={{
                background: cat.gradient,
                border: isActive ? "2px solid #C9A84C" : "1px solid rgba(201,168,76,0.2)",
                minHeight: "200px",
                boxShadow: isActive ? "0 0 0 1px #C9A84C, 0 8px 32px rgba(201,168,76,0.2)" : "none",
                opacity: isEmpty || is3DCasting ? 0.7 : 1,
                cursor: isEmpty || is3DCasting ? "not-allowed" : "pointer",
              }}
            >
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{ background: "linear-gradient(135deg, rgba(201,168,76,0.06) 0%, transparent 60%)" }}
              />
              
              {(isEmpty) && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center z-50">
                  <div className="text-center">
                    <p className="text-white font-semibold text-lg">Coming Soon</p>
                  </div>
                </div>
              )}
              
              {isActive && !isEmpty && (
                <div
                  className="absolute top-3 right-3 w-6 h-6 rounded-full flex items-center justify-center z-10"
                  style={{ backgroundColor: "#C9A84C" }}
                >
                  <span className="text-[#1A1A1A] text-xs font-bold">✓</span>
                </div>
              )}
              
              <div className="relative z-10 p-6">
                <div
                  className="inline-flex items-center gap-1.5 text-xs font-semibold tracking-widest uppercase mb-3"
                  style={{ color: "#C9A84C" }}
                >
                  <span className="w-4 h-px" style={{ backgroundColor: "#C9A84C" }} />
                  Collection
                </div>
                <h2 className="font-serif font-bold text-white text-xl sm:text-2xl mb-2">{cat.title}</h2>
                <p className="text-sm leading-relaxed mb-4" style={{ color: "rgba(232,213,163,0.65)" }}>
                  {cat.desc}
                </p>
                <span
                  className="inline-flex items-center gap-1.5 text-sm font-semibold
                                 transition-all duration-300 group-hover:gap-2.5"
                  style={{ color: "#C9A84C" }}
                >
                  {isEmpty ? "Coming Soon" : isActive ? "Showing all →" : "Explore →"}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Category filter chips */}
      {categories.filter(c => (c.productCount || 0) > 0).length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-6 scrollbar-none">
          <button
            onClick={() => setActive(null)}
            className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap
              ${!active
                ? "bg-ink text-canvas shadow-sm"
                : "bg-white text-stone-600 border border-stone-200 hover:border-stone-300"
              }`}
          >
            All Products
          </button>
          {categories
            .filter(c => (c.productCount || 0) > 0)
            .map(cat => (
              <button
                key={cat.id}
                onClick={() => setActive(active === cat.id ? null : cat.id)}
                className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap
                  ${active === cat.id
                    ? "bg-ink text-canvas shadow-sm"
                    : "bg-white text-stone-600 border border-stone-200 hover:border-stone-300"
                  }`}
              >
                {cat.title}
                <span className={`ml-1.5 text-xs ${active === cat.id ? "opacity-60" : "text-stone-400"}`}>
                  ({cat.productCount})
                </span>
              </button>
            ))
          }
        </div>
      )}

      {/* Search & Filters Bar */}
      <div className="mb-8 space-y-4">
        {/* Search */}
        <div className="relative w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white border border-stone-200 rounded-xl text-sm
                       focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/40"
          />
        </div>

        {/* Filter Toggle & Sort */}
        <div className="flex gap-3 flex-wrap">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="px-4 py-2 rounded-xl text-sm font-medium border border-stone-200 bg-white
                       hover:border-stone-300 transition-colors flex items-center gap-2"
          >
            Filters {hasActiveFilters && <span className="w-2 h-2 rounded-full bg-[#C9A84C]" />}
            <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? "rotate-180" : ""}`} />
          </button>

          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="px-4 py-2 rounded-xl text-sm font-medium border border-stone-200 bg-white
                       focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/40"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>

          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="px-4 py-2 rounded-xl text-sm font-medium bg-red-50 text-red-600
                         hover:bg-red-100 transition-colors flex items-center gap-2"
            >
              <X className="w-4 h-4" /> Clear All
            </button>
          )}
        </div>

        {/* Expandable Filters */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="bg-stone-50 rounded-xl p-4 space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-stone-600 uppercase tracking-wide block mb-2">
                      Min Price (₹)
                    </label>
                    <input
                      type="number"
                      placeholder="0"
                      value={minPrice}
                      onChange={(e) => setMinPrice(e.target.value)}
                      className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm
                                 focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/40"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-stone-600 uppercase tracking-wide block mb-2">
                      Max Price (₹)
                    </label>
                    <input
                      type="number"
                      placeholder="10000"
                      value={maxPrice}
                      onChange={(e) => setMaxPrice(e.target.value)}
                      className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm
                                 focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/40"
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Results info */}
      {!loading && (
        <div className="flex items-center justify-between mb-6">
          <p className="text-sm font-medium text-stone-600">
            {products.length} product{products.length !== 1 ? "s" : ""} found
          </p>
          {active && (
            <p className="text-sm text-stone-500">
              Category: <span className="font-semibold text-[#1A1A1A]">
                {categories.find((c) => c.id === active)?.title}
              </span>
            </p>
          )}
        </div>
      )}

      {/* Product grid */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl h-64 animate-pulse border border-stone-100" />
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-4xl mb-3">🔍</p>
          <p className="text-sm text-stone-600 mb-4">No products found matching your criteria.</p>
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="px-4 py-2 rounded-xl text-sm font-medium bg-[#C9A84C] text-[#1A1A1A]
                         hover:opacity-90 transition-opacity"
            >
              Clear Filters
            </button>
          )}
        </div>
      ) : (
        <motion.div layout className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          <AnimatePresence mode="popLayout">
            {sortedProducts.map((product, i) => (
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
      )}
    </div>
  );
}
