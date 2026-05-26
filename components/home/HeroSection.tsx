"use client";

import Link from "next/link";

export default function HeroSection() {
  return (
    <section className="relative w-full min-h-[85vh] sm:min-h-[92vh] md:min-h-screen flex items-end overflow-hidden" style={{ backgroundColor: "#2C2520" }}>

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

        {/* Hero background image */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/gallery.jpeg"
          alt=""
          aria-hidden="true"
          className="absolute inset-0 w-full h-full object-cover object-center"
          style={{ display: "block" }}
        />

        {/* Dark overlay for text readability */}
        <div
          aria-hidden="true"
          className="absolute inset-0"
          style={{
            background: "rgba(26,18,12,0.45)",
          }}
        />
      </div>

      {/* ── Content ── */}
      <div className="relative z-10 w-full px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto pb-12 sm:pb-16 md:pb-24 pt-20 sm:pt-32">
        <div className="max-w-3xl">

          {/* Eyebrow */}
          <span
            className="inline-flex items-center gap-2 text-[10px] sm:text-xs font-semibold tracking-widest uppercase mb-4 sm:mb-6"
            style={{ color: "#C9A84C" }}
          >
            <span className="w-4 sm:w-6 h-px" style={{ backgroundColor: "#C9A84C" }} />
            tiny hands. tiny feet. forever yours. 🤍
          </span>

          {/* Heading */}
          <h1
            className="font-serif font-bold text-white leading-[1.08] tracking-tight mb-4 sm:mb-6 text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl"
          >
            Let Your Story<br />
            <em className="not-italic" style={{ color: "#C9A84C" }}>Live Forever</em>
          </h1>

          {/* Subtext */}
          <p
            className="text-stone-300 text-sm sm:text-base md:text-lg leading-relaxed mb-6 sm:mb-10 max-w-xl"
          >
            Gold foil imprints, 3D castings, and handcrafted frames —
            each one a forever keepsake of the little moments you never want to forget.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row flex-wrap gap-3">
            <Link
              href="/shop"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2
                         px-6 sm:px-8 py-3 sm:py-4 rounded-full text-sm font-semibold tracking-wide
                         transition-all duration-300
                         hover:bg-[#C9A84C] hover:text-[#1A1A1A]"
              style={{ backgroundColor: "#FAF8F4", color: "#1A1A1A" }}
            >
              Make It Yours
            </Link>
            <Link
              href="/about"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2
                         px-6 sm:px-8 py-3 sm:py-4 rounded-full text-sm font-semibold tracking-wide
                         transition-all duration-300
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
