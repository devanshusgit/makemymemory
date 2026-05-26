"use client";

export default function IntroSection() {
  return (
    <section className="py-20 sm:py-28" style={{ backgroundColor: "#FFFFFF" }}>
      <div className="section-wrap">

        <div className="max-w-2xl text-left">
          <span
            className="label-tag mb-5 inline-flex"
          >
            Why We Exist
          </span>

          <h2
            className="font-serif font-bold text-ink leading-tight mb-5"
            style={{ fontSize: "clamp(1.9rem, 4.5vw, 3.2rem)", letterSpacing: "-0.02em" }}
          >
            Some moments deserve more<br className="hidden sm:block" /> than a screenshot.
          </h2>

          <p
            className="text-stone-500 text-base sm:text-lg leading-relaxed"
          >
            We turn your favourite photos into tangible, lasting keepsakes —
            things you can hold, display, and pass down. Because the best memories
            deserve a home beyond your phone.
          </p>
        </div>

      </div>
    </section>
  );
}
