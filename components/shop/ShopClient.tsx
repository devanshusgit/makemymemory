"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, ChevronDown, X } from "lucide-react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import Image from "next/image";
import { isUnoptimizableImage } from "@/lib/utils/cloudinary";
import type { Product } from "@/lib/types";
import ProductCard from "./ProductCard";
import { useToast } from "@/lib/context/ToastContext";
import { HIGHLIGHTS } from "@/lib/products/ranking";

const ease = [0.4, 0, 0.2, 1] as const;

// Quick price ranges, set around the current catalogue (₹2,299 – ₹3,599).
const PRICE_RANGES = [
  { label: "Under ₹2,500",     min: "",     max: "2500" },
  { label: "₹2,500 – ₹3,000",  min: "2500", max: "3000" },
  { label: "Above ₹3,000",     min: "3000", max: "" },
];

const SORT_OPTIONS = [
  { value: "recommended", label: "Recommended" },
  { value: "newest", label: "Newest" },
  { value: "price-low", label: "Price: Low to High" },
  { value: "price-high", label: "Price: High to Low" },
  { value: "popular", label: "Most Popular" },
  { value: "rating", label: "Highest Rated" },
];

// Page heading per sub-category. Others fall back to their category title.
const SUB_HEADINGS = new Map<string, string>([
  ["baby", "Baby Handprint & Footprint Frames"],
  ["pet", "Pet Paw Print Frames"],
  ["family", "Family Handprint Frames"],
  ["ashirwad", "Parents' Ashirwad Frames"],
  ["devotional", "Devotional Imprint Frames"],
]);
const HEADING_EVENT = "mmm:shop-heading";

/**
 * Text of the shop page's <h1>, which lives in the server-rendered hero.
 * Renders `fallback` (the default heading, so it is in the HTML for Google)
 * and switches to the picked sub-category or category when ShopClient
 * reports one.
 */
