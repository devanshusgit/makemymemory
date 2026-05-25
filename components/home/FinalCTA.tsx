"use client";

import Link from "next/link";

export default function FinalCTA() {
  return (
    <section className="relative overflow-hidden py-24 sm:py-36" style={{ backgroundColor: "#1A1A1A" }}>

      {/* Gold radial glow */}
      <div aria-hidden className="absolute inset-0 pointer-events-none"
        style={{ background: "radial-gradient(ellipse 70% 60% at 50% 50%, rgba(201,168,76,0.08) 0%, transparent 70%)" }} />

      {/* Decorative character */}
      <div aria-hidden
        className="absolute -top-8 -right-8 sm:-top-16 sm:-right-16 font-serif font-bold
                   select-none pointer-events-none leading-none"
        style={{ fontSize: "clamp(12rem, 30vw, 28rem)", color: "rgba(201,168,76,0.04)" }}>
        ✦
      </div>

      <div className="relative z-10 section-wrap text-center">

        <span
          className="inline-flex items-center gap-2 text-xs font-semibold tracking-widest uppercase mb-6"
          style={{ color: "#C9A84C" }}
        >
          <span className="w-5 h-px" style={{ backgroundColor: "#C9A84C" }} />
          Start Today
          <span className="w-5 h-px" style={{ backgroundColor: "#C9A84C" }} />
        </span>

        <h2
          className="font-serif font-bold text-white leading-tight mb-6 mx-auto"
          style={{ fontSize: "clamp(2.2rem, 6vw, 4.5rem)", letterSpacing: "-0.02em", maxWidth: "16ch" }}
        >
          Create Something<br />
          <em className="not-italic" style={{ color: "#C9A84C" }}>Worth Keeping</em>
        </h2>

        <p
          className="text-base sm:text-lg leading-relaxed mb-10 max-w-lg mx-auto"
          style={{ color: "rgba(232,213,163,0.65)" }}
        >
          Every memory deserves a home beyond your phone.
          Let us help you make something beautiful.
        </p>

        <div
          className="flex flex-col sm:flex-row gap-3 justify-center items-center"
        >
          <Link href="/shop"
            className="inline-flex items-center justify-center gap-2 px-10 py-4 rounded-full
                       text-sm font-semibold tracking-wide transition-all duration-300
                       hover:bg-[#C9A84C] hover:text-[#1A1A1A] min-w-[180px]"
            style={{ backgroundColor: "#FAF8F4", color: "#1A1A1A" }}>
            Make It Yours
          </Link>
          <Link href="/contact"
            className="inline-flex items-center justify-center gap-2 px-10 py-4 rounded-full
                       text-sm font-semibold tracking-wide transition-all duration-300
                       hover:bg-[#C9A84C] hover:text-[#1A1A1A] min-w-[180px]"
            style={{ border: "1.5px solid #C9A84C", color: "#C9A84C" }}>
            Custom Order
          </Link>
        </div>

        <p
          className="mt-8 text-xs tracking-wide"
          style={{ color: "rgba(201,168,76,0.4)" }}
        >
          Free gift wrap on orders ₹999+ &nbsp;·&nbsp; 2–3 day delivery &nbsp;·&nbsp; 100% personalised
        </p>
      </div>
    </section>
  );
}
