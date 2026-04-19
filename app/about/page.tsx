import Link from "next/link";
import { buildMeta } from "@/lib/seo";

export const metadata = buildMeta({
  title:       "About Us",
  description: "Learn about our story, mission, and the people behind Make My Memory — crafting personalised keepsakes since 2020.",
  path:        "/about",
});

const values = [
  {
    icon: "✦",
    title: "Crafted with Care",
    body: "Every product is made to order — no mass production, no shortcuts. Just thoughtful craftsmanship.",
  },
  {
    icon: "◈",
    title: "Your Story, Your Way",
    body: "We believe every memory deserves to be told in its own unique way. That's why everything we make is fully personalised.",
  },
  {
    icon: "◇",
    title: "Premium Materials",
    body: "From archival-quality photo paper to sustainably sourced wood, we only use materials that last.",
  },
  {
    icon: "◉",
    title: "Happiness Guaranteed",
    body: "Not happy with your order? We'll make it right — no questions asked.",
  },
];

const team = [
  { name: "Ananya Sharma", role: "Founder & Creative Director", emoji: "👩‍🎨" },
  { name: "Rohan Mehta",   role: "Head of Production",          emoji: "👨‍🔧" },
  { name: "Priya Nair",    role: "Customer Happiness Lead",     emoji: "👩‍💼" },
];

const stats = [
  { value: "10,000+", label: "Happy Customers" },
  { value: "50,000+", label: "Memories Created" },
  { value: "4.9★",    label: "Average Rating" },
  { value: "2020",    label: "Founded" },
];

export default function AboutPage() {
  return (
    <div className="bg-canvas min-h-screen">

      {/* Dark hero */}
      <div className="bg-stone-900 py-14 sm:py-20">
        <div className="section-wrap text-center">
          <span className="inline-flex items-center gap-2 text-xs font-semibold
                           tracking-widest uppercase text-sage mb-5">
            <span className="w-5 h-px bg-sage" />
            Our Story
            <span className="w-5 h-px bg-sage" />
          </span>
          <h1
            className="font-serif font-bold text-white leading-tight mb-4"
            style={{ fontSize: "clamp(2rem, 5vw, 3.5rem)", letterSpacing: "-0.02em" }}
          >
            We turn moments into memories
          </h1>
          <p className="text-stone-400 text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
            Make My Memory was born from a simple idea — that the best gifts aren&apos;t bought,
            they&apos;re made. We started in 2020 as a small studio in Mumbai, and today we&apos;ve
            helped over 10,000 families preserve their most precious moments.
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="bg-white border-b border-stone-100">
        <div className="section-wrap py-10">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
            {stats.map((s) => (
              <div key={s.label}>
                <p className="font-serif font-bold text-ink text-3xl">{s.value}</p>
                <p className="text-stone-500 text-sm mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Mission */}
      <section className="section-wrap py-16 sm:py-20 max-w-3xl mx-auto text-center">
        <span className="label-tag mb-5 inline-flex">Our Mission</span>
        <p className="text-stone-600 text-lg leading-relaxed">
          We believe every family deserves a beautiful way to preserve their story.
          From first birthdays to golden anniversaries, we craft personalised keepsakes
          that become heirlooms — things you&apos;ll treasure for generations.
        </p>
      </section>

      {/* Values */}
      <section className="bg-stone-50 py-16 sm:py-20">
        <div className="section-wrap">
          <div className="text-center mb-12">
            <span className="label-tag mb-4 inline-flex">What We Stand For</span>
            <h2 className="section-heading">Our Values</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((v) => (
              <div key={v.title} className="bg-white rounded-3xl p-7 border border-stone-100 shadow-soft">
                <div className="w-10 h-10 rounded-2xl bg-sage/10 flex items-center justify-center
                                text-sage-dark text-xl font-bold mb-5">
                  {v.icon}
                </div>
                <h3 className="font-semibold text-ink mb-2">{v.title}</h3>
                <p className="text-stone-500 text-sm leading-relaxed">{v.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="section-wrap py-16 sm:py-20">
        <div className="text-center mb-12">
          <span className="label-tag mb-4 inline-flex">The People</span>
          <h2 className="section-heading">Meet the Team</h2>
        </div>
        <div className="grid sm:grid-cols-3 gap-6 max-w-2xl mx-auto">
          {team.map((member) => (
            <div key={member.name} className="bg-white rounded-3xl p-7 text-center border border-stone-100 shadow-soft">
              <div className="w-16 h-16 bg-sage/10 rounded-full flex items-center justify-center
                              text-3xl mx-auto mb-4">
                {member.emoji}
              </div>
              <p className="font-semibold text-ink">{member.name}</p>
              <p className="text-stone-400 text-xs mt-1">{member.role}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-stone-900 py-16 sm:py-20">
        <div className="section-wrap text-center">
          <h2 className="font-serif font-bold text-white text-3xl mb-4">
            Ready to create something beautiful?
          </h2>
          <p className="text-stone-400 text-sm mb-8 max-w-md mx-auto">
            Browse our collection and start turning your favourite moments into lasting memories.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/shop"
              className="inline-flex items-center justify-center gap-2 bg-sage text-white
                         px-8 py-3.5 rounded-full text-sm font-semibold
                         hover:bg-sage-dark hover:-translate-y-0.5 transition-all duration-300">
              Shop Now
            </Link>
            <Link href="/contact"
              className="inline-flex items-center justify-center gap-2 border border-white/20
                         text-white/80 px-8 py-3.5 rounded-full text-sm font-semibold
                         hover:border-white/50 hover:text-white hover:-translate-y-0.5 transition-all duration-300">
              Contact Us
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
