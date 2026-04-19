"use client";

import { motion } from "framer-motion";
import Link from "next/link";

const ease = [0.4, 0, 0.2, 1] as const;

export default function FinalCTA() {
  return (
    <section className="relative bg-stone-900 overflow-hidden py-24 sm:py-36">

      {/* Background texture — warm radial glow */}
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 70% 60% at 50% 50%, rgba(143,188,143,0.12) 0%, transparent 70%), radial-gradient(ellipse 50% 40% at 80% 20%, rgba(200,160,120,0.08) 0%, transparent 60%)",
        }}
      />

      {/* Decorative large serif character */}
      <div
        aria-hidden
        className="absolute -top-8 -right-8 sm:-top-16 sm:-right-16
                   font-serif font-bold text-white/[0.03] select-none pointer-events-none
                   leading-none"
        style={{ fontSize: "clamp(12rem, 30vw, 28rem)" }}
      >
        ✦
      </div>

      <div className="relative z-10 section-wrap text-center">

        {/* Eyebrow */}
        <motion.span
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, ease }}
          className="inline-flex items-center gap-2 text-xs font-semibold tracking-widest
                     uppercase text-sage mb-6"
        >
          <span className="w-5 h-px bg-sage" />
          Start Today
          <span className="w-5 h-px bg-sage" />
        </motion.span>

        {/* Heading */}
        <motion.h2
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.08, ease }}
          className="font-serif font-bold text-white leading-tight mb-6 mx-auto"
          style={{
            fontSize: "clamp(2.2rem, 6vw, 4.5rem)",
            letterSpacing: "-0.02em",
            maxWidth: "16ch",
          }}
        >
          Create Something<br />
          <em className="not-italic text-sage-light">Worth Keeping</em>
        </motion.h2>

        {/* Subtext */}
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.18, ease }}
          className="text-stone-400 text-base sm:text-lg leading-relaxed mb-10
                     max-w-lg mx-auto"
        >
          Every memory deserves a home beyond your phone.
          Let us help you make something beautiful.
        </motion.p>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55, delay: 0.28, ease }}
          className="flex flex-col sm:flex-row gap-3 justify-center items-center"
        >
          <Link
            href="/shop"
            className="inline-flex items-center justify-center gap-2
                       bg-white text-ink px-10 py-4 rounded-full
                       text-sm font-semibold tracking-wide
                       hover:bg-canvas hover:shadow-lift hover:-translate-y-0.5
                       transition-all duration-300 min-w-[180px]"
          >
            Make It Yours
          </Link>
          <Link
            href="/contact"
            className="inline-flex items-center justify-center gap-2
                       border border-white/20 text-white/80 px-10 py-4 rounded-full
                       text-sm font-semibold tracking-wide
                       hover:border-white/50 hover:text-white hover:-translate-y-0.5
                       transition-all duration-300 min-w-[180px]"
          >
            Custom Order
          </Link>
        </motion.div>

        {/* Trust line */}
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4, ease }}
          className="mt-8 text-stone-600 text-xs tracking-wide"
        >
          Free gift wrap on orders ₹999+ &nbsp;·&nbsp; 2–3 day delivery &nbsp;·&nbsp; 100% personalised
        </motion.p>

      </div>
    </section>
  );
}
