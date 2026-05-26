"use client";

import { useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

interface LightboxProps {
  images: string[];
  index: number;
  onClose: () => void;
  onNavigate: (index: number) => void;
}

export default function Lightbox({ images, index, onClose, onNavigate }: LightboxProps) {
  const prev = () => onNavigate((index - 1 + images.length) % images.length);
  const next = () => onNavigate((index + 1) % images.length);

  const handleKey = useCallback((e: KeyboardEvent) => {
    if (e.key === "Escape")     onClose();
    if (e.key === "ArrowLeft")  prev();
    if (e.key === "ArrowRight") next();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, images.length]);

  useEffect(() => {
    document.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [handleKey]);

  const content = (
    <div
      className="fixed inset-0 flex items-center justify-center"
      style={{ zIndex: 9999, backgroundColor: "rgba(0,0,0,0.93)" }}
      onClick={onClose}
    >
      {/* Close */}
      <button
        onClick={onClose}
        aria-label="Close lightbox"
        className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10
                   flex items-center justify-center hover:bg-white/25 transition-colors"
        style={{ zIndex: 10000 }}
      >
        <X className="w-5 h-5 text-white" />
      </button>

      {/* Counter */}
      {images.length > 1 && (
        <div
          className="absolute top-4 left-1/2 -translate-x-1/2
                     bg-black/50 rounded-full px-4 py-1.5 text-white text-xs font-semibold"
          style={{ zIndex: 10000 }}
        >
          {index + 1} / {images.length}
        </div>
      )}

      {/* Prev */}
      {images.length > 1 && (
        <button
          onClick={(e) => { e.stopPropagation(); prev(); }}
          aria-label="Previous image"
          className="absolute left-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full
                     bg-white/10 flex items-center justify-center hover:bg-white/25 transition-colors"
          style={{ zIndex: 10000 }}
        >
          <ChevronLeft className="w-6 h-6 text-white" />
        </button>
      )}

      {/* Next */}
      {images.length > 1 && (
        <button
          onClick={(e) => { e.stopPropagation(); next(); }}
          aria-label="Next image"
          className="absolute right-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full
                     bg-white/10 flex items-center justify-center hover:bg-white/25 transition-colors"
          style={{ zIndex: 10000 }}
        >
          <ChevronRight className="w-6 h-6 text-white" />
        </button>
      )}

      {/* Main image */}
      <motion.div
        key={index}
        initial={{ opacity: 0, scale: 0.94 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.18 }}
        className="px-4 md:px-8 lg:px-16 flex items-center justify-center"
        style={{ zIndex: 10000, maxWidth: "90vw", maxHeight: "88vh" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={images[index]}
          alt={`Image ${index + 1}`}
          style={{ maxWidth: "85vw", maxHeight: "82vh", objectFit: "contain", borderRadius: "12px" }}
          draggable={false}
        />
      </motion.div>

      {/* Thumbnail strip */}
      {images.length > 1 && (
        <div
          className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 px-4
                     overflow-x-auto scrollbar-hide"
          style={{ zIndex: 10000, maxWidth: "90vw" }}
          onClick={(e) => e.stopPropagation()}
        >
          {images.map((img, i) => (
            <button
              key={i}
              onClick={() => onNavigate(i)}
              aria-label={`Go to image ${i + 1}`}
              style={{
                width: 48, height: 48, borderRadius: 8, overflow: "hidden",
                flexShrink: 0, opacity: i === index ? 1 : 0.4,
                outline: i === index ? "2px solid #C9A84C" : "none",
                outlineOffset: 2,
                transition: "opacity 0.2s",
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={img} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </button>
          ))}
        </div>
      )}
    </div>
  );

  // Render into document.body via portal so nothing can block it
  if (typeof document === "undefined") return null;
  return createPortal(content, document.body);
}
