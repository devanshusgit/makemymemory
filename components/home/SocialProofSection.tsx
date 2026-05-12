"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
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

function MediaCard({
  item,
  index,
  gradient,
  onClick,
}: {
  item: GalleryItem;
  index: number;
  gradient: string;
  onClick: () => void;
}) {
  const videoRef   = useRef<HTMLVideoElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

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
      transition={{ delay: (index % 5) * 0.07, duration: 0.5, ease }}
      className="relative overflow-hidden rounded-2xl group cursor-pointer"
      style={{
        aspectRatio: item.tall ? "3/4" : "4/3",
        border: "1px solid rgba(201,168,76,0.15)",
      }}
      onClick={onClick}
    >
      {/* Gradient base */}
      <div className="absolute inset-0 w-full h-full" style={{ background: gradient }} />

      {item.type === "video" ? (
        <video
          ref={videoRef}
          src={item.url}
          muted loop playsInline preload="metadata"
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
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity
                   duration-300 flex items-center justify-center"
        style={{ background: "rgba(0,0,0,0.25)" }}
      >
        <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm
                        flex items-center justify-center">
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor"
            strokeWidth={2} viewBox="0 0 24 24">
            <circle cx="11" cy="11" r="8"/>
            <path d="m21 21-4.35-4.35M11 8v6M8 11h6"/>
          </svg>
        </div>
      </div>
    </motion.div>
  );
}

export default function SocialProofSection() {
  const [items, setItems]               = useState<GalleryItem[]>([]);
  const [loading, setLoading]           = useState(true);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  useEffect(() => {
    fetch("/api/gallery")
      .then((r) => r.ok ? r.json() : { items: [] })
      .then((d) => setItems(d.items || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // Only images go into lightbox
  const imageItems = items.filter((i) => i.type === "image");
  const imageUrls  = imageItems.map((i) => i.url);

  const handleClick = (item: GalleryItem) => {
    if (item.type !== "image") return;
    const idx = imageItems.findIndex((i) => i._id === item._id);
    if (idx !== -1) setLightboxIndex(idx);
  };

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
          <h2 className="font-serif font-bold"
            style={{ fontSize: "clamp(1.8rem, 4vw, 2.8rem)", color: "#1A1A1A" }}>
            Moments Preserved with <span style={{ color: "#C9A84C" }}>Love</span>
          </h2>
          <p className="mt-3 text-sm" style={{ color: "#6B6560" }}>
            Real keepsakes, real families, real memories — crafted with care.
          </p>
        </motion.div>

        {/* Gallery grid — unlimited items, responsive columns */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i}
                className="rounded-2xl animate-pulse"
                style={{
                  aspectRatio: i % 3 === 0 ? "3/4" : "4/3",
                  background: FALLBACK_GRADIENTS[i % FALLBACK_GRADIENTS.length],
                }}
              />
            ))}
          </div>
        ) : items.length === 0 ? (
          /* Placeholder grid when no items uploaded yet */
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
            {FALLBACK_GRADIENTS.map((g, i) => (
              <div key={i}
                className="rounded-2xl"
                style={{
                  aspectRatio: i % 3 === 0 ? "3/4" : "4/3",
                  background: g,
                  border: "1px solid rgba(201,168,76,0.15)",
                }}
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
            {items.map((item, i) => (
              <MediaCard
                key={item._id}
                item={item}
                index={i}
                gradient={FALLBACK_GRADIENTS[i % FALLBACK_GRADIENTS.length]}
                onClick={() => handleClick(item)}
              />
            ))}
          </div>
        )}

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
