/**
 * Centralised SEO helpers.
 *
 * Every canonical, sitemap and JSON-LD URL uses one host. The previous
 * per-request host lookup (headers()) forced every page that called it into
 * dynamic rendering (no CDN caching, ~0.4–0.8 s TTFB), and it canonicalised
 * to the bare domain, which Vercel 308-redirects to www.
 * makemymemory.in and makemymemory.com should both redirect to this host
 * (Vercel → Settings → Domains).
 */
import type { Metadata } from "next";

export const CANONICAL_BASE_URL = "https://www.makemymemory.in";
const SITE_NAME = "Make My Memory";

export function resolveBaseUrl(): string {
  return CANONICAL_BASE_URL;
}

interface MetaOptions {
  title:        string;
  description:  string;
  path?:        string;   // e.g. "/shop"
  image?:       string;
  noIndex?:     boolean;
}

export function buildMeta({
  title,
  description,
  path = "",
  image,
  noIndex = false,
}: MetaOptions): Metadata {
  const BASE_URL = resolveBaseUrl();
  const url = `${BASE_URL}${path}`;
  const ogImage = image ?? `${BASE_URL}/og-default.jpg`;

  return {
    title,
    description,
    metadataBase: new URL(BASE_URL),
    alternates:   { canonical: url },
    robots:       noIndex ? "noindex,nofollow" : "index,follow",
    openGraph: {
      title,
      description,
      url,
      siteName:  SITE_NAME,
      type:      "website",
      locale:    "en_IN",
      images:    [{ url: ogImage, width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card:        "summary_large_image",
      title,
      description,
      images:      [ogImage],
      site:        "@makemymemory",
    },
  };
}
