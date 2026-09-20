"use client";

import { useEffect, useState } from "react";

interface StatsData {
  happyCustomers: number;
  memoriesCreated: number;
  averageRating: number;
  founded: number;
}

// Shown until the API answers, and kept whenever it cannot be trusted, so the
// strip never renders a blank (or NaN) gold number above its label.
const DEFAULT_STATS: StatsData = {
  happyCustomers: 1000,
  memoriesCreated: 1000,
  averageRating: 0,
  founded: 2026,
};

function pickNumber(value: unknown, fallback: number): number {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

// A degraded payload (missing or null fields) falls back field by field rather
// than wiping the whole strip.
function mergeStats(incoming: Partial<StatsData> | null | undefined): StatsData {
  return {
    happyCustomers: pickNumber(incoming?.happyCustomers, DEFAULT_STATS.happyCustomers),
    memoriesCreated: pickNumber(incoming?.memoriesCreated, DEFAULT_STATS.memoriesCreated),
    averageRating: pickNumber(incoming?.averageRating, DEFAULT_STATS.averageRating),
    founded: pickNumber(incoming?.founded, DEFAULT_STATS.founded),
  };
}

function CountingNumber({ end, suffix, duration = 2000 }: { end: number; suffix: string; duration?: number }) {
  const [count, setCount] = useState(0);
  const target = Number.isFinite(end) ? end : 0;

  useEffect(() => {
    let startTime: number;
    let animationId: number;

    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      setCount(Math.floor(target * progress));

      if (progress < 1) {
        animationId = requestAnimationFrame(animate);
      } else {
        setCount(target);
      }
    };

    animationId = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animationId);
  }, [target, duration]);

  return (
    <>
      {count}
      {suffix}
    </>
  );
}

function RatingCounter({ rating }: { rating: number | null }) {
  // null = no approved reviews yet (or still loading) — shown as "New"
  // rather than a literal "0★", which reads as a genuinely bad rating
  // instead of "nobody's rated us yet". The average is calculated on the
  // server from every approved review (/api/stats), so approving a review
  // in Admin updates it automatically.
  return rating === null ? <>New</> : <>{rating}★</>;
}

export default function AnimatedStats() {
  const [isVisible, setIsVisible] = useState(false);
  const [stats, setStats] = useState<StatsData>({
    happyCustomers: 1000,
    memoriesCreated: 2500,
    averageRating: 0,
    founded: 2020,
  });

  const [rating, setRating] = useState<number | null>(null);

  useEffect(() => {
    setIsVisible(true);
    
    // Counters (set in Admin → Settings) and the average review rating, in one public call.
    fetch("/api/stats")
      .then((r) => r.ok ? r.json() : null)
      .then((d) => {
        if (d?.stats) setStats((prev) => ({ ...prev, ...d.stats }));
        if (d) setRating(typeof d.rating === "number" ? d.rating : null);
      })
      .catch(() => {});
  }, []);

  return (
    <section className="relative w-full py-8 sm:py-12 md:py-16 overflow-hidden bg-section-stats">

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Always 4 in one row - flex layout */}
        <div className="flex flex-row justify-around items-center w-full gap-2 sm:gap-4">
          
          {/* Happy Customers */}
          <div
            className="text-center flex-1"
            style={{
              opacity: isVisible ? 1 : 0,
              transform: isVisible ? "translateY(0)" : "translateY(20px)",
              transition: "all 0.6s ease 0s",
            }}
          >
            <div
              className="font-serif font-bold text-3xl sm:text-2xl md:text-4xl lg:text-5xl mb-1"
              style={{ color: "#C9A84C" }}
            >
              {isVisible && <CountingNumber end={stats.happyCustomers} suffix="+" duration={2000} />}
            </div>
            <div className="text-xs sm:text-sm font-medium text-stone-600 leading-tight">
              Happy Customers
            </div>
          </div>

          {/* Memories Created */}
          <div
            className="text-center flex-1"
            style={{
              opacity: isVisible ? 1 : 0,
              transform: isVisible ? "translateY(0)" : "translateY(20px)",
              transition: "all 0.6s ease 0.1s",
            }}
          >
            <div
              className="font-serif font-bold text-3xl sm:text-2xl md:text-4xl lg:text-5xl mb-1"
              style={{ color: "#C9A84C" }}
            >
              {isVisible && <CountingNumber end={stats.memoriesCreated} suffix="+" duration={2000} />}
            </div>
            <div className="text-xs sm:text-sm font-medium text-stone-600 leading-tight">
              Memories Created
            </div>
          </div>

          {/* Average Rating */}
          <div
            className="text-center flex-1"
            style={{
              opacity: isVisible ? 1 : 0,
              transform: isVisible ? "translateY(0)" : "translateY(20px)",
              transition: "all 0.6s ease 0.2s",
            }}
          >
            <div
              className="font-serif font-bold text-3xl sm:text-2xl md:text-4xl lg:text-5xl mb-1"
              style={{ color: "#C9A84C" }}
            >
              {isVisible && <RatingCounter rating={rating} />}
            </div>
            <div className="text-xs sm:text-sm font-medium text-stone-600 leading-tight">
              Average Rating
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
