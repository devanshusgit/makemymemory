/**
 * Centralised SEO helpers.
 * Import buildMeta() in any page to get consistent og/twitter tags.
 */
import type { Metadata } from "next";

const BASE_URL  = process.env.NEXT_PUBLIC_APP_URL ?? "https://makemymemory.in";
const SITE_NAME = "Make My Memory";
const DEFAULT_OG_IMAGE = `${BASE_URL}/og-default.jpg`;   // place a 1200×630 image here

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
  image = DEFAULT_OG_IMAGE,
  noIndex = false,
}: MetaOptions): Metadata {
  const url = `${BASE_URL}${path}`;

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
      images:    [{ url: image, width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card:        "summary_large_image",
      title,
      description,
      images:      [image],
      site:        "@makemymemory",
    },
  };
}
