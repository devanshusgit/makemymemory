import Link from "next/link";
import { buildMeta } from "@/lib/seo";

export const metadata = buildMeta({
  title:       "Returns & Refunds",
  description: "Our returns, refunds, and replacement policy for personalised gifts and keepsakes.",
  path:        "/returns",
});

const steps = [
  {
    step: "01",
    title: "Contact Us Within 48 Hours",
    body: "Email hello@makemymemory.in with your order number and photos of the issue within 48 hours of delivery.",
  },
  {
    step: "02",
    title: "We Review Your Request",
    body: "Our team will review your request within 24 hours and confirm whether a replacement or refund is applicable.",
  },
  {
    step: "03",
    title: "We Make It Right",
    body: "If approved, we'll reprint and reship your order at no cost, or issue a full refund to your original payment method.",
  },
];

const faqs = [
  {
    q: "Can I return a product if I changed my mind?",
    a: "Because every product is personalised and made to order, we cannot accept returns for change of mind. Please review your design carefully before placing your order.",
  },
  {
    q: "What if my product arrived damaged?",
    a: "We're sorry! Please email us at hello@makemymemory.in with your order number and clear photos of the damage within 48 hours of delivery. We'll send a replacement immediately.",
  },
  {
    q: "What if there's a typo in my personalisation?",
    a: "If the typo was in the text you submitted, we'll do our best to help but may need to charge for reprinting. If the error was ours, we'll reprint and reship at no cost.",
  },
  {
    q: "How long do refunds take?",
    a: "Refunds are processed within 5–7 business days and will appear in your account within 7–10 business days depending on your bank.",
  },
  {
    q: "What if my order never arrived?",
    a: "If your order hasn't arrived within 10 business days of dispatch, please contact us. We'll investigate with the courier and either reship or refund your order.",
  },
];

export default function ReturnsPage() {
  return (
    <div className="bg-canvas min-h-screen">
      {/* Dark hero */}
      <div className="bg-hero py-14 sm:py-20">
        <div className="section-wrap text-center">
          <span className="inline-flex items-center gap-2 text-xs font-semibold
                           tracking-widest uppercase text-sage mb-5">
            <span className="w-5 h-px bg-sage" />
            Our Policy
            <span className="w-5 h-px bg-sage" />
          </span>
          <h1
            className="font-serif font-bold text-white leading-tight mb-4"
            style={{ fontSize: "clamp(2rem, 5vw, 3.5rem)", letterSpacing: "-0.02em" }}
          >
            Returns &amp; Refunds
          </h1>
          <p className="text-white/60 text-sm sm:text-base max-w-md mx-auto leading-relaxed">
            We stand behind every product we make. If something isn&apos;t right, we&apos;ll make it right.
          </p>
        </div>
      </div>

      {/* Policy summary */}
      <div className="section-wrap py-12 sm:py-16 max-w-3xl mx-auto">
        <div className="bg-sage/10 border border-sage/20 rounded-3xl p-6 sm:p-8 mb-12 text-center">
          <p className="text-2xl mb-3">🛡️</p>
          <h2 className="font-serif font-bold text-ink text-xl mb-2">Our Happiness Guarantee</h2>
          <p className="text-stone-600 text-sm leading-relaxed max-w-lg mx-auto">
            If your order arrives damaged, defective, or with an error on our part,
            we will replace it or refund it — no questions asked.
          </p>
        </div>

        {/* Process steps */}
        <div className="mb-12">
          <h2 className="section-heading text-center mb-8" style={{ fontSize: "1.75rem" }}>
            How It Works
          </h2>
          <div className="space-y-4">
            {steps.map((s) => (
              <div key={s.step} className="bg-white rounded-3xl p-6 border border-stone-100 shadow-soft flex gap-5">
                <div className="w-10 h-10 bg-ink text-canvas rounded-full flex items-center
                                justify-center text-sm font-bold shrink-0">
                  {s.step}
                </div>
                <div>
                  <h3 className="font-semibold text-ink mb-1">{s.title}</h3>
                  <p className="text-stone-500 text-sm leading-relaxed">{s.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* FAQs */}
        <div className="mb-12">
          <h2 className="section-heading text-center mb-8" style={{ fontSize: "1.75rem" }}>
            Common Questions
          </h2>
          <div className="space-y-4">
            {faqs.map((faq) => (
              <div key={faq.q} className="bg-white rounded-3xl p-6 border border-stone-100 shadow-soft">
                <h3 className="font-semibold text-ink text-sm mb-2">{faq.q}</h3>
                <p className="text-stone-500 text-sm leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="bg-hero rounded-3xl p-8 text-center">
          <p className="text-white font-semibold text-base mb-2">Need to raise a concern?</p>
          <p className="text-white/60 text-sm mb-6">
            Our team responds within 24 hours, Mon–Sat.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/contact"
              className="inline-flex items-center justify-center gap-2 bg-white text-ink
                         px-7 py-3 rounded-full text-sm font-semibold
                         hover:bg-canvas hover:-translate-y-0.5 hover:shadow-lift transition-all duration-300">
              Contact Us
            </Link>
            <a href="mailto:hello@makemymemory.in"
              className="inline-flex items-center justify-center gap-2 border border-white/20
                         text-white/80 px-7 py-3 rounded-full text-sm font-semibold
                         hover:border-white/50 hover:text-white hover:-translate-y-0.5 transition-all duration-300">
              hello@makemymemory.in
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
