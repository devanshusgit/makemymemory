"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, ChevronDown, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { isUnoptimizableImage } from "@/lib/utils/cloudinary";
import type { Product } from "@/lib/types";
import ProductCard from "./ProductCard";
import { useToast } from "@/lib/context/ToastContext";

const ease = [0.4, 0, 0.2, 1] as const;

// Quick price ranges, set around the current catalogue (₹2,299 – ₹3,599).
const PRICE_RANGES = [
  { label: "Under ₹2,500",     min: "",     max: "2500" },
  { label: "₹2,500 – ₹3,000",  min: "2500", max: "3000" },
  { label: "Above ₹3,000",     min: "3000", max: "" },
];

const SORT_OPTIONS = [
  { value: "newest", label: "Newest" },
  { value: "price-low", label: "Price: Low to High" },
  { value: "price-high", label: "Price: High to Low" },
  { value: "popular", label: "Most Popular" },
  { value: "rating", label: "Highest Rated" },
];


/**
 * Search box with a live suggestion list (up to 4 matching products) under
 * it. Matches name, description and category as the customer types; arrow
 * keys + Enter or a click opens the product. Typing also filters the grid.
 */
function SearchWithSuggestions({ value, onChange, products }: {
  value: string;
  onChange: (v: string) => void;
  products: Product[];
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [highlight, setHighlight] = useState(-1);
  const q = value.trim().toLowerCase();
  const suggestions = useMemo(() => {
    if (!q) return [];
    return products
      .filter((p) => [p.name, p.description, p.category].some((t) => t?.toLowerCase().includes(q)))
      .slice(0, 4);
  }, [q, products]);
  const showList = open && q.length > 0;

  return (
    <div className="relative w-full">
      <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" aria-hidden="true" />
      <input
        id="shop-search"
        type="search"
        role="combobox"
        aria-label="Search products"
        aria-expanded={showList}
        aria-controls="shop-search-suggestions"
        aria-autocomplete="list"
        aria-activedescendant={showList && highlight >= 0 ? `shop-suggestion-${highlight}` : undefined}
        autoComplete="off"
        placeholder="Search products..."
        value={value}
        onChange={(e) => { onChange(e.target.value); setOpen(true); setHighlight(-1); }}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        onKeyDown={(e) => {
          if (!showList) return;
          if (e.key === "ArrowDown") { e.preventDefault(); setHighlight((h) => Math.min(h + 1, suggestions.length - 1)); }
          else if (e.key === "ArrowUp") { e.preventDefault(); setHighlight((h) => Math.max(h - 1, -1)); }
          else if (e.key === "Enter" && highlight >= 0 && suggestions[highlight]) { e.preventDefault(); router.push(`/shop/${suggestions[highlight].slug}`); }
          else if (e.key === "Escape") setOpen(false);
        }}
        className="w-full pl-10 pr-4 py-3 bg-white border border-stone-200 rounded-xl text-sm
                   focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/40"
      />
      {showList && (
        <ul id="shop-search-suggestions" role="listbox" aria-label="Suggested products"
          className="absolute z-20 left-0 right-0 mt-2 bg-white border border-stone-200 rounded-xl shadow-lg overflow-hidden">
          {suggestions.length ? suggestions.map((p, i) => (
            <li key={p.id} id={`shop-suggestion-${i}`} role="option" aria-selected={i === highlight}>
              <Link
                href={`/shop/${p.slug}`}
                // Keep focus in the input until the click lands, so the list doesn't close first.
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => setOpen(false)}
                className={`flex items-center gap-3 px-4 py-2.5 transition-colors hover:bg-stone-50${i === highlight ? " bg-stone-50" : ""}`}
              >
                <span className="relative w-10 h-10 rounded-lg overflow-hidden bg-stone-100 shrink-0">
                  {p.images?.[0] && <Image src={p.images[0]} alt="" fill unoptimized={isUnoptimizableImage(p.images[0])} sizes="40px" className="object-cover" />}
                </span>
                <span className="flex-1 min-w-0">
                  <span className="block text-sm font-medium text-ink truncate">{p.name}</span>
                  <span className="block text-xs text-stone-500">₹{p.price.toLocaleString("en-IN")}</span>
                </span>
              </Link>
            </li>
          )) : (
            <li role="option" aria-selected={false} aria-disabled="true" className="px-4 py-3 text-sm text-stone-500">
              No products match “{value.trim()}”
            </li>
          )}
        </ul>
      )}
    </div>
  );
}

