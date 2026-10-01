import Link from "next/link";
import { buildMeta } from "@/lib/seo";

export function generateMetadata() {
  return {
    ...buildMeta({
      title:       "Blog",
      description: "Stories, keepsake ideas and imprint tips from Make My Memory — coming soon.",
      path:        "/blog",
    }),
    // Nothing to index until the first posts are up.
    robots: { index: false, follow: true },
  };
}

export default function BlogPage() {
  return (
    <div className="min-h-[70vh]" style={{ backgroundColor: "#FAF8F4" }}>
      <div className="py-14 sm:py-20" style={{ backgroundColor: "#1A1A1A" }}>
        <div className="section-wrap text-center">
          <span className="inline-flex items-center gap-2 text-xs font-semibold tracking-widest uppercase mb-5"
            style={{ color: "#C9A84C" }}>
            <span className="w-5 h-px" style={{ backgroundColor: "#C9A84C" }} />
            Our Blog
            <span className="w-5 h-px" style={{ backgroundColor: "#C9A84C" }} />
          </span>
          <h1 className="font-serif font-bold text-white leading-tight"
            style={{ fontSize: "clamp(2rem, 5vw, 3.5rem)", letterSpacing: "-0.02em" }}>
            Blog
          </h1>
        </div>
      </div>

      <section className="section-wrap py-20 sm:py-28 text-center">
        <p className="font-serif font-bold text-3xl sm:text-4xl mb-3" style={{ color: "#C9A84C" }}>
          Coming Soon
        </p>
        <p className="text-sm sm:text-base max-w-md mx-auto mb-8" style={{ color: "#6B6560" }}>
          Stories, keepsake ideas and imprint tips — we&apos;re writing them now.
        </p>
        <Link href="/shop"
          className="inline-flex items-center justify-center px-8 py-3.5 rounded-full text-sm font-semibold
                     bg-[#1A1A1A] text-[#C9A84C] hover:opacity-90 transition-opacity">
          Shop Now
        </Link>
      </section>
    </div>
  );
}
