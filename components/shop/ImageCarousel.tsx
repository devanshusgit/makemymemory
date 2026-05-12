"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, ZoomIn } from "lucide-react";
import Image from "next/image";
import Lightbox from "@/components/ui/Lightbox";

interface ImageCarouselProps {
  images: string[];
  productName: string;
}

export default function ImageCarousel({ images, productName }: ImageCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection]       = useState(0);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);

  const goToNext = useCallback(() => {
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % images.length);
  }, [images.length]);

  const goToPrevious = useCallback(() => {
    setDirection(-1);
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  }, [images.length]);

  const goToSlide = (index: number) => {
    setDirection(index > currentIndex ? 1 : -1);
    setCurrentIndex(index);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (lightboxIndex !== null) return; // lightbox handles its own keys
      if (images.length <= 1) return;
      if (e.key === "ArrowLeft")  goToPrevious();
      if (e.key === "ArrowRight") goToNext();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [images.length, goToNext, goToPrevious, lightboxIndex]);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null || touchStartY.current === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    const dy = e.changedTouches[0].clientY - touchStartY.current;
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 40) {
      if (dx < 0) goToNext();
      else goToPrevious();
    }
    touchStartX.current = null;
    touchStartY.current = null;
  };

  const multipleImages = images.length > 1;

  if (!multipleImages) {
    return (
      <>
        <div
          className="relative aspect-square rounded-xl overflow-hidden cursor-zoom-in group"
          style={{ backgroundColor: "rgba(201,168,76,0.08)", border: "1px solid rgba(201,168,76,0.2)" }}
          onClick={() => images.length > 0 && setLightboxIndex(0)}
        >
          {images.length > 0 ? (
            <>
              <Image src={images[0]} alt={productName} fill
                sizes="(max-width: 768px) 100vw, 50vw" className="object-cover" priority />
              <div className="absolute inset-0 flex items-center justify-center opacity-0
                              group-hover:opacity-100 transition-opacity duration-200
                              bg-black/10">
                <ZoomIn className="w-8 h-8 text-white drop-shadow-lg" />
              </div>
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <p className="text-stone-400 text-sm">No image available</p>
            </div>
          )}
        </div>

        {lightboxIndex !== null && (
          <Lightbox
            images={images}
            index={lightboxIndex}
            onClose={() => setLightboxIndex(null)}
            onNavigate={setLightboxIndex}
          />
        )}
      </>
    );
  }

  return (
    <>
      <div className="space-y-3">
        {/* Main image */}
        <div
          className="relative aspect-square rounded-xl overflow-hidden group select-none cursor-zoom-in"
          style={{ backgroundColor: "rgba(201,168,76,0.08)", border: "1px solid rgba(201,168,76,0.2)" }}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          onClick={() => setLightboxIndex(currentIndex)}
        >
          <AnimatePresence initial={false} mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, x: direction > 0 ? 60 : -60 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: direction > 0 ? -60 : 60 }}
              transition={{ duration: 0.28, ease: "easeInOut" }}
              className="absolute inset-0"
            >
              <Image
                src={images[currentIndex]}
                alt={`${productName} — image ${currentIndex + 1}`}
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover"
                priority={currentIndex === 0}
              />
            </motion.div>
          </AnimatePresence>

          {/* Zoom hint */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0
                          group-hover:opacity-100 transition-opacity duration-200 bg-black/10 pointer-events-none">
            <ZoomIn className="w-8 h-8 text-white drop-shadow-lg" />
          </div>

          {/* Left arrow */}
          <button
            onClick={(e) => { e.stopPropagation(); goToPrevious(); }}
            aria-label="Previous image"
            className="absolute left-3 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full
                       bg-white/85 backdrop-blur-sm flex items-center justify-center
                       opacity-0 group-hover:opacity-100 transition-opacity duration-200
                       hover:bg-white shadow-md"
          >
            <ChevronLeft className="w-5 h-5 text-stone-800" />
          </button>

          {/* Right arrow */}
          <button
            onClick={(e) => { e.stopPropagation(); goToNext(); }}
            aria-label="Next image"
            className="absolute right-3 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full
                       bg-white/85 backdrop-blur-sm flex items-center justify-center
                       opacity-0 group-hover:opacity-100 transition-opacity duration-200
                       hover:bg-white shadow-md"
          >
            <ChevronRight className="w-5 h-5 text-stone-800" />
          </button>
        </div>

        {/* Dots */}
        <div className="flex items-center justify-center gap-1.5">
          {images.map((_, index) => (
            <button key={index} onClick={() => goToSlide(index)}
              aria-label={`Go to image ${index + 1}`} className="transition-all duration-300">
              <div className={`rounded-full transition-all duration-300 ${
                index === currentIndex ? "w-5 h-2 bg-[#C9A84C]" : "w-2 h-2 bg-stone-300 hover:bg-stone-400"
              }`} />
            </button>
          ))}
        </div>

        {/* Thumbnail strip */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {images.map((image, index) => (
            <button key={index} onClick={() => goToSlide(index)}
              aria-label={`View image ${index + 1}`}
              className={`relative w-16 h-16 rounded-lg overflow-hidden shrink-0 transition-all duration-200
                ${index === currentIndex
                  ? "border-2 border-[#C9A84C] opacity-100"
                  : "border-2 border-transparent opacity-55 hover:opacity-90"
                }`}
            >
              <Image src={image} alt={`${productName} thumbnail ${index + 1}`}
                fill sizes="64px" className="object-cover" />
            </button>
          ))}
        </div>
      </div>

      {lightboxIndex !== null && (
        <Lightbox
          images={images}
          index={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
          onNavigate={setLightboxIndex}
        />
      )}
    </>
  );
}
