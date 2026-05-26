import Link from "next/link";
import { buildMeta } from "@/lib/seo";

export const metadata = buildMeta({
  title:       "About Us",
  description: "Learn about our story, mission, and the people behind Make My Memory.",
  path:        "/about",
});

const values = [
  { icon: "✦", title: "Crafted with Care",    body: "Every product is made to order — no mass production, no shortcuts. Just thoughtful craftsmanship." },
  { icon: "◈", title: "Your Story, Your Way", body: "We believe every memory deserves to be told in its own unique way. That's why everything we make is fully personalised." },
  { icon: "◇", title: "Premium Materials",    body: "From archival-quality photo paper to sustainably sourced wood, we only use materials that last." },
  { icon: "◉", title: "Happiness Guaranteed", body: "Not happy with your order? We'll make it right — no questions asked." },
];

const stats = [
  { value: "1000+", label: "Happy Customers" },
  { value: "1000+", label: "Memories Created" },
  { value: "0★",    label: "Average Rating" },
  { value: "2026",  label: "Founded" },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: "#FAF8F4" }}>

      {/* Dark hero */}
      <div className="py-14 sm:py-20" style={{ backgroundColor: "#1A1A1A" }}>
        <div className="section-wrap text-center">
          <span className="inline-flex items-center gap-2 text-xs font-semibold tracking-widest uppercase mb-5"
            style={{ color: "#C9A84C" }}>
            <span className="w-5 h-px" style={{ backgroundColor: "#C9A84C" }} />
            Our Story
            <span className="w-5 h-px" style={{ backgroundColor: "#C9A84C" }} />
          </span>
          <h1 className="font-serif font-bold text-white leading-tight mb-4"
            style={{ fontSize: "clamp(2rem, 5vw, 3.5rem)", letterSpacing: "-0.02em" }}>
            We turn moments into memories
          </h1>
          <p className="text-sm sm:text-base max-w-xl mx-auto leading-relaxed"
            style={{ color: "rgba(232,213,163,0.65)" }}>
            Make My Memory was born from a simple idea — that the best gifts aren&apos;t bought,
            they&apos;re made. We started in 2020 as a small studio in Mumbai, and today we&apos;ve
            helped over 10,000 families preserve their most precious moments.
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="bg-white" style={{ borderBottom: "1px solid #E8D5A3" }}>
        <div className="section-wrap py-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {stats.map((s) => (
              <div key={s.label}>
                <p className="font-serif font-bold text-3xl" style={{ color: "#C9A84C" }}>{s.value}</p>
                <p className="text-sm mt-1" style={{ color: "#6B6560" }}>{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Founder section */}
      <section className="section-wrap py-16 sm:py-20">
        <div className="grid md:grid-cols-[35%_65%] gap-10 lg:gap-16 items-center">
          {/* Photo */}
          <div className="flex justify-center md:justify-start">
            <div className="w-48 h-48 sm:w-56 sm:h-56 rounded-full overflow-hidden flex items-center justify-center text-7xl"
              style={{
                backgroundColor: "rgba(201,168,76,0.1)",
                outline: "2px solid #C9A84C",
                outlineOffset: "4px",
              }}>
              👩‍🎨
            </div>
          </div>
          {/* Bio */}
          <div className="text-center md:text-left">
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold tracking-widest uppercase mb-4"
              style={{ color: "#C9A84C" }}>
              <span className="w-4 h-px" style={{ backgroundColor: "#C9A84C" }} />
              Founder
            </span>
            <h2 className="font-serif font-bold text-3xl mb-1" style={{ color: "#1A1A1A" }}>
              Ananya Sharma
            </h2>
            <p className="text-sm mb-4" style={{ color: "#6B6560" }}>Founder &amp; Creative Director</p>
            <p className="leading-relaxed" style={{ color: "#6B6560" }}>
              "I started Make My Memory because I wanted to give families a way to hold onto the moments
              that matter most. Every product we make is a piece of someone's story — and that's something
              I never take lightly."
            </p>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-16 sm:py-20" style={{ backgroundColor: "#F0EBE1" }}>
        <div className="section-wrap">
          <div className="text-center mb-12">
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold tracking-widest uppercase mb-4"
              style={{ color: "#C9A84C" }}>
              What We Stand For
            </span>
            <h2 className="font-serif font-bold" style={{ fontSize: "clamp(1.75rem, 4vw, 2.5rem)", color: "#1A1A1A" }}>
              Our Values
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((v) => (
              <div key={v.title} className="bg-white rounded-2xl p-7 transition-all duration-300 hover:-translate-y-1"
                style={{ border: "1px solid #E8D5A3", boxShadow: "0 2px 12px rgba(26,26,26,0.05)" }}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg font-bold mb-5"
                  style={{ backgroundColor: "rgba(201,168,76,0.12)", color: "#C9A84C" }}>
                  {v.icon}
                </div>
                <h3 className="font-serif font-semibold mb-2" style={{ color: "#1A1A1A" }}>{v.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: "#6B6560" }}>{v.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 sm:py-20" style={{ backgroundColor: "#1A1A1A" }}>
        <div className="section-wrap text-center">
          <h2 className="font-serif font-bold text-white text-3xl mb-4">
            Ready to create something beautiful?
          </h2>
          <p className="text-sm mb-8 max-w-md mx-auto" style={{ color: "rgba(232,213,163,0.65)" }}>
            Browse our collection and start turning your favourite moments into lasting memories.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/shop"
              className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full
                         text-sm font-semibold transition-all duration-300 hover:bg-[#C9A84C] hover:text-[#1A1A1A]"
              style={{ backgroundColor: "#FAF8F4", color: "#1A1A1A" }}>
              Shop Now
            </Link>
            <Link href="/contact"
              className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full
                         text-sm font-semibold transition-all duration-300 hover:bg-[#C9A84C] hover:text-[#1A1A1A]"
              style={{ border: "1.5px solid #C9A84C", color: "#C9A84C" }}>
              Contact Us
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
