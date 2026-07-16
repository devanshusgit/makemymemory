"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight, Eye } from "lucide-react";

interface GalleryItem {
  _id: string;
  url: string;
  type: "image" | "video";
  alt: string;
  category: string;
  sortOrder: number;
}

const ease = [0.4, 0, 0.2, 1] as const;

export default function HomeGallerySection() {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  useEffect(() => {
    const fetchGallery = async () => {
      try {
        const res = await fetch("/api/gallery");
        if (res.ok) {
          const data = await res.json();
          // We fetch up to 16 items for the dual scrolling tracks
          setItems((data.items || []).slice(0, 16));
        }
      } catch (error) {
        console.error("Failed to fetch gallery:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchGallery();
  }, []);

  const handlePrevious = () => {
    if (selectedIndex !== null) {
      setSelectedIndex((selectedIndex - 1 + items.length) % items.length);
    }
  };

  const handleNext = () => {
    if (selectedIndex !== null) {
      setSelectedIndex((selectedIndex + 1) % items.length);
    }
  };

  if (loading || items.length === 0) {
    return null;
  }

  // Split items into two rows for alternate scrolling directions
  const half = Math.ceil(items.length / 2);
  const row1 = items.slice(0, half);
  const row2 = items.slice(half);

  // Duplicate arrays to achieve seamless infinite loop scrolling
  const row1Doubled = [...row1, ...row1, ...row1];
  const row2Doubled = [...row2, ...row2, ...row2];

  return (
    <section className="relative overflow-hidden py-16 sm:py-20 bg-cream-dark/30">
      {/* Self-contained CSS for smooth GPU-accelerated marquee */}
      <style>{`
        @keyframes marquee-left {
          0% { transform: translate3d(0, 0, 0); }
          100% { transform: translate3d(-33.33%, 0, 0); }
        }
        @keyframes marquee-right {
          0% { transform: translate3d(-33.33%, 0, 0); }
          100% { transform: translate3d(0, 0, 0); }
        }
        .marquee-track-left {
          display: flex;
          gap: 12px;
          width: max-content;
          animation: marquee-left 35s linear infinite;
        }
        .marquee-track-right {
          display: flex;
          gap: 12px;
          width: max-content;
          animation: marquee-right 35s linear infinite;
        }
        .marquee-container:hover .marquee-track-left,
        .marquee-container:hover .marquee-track-right {
          animation-play-state: paused;
        }
      `}</style>

      <div className="relative z-10 section-wrap mb-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="max-w-xl">
            <span className="label-tag mb-4 inline-flex">
              Interactive Gallery
            </span>
            <h2 className="section-heading">
              Memories in Motion
            </h2>
            <p className="text-stone-500 mt-2 text-sm sm:text-base leading-relaxed">
              Hover to pause any memory, and click to view details or shop the category.
            </p>
          </div>
          <Link
            href="/gallery"
            className="btn-outline self-start md:self-auto shrink-0"
          >
            View Full Gallery →
          </Link>
        </div>
      </div>

      {/* Infinite Scroll Container */}
      <div className="marquee-container flex flex-col gap-3 overflow-hidden py-4 select-none">
        
        {/* Row 1 (Scrolls Left) */}
        <div className="flex overflow-hidden w-full">
          <div className="marquee-track-left">
            {row1Doubled.map((item, index) => {
              // Map index to the original index in the main items array
              const originalIndex = items.findIndex(x => x._id === item._id);
              return (
                <div
                  key={`r1-${item._id}-${index}`}
                  onClick={() => setSelectedIndex(originalIndex)}
                  className="relative w-40 h-40 sm:w-56 sm:h-56 flex-shrink-0 cursor-pointer rounded-2xl overflow-hidden bg-stone-100
                             border border-stone-200/50 shadow-sm hover:shadow-lg transition-all duration-300 group"
                >
                  {item.type === "image" ? (
                    <img
                      src={item.url}
                      alt={item.alt || "Keepsake"}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                    />
                  ) : (
                    <video
                      src={item.url}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                      muted
                      playsInline
                    />
                  )}
                  {/* Glassmorphic hover icon */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center">
                    <div className="w-10 h-10 rounded-full bg-white/95 text-ink flex items-center justify-center shadow-lg transform scale-90 group-hover:scale-100 transition-all duration-300">
                      <Eye className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Row 2 (Scrolls Right) */}
        <div className="flex overflow-hidden w-full">
          <div className="marquee-track-right">
            {row2Doubled.map((item, index) => {
              const originalIndex = items.findIndex(x => x._id === item._id);
              return (
                <div
                  key={`r2-${item._id}-${index}`}
                  onClick={() => setSelectedIndex(originalIndex)}
                  className="relative w-40 h-40 sm:w-56 sm:h-56 flex-shrink-0 cursor-pointer rounded-2xl overflow-hidden bg-stone-100
                             border border-stone-200/50 shadow-sm hover:shadow-lg transition-all duration-300 group"
                >
                  {item.type === "image" ? (
                    <img
                      src={item.url}
                      alt={item.alt || "Keepsake"}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                    />
                  ) : (
                    <video
                      src={item.url}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                      muted
                      playsInline
                    />
                  )}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center">
                    <div className="w-10 h-10 rounded-full bg-white/95 text-ink flex items-center justify-center shadow-lg transform scale-90 group-hover:scale-100 transition-all duration-300">
                      <Eye className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* Lightbox Modal */}
      <AnimatePresence>
        {selectedIndex !== null && (
          <>
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedIndex(null)}
              className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md"
            />

            <motion.div
              key="lightbox"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.25 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
            >
              <button
                onClick={() => setSelectedIndex(null)}
                className="absolute top-4 right-4 z-10 w-11 h-11 rounded-full
                           bg-white/10 hover:bg-white/20 flex items-center justify-center
                           text-white transition-colors"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>

              <button
                onClick={handlePrevious}
                className="absolute left-4 z-10 w-11 h-11 rounded-full
                           bg-white/10 hover:bg-white/20 flex items-center justify-center
                           text-white transition-colors"
                aria-label="Previous"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>

              <div className="max-w-4xl max-h-[75vh] flex flex-col items-center justify-center">
                {items[selectedIndex].type === "image" ? (
                  <img
                    src={items[selectedIndex].url}
                    alt={items[selectedIndex].alt || "Gallery keepsake"}
                    className="max-w-full max-h-[75vh] object-contain rounded-2xl shadow-2xl"
                  />
                ) : (
                  <video
                    src={items[selectedIndex].url}
                    className="max-w-full max-h-[75vh] object-contain rounded-2xl shadow-2xl"
                    controls
                    autoPlay
                  />
                )}
                {items[selectedIndex].alt && (
                  <p className="text-white/80 text-center text-sm font-medium mt-4 max-w-md">
                    {items[selectedIndex].alt}
                  </p>
                )}
              </div>

              <button
                onClick={handleNext}
                className="absolute right-4 z-10 w-11 h-11 rounded-full
                           bg-white/10 hover:bg-white/20 flex items-center justify-center
                           text-white transition-colors"
                aria-label="Next"
              >
                <ChevronRight className="w-6 h-6" />
              </button>

              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/60 text-xs font-semibold tracking-wider">
                {selectedIndex + 1} / {items.length}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </section>
  );
}
