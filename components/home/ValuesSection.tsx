"use client";

import { motion } from "framer-motion";

const ease = [0.4, 0, 0.2, 1] as const;

const values = [
  {
    number: "01",
    title: "Made with Meaning",
    body: "Every product starts with your story. We don't make things in bulk — we make them for you, with intention and care baked into every detail.",
    accent: "bg-sage/10 text-sage-dark",
  },
  {
    number: "02",
    title: "Quality You Can Feel",
    body: "From archival-grade photo paper to sustainably sourced wood, we choose materials that age beautifully — because your memories deserve to last.",
    accent: "bg-stone-200 text-stone-700",
  },
  {
    number: "03",
    title: "Built Around You",
    body: "No templates, no compromises. Our design process puts you in control — your photos, your words, your layout, your keepsake.",
    accent: "bg-sage/10 text-sage-dark",
  },
  {
    number: "04",
    title: "With You Every Step",
    body: "From the moment you upload your first photo to the day your order arrives, our team is here — responsive, human, and genuinely invested in getting it right.",
    accent: "bg-stone-200 text-stone-700",
  },
];

export default function ValuesSection() {
  return (
    <section className="bg-canvas py-20 sm:py-28">
      <div className="section-wrap">

        {/* Header */}
        <div className="max-w-xl mb-14 sm:mb-20">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, ease }}
            className="label-tag mb-4 inline-flex"
          >
            What We Believe
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.08, ease }}
            className="section-heading"
          >
            The values behind every keepsake
          </motion.h2>
        </div>

        {/* Cards grid */}
        <div className="grid sm:grid-cols-2 gap-5 sm:gap-6">
          {values.map((v, i) => (
            <motion.div
              key={v.title}
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ delay: i * 0.1, duration: 0.6, ease }}
              className="group bg-white rounded-4xl p-8 sm:p-10 border border-stone-100
                         shadow-soft hover:shadow-card hover:-translate-y-1
                         transition-all duration-300 flex flex-col gap-5"
            >
              {/* Number badge */}
              <div className={`self-start w-10 h-10 rounded-2xl flex items-center justify-center
                               text-xs font-bold tracking-widest ${v.accent}`}>
                {v.number}
              </div>

              {/* Text */}
              <div>
                <h3 className="font-serif font-bold text-ink text-xl sm:text-2xl mb-3
                               group-hover:text-sage-dark transition-colors duration-300">
                  {v.title}
                </h3>
                <p className="text-stone-500 text-sm sm:text-base leading-relaxed">
                  {v.body}
                </p>
              </div>

              {/* Decorative line */}
              <div className="mt-auto pt-4 border-t border-stone-100">
                <div className="w-8 h-0.5 bg-sage/40 rounded-full
                                group-hover:w-16 transition-all duration-500" />
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}
