"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { optimizeCloudinaryUrl } from "@/lib/utils/cloudinary";

interface GalleryItem {
  _id: string;
  url: string;
  type: "image" | "video";
  alt: string;
  category: string;
  sortOrder: number;
  tall: boolean;
}

export default function GalleryClient() {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const router = useRouter();

  const categories = Array.from(new Set(items.map((i) => i.category).filter(Boolean)));
  const filteredItems = activeCategory ? items.filter((i) => i.category === activeCategory) : items;

  useEffect(() => {
    const fetchGallery = async () => {
      try {
        const res = await fetch("/api/gallery");
        if (res.ok) {
          const data = await res.json();
          setItems(data.items || []);
        }
      } catch (error) {
        console.error("Failed to fetch gallery:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchGallery();
  }, []);

  const handleItemClick = (item: GalleryItem, index: number) => {
    // If item has a category, redirect to shop with category filter
    if (item.category) {
      router.push(`/shop?category=${item.category}`);
    } else {
      // Otherwise, open lightbox
      setSelectedIndex(index);
    }
  };

  const handlePrevious = () => {
    if (selectedIndex !== null) {
      setSelectedIndex((selectedIndex - 1 + filteredItems.length) % filteredItems.length);
    }
  };

  const handleNext = () => {
    if (selectedIndex !== null) {
      setSelectedIndex((selectedIndex + 1) % filteredItems.length);
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
        {[...Array(9)].map((_, i) => (
          <div
            key={i}
            className="aspect-square bg-stone-200 animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-20">
        <p className="text-stone-500 text-lg">Gallery coming soon...</p>
      </div>
    );
  }

  return (
    <>
      {/* Category tabs */}
      {categories.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8 scrollbar-none border-b border-stone-200">
          <button
            onClick={() => setActiveCategory(null)}
            className={`flex-shrink-0 px-4 py-2 rounded-full text-xs font-semibold uppercase tracking-wide whitespace-nowrap transition-colors
              ${!activeCategory ? "bg-ink text-white" : "bg-white text-stone-500 border border-stone-200 hover:border-stone-300"}`}
          >
            All
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`flex-shrink-0 px-4 py-2 rounded-full text-xs font-semibold uppercase tracking-wide capitalize whitespace-nowrap transition-colors
                ${activeCategory === cat ? "bg-ink text-white" : "bg-white text-stone-500 border border-stone-200 hover:border-stone-300"}`}
            >
              {cat.replace(/-/g, " ")}
            </button>
          ))}
        </div>
      )}

      {/* Gallery Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
          {filteredItems.map((item, index) => (
            <motion.div
              key={item._id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: (index % 9) * 0.05 }}
              onClick={() => handleItemClick(item, index)}
              className="relative group cursor-pointer overflow-hidden bg-stone-100
                         border transition-all duration-300 hover:shadow-lift hover:-translate-y-1 aspect-square"
              style={{ borderColor: "rgba(201,168,76,0.3)" }}
            >
              {/* Image/Video */}
              {item.type === "image" ? (
                <div className="relative w-full h-full">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={optimizeCloudinaryUrl(item.url, 700)}
                    alt={item.alt || "Gallery item"}
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
              ) : (
                // No native controls in the grid thumbnail — clicking opens
                // the lightbox below, which has real playback controls.
                <video
                  src={item.url}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  muted
                  playsInline
                  preload="metadata"
                />
              )}

              {/* Overlay */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: "#C9A84C" }}
                  >
                    {item.category ? (
                      <svg
                        className="w-6 h-6 text-ink"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                      </svg>
                    ) : (
                      <svg
                        className="w-6 h-6 text-ink"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    )}
                  </div>
                </div>
              </div>

              {/* Alt text badge */}
              {item.alt && (
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3">
                  <p className="text-white text-xs font-semibold line-clamp-2">
                    {item.alt}
                  </p>
                </div>
              )}

              {/* Category badge */}
              {item.category && (
                <div className="absolute top-2 left-2 bg-[#C9A84C] text-[#1A1A1A] text-[10px]
                               font-bold px-2 py-0.5 rounded-full capitalize">
                  {item.category.replace(/-/g, " ")}
                </div>
              )}
            </motion.div>
          ))}
      </div>

      {/* Lightbox */}
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
              className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm"
            />

            {/* Lightbox */}
            <motion.div
              key="lightbox"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
            >
              {/* Close button */}
              <button
                onClick={() => setSelectedIndex(null)}
                className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full
                           bg-white/10 hover:bg-white/20 flex items-center justify-center
                           transition-colors"
                aria-label="Close"
              >
                <X className="w-6 h-6 text-white" />
              </button>

              {/* Previous button */}
              <button
                onClick={handlePrevious}
                className="absolute left-4 z-10 w-10 h-10 rounded-full
                           bg-white/10 hover:bg-white/20 flex items-center justify-center
                           transition-colors"
                aria-label="Previous"
              >
                <ChevronLeft className="w-6 h-6 text-white" />
              </button>

              {/* Media */}
              <div className="max-w-4xl max-h-[80vh] flex items-center justify-center">
                {filteredItems[selectedIndex].type === "image" ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={optimizeCloudinaryUrl(filteredItems[selectedIndex].url, 1200)}
                    alt={filteredItems[selectedIndex].alt || "Gallery item"}
                    className="max-w-full max-h-[80vh] object-contain rounded-lg"
                  />
                ) : (
                  <video
                    src={filteredItems[selectedIndex].url}
                    className="max-w-full max-h-[80vh] object-contain rounded-lg"
                    controls
                    autoPlay
                  />
                )}
              </div>

              {/* Next button */}
              <button
                onClick={handleNext}
                className="absolute right-4 z-10 w-10 h-10 rounded-full
                           bg-white/10 hover:bg-white/20 flex items-center justify-center
                           transition-colors"
                aria-label="Next"
              >
                <ChevronRight className="w-6 h-6 text-white" />
              </button>

              {/* Counter */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white text-sm font-semibold">
                {selectedIndex + 1} / {filteredItems.length}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
