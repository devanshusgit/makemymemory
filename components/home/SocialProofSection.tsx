"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

const ease = [0.4, 0, 0.2, 1] as const;

// Fallback gradients shown while loading or when no items are in the DB
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

function VideoCard({
  item,
  index,
  gradient,
}: {
  item: GalleryItem;
  index: number;
  gradient: string;
}) {
  const videoRef  = useRef<HTMLVideoElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Play when in view, pause when out
  useEffect(() => {
    if (item.type !== "video") return;
    const video   = videoRef.current;
    const wrapper = wrapperRef.current;
    if (!video || !wrapper) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) video.play().catch(() => {});
        else video.pause();
      },
      { threshold: 0.25 }
    );
    observer.observe(wrapper);
    return () => observer.disconnect();
  }, [item.type]);

  return (
    <motion.div
      ref={wrapperRef}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ delay: index * 0.08, duration: 0.55, ease }}
      className="relative overflow-hidden rounded-2xl flex-1 min-w-0 group"
      style={{
        minHeight: item.tall ? "320px" : "260px",
        border: "1px solid rgba(201,168,76,0.15)",
      }}
    >
      {/* Gradient base */}
      <div className="absolute inset-0 w-full h-full" style={{ background: gradient }} />

      {item.type === "video" ? (
        <video
          ref={videoRef}
          src={item.url}
          muted
          loop
          playsInline
          preload="metadata"
          className="absolute inset-0 w-full h-full object-cover transition-transform
                     duration-500 group-hover:scale-105"
          aria-label={item.alt}
        />
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={item.url}
          alt={item.alt || "Gallery item"}
          className="absolute inset-0 w-full h-full object-cover transition-transform
                     duration-500 group-hover:scale-105"
        />
      )}

      {/* Hover overlay */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{ background: "linear-gradient(to top, rgba(26,26,26,0.5) 0%, transparent 60%)" }}
      />
    </motion.div>
  );
}

// Placeholder card shown while loading or when DB is empty
function PlaceholderCard({ index, gradient }: { index: number; gradient: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ delay: index * 0.08, duration: 0.55, ease }}
      className="relative overflow-hidden rounded-2xl flex-1 min-w-0"
      style={{
        minHeight: index % 3 === 0 ? "320px" : "260px",
        border: "1px solid rgba(201,168,76,0.15)",
        background: gradient,
      }}
    />
  );
}

export default function SocialProofSection() {
  const [items, setItems]     = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/gallery")
      .then((r) => r.ok ? r.json() : { items: [] })
      .then((d) => setItems(d.items || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // Show 5 slots — fill with DB items, pad with placeholders
  const slots = Array.from({ length: 5 }, (_, i) => items[i] ?? null);

  return (
    <section className="py-16 sm:py-24" style={{ backgroundColor: "#FAF8F4" }}>
      <div className="section-wrap">

        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease }}
          className="text-center mb-10 sm:mb-14"
        >
          <h2
            className="font-serif font-bold"
            style={{ fontSize: "clamp(1.8rem, 4vw, 2.8rem)", color: "#1A1A1A" }}
          >
            Moments Preserved with <span style={{ color: "#C9A84C" }}>Love</span>
          </h2>
          <p className="mt-3 text-sm" style={{ color: "#6B6560" }}>
            Real keepsakes, real families, real memories — crafted with care.
          </p>
        </motion.div>

        {/* Collage */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-stretch">
          {loading
            ? FALLBACK_GRADIENTS.map((g, i) => (
                <PlaceholderCard key={i} index={i} gradient={g} />
              ))
            : slots.map((item, i) =>
                item ? (
                  <VideoCard
                    key={item._id}
                    item={item}
                    index={i}
                    gradient={FALLBACK_GRADIENTS[i % FALLBACK_GRADIENTS.length]}
                  />
                ) : (
                  <PlaceholderCard
                    key={`placeholder-${i}`}
                    index={i}
                    gradient={FALLBACK_GRADIENTS[i % FALLBACK_GRADIENTS.length]}
                  />
                )
              )}
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
    </section>
  );
}
