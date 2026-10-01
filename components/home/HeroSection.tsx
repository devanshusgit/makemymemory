import Link from "next/link";
import { getImageProps } from "next/image";

// Art-directed hero: a tall crop on phones, the wide crop from 640px up.
// Served through Next's optimizer (AVIF/WebP, resized per device) instead of
// the raw 2.0 MB / 1.8 MB PNGs, and fetched at high priority as the LCP image.
const heroCommon = { alt: "", sizes: "100vw", quality: 70, priority: true } as const;
const { props: heroDesktopProps } = getImageProps({ ...heroCommon, src: "/images/home-banner-2026.png", width: 1448, height: 1086 });
// Phones: the tall banner is shown in the page flow, between the heading and
// the buttons, so no text sits on top of the frames.
const { props: heroMobileProps } = getImageProps({
  ...heroCommon, alt: "Gold foil baby handprint and footprint frames on a shelf",
  src: "/images/home-banner-vertical-2026.png", width: 1024, height: 1536, sizes: "100vw",
});

// A 1×1 blank image: the <source> below swaps it in on the screen size where
// that banner is hidden, so each device downloads only its own banner.
const BLANK = "data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==";

export default function HeroSection() {
  return (
    <section className="relative w-full sm:min-h-[90vh] md:min-h-[88svh] flex items-stretch overflow-hidden" style={{ backgroundColor: "#2C2520" }}>

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

        {/* Hero background image — from sm up only (phones show the tall banner in the flow below the heading) */}
        <picture>
        <source media="(max-width: 639px)" srcSet={BLANK} />
        {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
        <img
          {...heroDesktopProps}
          alt=""
          aria-hidden="true"
          // Anchored a little below centre so the row of frames sits in the
          // middle band, with the empty wall above for the heading and the
          // cabinet below for the buttons.
          className="hidden sm:block absolute inset-0 w-full h-full object-cover object-[center_62%]"
        />
        </picture>

        {/* Dark overlay for text readability. Text sits at the TOP (heading) and
            BOTTOM (paragraph/CTAs) at every breakpoint, so both ends are darkened
            while the middle stays lighter to keep the framed keepsake photos visible. */}
        <div
          aria-hidden="true"
          className="absolute inset-0 hidden sm:block"
          style={{
            background: "linear-gradient(to bottom, rgba(20,14,10,0.78) 0%, rgba(20,14,10,0.55) 18%, rgba(20,14,10,0.08) 36%, rgba(20,14,10,0) 50%, rgba(20,14,10,0.05) 66%, rgba(20,14,10,0.6) 84%, rgba(20,14,10,0.85) 100%)",
          }}
        />
      </div>

      {/* ── Content ── */}
      <div className="hero-content relative z-10 w-full px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto pb-6 pt-6 sm:pb-8 sm:pt-12 md:pt-14">
        {/* Full-height column at every breakpoint so the CTAs push to the bottom
            (mt-auto below), leaving the eyebrow/heading pinned to the top — the
            framed keepsake photos in the middle of the hero image stay uncovered. */}
        {/* Phones: left-aligned over the tall photo. From sm up: centred, so the
            heading sits on the empty wall between the lamp and the plant and the
            buttons on the cabinet, leaving the row of frames uncovered. */}
        <div className="max-w-3xl flex flex-col h-full sm:mx-auto sm:items-center sm:text-center">

          {/* Eyebrow */}
          <span
            className="inline-flex items-center gap-2 text-[10px] sm:text-xs font-semibold tracking-widest uppercase mb-3 sm:mb-6 animate-fade-in"
            style={{ color: "#F5EFE0" }}
          >
            <span className="w-4 sm:w-6 h-px" style={{ backgroundColor: "#C9A84C" }} />
            Handcrafted Baby Keepsakes, Made With Love
            <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="#C9A84C" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
            </svg>
          </span>

          {/* Heading */}
          <h1
            className="font-serif font-bold text-white leading-[1.08] tracking-tight mb-3 sm:mb-4 text-3xl sm:text-4xl md:text-5xl lg:text-6xl animate-slide-up"
            style={{ textShadow: "0 2px 18px rgba(0,0,0,0.45)" }}
          >
            Preserve Precious Moments<br />
            <em className="not-italic" style={{ color: "#C9A84C" }}>In Timeless Keepsakes</em>
          </h1>

          {/* Phone banner, full width, nothing on top of it */}
          <picture>
            <source media="(min-width: 640px)" srcSet={BLANK} />
            {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
            <img
              {...heroMobileProps}
              className="sm:hidden -mx-4 w-[calc(100%+2rem)] max-w-none h-auto mb-5 block"
            />
          </picture>

          {/* Subtext — mt-auto pushes this (and the CTAs right after it) down to the
              bottom of the column at every breakpoint, leaving just the eyebrow/heading
              up top so the framed keepsake photos in the middle of the hero image
              stay uncovered. */}
          <p
            className="mt-auto text-stone-200 text-sm sm:text-base md:text-lg leading-relaxed mb-4 sm:mb-3 max-w-xl animate-fade-in-delay"
          >
            Gold foil handprint and footprint frames, made from your baby's own imprint.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row flex-wrap gap-3 sm:justify-center">
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
                         transition-all duration-300 bg-transparent
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
