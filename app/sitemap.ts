import type { MetadataRoute } from "next";
import { connectDB } from "@/lib/db/connect";
import { Product } from "@/lib/db/models/Product";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://makemymemory.in";

// Public, indexable content pages. Account/cart/checkout/admin/auth pages
// are functional, not content — they're deliberately left out here and
// blocked in app/robots.ts instead.
const STATIC_ROUTES: Array<{ path: string; priority: number; changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"] }> = [
  { path: "",                  priority: 1.0, changeFrequency: "daily" },
  { path: "/shop",             priority: 0.9, changeFrequency: "daily" },
  { path: "/gallery",          priority: 0.7, changeFrequency: "weekly" },
  { path: "/about",            priority: 0.6, changeFrequency: "monthly" },
  { path: "/contact",          priority: 0.6, changeFrequency: "monthly" },
  { path: "/faq",              priority: 0.5, changeFrequency: "monthly" },
  { path: "/shipping-policy",  priority: 0.3, changeFrequency: "yearly" },
  { path: "/privacy-policy",   priority: 0.3, changeFrequency: "yearly" },
  { path: "/terms-of-service", priority: 0.3, changeFrequency: "yearly" },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticEntries: MetadataRoute.Sitemap = STATIC_ROUTES.map((route) => ({
    url: `${BASE_URL}${route.path}`,
    lastModified: new Date(),
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));

  // Product pages are dynamic — fail soft (static routes only) if the DB
  // isn't reachable rather than breaking the whole sitemap.
  try {
    await connectDB();
    const products = await Product.find({ inStock: true }).select("slug updatedAt").lean();
    const productEntries: MetadataRoute.Sitemap = products.map((p: any) => ({
      url: `${BASE_URL}/shop/${p.slug}`,
      lastModified: p.updatedAt ? new Date(p.updatedAt) : new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    }));
    return [...staticEntries, ...productEntries];
  } catch {
    return staticEntries;
  }
}
