"use client";

import { useEffect, useState } from "react";

interface CounterStat {
  end: number;
  label: string;
  suffix: string;
}

interface StatsData {
  happyCustomers: number;
  memoriesCreated: number;
  averageRating: number;
  founded: number;
}

function CountingNumber({ end, suffix, duration = 2000 }: { end: number; suffix: string; duration?: number }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTime: number;
    let animationId: number;

    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      setCount(Math.floor(end * progress));

      if (progress < 1) {
        animationId = requestAnimationFrame(animate);
      } else {
        setCount(end);
      }
    };

    animationId = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animationId);
  }, [end, duration]);

  return (
    <>
      {count}
      {suffix}
    </>
  );
}

function RatingCounter({ duration = 2000 }: { duration?: number }) {
  const [rating, setRating] = useState(0);

  useEffect(() => {
    // Fetch live rating from reviews database
    fetch("/api/reviews?approved=true")
      .then((r) => r.ok ? r.json() : null)
      .then((data) => {
        if (data?.reviews && data.reviews.length > 0) {
          // Calculate average rating from approved reviews
          const totalRating = data.reviews.reduce((sum: number, review: any) => sum + (review.rating || 0), 0);
          const avgRating = totalRating / data.reviews.length;
          setRating(Math.round(avgRating * 10) / 10); // Round to 1 decimal
        } else {
          setRating(0); // No reviews yet
        }
      })
      .catch(() => {
        setRating(0); // Default to 0 on error
      });
  }, []);

  return (
    <>
      {rating}★
    </>
  );
}

export default function AnimatedStats() {
  const [isVisible, setIsVisible] = useState(false);
  const [stats, setStats] = useState<StatsData>({
    happyCustomers: 1000,
    memoriesCreated: 1000,
    averageRating: 0,
    founded: 2026,
  });

  useEffect(() => {
    setIsVisible(true);
    
    // Fetch stats from admin settings
    fetch("/api/admin/settings/stats")
      .then((r) => r.ok ? r.json() : null)
      .then((d) => {
        if (d?.stats) {
          setStats(d.stats);
        }
      })
      .catch(() => {});
  }, []);

  return (
    <section className="w-full py-12 sm:py-16" style={{ backgroundColor: "#FAF8F4" }}>
      <div className="section-wrap">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
          {/* Happy Customers */}
          <div
            className="text-center"
            style={{
              opacity: isVisible ? 1 : 0,
              transform: isVisible ? "translateY(0)" : "translateY(20px)",
              transition: "all 0.6s ease 0s",
            }}
          >
            <p
              className="font-serif font-bold text-3xl sm:text-4xl mb-2"
              style={{ color: "#C9A84C" }}
            >
              {isVisible && <CountingNumber end={stats.happyCustomers} suffix="+" duration={2000} />}
            </p>
            <p className="text-xs sm:text-sm font-medium text-stone-500">
              Happy Customers
            </p>
          </div>

          {/* Memories Created */}
          <div
            className="text-center"
            style={{
              opacity: isVisible ? 1 : 0,
              transform: isVisible ? "translateY(0)" : "translateY(20px)",
              transition: "all 0.6s ease 0.1s",
            }}
          >
            <p
              className="font-serif font-bold text-3xl sm:text-4xl mb-2"
              style={{ color: "#C9A84C" }}
            >
              {isVisible && <CountingNumber end={stats.memoriesCreated} suffix="+" duration={2000} />}
            </p>
            <p className="text-xs sm:text-sm font-medium text-stone-500">
              Memories Created
            </p>
          </div>

          {/* Average Rating */}
          <div
            className="text-center"
            style={{
              opacity: isVisible ? 1 : 0,
              transform: isVisible ? "translateY(0)" : "translateY(20px)",
              transition: "all 0.6s ease 0.2s",
            }}
          >
            <p
              className="font-serif font-bold text-3xl sm:text-4xl mb-2"
              style={{ color: "#C9A84C" }}
            >
              {isVisible && <RatingCounter duration={2000} />}
            </p>
            <p className="text-xs sm:text-sm font-medium text-stone-500">
              Average Rating
            </p>
          </div>

          {/* Founded */}
          <div
            className="text-center"
            style={{
              opacity: isVisible ? 1 : 0,
              transform: isVisible ? "translateY(0)" : "translateY(20px)",
              transition: "all 0.6s ease 0.3s",
            }}
          >
            <p
              className="font-serif font-bold text-3xl sm:text-4xl mb-2"
              style={{ color: "#C9A84C" }}
            >
              {isVisible && <CountingNumber end={stats.founded} suffix="" duration={2000} />}
            </p>
            <p className="text-xs sm:text-sm font-medium text-stone-500">
              Founded
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
