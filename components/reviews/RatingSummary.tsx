"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { ShieldCheck } from "lucide-react";

const ease = [0.4, 0, 0.2, 1] as const;

function CountUp({ value, decimals = 0 }: { value: number; decimals?: number }) {
  const [display, setDisplay] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);

  useEffect(() => {
    started.current = false;
    setDisplay(0);
  }, [value]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current && value > 0) {
          started.current = true;
          const duration = 1200;
          const steps = 50;
          let step = 0;
          const timer = setInterval(() => {
            step++;
            const progress = step / steps;
            const eased = 1 - Math.pow(1 - progress, 3);
            setDisplay(Math.round(value * eased * Math.pow(10, decimals)) / Math.pow(10, decimals));
            if (step >= steps) clearInterval(timer);
          }, duration / steps);
        }
      },
      { threshold: 0.5 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [value, decimals]);

  return <span ref={ref}>{display.toFixed(decimals)}</span>;
}

function StarBar({ star, count, max }: { star: number; count: number; max: number }) {
  const pct = max > 0 ? (count / max) * 100 : 0;
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs font-medium text-stone-500 w-4 shrink-0 text-right">{star}</span>
      <span className="text-sage text-xs">★</span>
      <div className="flex-1 h-2 bg-stone-200 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-sage rounded-full"
          initial={{ width: 0 }}
          whileInView={{ width: `${pct}%` }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: (5 - star) * 0.08, ease }}
        />
      </div>
      <span className="text-xs text-stone-400 w-5 shrink-0">{count}</span>
    </div>
  );
}

interface Stats {
  avgRating: number;
  totalCount: number;
  fiveStar: number;
  fourStar: number;
  threeStar: number;
  twoStar: number;
  oneStar: number;
  verifiedCount: number;
}

export default function RatingSummary() {
  const [stats, setStats] = useState<Stats>({
    avgRating: 0, totalCount: 0,
    fiveStar: 0, fourStar: 0, threeStar: 0, twoStar: 0, oneStar: 0,
    verifiedCount: 0,
  });

  useEffect(() => {
    fetch("/api/reviews?limit=1")
      .then((r) => r.ok ? r.json() : null)
      .then((data) => {
        if (!data?.stats) return;
        const s = data.stats;
        setStats({
          avgRating:    Math.round((s.avgRating ?? 0) * 10) / 10,
          totalCount:   s.totalCount ?? 0,
          fiveStar:     s.fiveStar   ?? 0,
          fourStar:     s.fourStar   ?? 0,
          threeStar:    s.threeStar  ?? 0,
          twoStar:      s.twoStar    ?? 0,
          oneStar:      s.oneStar    ?? 0,
          verifiedCount: data.pagination?.total ?? 0,
        });
      })
      .catch(() => {});
  }, []);

  const breakdown = [
    { star: 5, count: stats.fiveStar },
    { star: 4, count: stats.fourStar },
    { star: 3, count: stats.threeStar },
    { star: 2, count: stats.twoStar },
    { star: 1, count: stats.oneStar },
  ];
  const maxCount = Math.max(...breakdown.map((r) => r.count), 1);

  return (
    <div className="bg-canvas py-14 sm:py-20">
      <div className="section-wrap">
        <div className="grid md:grid-cols-2 gap-8 lg:gap-16 items-center max-w-4xl mx-auto">

          {/* Left: rating score */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease }}
            className="text-center md:text-left"
          >
            <p className="font-serif font-bold text-ink leading-none mb-2"
              style={{ fontSize: "clamp(4rem, 12vw, 7rem)", letterSpacing: "-0.04em" }}>
              {stats.totalCount === 0 ? (
                <span>0.0</span>
              ) : (
                <CountUp value={stats.avgRating} decimals={1} />
              )}
              <span className="text-stone-300 font-normal" style={{ fontSize: "0.4em" }}>/5</span>
            </p>

            <div className="flex gap-1 justify-center md:justify-start mb-3">
              {[1, 2, 3, 4, 5].map((s) => (
                <span key={s}
                  className={`text-2xl ${stats.avgRating > 0 && s <= Math.round(stats.avgRating) ? "text-sage" : "text-stone-200"}`}>
                  ★
                </span>
              ))}
            </div>

            <p className="text-stone-500 text-sm">
              {stats.totalCount === 0 ? (
                "No reviews yet — be the first!"
              ) : (
                <>Based on <span className="font-semibold text-ink">{stats.totalCount.toLocaleString("en-IN")}</span> review{stats.totalCount !== 1 ? "s" : ""}</>
              )}
            </p>
          </motion.div>

          {/* Right: breakdown bars */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1, ease }}
            className="space-y-2.5"
          >
            {breakdown.map(({ star, count }) => (
              <StarBar key={star} star={star} count={count} max={maxCount} />
            ))}
          </motion.div>
        </div>

        {/* Verified badge */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.25, ease }}
          className="mt-10 flex justify-center"
        >
          <div className="inline-flex items-center gap-3 bg-white border border-stone-200
                          rounded-2xl px-5 py-3 shadow-soft">
            <div className="w-8 h-8 rounded-xl bg-sage/10 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-4 h-4 text-sage-dark" strokeWidth={2} />
            </div>
            <div>
              <p className="text-xs font-bold text-ink tracking-wide">Verified Reviews</p>
              <p className="text-[11px] text-stone-400 leading-tight">
                Every review is from a confirmed purchase
              </p>
            </div>
            <div className="h-8 w-px bg-stone-200 mx-1" />
            <div className="text-center">
              <p className="text-xs font-bold text-ink">{stats.totalCount}</p>
              <p className="text-[11px] text-stone-400">Total</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