export function ShopHeading({ fallback }: { fallback: string }) {
  const [text, setText] = useState<string | null>(null);
  useEffect(() => {
    const onChange = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      setText(typeof detail === "string" && detail ? detail : null);
    };
    window.addEventListener(HEADING_EVENT, onChange);
    return () => window.removeEventListener(HEADING_EVENT, onChange);
  }, []);
  return <>{text ?? fallback}</>;
}

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
    parentId: string;
    comingSoon: boolean;
    productCount?: number;
  }>>([]);
  const [loading, setLoading] = useState(!hasInitial);
  // True when the catalogue request itself failed (e.g. the API answers 503
  // while the database is down) — kept apart from "no products matched".
  const [loadError, setLoadError] = useState(false);
  // Read ?category= after load instead of with useSearchParams(), which would
  // force the whole grid to render only in the browser on this static page.
  const [active, setActive] = useState<string | null>(null);
  // Sub-category inside the main one (Baby, Pet, Family...). Filtered in the
  // browser: the main category's products are already loaded.
  const [sub, setSub] = useState<string | null>(null);
  // ?category= / ?sub= (the menu's category links). Re-read on every URL
  // change, so picking another category from the menu while already on /shop works.
  const pathname = usePathname();
  const [urlKey, setUrlKey] = useState("");
  useEffect(() => {
    const read = () => setUrlKey(window.location.search);
    const fromMenu = (e: Event) => setUrlKey(String((e as CustomEvent).detail ?? ""));
    read();
    window.addEventListener("popstate", read);
    window.addEventListener("mmm:shop-url", fromMenu);
    return () => {
      window.removeEventListener("popstate", read);
      window.removeEventListener("mmm:shop-url", fromMenu);
    };
  }, [pathname]);
  useEffect(() => {
    const params = new URLSearchParams(urlKey);
    setActive(params.get("category") || null);
    setSub(params.get("sub")?.toLowerCase() || null);
  }, [urlKey]);
  const [search, setSearch] = useState("");
  // Default order: Best Seller, Popular, Best Value, New, then the rest
  // (lib/products/ranking.ts) — no longer "last upload first".
  const [sort, setSort] = useState("recommended");
  // Lets a shopper see only e.g. the popular pieces. Applied in the browser:
  // the whole catalogue is already loaded.
  const [highlight, setHighlight] = useState<string | null>(null);
  const visibleProducts = useMemo(
    () => sortedProducts
      .filter((p) => !highlight || (p.badge ?? "").trim().toLowerCase() === highlight.toLowerCase())
      .filter((p) => !sub || (p.subcategory ?? "").toLowerCase() === sub),
    [sortedProducts, highlight, sub]
  );
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
        
        // /api/categories already counts products per category.
        const categoriesWithCounts = cats.map((c: any, i: number) => ({
          id: c.id,
          title: c.title,
          desc: c.description || "",
          gradient: gradients[i % gradients.length],
          parentId: c.parentId || "",
          comingSoon: !!c.comingSoon,
          productCount: c.productCount || 0,
        }));

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
        if (!search && !active && !minPrice && !maxPrice && sort === "recommended") {
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

  const hasActiveFilters = search || active || sub || minPrice || maxPrice || highlight || sort !== "recommended";
  // Sorting alone can never empty the grid, so the empty state only counts the
  // narrowing filters when deciding whether to blame the customer's criteria.
  const hasNarrowingFilters = Boolean(search || active || sub || minPrice || maxPrice || highlight);

  const clearFilters = () => {
    setSearch("");
    setActive(null);
    setSub(null);
    setMinPrice("");
    setMaxPrice("");
    setSort("recommended");
    setHighlight(null);
  };

  // Sorting and price filters are useful as soon as there is more than one
  // product to compare.
  const showFilterBar = totalProductCount === null || totalProductCount >= 2;
  // Shop structure: main categories as cards (Foil Imprints Frame, 3D Casting
  // Kit, DIY Baby Imprints Frame), and the chosen one's sub-categories (Baby,
  // Pet, Family, Ashirwad, Devotional) as chips. A main category is "coming
  // soon" when Admin marks it so or it has no products yet.
  const topCategories = categories.filter((c) => !c.parentId);
  const isComingSoon = (c: { comingSoon: boolean; productCount?: number }) => c.comingSoon || !c.productCount;
  // With nothing picked, the sub-category chips belong to the one main
  // category that has products (today: Foil Imprints Frame).
  const openTop = topCategories.filter((c) => !isComingSoon(c));
  const chipParent = active ?? (openTop.length === 1 ? openTop[0].id : null);
  const subCategories = chipParent ? categories.filter((c) => c.parentId === chipParent) : [];
  const subCount = (id: string) => allProducts.filter((p) => (p.subcategory ?? "").toLowerCase() === id).length;
  const availableHighlights = HIGHLIGHTS.filter((h) =>
    allProducts.some((p) => (p.badge ?? "").trim().toLowerCase() === h.badge.toLowerCase())
  );
  // Tell the hero <h1> what is picked; null keeps its default text.
  const titleOf = (id: string) => categories.find((c) => c.id === id)?.title ?? null;
  const heading = sub ? SUB_HEADINGS.get(sub) ?? titleOf(sub) : active ? titleOf(active) : null;
  useEffect(() => {
    window.dispatchEvent(new CustomEvent(HEADING_EVENT, { detail: heading }));
  }, [heading]);

  return (
    <div className="section-wrap py-12 sm:py-16">
      {/* Sub-categories of the chosen main category */}
      {subCategories.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-6 scrollbar-none">
          <button
            onClick={() => setSub(null)}
            className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap
              ${!sub
                ? "bg-ink text-canvas shadow-sm"
                : "bg-white text-stone-600 border border-stone-200 hover:border-stone-300"
              }`}
          >
            All
          </button>
          {subCategories.map((c) => {
            const count = subCount(c.id);
            const on = sub === c.id;
            return (
              <button
                key={c.id}
                onClick={() => {
                  if (!count) { showToast(`${c.title} designs are coming soon!`, "info"); return; }
                  setSub(on ? null : c.id);
                }}
                className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap
                  ${on
                    ? "bg-ink text-canvas shadow-sm"
                    : count
                      ? "bg-white text-stone-600 border border-stone-200 hover:border-stone-300"
                      : "bg-white text-stone-400 border border-dashed border-stone-200"
                  }`}
              >
                {c.title}
                <span className={`ml-1.5 text-xs ${on ? "opacity-60" : "text-stone-400"}`}>
                  {count ? `(${count})` : "· soon"}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* Search — always shown (even on a small catalogue), with suggestions */}
      <div className="mb-8 max-w-xl mx-auto">
        <SearchWithSuggestions value={search} onChange={setSearch} products={allProducts} />
      </div>

      {/* Browse by highlight — only the ones some product actually carries.
          Worded for shoppers ("Best Sellers"), never "badge". */}
      {availableHighlights.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-6 scrollbar-none">
          <button
            onClick={() => setHighlight(null)}
            className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap
              ${!highlight ? "bg-ink text-canvas shadow-sm" : "bg-white text-stone-600 border border-stone-200 hover:border-stone-300"}`}
          >
            All
          </button>
          {availableHighlights.map((h) => (
            <button
              key={h.badge}
              onClick={() => setHighlight(highlight === h.badge ? null : h.badge)}
              className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap
                ${highlight === h.badge ? "bg-ink text-canvas shadow-sm" : "bg-white text-stone-600 border border-stone-200 hover:border-stone-300"}`}
            >
              {h.label}
            </button>
          ))}
        </div>
      )}

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
            {visibleProducts.length} product{visibleProducts.length !== 1 ? "s" : ""} found
          </p>
          {(active || sub) && (
            <p className="text-sm text-stone-500">
              Category: <span className="font-semibold text-[#1A1A1A]">
                {[active, sub].filter(Boolean).map((id) => categories.find((c) => c.id === id)?.title).filter(Boolean).join(" › ")}
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
      ) : visibleProducts.length === 0 ? (
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
            {visibleProducts.map((product, i) => (
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
