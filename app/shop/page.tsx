import ShopClient from "@/components/shop/ShopClient";
import { buildMeta } from "@/lib/seo";

export const metadata = buildMeta({
  title:       "Shop — Personalised Keepsakes",
  description: "Browse our collection of gold foil imprints and 3D castings — personalised keepsakes crafted for a lifetime.",
  path:        "/shop",
});

export default function ShopPage() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: "#FAF8F4" }}>

      {/* Hero header */}
      <div className="py-14 sm:py-20" style={{ backgroundColor: "#1A1A1A" }}>
        <div className="section-wrap text-center">
          <span className="inline-flex items-center gap-2 text-xs font-semibold tracking-widest uppercase mb-5"
            style={{ color: "#C9A84C" }}>
            <span className="w-5 h-px" style={{ backgroundColor: "#C9A84C" }} />
            Our Collection
            <span className="w-5 h-px" style={{ backgroundColor: "#C9A84C" }} />
          </span>
          <h1 className="font-serif font-bold text-white leading-tight"
            style={{ fontSize: "clamp(2rem, 5vw, 3.5rem)", letterSpacing: "-0.02em" }}>
            Made for Every Moment
          </h1>
          <p className="text-sm sm:text-base mt-4 max-w-md mx-auto leading-relaxed"
            style={{ color: "rgba(232,213,163,0.65)" }}>
            Every piece is personalised, crafted with care, and made to last a lifetime.
          </p>
        </div>
      </div>

      {/* Category filter cards + product grid */}
      <ShopClient />
    </div>
  );
}
