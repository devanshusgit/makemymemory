import { cache } from "react";
import { connectDB } from "@/lib/db/connect";
import { Product } from "@/lib/db/models/Product";
import { ProductOption } from "@/lib/db/models/ProductOption";
import type { Product as PublicProduct } from "@/lib/types";
import { resolveProductImages, remainingAttachments } from "@/lib/products/photoRescue";
import { rankProducts } from "@/lib/products/ranking";

/**
 * Shown when a product has no photo of its own yet. It used to be a stock
 * Unsplash shot of a pair of headphones, which is what every product on the
 * shop page was advertising whenever its images array was empty. A local,
 * on-brand "photo coming soon" card is honest, costs no third-party request,
 * and makes the missing upload obvious to whoever is managing the catalogue.
 */
const FALLBACK_IMAGE = "/images/product-placeholder.svg";

/**
 * The storefront's shape of a product. Shared by GET /api/products and the
 * server-rendered pages so the browser and the HTML always agree. Round-tripped
 * through JSON so Mongo ObjectIds/Dates become plain values that can be passed
 * as props to client components.
 */
export function toPublicProduct(p: any): PublicProduct {
  const photos = resolveProductImages(p);
  return JSON.parse(JSON.stringify({
    id:                     p._id.toString(),
    name:                   p.name,
    slug:                   p.slug,
    description:            p.description,
    price:                  p.price,
    originalPrice:          p.originalPrice,
    images:                 photos.length ? photos : [FALLBACK_IMAGE],
    videos:                 p.videos || [],
    category:               p.category,
    subcategory:            p.subcategory || "",
    badge:                  p.badge,
    inStock:                p.inStock,
    avgRating:              p.avgRating || 0,
    reviewCount:            p.reviewCount || 0,
    customizationFields:    p.customizationFields || [],
    details:                p.details || [],
    descriptionAttachments: remainingAttachments(p),
    enabledOptions:         p.enabledOptions,
  }));
}

/**
 * Products in the storefront's recommended order (lib/products/ranking.ts:
 * Best Seller, Popular, Best Value, New, then the rest) — the same order as
 * GET /api/products with no filters. Returns [] if the database is
 * unreachable, so callers fall back to fetching in the browser.
 */
export async function getPublicProducts(limit = 12): Promise<PublicProduct[]> {
  try {
    await connectDB();
    // The catalogue is small, so rank all of it and then take the first N.
    const docs = await Product.find({}).lean();
    return rankProducts(docs as any[]).slice(0, limit).map(toPublicProduct);
  } catch {
    return [];
  }
}

/** Customization option groups shown on the product page, in display order. */
export const OPTION_GROUPS = ["frame-type", "frame-color", "foil-finish", "paper-color", "font", "layout"] as const;

/**
 * Everything the product page needs, loaded in one round trip. Wrapped in
 * React cache() so generateMetadata() and the page share a single query.
 */
export const getProductPageData = cache(async (slug: string) => {
  try {
    await connectDB();
    const [product, options, related] = await Promise.all([
      Product.findOne({ slug }).lean(),
      ProductOption.find({ group: { $in: OPTION_GROUPS } }).sort({ sortOrder: 1, createdAt: 1 }).lean(),
      // "You may also like" — loaded here so it is cached with the page (ISR)
      // instead of every visitor's browser querying the database for it.
      Product.find({ slug: { $ne: slug } }).lean(),
    ]);
    const optionsByGroup: Record<string, any[]> = {};
    for (const o of JSON.parse(JSON.stringify(options))) (optionsByGroup[o.group] ??= []).push(o);
    return {
      product: product ? toPublicProduct(product) : null,
      optionsByGroup,
      related: rankProducts(related as any[]).slice(0, 4).map(toPublicProduct),
      raw: product as any,
    };
  } catch {
    return { product: null, optionsByGroup: null, related: null, raw: null };
  }
});
