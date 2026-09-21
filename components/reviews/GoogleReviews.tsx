import { fetchGoogleReviews } from "@/lib/reviews/googleReviews";

function Stars({ rating }: { rating: number }) {
  return (
    <span className="text-sage text-sm tracking-[0.15em]" aria-label={`${rating} out of 5 stars`}>
      {"★".repeat(Math.round(rating)).padEnd(5, "☆")}
    </span>
  );
}

/**
 * Reviews left on the Google Business Profile, shown automatically.
 *
 * Renders nothing at all when the Places credentials are missing or Google is
 * unreachable — the page's own reviews must never disappear because of it.
 */
export default async function GoogleReviews() {
  const data = await fetchGoogleReviews();
  if (!data.configured || data.reviews.length === 0) return null;

  return (
    <section className="section-wrap py-12 sm:py-16">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-8">
        <div>
          <span className="inline-flex items-center gap-2 text-xs font-semibold tracking-widest uppercase text-sage mb-2">
            <span className="w-5 h-px bg-sage" />
            From Google
          </span>
          <h2 className="font-serif font-bold text-ink text-2xl sm:text-3xl">
            Reviews on Google Maps
          </h2>
          {data.rating !== null && (
            <p className="text-sm text-stone-500 mt-2">
              <Stars rating={data.rating} />{" "}
              <span className="font-semibold text-ink">{data.rating.toFixed(1)}</span>{" "}
              from {data.total.toLocaleString("en-IN")} Google {data.total === 1 ? "review" : "reviews"}
            </p>
          )}
        </div>

        {data.mapsUrl && (
          <a
            href={data.mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 inline-flex items-center gap-2 text-sm font-semibold
                       border border-stone-300 text-stone-700 px-5 py-2.5 rounded-full
                       hover:border-stone-500 hover:text-ink transition-colors duration-300"
          >
            Review us on Google ↗
          </a>
        )}
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {data.reviews.map((review, i) => (
          <article
            key={`${review.author}-${i}`}
            className="bg-white border border-stone-200 rounded-2xl p-6 flex flex-col gap-3"
          >
            <div className="flex items-center gap-3">
              {review.authorPhoto ? (
                // Google requires the reviewer's own photo; it is served from
                // their CDN, so a plain img avoids remote-pattern config.
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={review.authorPhoto}
                  alt=""
                  width={40}
                  height={40}
                  loading="lazy"
                  className="w-10 h-10 rounded-full object-cover bg-stone-100"
                />
              ) : (
                <span className="w-10 h-10 rounded-full bg-stone-100 grid place-items-center text-stone-500 font-semibold">
                  {review.author.charAt(0).toUpperCase()}
                </span>
              )}
              <div className="min-w-0">
                <p className="font-semibold text-ink text-sm truncate">{review.author}</p>
                <p className="text-xs text-stone-400">{review.relativeTime}</p>
              </div>
            </div>

            <Stars rating={review.rating} />

            <p className="text-sm text-stone-600 leading-relaxed line-clamp-6">{review.text}</p>

            {review.authorUrl && (
              <a
                href={review.authorUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-stone-400 hover:text-stone-600 mt-auto pt-1"
              >
                View on Google
              </a>
            )}
          </article>
        ))}
      </div>

      <p className="text-xs text-stone-400 mt-6">Reviews sourced from Google.</p>
    </section>
  );
}
