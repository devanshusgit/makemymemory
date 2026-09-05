"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Minus } from "lucide-react";

const FAQS = [
  {
    q: "How does the Foil Imprint process work?",
    a: "Simply place your order, and we'll guide you through capturing your baby's handprint or footprint using our easy imprinting process. Once you upload the prints, we transform them into a beautiful, personalised metallic keepsake.",
  },
  {
    q: "Is the imprinting process safe for my baby?",
    a: "Yes, absolutely! Our imprinting process is designed to be safe, gentle, and easy to use for babies. We use baby-safe, non-toxic ink wipes that are gentle on your baby's skin.",
  },
  {
    q: "What if I don't get a perfect handprint or footprint?",
    a: "Don't worry! Babies can be unpredictable. We provide clear guidance to help you capture the best possible imprint. If you need any assistance, our team is always here to help.",
  },
  {
    q: "Can I personalise my Foil Imprint?",
    a: "Absolutely! You can personalise your keepsake with your baby's name, birthdate, special messages, and other available options. Depending on the product, you can also choose from different font styles, frame options, and foil colours.",
  },
  {
    q: "What materials are used, and how long will it take to receive my keepsake?",
    a: "We use baby-safe, non-toxic ink wipes along with high-quality wooden or metal frames, designed to create a beautiful keepsake that lasts a lifetime. You'll receive your imprint kit within 4-6 business days. Once you upload your prints, your finished personalised keepsake will be delivered within 10-12 business days.",
  },
  {
    q: "Do you ship across India?",
    a: "Yes! We currently offer PAN India shipping with doorstep delivery. International shipping is not available at the moment, but we're working towards offering international delivery soon.",
  },
];

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
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="answer"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.28, ease }}
            className="overflow-hidden"
          >
            <p className="pb-5 pr-10 text-sm leading-relaxed" style={{ color: "#6B6560" }}>{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
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
            Our team is available Mon–Sat, 10 AM–6 PM IST.
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
