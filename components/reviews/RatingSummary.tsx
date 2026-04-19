"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { ShieldCheck } from "lucide-react";
import { OVERALL_RATING, TOTAL_REVIEWS, RATING_BREAKDOWN, REVIEWS } from "@/lib/data/reviews";

const ease = [0.4, 0, 0.2, 1] as const;

/* Animated number that counts up when scrolled into view */
function CountUp({ value, decimals = 0 }: { value: number; decimals?: number }) {
  const [display, setDisplay] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          const duration = 1200;
          const steps = 50;
          let step = 0;
          const timer = setInterval(() => {
            step++;
            const progress = step / steps;
            const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
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

/* Single star bar row */
function StarBar({ star, count, max }: { star: number; count: number; max: number }) {
  const pct = max > 0 ? (count / max) * 100 : 0;
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs font-medium text-stone-500 w-4 shrink-0 text-right">
        {star}
      </span>
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

export default function RatingSummary() {
  const maxCount = Math.max(...RATING_BREAKDOWN.map((r) => r.count));

  return (
    <div className="bg-canvas py-14 sm:py-20">
      <div className="section-wrap">
        <div className="grid md:grid-cols-2 gap-8 lg:gap-16 items-center max-w-4xl mx-auto">

          {/* ── Left: big rating number ── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease }}
            className="text-center md:text-left"
          >
            {/* Score */}
            <p
              className="font-serif font-bold text-ink leading-none mb-2"
              style={{ fontSize: "clamp(4rem, 12vw, 7rem)", letterSpacing: "-0.04em" }}
            >
              <CountUp value={OVERALL_RATING} decimals={1} />
              <span className="text-stone-300 font-normal" style={{ fontSize: "0.4em" }}>
                /5
              </span>
            </p>

            {/* Stars */}
            <div className="flex gap-1 justify-center md:justify-start mb-3">
              {[1, 2, 3, 4, 5].map((s) => (
                <span
                  key={s}
                  className={`text-2xl ${s <= Math.round(OVERALL_RATING) ? "text-sage" : "text-stone-200"}`}
                >
                  ★
                </span>
              ))}
            </div>

            {/* Count */}
            <p className="text-stone-500 text-sm">
              Based on{" "}
              <span className="font-semibold text-ink">
                {TOTAL_REVIEWS.toLocaleString("en-IN")}
              </span>{" "}
              reviews
            </p>
          </motion.div>

          {/* ── Right: breakdown bars ── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1, ease }}
            className="space-y-2.5"
          >
            {RATING_BREAKDOWN.map(({ star, count }) => (
              <StarBar key={star} star={star} count={count} max={maxCount} />
            ))}
          </motion.div>
        </div>

        {/* ── Verified badge ── */}
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
              <p className="text-xs font-bold text-ink">
                {REVIEWS.filter((r) => r.verified).length}/{REVIEWS.length}
              </p>
              <p className="text-[11px] text-stone-400">Verified</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