export default function ShopClient({ initialProducts }: { initialProducts?: Product[] }) {
  const { showToast } = useToast();

  // Server-loaded products put the grid in the HTML (visible to Google and AI
  // crawlers). The first browser fetch is skipped when they're present.
  const hasInitial = !!initialProducts?.length;
  const [products, setProducts] = useState<Product[]>(initialProducts ?? []);
  // Unfiltered catalogue, used for search suggestions.
  const [allProducts, setAllProducts] = useState<Product[]>(initialProducts ?? []);
  const skipFirstFetch = useRef(hasInitial);

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
  const [loading, setLoading] = useState(!hasInitial);
  // True when the catalogue request itself failed (e.g. the API answers 503
  // while the database is down) — kept apart from "no products matched".
  const [loadError, setLoadError] = useState(false);
  // Read ?category= after load instead of with useSearchParams(), which would
  // force the whole grid to render only in the browser on this static page.
  const [active, setActive] = useState<string | null>(null);
  useEffect(() => {
    const fromUrl = new URLSearchParams(window.location.search).get("category");
    if (fromUrl) setActive(fromUrl);
  }, []);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("newest");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [totalProductCount, setTotalProductCount] = useState<number | null>(hasInitial ? initialProducts!.length : null);

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
    if (skipFirstFetch.current) {
      skipFirstFetch.current = false;
      return;
    }
    const fetchProducts = async () => {
      setLoading(true);
      setLoadError(false);
      try {
        const params = new URLSearchParams();
        if (search) params.append("search", search);
        if (active) params.append("category", active);
        if (minPrice) params.append("minPrice", minPrice);
        if (maxPrice) params.append("maxPrice", maxPrice);
        params.append("sort", sort);

        const res = await fetch(`/api/products?${params.toString()}`);
        // A failed request (the API answers 503 when the DB is down) must not be
        // mistaken for an empty catalogue, or we tell the customer we sell nothing.
        if (!res.ok) {
          throw new Error(`Products request failed with status ${res.status}`);
        }
        const data = await res.json();
        setProducts(data.products ?? []);
        // Capture the true catalog size from the unfiltered baseline fetch, so
        // the search/filter/sort/category UI can hide itself on a tiny catalog
        // (it currently advertises 5 sort modes and empty "Coming Soon"
        // collections over a 2-product store).
        if (!search && !active && !minPrice && !maxPrice && sort === "newest") {
          setTotalProductCount((data.products ?? []).length);
          setAllProducts(data.products ?? []);
        }
      } catch (error) {
        console.error("Failed to fetch products:", error);
        setProducts([]);
        setLoadError(true);
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(fetchProducts, 300); // Debounce search
    return () => clearTimeout(timer);
  }, [search, active, sort, minPrice, maxPrice]);

  const hasActiveFilters = search || active || minPrice || maxPrice || sort !== "newest";
  // Sorting alone can never empty the grid, so the empty state only counts the
  // narrowing filters when deciding whether to blame the customer's criteria.
  const hasNarrowingFilters = Boolean(search || active || minPrice || maxPrice);

  const clearFilters = () => {
    setSearch("");
    setActive(null);
    setMinPrice("");
    setMaxPrice("");
    setSort("newest");
  };

  // On a tiny catalog, category tiles ("Coming Soon" overlays on empty
  // collections) and a 5-option sort/search/filter bar just advertise a
  // bigger store than exists — hide both until there's enough inventory
  // to justify browsing controls, and show products straight away.
  const showBrowseControls = totalProductCount === null || totalProductCount >= 8;
  // Sorting and price filters are useful as soon as there is more than one
  // product to compare — they were hidden behind the same 8-product gate as the
  // category tiles, so a 6-product shop had no way to sort by price at all.
  const showFilterBar = totalProductCount === null || totalProductCount >= 2;
  // Category tiles and chips only help when there is more than one category to
  // pick from; a single tile just repeats the whole catalogue.
  const categoriesWithProducts = categories.filter((c) => (c.productCount || 0) > 0);
  const showCategoryControls = categoriesWithProducts.length >= 2;

  return (
    <div className="section-wrap py-12 sm:py-16">
      {/* Category filter cards */}
      {showBrowseControls && showCategoryControls && (
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
      )}

      {/* Category filter chips */}
      {showCategoryControls && (
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

      {/* Search — always shown (even on a small catalogue), with suggestions */}
      <div className="mb-8 max-w-xl mx-auto">
        <SearchWithSuggestions value={search} onChange={setSearch} products={allProducts} />
      </div>

      {/* Filters Bar */}
      {showFilterBar && (
      <div className="mb-8 space-y-4">
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
                <div>
                  <p className="text-xs font-semibold text-stone-600 uppercase tracking-wide mb-2">Price</p>
                  <div className="flex flex-wrap gap-2">
                    {PRICE_RANGES.map((r) => {
                      const on = minPrice === r.min && maxPrice === r.max;
                      return (
                        <button key={r.label} type="button"
                          onClick={() => { setMinPrice(on ? "" : r.min); setMaxPrice(on ? "" : r.max); }}
                          className="px-3 py-1.5 rounded-full text-xs font-medium border transition-colors"
                          style={{
                            borderColor: on ? "#C9A84C" : "#E7E5E4",
                            backgroundColor: on ? "rgba(201,168,76,0.12)" : "#FFFFFF",
                            color: "#1A1A1A",
                          }}>
                          {r.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
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
      )}

      {/* Results info — a failed request has no count to report */}
      {!loading && !loadError && (
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
        <div className="grid grid-cols-4 gap-2 sm:gap-5">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl h-64 animate-pulse border border-stone-100" />
          ))}
        </div>
      ) : loadError ? (
        <div className="text-center py-20">
          <p className="text-4xl mb-3">⚠️</p>
          <p className="text-sm text-stone-600 mb-4">
            We&apos;re having trouble loading products — please refresh or try again shortly.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 rounded-xl text-sm font-medium bg-[#C9A84C] text-[#1A1A1A]
                       hover:opacity-90 transition-opacity"
          >
            Refresh
          </button>
        </div>
      ) : products.length === 0 ? (
        hasNarrowingFilters ? (
          <div className="text-center py-20">
            <p className="text-4xl mb-3">🔍</p>
            <p className="text-sm text-stone-600 mb-4">No products found matching your criteria.</p>
            <button
              onClick={clearFilters}
              className="px-4 py-2 rounded-xl text-sm font-medium bg-[#C9A84C] text-[#1A1A1A]
                         hover:opacity-90 transition-opacity"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="text-center py-20">
            <p className="text-4xl mb-3">✨</p>
            <p className="text-sm text-stone-600">
              Products coming soon — new pieces are on their way.
            </p>
          </div>
        )
      ) : (
        <motion.div layout className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-5">
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
