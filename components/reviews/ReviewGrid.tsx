"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import ReviewCard from "./ReviewCard";
import type { Review } from "@/lib/data/reviews";

const SORT_OPTIONS = [
  { label: "Most Recent",   value: "recent"  },
  { label: "Most Helpful",  value: "helpful" },
  { label: "Highest Rated", value: "high"    },
  { label: "Lowest Rated",  value: "low"     },
];

const FILTER_OPTIONS = [
  { label: "All Stars",       value: "all" },
  { label: "5 Stars ★★★★★",  value: "5"   },
  { label: "4 Stars ★★★★",   value: "4"   },
  { label: "3 Stars ★★★",    value: "3"   },
];

const PAGE_SIZE = 6;

// Shape returned by the API
interface ApiReview {
  _id: string;
  name: string;
  rating: number;
  title: string;
  content: string;
  product: string;
  verified: boolean;
  helpful: number;
  createdAt: string;
  mediaGradient?: string;
}

function apiToReview(r: ApiReview): Review {
  return {
    id:           r._id,
    name:         r.name,
    location:     "",
    rating:       r.rating,
    title:        r.title,
    text:         r.content,
    date:         r.createdAt,
    product:      r.product,
    verified:     r.verified,
    helpful:      r.helpful ?? 0,
    initials:     r.name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase(),
    avatarColor:  "#8FBC8F",
    mediaGradient: r.mediaGradient ?? "linear-gradient(135deg, #EDE5DC 0%, #C4A882 100%)",
  };
}

export default function ReviewGrid() {
  const [reviews, setReviews]   = useState<Review[]>([]);
  const [loading, setLoading]   = useState(true);
  const [sort, setSort]         = useState("recent");
  const [filter, setFilter]     = useState("all");
  const [sortOpen, setSortOpen] = useState(false);
  const [page, setPage]         = useState(1);
  const [total, setTotal]       = useState(0);

  const fetchReviews = useCallback(async (currentSort: string, currentPage: number, reset = false) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/reviews?sort=${currentSort}&page=${currentPage}&limit=${PAGE_SIZE}`);
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      const mapped = (data.reviews ?? []).map(apiToReview);
      setReviews((prev) => reset ? mapped : [...prev, ...mapped]);
      setTotal(data.pagination?.total ?? 0);
    } catch {
      // silently fail — show empty state
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    setPage(1);
    fetchReviews(sort, 1, true);
  }, [sort, fetchReviews]);

  const loadMore = () => {
    const next = page + 1;
    setPage(next);
    fetchReviews(sort, next, false);
  };

  // Client-side star filter
  const filtered = filter === "all"
    ? reviews
    : reviews.filter((r) => r.rating === Number(filter));

  const hasMore = reviews.length < total;
  const activeSortLabel = SORT_OPTIONS.find((o) => o.value === sort)?.label ?? "Sort";

  return (
    <section className="bg-stone-50 py-14 sm:py-20">
      <div className="section-wrap">

        {/* Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-8">
          <div className="flex items-center gap-2 flex-wrap">
            {FILTER_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setFilter(opt.value)}
                className={`px-3.5 py-2 rounded-full text-xs font-semibold tracking-wide
                             transition-all duration-200
                             ${filter === opt.value
                               ? "bg-ink text-canvas shadow-soft"
                               : "bg-white border border-stone-200 text-stone-600 hover:border-stone-300 hover:text-ink"
                             }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          <div className="relative">
            <button
              onClick={() => setSortOpen((v) => !v)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-white
                         border border-stone-200 text-stone-600 text-xs font-semibold
                         hover:border-stone-300 hover:text-ink transition-all duration-200"
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
                             shadow-card border border-stone-100 overflow-hidden z-20"
                >
                  {SORT_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => { setSort(opt.value); setSortOpen(false); }}
                      className={`w-full text-left px-4 py-2.5 text-xs font-medium transition-colors
                                  ${sort === opt.value ? "bg-stone-50 text-ink font-semibold" : "text-stone-600 hover:bg-stone-50 hover:text-ink"}`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <p className="text-xs text-stone-400 mb-6">
          Showing {filtered.length} of {total} review{total !== 1 ? "s" : ""}
        </p>

        {/* Grid */}
        {loading && reviews.length === 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="bg-white rounded-3xl h-64 animate-pulse border border-stone-100" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-3xl mb-3">✍️</p>
            <p className="text-stone-500 text-sm">No reviews yet. Be the first to write one!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
            {filtered.map((review, i) => (
              <ReviewCard key={review.id} review={review} index={i} />
            ))}
          </div>
        )}

        {/* Load more */}
        {hasMore && !loading && (
          <div className="text-center mt-10">
            <button onClick={loadMore} className="btn-outline px-10 py-3.5 text-sm">
              Load More Reviews
            </button>
          </div>
        )}
        {loading && reviews.length > 0 && (
          <div className="text-center mt-6">
            <div className="w-6 h-6 border-2 border-sage border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        )}

      </div>
    </section>
  );
}
