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
          // Limit to first 12 items for optimal homepage speed
          setItems((data.items || []).slice(0, 12));
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
    return null; // Silent hide during loading/empty state to prevent layout shift
  }

  return (
    <section className="relative overflow-hidden py-16 sm:py-24 bg-white/40">
      <div className="relative z-10 section-wrap">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 sm:mb-14">
          <div className="max-w-xl">
            <span className="label-tag mb-4 inline-flex">
              Our Gallery
            </span>
            <h2 className="section-heading">
              Memories brought to life
            </h2>
            <p className="text-stone-500 mt-3 text-sm sm:text-base leading-relaxed">
              Take a look at the beautiful custom photo frames, memory books, and keepsakes created by our community.
            </p>
          </div>
          <Link
            href="/gallery"
            className="btn-outline self-start md:self-auto shrink-0"
          >
            View Full Gallery →
          </Link>
        </div>

        {/* Responsive Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 sm:gap-3">
          {items.map((item, index) => (
            <motion.div
              key={item._id}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.04, duration: 0.5, ease }}
              onClick={() => setSelectedIndex(index)}
              className="relative aspect-square group cursor-pointer rounded-2xl overflow-hidden bg-stone-100
                         border border-stone-200/50 shadow-sm hover:shadow-md transition-all duration-300"
            >
              {item.type === "image" ? (
                <img
                  src={item.url}
                  alt={item.alt || "Gallery keepsake"}
                  loading="lazy"
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

              {/* Glassmorphism Hover Overlay */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center">
                <div className="w-10 h-10 rounded-full bg-white/95 text-ink flex items-center justify-center shadow-lg transform scale-90 group-hover:scale-100 transition-all duration-300">
                  <Eye className="w-4 h-4" />
                </div>
              </div>

              {/* Small Category tag */}
              {item.category && (
                <div className="absolute top-2 left-2 bg-[#C9A84C] text-[#1A1A1A] text-[9px] font-bold px-2 py-0.5 rounded-full capitalize shadow-sm">
                  {item.category.replace(/-/g, " ")}
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>

      {/* Lightbox Modal */}
      <AnimatePresence>
        {selectedIndex !== null && (
          <>
            {/* Backdrop */}
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedIndex(null)}
              className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md"
            />

            {/* Content Container */}
            <motion.div
              key="lightbox"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.25 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
            >
              {/* Close Button */}
              <button
                onClick={() => setSelectedIndex(null)}
                className="absolute top-4 right-4 z-10 w-11 h-11 rounded-full
                           bg-white/10 hover:bg-white/20 flex items-center justify-center
                           text-white transition-colors"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Navigation Left */}
              <button
                onClick={handlePrevious}
                className="absolute left-4 z-10 w-11 h-11 rounded-full
                           bg-white/10 hover:bg-white/20 flex items-center justify-center
                           text-white transition-colors"
                aria-label="Previous"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>

              {/* Media Display */}
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

              {/* Navigation Right */}
              <button
                onClick={handleNext}
                className="absolute right-4 z-10 w-11 h-11 rounded-full
                           bg-white/10 hover:bg-white/20 flex items-center justify-center
                           text-white transition-colors"
                aria-label="Next"
              >
                <ChevronRight className="w-6 h-6" />
              </button>

              {/* Index Counter */}
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
