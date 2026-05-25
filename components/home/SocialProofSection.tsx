"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Lightbox from "@/components/ui/Lightbox";

const ease = [0.4, 0, 0.2, 1] as const;

const FALLBACK_GRADIENTS = [
  "linear-gradient(135deg, #C9A84C22 0%, #E8D5A3 100%)",
  "linear-gradient(135deg, #1A1A1A 0%, #2d2520 100%)",
  "linear-gradient(135deg, #2d2520 0%, #C9A84C33 100%)",
  "linear-gradient(135deg, #1A1A1A 0%, #3d3228 100%)",
  "linear-gradient(135deg, #E8D5A3 0%, #C9A84C44 100%)",
];

interface GalleryItem {
  _id: string;
  url: string;
  type: "image" | "video";
  alt: string;
  tall: boolean;
  sortOrder: number;
}

interface Stats {
  customers: number;
  memories: number;
  rating: number;
  founded: number;
}

export default function SocialProofSection() {
  const [items, setItems]               = useState<GalleryItem[]>([]);
  const [loading, setLoading]           = useState(true);
  const [stats, setStats]               = useState<Stats>({ customers: 1000, memories: 1000, rating: 4.9, founded: 2026 });
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const videoRefs = useRef<Map<string, HTMLVideoElement>>(new Map());

  useEffect(() => {
    // Fetch gallery
    fetch("/api/gallery")
      .then((r) => r.ok ? r.json() : { items: [] })
      .then((d) => setItems(d.items || []))
      .catch(() => {})
      .finally(() => setLoading(false));

    // Fetch live stats from reviews
    fetch("/api/reviews?approved=true")
      .then((r) => r.ok ? r.json() : { reviews: [] })
      .then((d) => {
        const reviews = d.reviews || [];
        const avgRating = reviews.length > 0
          ? (reviews.reduce((sum: number, r: any) => sum + (r.rating || 0), 0) / reviews.length).toFixed(1)
          : 4.9;
        setStats((prev) => ({ ...prev, rating: parseFloat(avgRating as string) }));
      })
      .catch(() => {});
  }, []);

  // Autoplay videos when in view
  useEffect(() => {
    const observers: IntersectionObserver[] = [];
    videoRefs.current.forEach((video) => {
      const obs = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) video.play().catch(() => {});
          else video.pause();
        },
        { threshold: 0.25 }
      );
      obs.observe(video);
      observers.push(obs);
    });
    return () => observers.forEach((o) => o.disconnect());
  }, [items]);

  const scroll = (dir: "left" | "right") => {
    const el = scrollRef.current;
    if (!el) return;
    // Scroll by ~5 card widths
    const cardW = el.firstElementChild?.clientWidth ?? 220;
    el.scrollBy({ left: dir === "right" ? cardW * 5 : -cardW * 5, behavior: "smooth" });
  };

  // Only images go into lightbox
  const imageItems = items.filter((i) => i.type === "image");
  const imageUrls  = imageItems.map((i) => i.url);

  const handleClick = (item: GalleryItem) => {
    if (item.type !== "image") return;
    const idx = imageItems.findIndex((i) => i._id === item._id);
    if (idx !== -1) setLightboxIndex(idx);
  };

  return (
    <section className="py-16 sm:py-24" style={{ backgroundColor: "#FFFFFF" }}>
      <div className="section-wrap">

        {/* Stats Section */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease }}
          className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 mb-16 sm:mb-20 text-center"
        >
          <div>
            <p className="font-serif font-bold text-3xl sm:text-4xl" style={{ color: "#C9A84C" }}>
              1000+
            </p>
            <p className="text-xs sm:text-sm mt-2" style={{ color: "#6B6560" }}>
              Happy Customers
            </p>
          </div>
          <div>
            <p className="font-serif font-bold text-3xl sm:text-4xl" style={{ color: "#C9A84C" }}>
              1000+
            </p>
            <p className="text-xs sm:text-sm mt-2" style={{ color: "#6B6560" }}>
              Memories Created
            </p>
          </div>
          <div>
            <p className="font-serif font-bold text-3xl sm:text-4xl" style={{ color: "#C9A84C" }}>
              {stats.rating}★
            </p>
            <p className="text-xs sm:text-sm mt-2" style={{ color: "#6B6560" }}>
              Average Rating
            </p>
          </div>
          <div>
            <p className="font-serif font-bold text-3xl sm:text-4xl" style={{ color: "#C9A84C" }}>
              {stats.founded}
            </p>
            <p className="text-xs sm:text-sm mt-2" style={{ color: "#6B6560" }}>
              Founded
            </p>
          </div>
        </motion.div>

        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease }}
          className="text-center mb-10 sm:mb-14"
        >
          <h2 className="font-serif font-bold"
            style={{ fontSize: "clamp(1.8rem, 4vw, 2.8rem)", color: "#1A1A1A" }}>
            Moments Preserved with <span style={{ color: "#C9A84C" }}>Love</span>
          </h2>
          <p className="mt-3 text-sm" style={{ color: "#6B6560" }}>
            Real keepsakes, real families, real memories — crafted with care.
          </p>
        </motion.div>

        {/* Carousel wrapper */}
        <div className="relative">

          {/* Left arrow */}
          {!loading && items.length > 5 && (
            <button
              onClick={() => scroll("left")}
              aria-label="Scroll left"
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10
                         w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center
                         hover:bg-[#C9A84C] hover:text-white transition-colors"
              style={{ border: "1px solid #E8D5A3" }}
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          )}

          {/* Right arrow */}
          {!loading && items.length > 5 && (
            <button
              onClick={() => scroll("right")}
              aria-label="Scroll right"
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10
                         w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center
                         hover:bg-[#C9A84C] hover:text-white transition-colors"
              style={{ border: "1px solid #E8D5A3" }}
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          )}

          {/* Scrollable row */}
          <div
            ref={scrollRef}
            className="flex gap-3 sm:gap-4 overflow-x-auto scrollbar-hide scroll-smooth"
            style={{ scrollSnapType: "x mandatory" }}
          >
            {loading
              ? FALLBACK_GRADIENTS.map((g, i) => (
                  <div key={i}
                    className="rounded-2xl shrink-0"
                    style={{
                      width: "calc(20% - 12px)",
                      minWidth: "180px",
                      minHeight: "260px",
                      background: g,
                      border: "1px solid rgba(201,168,76,0.15)",
                      scrollSnapAlign: "start",
                    }}
                  />
                ))
              : items.length === 0
              ? FALLBACK_GRADIENTS.map((g, i) => (
                  <div key={i}
                    className="rounded-2xl shrink-0"
                    style={{
                      width: "calc(20% - 12px)",
                      minWidth: "180px",
                      minHeight: "260px",
                      background: g,
                      border: "1px solid rgba(201,168,76,0.15)",
                      scrollSnapAlign: "start",
                    }}
                  />
                ))
              : items.map((item, i) => (
                  <motion.div
                    key={item._id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-40px" }}
                    transition={{ delay: (i % 5) * 0.07, duration: 0.5, ease }}
                    className="relative overflow-hidden rounded-2xl shrink-0 group cursor-pointer"
                    style={{
                      width: "calc(20% - 12px)",
                      minWidth: "180px",
                      minHeight: item.tall ? "320px" : "260px",
                      border: "1px solid rgba(201,168,76,0.15)",
                      background: FALLBACK_GRADIENTS[i % FALLBACK_GRADIENTS.length],
                      scrollSnapAlign: "start",
                    }}
                    onClick={() => handleClick(item)}
                  >
                    {item.type === "video" ? (
                      <video
                        ref={(el) => {
                          if (el) videoRefs.current.set(item._id, el);
                          else videoRefs.current.delete(item._id);
                        }}
                        src={item.url}
                        muted loop playsInline preload="metadata"
                        className="absolute inset-0 w-full h-full object-cover
                                   transition-transform duration-500 group-hover:scale-105"
                        aria-label={item.alt}
                      />
                    ) : (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={item.url}
                        alt={item.alt || "Gallery item"}
                        className="absolute inset-0 w-full h-full object-cover
                                   transition-transform duration-500 group-hover:scale-105"
                      />
                    )}

                    {/* Hover overlay */}
                    <div
                      className="absolute inset-0 opacity-0 group-hover:opacity-100
                                 transition-opacity duration-300 flex items-center justify-center"
                      style={{ background: "rgba(0,0,0,0.2)" }}
                    >
                      {item.type === "image" && (
                        <div className="w-9 h-9 rounded-full bg-white/20 backdrop-blur-sm
                                        flex items-center justify-center">
                          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor"
                            strokeWidth={2} viewBox="0 0 24 24">
                            <circle cx="11" cy="11" r="8"/>
                            <path d="m21 21-4.35-4.35M11 8v6M8 11h6"/>
                          </svg>
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))
            }
          </div>
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3, ease }}
          className="text-center mt-10"
        >
          <a
            href="/shop"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full text-sm font-semibold
                       transition-all duration-300 hover:bg-[#C9A84C] hover:text-[#1A1A1A]"
            style={{ border: "1.5px solid #C9A84C", color: "#C9A84C" }}
          >
            Create Yours →
          </a>
        </motion.div>
      </div>

      {lightboxIndex !== null && imageUrls.length > 0 && (
        <Lightbox
          images={imageUrls}
          index={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
          onNavigate={setLightboxIndex}
        />
      )}
    </section>
  );
}
