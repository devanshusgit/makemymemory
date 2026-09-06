"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Plus, Minus } from "lucide-react";
import { FAQS } from "@/lib/data/faqs";
import { BUSINESS_HOURS_SHORT } from "@/lib/data/businessHours";

const ease = [0.4, 0, 0.2, 1] as const;

function AccordionItem({ q, a, index }: { q: string; a: string; index: number }) {
  const [open, setOpen] = useState(false);
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-20px" }}
      transition={{ delay: index * 0.04, duration: 0.4, ease }}
      className="border-b last:border-0"
      style={{ borderColor: "rgba(201,168,76,0.15)" }}
    >
      <button
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="w-full flex items-start justify-between gap-4 py-5 text-left group"
      >
        <span className="text-sm sm:text-[15px] font-medium leading-snug transition-colors duration-200"
          style={{ color: "#1A1A1A" }}>
          {q}
        </span>
        <span className="shrink-0 mt-0.5 w-6 h-6 rounded-full flex items-center justify-center
                         transition-all duration-200"
          style={{
            backgroundColor: open ? "rgba(201,168,76,0.15)" : "#F0EBE1",
            color: open ? "#C9A84C" : "#6B6560",
          }}>
          {open ? <Minus className="w-3 h-3" /> : <Plus className="w-3 h-3" />}
        </span>
      </button>
      {/* Answer stays mounted (just visually collapsed) so it's present in the
          server-rendered HTML for search/AI crawlers, instead of only
          appearing in the DOM after a click. */}
      <motion.div
        initial={false}
        animate={{ height: open ? "auto" : 0, opacity: open ? 1 : 0 }}
        transition={{ duration: 0.28, ease }}
        className="overflow-hidden"
      >
        <p className="pb-5 pr-10 text-sm leading-relaxed" style={{ color: "#6B6560" }}>{a}</p>
      </motion.div>
    </motion.div>
  );
}

export default function FaqClient() {
  return (
    <div className="section-wrap py-12 sm:py-16">
      <div className="max-w-2xl mx-auto space-y-10">
        <div className="bg-white rounded-2xl px-5 sm:px-7"
          style={{ border: "1px solid rgba(201,168,76,0.15)", boxShadow: "0 2px 12px rgba(26,26,26,0.04)" }}>
          {FAQS.map((item, i) => (
            <AccordionItem key={item.q} q={item.q} a={item.a} index={i} />
          ))}
        </div>

        {/* Still have questions CTA */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, ease }}
          className="rounded-2xl p-8 text-center"
          style={{ backgroundColor: "#1A1A1A" }}
        >
          <p className="text-white font-semibold text-base mb-2">Still have a question?</p>
          <p className="text-sm mb-6" style={{ color: "rgba(232,213,163,0.65)" }}>
            Our team is available {BUSINESS_HOURS_SHORT} IST.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/contact"
              className="inline-flex items-center justify-center gap-2 bg-white px-7 py-3 rounded-full
                         text-sm font-semibold transition-all duration-300 hover:bg-[#C9A84C] hover:text-[#1A1A1A]"
              style={{ color: "#1A1A1A" }}>
              Contact Us
            </Link>
            <a href="mailto:support@makemymemory.in"
              className="inline-flex items-center justify-center gap-2 px-7 py-3 rounded-full
                         text-sm font-semibold transition-all duration-300 hover:bg-[#C9A84C] hover:text-[#1A1A1A]"
              style={{ border: "1px solid rgba(201,168,76,0.3)", color: "rgba(232,213,163,0.8)" }}>
              support@makemymemory.in
            </a>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
