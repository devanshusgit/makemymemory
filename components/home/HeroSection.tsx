"use client";

import Link from "next/link";
import { motion } from "framer-motion";

const ease = [0.4, 0, 0.2, 1] as const;

/*
  ── HOW TO SET YOUR HERO BACKGROUND PHOTO ───────────────────────────────────
  Drop your image into:  make-my-memory/public/images/hero-bg.jpg
  (JPG, PNG or WEBP — recommended size: 1920×1080 or taller for mobile)
  The dark overlay on top keeps the text readable regardless of photo content.
  ─────────────────────────────────────────────────────────────────────────────
*/
const HERO_IMAGE = "/images/gallery.jpeg";

export default function HeroSection() {
  return (
    <section className="relative w-full min-h-[92vh] sm:min-h-screen flex items-end overflow-hidden">

      {/* ── Background ── */}
      <div className="absolute inset-0">

        {/* Fallback gradient — shows if image hasn't loaded yet */}
        <div
          aria-hidden="true"
          className="absolute inset-0 w-full h-full"
          style={{
            background: "linear-gradient(135deg, #2C2520 0%, #3d3228 50%, #2C2520 100%)",
          }}
        />

        {/* Hero background photo */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={HERO_IMAGE}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 w-full h-full object-cover object-center"
          style={{ display: "block" }}
        />

        {/* Dark overlay — keeps text readable */}
        <div
          aria-hidden="true"
          className="absolute inset-0"
          style={{
            background: "rgba(26,18,12,0.45)",
          }}
        />
      </div>

      {/* ── Content ── */}
      <div className="relative z-10 section-wrap w-full pb-16 sm:pb-24 pt-32">
        <div className="max-w-3xl">

          {/* Eyebrow — cute tagline for imprints & 3D castings */}
          <motion.span
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease }}
            className="inline-flex items-center gap-2 text-xs font-semibold tracking-widest uppercase mb-6"
            style={{ color: "#C9A84C" }}
          >
            <span className="w-6 h-px" style={{ backgroundColor: "#C9A84C" }} />
            tiny hands. tiny feet. forever yours. 🤍
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
            <em className="not-italic" style={{ color: "#C9A84C" }}>Live Forever</em>
          </motion.h1>

          {/* Subtext — aligned to imprints & 3D castings */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.22, ease }}
            className="text-stone-300 text-base sm:text-lg leading-relaxed mb-10 max-w-xl"
          >
            Gold foil imprints, 3D castings, and handcrafted frames —
            each one a forever keepsake of the little moments you never want to forget.
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
                         px-8 py-4 rounded-full text-sm font-semibold tracking-wide
                         transition-all duration-300
                         hover:bg-[#C9A84C] hover:text-[#1A1A1A]"
              style={{ backgroundColor: "#FAF8F4", color: "#1A1A1A" }}
            >
              Make It Yours
            </Link>
            <Link
              href="/about"
              className="inline-flex items-center justify-center gap-2
                         px-8 py-4 rounded-full text-sm font-semibold tracking-wide
                         transition-all duration-300
                         hover:bg-[#C9A84C] hover:text-[#1A1A1A]"
              style={{ border: "1.5px solid #C9A84C", color: "#C9A84C" }}
            >
              Our Story
            </Link>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
