"use client";

import Link from "next/link";

export default function HeroSection() {
  return (
    <section className="relative w-full min-h-[85vh] sm:min-h-[92vh] md:min-h-screen flex items-stretch overflow-hidden" style={{ backgroundColor: "#2C2520" }}>

      {/* ── Background ── */}
      <div className="absolute inset-0">
        {/* Fallback gradient */}
        <div
          aria-hidden="true"
          className="absolute inset-0 w-full h-full"
          style={{
            background: "linear-gradient(135deg, #2C2520 0%, #3d3228 50%, #2C2520 100%)",
          }}
        />

        {/* Hero background image — a taller vertical crop on mobile, the wide web crop from sm up */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/gallery-vertical.png"
          alt=""
          aria-hidden="true"
          className="absolute inset-0 w-full h-full object-cover object-center block sm:hidden"
        />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/gallery.jpeg"
          alt=""
          aria-hidden="true"
          className="absolute inset-0 w-full h-full object-cover object-center hidden sm:block"
        />

        {/* Dark overlay for text readability. Text sits at the TOP (heading) and
            BOTTOM (paragraph/CTAs) at every breakpoint, so both ends are darkened
            while the middle stays lighter to keep the framed keepsake photos visible. */}
        <div
          aria-hidden="true"
          className="absolute inset-0 sm:hidden"
          style={{
            background: "linear-gradient(to bottom, rgba(20,14,10,0.82) 0%, rgba(20,14,10,0.55) 30%, rgba(20,14,10,0.2) 55%, rgba(20,14,10,0.05) 100%)",
          }}
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 hidden sm:block"
          style={{
            background: "linear-gradient(to bottom, rgba(20,14,10,0.8) 0%, rgba(20,14,10,0.45) 20%, rgba(20,14,10,0.1) 38%, rgba(20,14,10,0.1) 60%, rgba(20,14,10,0.5) 80%, rgba(20,14,10,0.82) 100%)",
          }}
        />
      </div>

      {/* ── Content ── */}
      <div className="relative z-10 w-full px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto pb-8 pt-8 sm:pt-12 md:pt-14">
        {/* Full-height column at every breakpoint so the CTAs push to the bottom
            (mt-auto below), leaving the eyebrow/heading pinned to the top — the
            framed keepsake photos in the middle of the hero image stay uncovered. */}
        <div className="max-w-3xl flex flex-col h-full">

          {/* Eyebrow */}
          <span
            className="inline-flex items-center gap-2 text-[10px] sm:text-xs font-semibold tracking-widest uppercase mb-3 sm:mb-6 animate-fade-in"
            style={{ color: "#C9A84C" }}
          >
            <span className="w-4 sm:w-6 h-px" style={{ backgroundColor: "#C9A84C" }} />
            Premium Memory Keepsakes Handcrafted with Love
            <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
            </svg>
          </span>

          {/* Heading */}
          <h1
            className="font-serif font-bold text-white leading-[1.08] tracking-tight mb-3 sm:mb-6 text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl animate-slide-up"
          >
            Preserve Precious Moments<br />
            <em className="not-italic" style={{ color: "#C9A84C" }}>In Timeless Keepsakes</em>
          </h1>

          {/* Subtext — mt-auto pushes this (and the CTAs right after it) down to the
              bottom of the column at every breakpoint, leaving just the eyebrow/heading
              up top so the framed keepsake photos in the middle of the hero image
              stay uncovered. */}
          <p
            className="mt-auto text-stone-300 text-sm sm:text-base md:text-lg leading-relaxed mb-5 sm:mb-10 max-w-xl animate-fade-in-delay
                       bg-black/45 backdrop-blur-sm rounded-2xl px-4 py-3 sm:bg-transparent sm:backdrop-blur-none sm:rounded-none sm:px-0 sm:py-0"
          >
            Exquisite gold foil imprints, 3D castings, custom frames, and handcrafted gifts —
            each one treasured with premium craftsmanship to preserve your most cherished memories forever.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row flex-wrap gap-3">
            <Link
              href="/shop"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2
                         px-6 sm:px-8 py-3.5 sm:py-4 rounded-full text-sm font-semibold tracking-wide
                         transition-all duration-300
                         hover:bg-[#C9A84C] hover:text-[#1A1A1A]"
              style={{ backgroundColor: "#FAF8F4", color: "#1A1A1A" }}
            >
              Make It Yours
            </Link>
            <Link
              href="/about"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2
                         px-6 sm:px-8 py-3.5 sm:py-4 rounded-full text-sm font-semibold tracking-wide
                         transition-all duration-300 bg-black/40 sm:bg-transparent backdrop-blur-sm sm:backdrop-blur-none
                         hover:bg-[#C9A84C] hover:text-[#1A1A1A]"
              style={{ border: "1.5px solid #C9A84C", color: "#C9A84C" }}
            >
              Our Story
            </Link>
          </div>

        </div>
      </div>
    </section>
  );
}
