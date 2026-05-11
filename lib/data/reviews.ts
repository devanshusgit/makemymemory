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

<<<<<<< HEAD
// All hardcoded reviews have been removed.
// Reviews are now fetched from the database via /api/reviews
=======
// Reviews are now stored in MongoDB and fetched via /api/reviews.
// This module exports an empty static list so legacy imports keep compiling.
>>>>>>> 6602731b81f44a4b2b0822822d63752cf6ccfede
export const REVIEWS: Review[] = [];

/* Rating breakdown — how many reviews per star level */
export const RATING_BREAKDOWN = [5, 4, 3, 2, 1].map((star) => ({
  star,
  count: 0,
}));

<<<<<<< HEAD
export const OVERALL_RATING = 0;

export const TOTAL_REVIEWS = 0; // Will be fetched from database
=======
export const OVERALL_RATING =
  REVIEWS.length === 0
    ? 0
    : Math.round(
        (REVIEWS.reduce((sum, r) => sum + r.rating, 0) / REVIEWS.length) * 10
      ) / 10;

export const TOTAL_REVIEWS = 0; // updated once reviews are pulled from DB
>>>>>>> 6602731b81f44a4b2b0822822d63752cf6ccfede
