"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import Lightbox from "@/components/ui/Lightbox";

const ease = [0.4, 0, 0.2, 1] as const;

const FALLBACK_GRADIENTS = [
  "linear-gradient(135deg, #C9A84C22 0%, #E8D5A3 100%)",
  "linear-gradient(135deg, #1A1A1A 0%, #2d2520 100%)",
  "linear-gradient(135deg, #2d2520 0%, #C9A84C33 100%)",
  "linear-gradient(135deg, #1A1A1A 0%, #3d3228 100%)",
  "linear-gradient(135deg, #E8D5A3 0%, #C9A84C44 100%)",
  "linear-gradient(135deg, #C9A84C44 0%, #1A1A1A 100%)",
  "linear-gradient(135deg, #3d3228 0%, #E8D5A3 100%)",
];

interface GalleryItem {
  _id: string;
  url: string;
  type: "image" | "video";
  alt: string;
  tall: boolean;
  sortOrder: number;
}

/* ── Individual tilt card ── */
function TiltCard({
  item,
  gradient,
  videoRefs,
  onClick,
}: {
  item: GalleryItem;
  gradient: string;
  videoRefs: React.MutableRefObject<Map<string, HTMLVideoElement>>;
  onClick: () => void;
}) {
  const cardRef = useRef<HTMLDivElement>(null);

  const rawX  = useMotionValue(0);
  const rawY  = useMotionValue(0);
  const springX = useSpring(rawX, { stiffness: 300, damping: 30 });
  const springY = useSpring(rawY, { stiffness: 300, damping: 30 });

  const rotateX = useTransform(springY, [-0.5, 0.5], ["12deg", "-12deg"]);
  const rotateY = useTransform(springX, [-0.5, 0.5], ["-12deg", "12deg"]);
  const glowX   = useTransform(springX, [-0.5, 0.5], ["0%", "100%"]);
  const glowY   = useTransform(springY, [-0.5, 0.5], ["0%", "100%"]);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = cardRef.current?.getBoundingClientRect();
    if (!rect) return;
    rawX.set((e.clientX - rect.left) / rect.width - 0.5);
    rawY.set((e.clientY - rect.top)  / rect.height - 0.5);
  }, [rawX, rawY]);

  const handleMouseLeave = useCallback(() => {
    rawX.set(0);
    rawY.set(0);
  }, [rawX, rawY]);

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      style={{
        rotateX,
        rotateY,
        transformStyle: "preserve-3d",
        perspective: "800px",
        width: "220px",
        minWidth: "220px",
        height: item.tall ? "320px" : "260px",
        background: gradient,
        border: "1px solid rgba(201,168,76,0.2)",
        borderRadius: "16px",
        position: "relative",
        overflow: "hidden",
        cursor: item.type === "image" ? "pointer" : "default",
        flexShrink: 0,
      }}
      whileHover={{ scale: 1.04, zIndex: 10 }}
      transition={{ duration: 0.25, ease }}
      className="group"
    >
      {/* Glowing highlight that follows mouse */}
      <motion.div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 1,
          pointerEvents: "none",
          background: `radial-gradient(circle at ${glowX} ${glowY}, rgba(201,168,76,0.22) 0%, transparent 65%)`,
          opacity: 0,
          borderRadius: "16px",
        }}
        whileHover={{ opacity: 1 }}
        transition={{ duration: 0.2 }}
      />

      {/* Media */}
      {item.type === "video" ? (
        <video
          ref={(el) => {
            if (el) videoRefs.current.set(item._id, el);
            else     videoRefs.current.delete(item._id);
          }}
          src={item.url}
          muted loop playsInline preload="metadata"
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.06]"
          aria-label={item.alt}
        />
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={item.url}
          alt={item.alt || "Gallery item"}
          loading="lazy"
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.06]"
        />
      )}

      {/* Dark overlay + zoom icon on hover */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300
                   flex items-center justify-center"
        style={{ background: "rgba(0,0,0,0.18)", zIndex: 2 }}
      >
        {item.type === "image" && (
          <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <circle cx="11" cy="11" r="8"/>
              <path d="m21 21-4.35-4.35M11 8v6M8 11h6"/>
            </svg>
          </div>
        )}
      </div>
    </motion.div>
  );
}

/* ── Fallback gradient card (no hover tilt, simple) ── */
function FallbackCard({ gradient, index }: { gradient: string; index: number }) {
  const cardRef   = useRef<HTMLDivElement>(null);
  const rawX      = useMotionValue(0);
  const rawY      = useMotionValue(0);
  const springX   = useSpring(rawX, { stiffness: 300, damping: 30 });
  const springY   = useSpring(rawY, { stiffness: 300, damping: 30 });
  const rotateX   = useTransform(springY, [-0.5, 0.5], ["10deg", "-10deg"]);
  const rotateY   = useTransform(springX, [-0.5, 0.5], ["-10deg", "10deg"]);

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={(e) => {
        const rect = cardRef.current?.getBoundingClientRect();
        if (!rect) return;
        rawX.set((e.clientX - rect.left) / rect.width - 0.5);
        rawY.set((e.clientY - rect.top)  / rect.height - 0.5);
      }}
      onMouseLeave={() => { rawX.set(0); rawY.set(0); }}
      style={{
        rotateX,
        rotateY,
        transformStyle: "preserve-3d",
        width: "220px",
        minWidth: "220px",
        height: index % 3 === 1 ? "320px" : "260px",
        background: gradient,
        border: "1px solid rgba(201,168,76,0.2)",
        borderRadius: "16px",
        flexShrink: 0,
      }}
      whileHover={{ scale: 1.04, zIndex: 10 }}
      transition={{ duration: 0.25, ease }}
    />
  );
}

