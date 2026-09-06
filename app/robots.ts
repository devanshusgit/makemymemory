import type { MetadataRoute } from "next";
import { resolveBaseUrl } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  const BASE_URL = resolveBaseUrl();
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
