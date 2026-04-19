import FaqClient  from "@/components/faq/FaqClient";
import { buildMeta } from "@/lib/seo";

export const metadata = buildMeta({
  title:       "FAQ — Frequently Asked Questions",
  description: "Find answers about our products, how personalisation works, payment methods, shipping, returns, and customer support.",
  path:        "/faq",
});

export default function FaqPage() {
  return (
    <div className="bg-canvas min-h-screen">
      {/* Dark hero */}
      <div className="bg-stone-900 py-14 sm:py-20">
        <div className="section-wrap text-center">
          <span className="inline-flex items-center gap-2 text-xs font-semibold
                           tracking-widest uppercase text-sage mb-5">
            <span className="w-5 h-px bg-sage" />
            Help Centre
            <span className="w-5 h-px bg-sage" />
          </span>
          <h1
            className="font-serif font-bold text-white leading-tight mb-4"
            style={{ fontSize: "clamp(2rem, 5vw, 3.5rem)", letterSpacing: "-0.02em" }}
          >
            Frequently Asked Questions
          </h1>
          <p className="text-stone-400 text-sm sm:text-base max-w-md mx-auto leading-relaxed">
            Everything you need to know about our products, process, and policies.
          </p>
        </div>
      </div>

      <FaqClient />
    </div>
  );
}
