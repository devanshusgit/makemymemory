"use client";

const values = [
  {
    number: "01",
    title: "Made with Meaning",
    body: "Every product starts with your story. We don't make things in bulk — we make them for you, with intention and care baked into every detail.",
    accent: "bg-[#C9A84C]/10 text-[#A07C2E] border border-[#C9A84C]/25",
  },
  {
    number: "02",
    title: "Quality You Can Feel",
    body: "From archival-grade photo paper to sustainably sourced wood, we choose materials that age beautifully — because your memories deserve to last.",
    accent: "bg-[#1A1A1A]/5 text-[#1A1A1A] border border-[#1A1A1A]/10",
  },
  {
    number: "03",
    title: "Built Around You",
    body: "No templates, no compromises. Our design process puts you in control — your photos, your words, your layout, your keepsake.",
    accent: "bg-[#C9A84C]/10 text-[#A07C2E] border border-[#C9A84C]/25",
  },
  {
    number: "04",
    title: "With You Every Step",
    body: "From the moment you upload your first photo to the day your order arrives, our team is here — responsive, human, and genuinely invested in getting it right.",
    accent: "bg-[#1A1A1A]/5 text-[#1A1A1A] border border-[#1A1A1A]/10",
  },
];

export default function ValuesSection() {
  return (
    <section className="relative overflow-hidden py-20 sm:py-28 bg-section-values">
      {/* ── Decorative CSS Background ── */}
      <div aria-hidden="true" className="absolute inset-0 z-0 pointer-events-none" />

      <div className="relative z-10 section-wrap">

        {/* Header */}
        <div className="max-w-xl mb-14 sm:mb-20">
          <span
            className="label-tag mb-4 inline-flex"
          >
            What We Believe
          </span>
          <h2
            className="section-heading"
          >
            The values behind every keepsake
          </h2>
        </div>

        {/* Cards grid */}
        <div className="grid sm:grid-cols-2 gap-5 sm:gap-6">
          {values.map((v, i) => (
            <div
              key={v.title}
              className="group bg-white/95 backdrop-blur-sm rounded-4xl p-8 sm:p-10 border border-[#E8D5A3]/40
                         shadow-soft hover:shadow-gold hover:border-[#C9A84C]/60 hover:-translate-y-1
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
                               group-hover:text-gold transition-colors duration-300">
                  {v.title}
                </h3>
                <p className="text-stone-500 text-sm sm:text-base leading-relaxed">
                  {v.body}
                </p>
              </div>

              {/* Decorative line */}
              <div className="mt-auto pt-4 border-t border-stone-100">
                <div className="w-8 h-0.5 bg-[#C9A84C]/30 rounded-full
                                group-hover:w-16 group-hover:bg-[#C9A84C] transition-all duration-500" />
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
