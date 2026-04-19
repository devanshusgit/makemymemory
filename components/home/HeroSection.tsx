"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowDown } from "lucide-react";

const ease = [0.4, 0, 0.2, 1] as const;

export default function HeroSection() {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    // Attempt autoplay — browsers may block unmuted autoplay
    videoRef.current?.play().catch(() => {});
  }, []);

  return (
    <section className="relative w-full min-h-[92vh] sm:min-h-screen flex items-end overflow-hidden bg-stone-900">

      {/* ── Background: video with image fallback ── */}
      <div className="absolute inset-0">
        {/* Beautiful static gradient — always visible as the base layer */}
        <div
          aria-hidden="true"
          className="absolute inset-0 w-full h-full"
          style={{
            background:
              "linear-gradient(135deg, #2C2520 0%, #3d3228 50%, #2C2520 100%)",
          }}
        />

        {/* Warm texture overlay */}
        <div
          aria-hidden="true"
          className="absolute inset-0 w-full h-full opacity-60"
          style={{
            background:
              "radial-gradient(ellipse 80% 60% at 60% 40%, rgba(143,188,143,0.15) 0%, transparent 60%), radial-gradient(ellipse 60% 80% at 20% 80%, rgba(200,160,100,0.12) 0%, transparent 50%)",
          }}
        />

        {/*
          Video — loads on top of the gradient when /videos/hero.mp4 exists.
          If the file is missing the video element simply shows nothing,
          and the gradient below remains visible.
        */}
        <video
          ref={videoRef}
          src="/videos/hero.mp4"
          poster="/images/hero-poster.jpg"
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
          aria-hidden="true"
        />

        {/* Cinematic gradient overlay — dark at bottom, lighter at top */}
        <div
          aria-hidden="true"
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to top, rgba(44,37,32,0.92) 0%, rgba(44,37,32,0.55) 40%, rgba(44,37,32,0.15) 75%, transparent 100%)",
          }}
        />
      </div>

      {/* ── Content ── */}
      <div className="relative z-10 section-wrap w-full pb-16 sm:pb-24 pt-32">
        <div className="max-w-3xl">

          {/* Eyebrow */}
          <motion.span
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease }}
            className="inline-flex items-center gap-2 text-xs font-semibold tracking-widest
                       uppercase text-sage-light mb-6"
          >
            <span className="w-6 h-px bg-sage-light" />
            Personalised Gifts &amp; Keepsakes
          </motion.span>

          {/* Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.75, delay: 0.1, ease }}
            className="font-serif font-bold text-white leading-[1.08] tracking-tight mb-6"
            style={{ fontSize: "clamp(2.8rem, 7vw, 5.5rem)" }}
          >
            Let Your Story<br />
            <em className="not-italic text-sage-light">Live Forever</em>
          </motion.h1>

          {/* Subtext */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.22, ease }}
            className="text-stone-300 text-base sm:text-lg leading-relaxed mb-10 max-w-xl"
          >
            Handcrafted photo books, custom frames, and engraved keepsakes —
            each one made to hold the moments that matter most.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.34, ease }}
            className="flex flex-wrap gap-3"
          >
            <Link
              href="/shop"
              className="inline-flex items-center justify-center gap-2
                         bg-white text-ink px-8 py-4 rounded-full
                         text-sm font-semibold tracking-wide
                         hover:bg-canvas hover:shadow-lift hover:-translate-y-0.5
                         transition-all duration-300"
            >
              Make It Yours
            </Link>
            <Link
              href="/about"
              className="inline-flex items-center justify-center gap-2
                         border border-white/30 text-white px-8 py-4 rounded-full
                         text-sm font-semibold tracking-wide
                         hover:bg-white/10 hover:-translate-y-0.5
                         transition-all duration-300"
            >
              Our Story
            </Link>
          </motion.div>

          {/* Social proof strip */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.5, ease }}
            className="mt-12 flex items-center gap-5"
          >
            {/* Avatar stack */}
            <div className="flex -space-x-2.5">
              {["#C4A882", "#B8956E", "#A8825A", "#8C7260"].map((bg, i) => (
                <div
                  key={i}
                  className="w-8 h-8 rounded-full border-2 border-stone-900/60"
                  style={{ backgroundColor: bg }}
                />
              ))}
            </div>
            <div className="h-8 w-px bg-white/20" />
            <div>
              <p className="text-white text-sm font-semibold">
                ★★★★★{" "}
                <span className="text-stone-400 font-normal text-xs">4.9 / 5</span>
              </p>
              <p className="text-stone-400 text-xs">10,000+ happy customers</p>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Scroll cue */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.6 }}
        className="absolute bottom-8 right-8 z-10 hidden sm:flex flex-col items-center gap-2"
      >
        <span className="text-[10px] tracking-widest uppercase text-white/40 rotate-90 origin-center mb-1">
          Scroll
        </span>
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ repeat: Infinity, duration: 1.6, ease: "easeInOut" }}
        >
          <ArrowDown className="w-4 h-4 text-white/40" />
        </motion.div>
      </motion.div>
    </section>
  );
}
