import ShopClient from "@/components/shop/ShopClient";
import { buildMeta } from "@/lib/seo";

export const metadata = buildMeta({
  title:       "Shop — Personalised Gifts",
  description: "Browse our full collection of personalised gifts and keepsakes — photo books, custom frames, mugs, cushions, calendars, and gift sets.",
  path:        "/shop",
});

export default function ShopPage() {
  return (
    <div className="bg-canvas min-h-screen">

      {/* ── Page header ── */}
      <div className="bg-stone-900 py-14 sm:py-20">
        <div className="section-wrap text-center">
          <span className="inline-flex items-center gap-2 text-xs font-semibold tracking-widest
                           uppercase text-sage mb-5">
            <span className="w-5 h-px bg-sage" />
            Our Collection
            <span className="w-5 h-px bg-sage" />
          </span>
          <h1
            className="font-serif font-bold text-white leading-tight"
            style={{ fontSize: "clamp(2rem, 5vw, 3.5rem)", letterSpacing: "-0.02em" }}
          >
            Made for Every Moment
          </h1>
          <p className="text-stone-400 text-sm sm:text-base mt-4 max-w-md mx-auto leading-relaxed">
            Every product is personalised, crafted with care, and made to last.
          </p>
        </div>
      </div>

      {/* ── Filter bar + grid (client) ── */}
      <ShopClient />

    </div>
  );
}
