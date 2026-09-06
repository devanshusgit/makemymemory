/**
 * Centralised SEO helpers.
 * Call buildMeta() from a generateMetadata() function (not a static `export
 * const metadata`) so it can read the actual request host — the site is
 * served from two live domains (makemymemory.com and makemymemory.in) and
 * each must self-canonicalize instead of always pointing at one of them.
 */
import type { Metadata } from "next";
import { headers } from "next/headers";

const KNOWN_DOMAINS = ["makemymemory.com", "makemymemory.in"];
const DEFAULT_BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://makemymemory.in";
const SITE_NAME = "Make My Memory";

export function resolveBaseUrl(): string {
  try {
    const host = headers().get("host")?.replace(/^www\./, "");
    const matched = host ? KNOWN_DOMAINS.find((d) => d === host) : undefined;
    return matched ? `https://${matched}` : DEFAULT_BASE_URL;
  } catch {
    return DEFAULT_BASE_URL;
  }
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
