import RatingSummary from "@/components/reviews/RatingSummary";
import ReviewGrid    from "@/components/reviews/ReviewGrid";
import ReviewForm    from "@/components/reviews/ReviewForm";
import ReviewsComingSoon from "@/components/reviews/ReviewsComingSoon";
import { buildMeta } from "@/lib/seo";

export const metadata = buildMeta({
  title:       "Customer Reviews",
  description: "Read verified reviews from 10,000+ happy customers. See what people say about our personalised gifts and keepsakes.",
  path:        "/reviews",
});

export default function ReviewsPage() {
  // By default, show coming soon. This will be controlled by admin toggle in future.
  const showReviews = false; // TODO: Fetch from admin settings

  return (
    <div className="bg-canvas min-h-screen">
      {showReviews ? (
        <>
          {/* ── Dark hero header ── */}
          <div className="bg-hero py-14 sm:py-20">
            <div className="section-wrap text-center">
              <span className="inline-flex items-center gap-2 text-xs font-semibold
                               tracking-widest uppercase text-sage mb-5">
                <span className="w-5 h-px bg-sage" />
                Customer Stories
                <span className="w-5 h-px bg-sage" />
              </span>
              <h1
                className="font-serif font-bold text-white leading-tight"
                style={{ fontSize: "clamp(2rem, 5vw, 3.5rem)", letterSpacing: "-0.02em" }}
              >
                Loved by Thousands
              </h1>
              <p className="text-white/60 text-sm sm:text-base mt-4 max-w-md mx-auto leading-relaxed">
                Real reviews from real people who turned their moments into memories.
              </p>

              {/* Jump to form */}
              <a
                href="#write-review"
                className="inline-flex items-center gap-2 mt-7
                           border border-white/20 text-white/80 text-sm font-semibold
                           px-6 py-2.5 rounded-full
                           hover:border-white/50 hover:text-white hover:-translate-y-0.5
                           transition-all duration-300"
              >
                Write a Review ↓
              </a>
            </div>
          </div>

          {/* 1. Overall rating + star breakdown + verified badge */}
          <RatingSummary />

          {/* 2. Review cards grid with filter/sort toolbar */}
          <ReviewGrid />

          {/* 3. Review submission form */}
          <ReviewForm />
        </>
      ) : (
        <ReviewsComingSoon />
      )}
    </div>
  );
}