export default function SocialProofSection() {
  const [items, setItems]                 = useState<GalleryItem[]>([]);
  const [loading, setLoading]             = useState(true);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [paused, setPaused]               = useState(false);
  const videoRefs = useRef<Map<string, HTMLVideoElement>>(new Map());

  useEffect(() => {
    fetch("/api/gallery")
      .then((r) => r.ok ? r.json() : { items: [] })
      .then((d) => setItems(d.items || []))
      .catch(() => {})
      .finally(() => setLoading(false));
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

  const imageItems = items.filter((i) => i.type === "image");
  const imageUrls  = imageItems.map((i) => i.url);

  const handleClick = (item: GalleryItem) => {
    if (item.type !== "image") return;
    const idx = imageItems.findIndex((i) => i._id === item._id);
    if (idx !== -1) setLightboxIndex(idx);
  };

  // Determine what to show — duplicate for seamless loop
  const showFallback = loading || items.length === 0;
  const displayItems = showFallback ? [] : items;

  // Duplicate cards so the marquee loops seamlessly
  const duped = [...displayItems, ...displayItems];
  const dupedFallback = [...FALLBACK_GRADIENTS, ...FALLBACK_GRADIENTS, ...FALLBACK_GRADIENTS];

  return (
    <section className="relative py-16 sm:py-24 overflow-hidden bg-section-social">

      {/* ── Decorative floating diamonds ── */}
      <div aria-hidden="true" className="absolute inset-0 z-0 pointer-events-none">
        <motion.div
          className="absolute top-12 right-[15%] w-2.5 h-2.5 rotate-45"
          style={{ backgroundColor: "rgba(201,168,76,0.3)", borderRadius: "1px" }}
          animate={{ y: [0, -8, 0], rotate: [45, 60, 45] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-16 left-[12%] w-2 h-2 rotate-45"
          style={{ backgroundColor: "rgba(201,168,76,0.25)", borderRadius: "1px" }}
          animate={{ y: [0, -6, 0], rotate: [45, 30, 45] }}
          transition={{ duration: 5, delay: 1, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute top-1/3 left-[8%] w-1.5 h-1.5 rotate-45"
          style={{ backgroundColor: "rgba(201,168,76,0.35)", borderRadius: "1px" }}
          animate={{ y: [0, -5, 0], rotate: [45, 50, 45] }}
          transition={{ duration: 4, delay: 0.5, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      <div className="relative z-10">

        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease }}
          className="text-center mb-10 sm:mb-14 section-wrap"
        >
          <h2 className="font-serif font-bold"
            style={{ fontSize: "clamp(1.8rem, 4vw, 2.8rem)", color: "#1A1A1A" }}>
            Moments Preserved with <span style={{ color: "#C9A84C" }}>Love</span>
          </h2>
          <p className="mt-3 text-sm" style={{ color: "#6B6560" }}>
            Real keepsakes, real families, real memories — crafted with care.
          </p>
        </motion.div>

        {/* ── Infinite marquee strip ── */}
        {/* Edge fade masks */}
        <div className="relative"
          style={{
            maskImage: "linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%)",
            WebkitMaskImage: "linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%)",
          }}
        >
          <div
            className="overflow-hidden"
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
          >
            {/* The scrolling strip — we use CSS animation via inline style */}
            <div
              style={{
                display: "flex",
                gap: "16px",
                width: "max-content",
                padding: "12px 0 20px",
                animation: `marquee-scroll ${showFallback ? 28 : Math.max(25, displayItems.length * 4)}s linear infinite`,
                animationPlayState: paused ? "paused" : "running",
                willChange: "transform",
              }}
            >
              {showFallback
                ? dupedFallback.map((g, i) => (
                    <FallbackCard key={i} gradient={g} index={i} />
                  ))
                : duped.map((item, i) => (
                    <TiltCard
                      key={`${item._id}-${i}`}
                      item={item}
                      gradient={FALLBACK_GRADIENTS[i % FALLBACK_GRADIENTS.length]}
                      videoRefs={videoRefs}
                      onClick={() => handleClick(item)}
                    />
                  ))
              }
            </div>
          </div>
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3, ease }}
          className="text-center mt-10 section-wrap"
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

      {/* Marquee keyframe injected as a style tag */}
      <style>{`
        @keyframes marquee-scroll {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </section>
  );
}
