export interface Review {
  id: string;
  name: string;
  location: string;
  rating: number;           // 1–5
  title: string;
  text: string;
  date: string;             // ISO date string
  product: string;
  verified: boolean;
  helpful: number;          // helpful vote count
  initials: string;
  avatarColor: string;
  mediaType?: "image" | "video";
  mediaSrc?: string;        // swap with real paths / CDN URLs
  mediaGradient: string;    // placeholder gradient
}

// All hardcoded reviews have been removed.
// Reviews are now fetched from the database via /api/reviews
export const REVIEWS: Review[] = [];

/* Rating breakdown — how many reviews per star level */
export const RATING_BREAKDOWN = [5, 4, 3, 2, 1].map((star) => ({
  star,
  count: 0,
}));

export const OVERALL_RATING = 0;

export const TOTAL_REVIEWS = 0; // Will be fetched from database
