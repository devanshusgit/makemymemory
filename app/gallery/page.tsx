import GalleryClient from "@/components/gallery/GalleryClient";
import { buildMeta } from "@/lib/seo";

export const metadata = buildMeta({
  title:       "Gallery",
  description: "Browse our collection of beautiful personalised gifts and memory keepsakes created by our customers.",
  path:        "/gallery",
});

export default function GalleryPage() {
  return (
    <div className="bg-cream min-h-screen">

      {/* ── Dark hero header ── */}
      <div className="bg-ink py-14 sm:py-20">
        <div className="section-wrap text-center">
          <span className="inline-flex items-center gap-2 text-xs font-semibold
                           tracking-widest uppercase mb-5"
            style={{ color: "#C9A84C" }}>
            <span className="w-5 h-px" style={{ backgroundColor: "#C9A84C" }} />
            Our Collection
            <span className="w-5 h-px" style={{ backgroundColor: "#C9A84C" }} />
          </span>
          <h1
            className="font-serif font-bold text-white leading-tight"
            style={{ fontSize: "clamp(2rem, 5vw, 3.5rem)", letterSpacing: "-0.02em" }}
          >
            Gallery of Memories
          </h1>
          <p className="text-white/60 text-sm sm:text-base mt-4 max-w-md mx-auto leading-relaxed">
            Explore beautiful personalised gifts and keepsakes crafted with love.
          </p>
        </div>
      </div>

      {/* Gallery grid */}
      <div className="section-wrap py-16 sm:py-20">
        <GalleryClient />
      </div>
    </div>
  );
}
