"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Star } from "lucide-react";

interface Stats {
  avgRating: number;
  totalCount: number;
  fiveStar: number;
  fourStar: number;
  threeStar: number;
  twoStar: number;
  oneStar: number;
}

function StarBar({ star, count, max }: { star: number; count: number; max: number }) {
  const pct = max > 0 ? (count / max) * 100 : 0;
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs w-3 shrink-0 text-right" style={{ color: "#6B6560" }}>{star}</span>
      <Star className="w-3 h-3 shrink-0" style={{ fill: "#C9A84C", color: "#C9A84C" }} />
      <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ backgroundColor: "#F0EBE1" }}>
        <div className="h-full rounded-full transition-all duration-700"
          style={{ width: `${pct}%`, backgroundColor: "#C9A84C" }} />
      </div>
      <span className="text-xs w-4 shrink-0" style={{ color: "#6B6560" }}>{count}</span>
    </div>
  );
}

export default function ReviewsModal() {
  const [open, setOpen] = useState(false);
  const [stats, setStats] = useState<Stats>({
    avgRating: 0, totalCount: 0,
    fiveStar: 0, fourStar: 0, threeStar: 0, twoStar: 0, oneStar: 0,
  });

  useEffect(() => {
    if (open) {
      fetch("/api/reviews?limit=1")
        .then((r) => r.ok ? r.json() : null)
        .then((d) => {
          if (!d?.stats) return;
          const s = d.stats;
          setStats({
            avgRating:  Math.round((s.avgRating ?? 0) * 10) / 10,
            totalCount: s.totalCount ?? 0,
            fiveStar:   s.fiveStar   ?? 0,
            fourStar:   s.fourStar   ?? 0,
            threeStar:  s.threeStar  ?? 0,
            twoStar:    s.twoStar    ?? 0,
            oneStar:    s.oneStar    ?? 0,
          });
        })
        .catch(() => {});
    }
  }, [open]);

  const breakdown = [
    { star: 5, count: stats.fiveStar },
    { star: 4, count: stats.fourStar },
    { star: 3, count: stats.threeStar },
    { star: 2, count: stats.twoStar },
    { star: 1, count: stats.oneStar },
  ];
  const maxCount = Math.max(...breakdown.map((r) => r.count), 1);

  return (
    <>
      {/* ── Vertical "★ READ REVIEWS" tab — fixed right edge ── */}
      <div className="fixed right-0 top-1/2 -translate-y-1/2 z-30 pointer-events-none">
        <button
          onClick={() => setOpen(true)}
          aria-label="Read Reviews"
          className="pointer-events-auto block rounded-l-xl shadow-lg
                     transition-all duration-300 hover:pr-1"
          style={{ backgroundColor: "#C9A84C", width: "28px" }}
        >
          <span
            className="flex items-center justify-center gap-1.5 py-5
                       text-[10px] font-semibold tracking-widest uppercase"
            style={{ writingMode: "vertical-rl", transform: "rotate(0deg)", color: "#1A1A1A" }}
          >
            <span>★</span>
            Read Reviews
          </span>
        </button>
      </div>

      {/* ── Modal ── */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-40"
              style={{ backgroundColor: "rgba(26,26,26,0.6)" }}
              onClick={() => setOpen(false)}
            />
            <motion.div
              key="modal"
              initial={{ opacity: 0, scale: 0.94, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 16 }}
              transition={{ duration: 0.28, ease: [0.4, 0, 0.2, 1] }}
              className="fixed inset-0 z-50 flex items-center justify-center px-4"
              style={{ pointerEvents: "none" }}
            >
              <div className="w-full max-w-lg rounded-2xl p-7 sm:p-8 relative"
                style={{ backgroundColor: "#ffffff", pointerEvents: "auto" }}>

                <button onClick={() => setOpen(false)} aria-label="Close"
                  className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center
                             justify-center transition-colors hover:bg-stone-100"
                  style={{ color: "#6B6560" }}>
                  <X className="w-4 h-4" />
                </button>

                <h2 className="font-serif font-bold text-2xl mb-1" style={{ color: "#1A1A1A" }}>
                  Customer Reviews
                </h2>
                <p className="text-sm mb-6" style={{ color: "#6B6560" }}>
                  {stats.totalCount === 0
                    ? "No reviews yet — be the first!"
                    : `Based on ${stats.totalCount} review${stats.totalCount !== 1 ? "s" : ""}`}
                </p>

                {/* Big rating */}
                <div className="flex items-center gap-6 mb-6">
                  <div className="text-center">
                    <p className="font-serif font-bold leading-none"
                      style={{ fontSize: "4rem", color: "#1A1A1A" }}>
                      {stats.avgRating > 0 ? stats.avgRating.toFixed(1) : "0.0"}
                    </p>
                    <div className="flex gap-0.5 justify-center mt-1">
                      {[1,2,3,4,5].map((s) => (
                        <Star key={s} className="w-4 h-4"
                          style={{ fill: stats.avgRating >= s ? "#C9A84C" : "#E8D5A3", color: "#C9A84C" }} />
                      ))}
                    </div>
                    <p className="text-xs mt-1" style={{ color: "#6B6560" }}>out of 5</p>
                  </div>
                  <div className="flex-1 space-y-2">
                    {breakdown.map(({ star, count }) => (
                      <StarBar key={star} star={star} count={count} max={maxCount} />
                    ))}
                  </div>
                </div>

                <div className="flex gap-3">
                  <a href="/reviews"
                    className="flex-1 py-3 rounded-full text-sm font-semibold text-center
                               transition-all duration-300 hover:bg-[#C9A84C] hover:text-[#1A1A1A]"
                    style={{ border: "1.5px solid #C9A84C", color: "#C9A84C" }}>
                    Read All Reviews
                  </a>
                  <a href="/reviews#write-review"
                    className="flex-1 py-3 rounded-full text-sm font-semibold text-center
                               transition-all duration-300 hover:bg-[#C9A84C] hover:text-[#1A1A1A]"
                    style={{ backgroundColor: "#1A1A1A", color: "#ffffff" }}>
                    Write a Review
                  </a>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
