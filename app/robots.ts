import type { MetadataRoute } from "next";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://makemymemory.in";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/api/",
        "/admin",
        "/admin/",
        "/account",
        "/cart",
        "/checkout",
        "/login",
        "/signup",
        "/settings",
        "/orders",
        "/forgot-password",
        "/reset-password",
        "/maintenance",
      ],
    },
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}
