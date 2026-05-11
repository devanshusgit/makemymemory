export interface Review {
  id: string;
  name: string;
  location: string;
  rating: number; // 1–5
  title: string;
  text: string;
  date: string; // ISO date string
  product: string;
  verified: boolean;
  helpful: number; // helpful vote count
  initials: string;
  avatarColor: string;
  mediaType?: "image" | "video";
  mediaSrc?: string; // swap with real paths / CDN URLs
  mediaGradient: string; // placeholder gradient
}

// Reviews are now stored in MongoDB and fetched via /api/reviews.
// This module exports an empty static list so legacy imports keep compiling.
export const REVIEWS: Review[] = [];

/* Rating breakdown — how many reviews per star level */
export const RATING_BREAKDOWN = [5, 4, 3, 2, 1].map((star) => ({
  star,
  count: REVIEWS.filter((r) => r.rating === star).length,
}));

export const OVERALL_RATING =
  REVIEWS.length === 0
    ? 0
    : Math.round(
        (REVIEWS.reduce((sum, r) => sum + r.rating, 0) / REVIEWS.length) * 10
      ) / 10;

export const TOTAL_REVIEWS = 0; // updated once reviews are pulled from DB
