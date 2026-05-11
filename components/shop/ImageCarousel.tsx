"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";

interface ImageCarouselProps {
  images: string[];
  productName: string;
}

export default function ImageCarousel({ images, productName }: ImageCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") goToPrevious();
      if (e.key === "ArrowRight") goToNext();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentIndex]);

  const goToNext = () => {
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const goToPrevious = () => {
    setDirection(-1);
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const goToSlide = (index: number) => {
    setDirection(index > currentIndex ? 1 : -1);
    setCurrentIndex(index);
  };

  // If only one image, don't show carousel controls
  if (images.length <= 1) {
    return (
      <div
        className="relative aspect-square rounded-2xl overflow-hidden"
        style={{ backgroundColor: "rgba(201,168,76,0.08)", border: "1px solid rgba(201,168,76,0.2)" }}
      >
        {images.length > 0 ? (
          <Image
            src={images[0]}
            alt={productName}
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover"
            priority
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 bg-stone-200 rounded-xl flex items-center justify-center mx-auto mb-2">
                <span className="text-stone-400 text-sm font-medium">No Image</span>
              </div>
              <p className="text-stone-400 text-sm">No image available</p>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Main carousel */}
      <div
        className="relative aspect-square rounded-2xl overflow-hidden group"
        style={{ backgroundColor: "rgba(201,168,76,0.08)", border: "1px solid rgba(201,168,76,0.2)" }}
      >
        <AnimatePresence initial={false} mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, x: direction > 0 ? 100 : -100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: direction > 0 ? -100 : 100 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="absolute inset-0"
          >
            <Image
              src={images[currentIndex]}
              alt={`${productName} - Image ${currentIndex + 1}`}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover"
              priority
            />
          </motion.div>
        </AnimatePresence>

        {/* Left arrow */}
        <button
          onClick={goToPrevious}
          aria-label="Previous image"
          className="absolute left-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full
                     bg-white/80 backdrop-blur-sm flex items-center justify-center
                     opacity-0 group-hover:opacity-100 transition-opacity duration-200
                     hover:bg-white shadow-lg"
        >
          <ChevronLeft className="w-5 h-5 text-ink" />
        </button>

        {/* Right arrow */}
        <button
          onClick={goToNext}
          aria-label="Next image"
          className="absolute right-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full
                     bg-white/80 backdrop-blur-sm flex items-center justify-center
                     opacity-0 group-hover:opacity-100 transition-opacity duration-200
                     hover:bg-white shadow-lg"
        >
          <ChevronRight className="w-5 h-5 text-ink" />
        </button>

        {/* Image counter */}
        <div className="absolute top-4 right-4 z-10 px-3 py-1.5 rounded-full bg-ink/70 backdrop-blur-sm">
          <p className="text-xs font-semibold text-white">
            {currentIndex + 1} / {images.length}
          </p>
        </div>
      </div>

      {/* Dots indicator */}
      <div className="flex items-center justify-center gap-2">
        {images.map((_, index) => (
          <motion.button
            key={index}
            onClick={() => goToSlide(index)}
            aria-label={`Go to image ${index + 1}`}
            className="transition-all duration-200"
            whileHover={{ scale: 1.2 }}
            whileTap={{ scale: 0.9 }}
          >
            <div
              className={`rounded-full transition-all duration-300 ${
                index === currentIndex
                  ? "w-2.5 h-2.5 bg-ink"
                  : "w-2 h-2 bg-stone-300 hover:bg-stone-400"
              }`}
            />
          </motion.button>
        ))}
      </div>

      {/* Thumbnail strip (optional - for better UX on mobile) */}
      {images.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-2 sm:hidden">
          {images.map((image, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`relative w-16 h-16 rounded-lg overflow-hidden shrink-0 transition-all duration-200 ${
                index === currentIndex ? "ring-2 ring-ink" : "opacity-60 hover:opacity-100"
              }`}
            >
              <Image
                src={image}
                alt={`Thumbnail ${index + 1}`}
                fill
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
