"use client";

import { motion } from "framer-motion";

const ease = [0.4, 0, 0.2, 1] as const;

export default function IntroSection() {
  return (
    <section className="bg-canvas py-20 sm:py-28">
      <div className="section-wrap">

        <div className="max-w-2xl mx-auto text-center">
          <motion.span
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, ease }}
            className="label-tag mb-5 inline-flex"
          >
            Why We Exist
          </motion.span>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.65, delay: 0.08, ease }}
            className="font-serif font-bold text-ink leading-tight mb-5"
            style={{ fontSize: "clamp(1.9rem, 4.5vw, 3.2rem)", letterSpacing: "-0.02em" }}
          >
            Some moments deserve more<br className="hidden sm:block" /> than a screenshot.
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.16, ease }}
            className="text-stone-500 text-base sm:text-lg leading-relaxed"
          >
            We turn your favourite photos into tangible, lasting keepsakes —
            things you can hold, display, and pass down. Because the best memories
            deserve a home beyond your phone.
          </motion.p>
        </div>

      </div>
    </section>
  );
}
