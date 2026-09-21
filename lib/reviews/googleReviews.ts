/**
 * Google reviews, pulled straight from the Google Business Profile so a review
 * left on Google Maps shows up on the site by itself.
 *
 * Needs two environment variables:
 *   GOOGLE_PLACES_API_KEY — Google Cloud key with the "Places API (New)" enabled
 *   GOOGLE_PLACE_ID       — the Place ID of the Make My Memory listing
 *
 * Google returns at most 5 reviews per place and its terms require showing the
 * reviewer's name/photo and linking back, which renderGoogleReviews does.
 * Responses are cached for an hour so the page never waits on Google and the
 * API quota is not spent per visitor.
 */

export interface GoogleReview {
  author: string;
  authorPhoto?: string;
  authorUrl?: string;
  rating: number;
  text: string;
  relativeTime: string;
  publishedAt?: string;
}

export interface GoogleReviewsResult {
  configured: boolean;
  rating: number | null;
  total: number;
  reviews: GoogleReview[];
  mapsUrl?: string;
  error?: string;
}

const EMPTY: GoogleReviewsResult = { configured: false, rating: null, total: 0, reviews: [] };
const CACHE_SECONDS = 3600;

export async function fetchGoogleReviews(): Promise<GoogleReviewsResult> {
  const key = process.env.GOOGLE_PLACES_API_KEY;
  const placeId = process.env.GOOGLE_PLACE_ID;
  if (!key || !placeId) return EMPTY;

  try {
    const res = await fetch(`https://places.googleapis.com/v1/places/${encodeURIComponent(placeId)}`, {
      headers: {
        "X-Goog-Api-Key": key,
        "X-Goog-FieldMask": "rating,userRatingCount,googleMapsUri,reviews",
      },
      next: { revalidate: CACHE_SECONDS },
    });

    if (!res.ok) {
      const detail = await res.text();
      console.error("[google-reviews] Places API error", res.status, detail.slice(0, 200));
      return { ...EMPTY, configured: true, error: `Google returned ${res.status}` };
    }

    const data = await res.json();
    const reviews: GoogleReview[] = (data.reviews ?? []).map((r: any) => ({
      author:       r.authorAttribution?.displayName ?? "Google user",
      authorPhoto:  r.authorAttribution?.photoUri,
      authorUrl:    r.authorAttribution?.uri,
      rating:       typeof r.rating === "number" ? r.rating : 0,
      text:         r.originalText?.text ?? r.text?.text ?? "",
      relativeTime: r.relativePublishTimeDescription ?? "",
      publishedAt:  r.publishTime,
    })).filter((r: GoogleReview) => r.text.trim().length > 0);

    return {
      configured: true,
      rating:  typeof data.rating === "number" ? data.rating : null,
      total:   data.userRatingCount ?? 0,
      reviews,
      mapsUrl: data.googleMapsUri,
    };
  } catch (error) {
    console.error("[google-reviews] fetch failed", error);
    return { ...EMPTY, configured: true, error: "Could not reach Google" };
  }
}
