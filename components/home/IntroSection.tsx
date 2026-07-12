"use client";

export default function IntroSection() {
  return (
    <section className="relative overflow-hidden py-20 sm:py-28 bg-section-intro">
      {/* ── Decorative CSS Background ── */}
      <div aria-hidden="true" className="absolute inset-0 z-0 pointer-events-none">
        {/* Decorative large quote mark */}
        <div
          className="absolute right-8 sm:right-16 top-1/2 -translate-y-1/2 font-serif font-bold select-none leading-none"
          style={{
            fontSize: "clamp(10rem, 20vw, 18rem)",
            color: "rgba(201,168,76,0.08)",
            lineHeight: 1,
          }}
        >
          ❝
        </div>
      </div>

      <div className="relative z-10 section-wrap">
        <div className="max-w-2xl text-left">
          <span className="label-tag mb-5 inline-flex">
            Why We Exist
          </span>

          <h2
            className="font-serif font-bold text-ink leading-tight mb-5"
            style={{ fontSize: "clamp(1.9rem, 4.5vw, 3.2rem)", letterSpacing: "-0.02em" }}
          >
            Some moments deserve more<br className="hidden sm:block" /> than a screenshot.
          </h2>

          <p className="text-stone-500 text-base sm:text-lg leading-relaxed">
            We turn your favourite photos into tangible, lasting keepsakes —
            things you can hold, display, and pass down. Because the best memories
            deserve a home beyond your phone.
          </p>
        </div>
      </div>
    </section>
  );
}
