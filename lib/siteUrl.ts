/**
 * Canonical site origin for links in emails and messages. NEXT_PUBLIC_APP_URL
 * isn't set in production, so links built from it alone came out as
 * "undefined/track?...". Never derive this from the request's Host header —
 * that would let a caller point password-reset links at their own domain.
 */
export const SITE_URL = (process.env.NEXT_PUBLIC_APP_URL || "https://makemymemory.in").replace(/\/+$/, "");
