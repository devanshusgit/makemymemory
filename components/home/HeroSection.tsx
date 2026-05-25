"use client";

import Link from "next/link";

export default function HeroSection() {
  return (
    <section className="relative w-full min-h-[92vh] sm:min-h-screen flex items-end overflow-hidden" style={{ backgroundColor: "#2C2520" }}>

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
      <div className="relative z-10 section-wrap w-full pb-16 sm:pb-24 pt-32">
        <div className="max-w-3xl">

          {/* Eyebrow */}
          <span
            className="inline-flex items-center gap-2 text-xs font-semibold tracking-widest uppercase mb-6"
            style={{ color: "#C9A84C" }}
          >
            <span className="w-6 h-px" style={{ backgroundColor: "#C9A84C" }} />
            tiny hands. tiny feet. forever yours. 🤍
          </span>

          {/* Heading */}
          <h1
            className="font-serif font-bold text-white leading-[1.08] tracking-tight mb-6"
            style={{ fontSize: "clamp(2.8rem, 7vw, 5.5rem)" }}
          >
            Let Your Story<br />
            <em className="not-italic" style={{ color: "#C9A84C" }}>Live Forever</em>
          </h1>

          {/* Subtext */}
          <p
            className="text-stone-300 text-base sm:text-lg leading-relaxed mb-10 max-w-xl"
          >
            Gold foil imprints, 3D castings, and handcrafted frames —
            each one a forever keepsake of the little moments you never want to forget.
          </p>

          {/* CTAs */}
          <div className="flex flex-wrap gap-3">
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
          </div>

        </div>
      </div>
    </section>
  );
}
