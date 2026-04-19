"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { REVIEWS } from "@/lib/data/reviews";
import ReviewCard from "./ReviewCard";

const SORT_OPTIONS = [
  { label: "Most Recent",  value: "recent" },
  { label: "Most Helpful", value: "helpful" },
  { label: "Highest Rated", value: "high" },
  { label: "Lowest Rated",  value: "low" },
];

const FILTER_OPTIONS = [
  { label: "All Stars",  value: "all" },
  { label: "5 Stars ★★★★★", value: "5" },
  { label: "4 Stars ★★★★",  value: "4" },
  { label: "3 Stars ★★★",   value: "3" },
  { label: "With Photos/Videos", value: "media" },
];

const PAGE_SIZE = 6;

export default function ReviewGrid() {
  const [sort, setSort]         = useState("recent");
  const [filter, setFilter]     = useState("all");
  const [sortOpen, setSortOpen] = useState(false);
  const [page, setPage]         = useState(1);

  const processed = useMemo(() => {
    let list = [...REVIEWS];

    // Filter
    if (filter === "media") {
      list = list.filter((r) => r.mediaType);
    } else if (filter !== "all") {
      list = list.filter((r) => r.rating === Number(filter));
    }

    // Sort
    switch (sort) {
      case "helpful": list.sort((a, b) => b.helpful - a.helpful); break;
      case "high":    list.sort((a, b) => b.rating  - a.rating);  break;
      case "low":     list.sort((a, b) => a.rating  - b.rating);  break;
      default:        list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }

    return list;
  }, [sort, filter]);

  const visible = processed.slice(0, page * PAGE_SIZE);
  const hasMore = visible.length < processed.length;

  const activeSortLabel = SORT_OPTIONS.find((o) => o.value === sort)?.label ?? "Sort";

  return (
    <section className="bg-stone-50 py-14 sm:py-20">
      <div className="section-wrap">

        {/* ── Toolbar ── */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-8">
          <div className="flex items-center gap-2 flex-wrap">
            {FILTER_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => { setFilter(opt.value); setPage(1); }}
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

          {/* Sort */}
          <div className="relative">
            <button
              onClick={() => setSortOpen((v) => !v)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-white
                         border border-stone-200 text-stone-600 text-xs font-semibold
                         hover:border-stone-300 hover:text-ink transition-all duration-200"
            >
              {activeSortLabel}
              <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200
                                       ${sortOpen ? "rotate-180" : ""}`} />
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
                      onClick={() => { setSort(opt.value); setSortOpen(false); setPage(1); }}
                      className={`w-full text-left px-4 py-2.5 text-xs font-medium
                                  transition-colors duration-150
                                  ${sort === opt.value
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

        {/* Result count */}
        <p className="text-xs text-stone-400 mb-6">
          Showing {visible.length} of {processed.length} review{processed.length !== 1 ? "s" : ""}
        </p>

        {/* ── Grid ── */}
        {processed.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-3xl mb-3">🔍</p>
            <p className="text-stone-500 text-sm">No reviews match this filter.</p>
            <button
              onClick={() => setFilter("all")}
              className="mt-4 text-xs font-semibold text-sage-dark underline underline-offset-2"
            >
              Clear filter
            </button>
          </div>
        ) : (
          <motion.div
            layout
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6"
          >
            <AnimatePresence mode="popLayout">
              {visible.map((review, i) => (
                <ReviewCard key={review.id} review={review} index={i} />
              ))}
            </AnimatePresence>
          </motion.div>
        )}

        {/* Load more */}
        {hasMore && (
          <div className="text-center mt-10">
            <button
              onClick={() => setPage((p) => p + 1)}
              className="btn-outline px-10 py-3.5 text-sm"
            >
              Load More Reviews
            </button>
          </div>
        )}

      </div>
    </section>
  );
}
