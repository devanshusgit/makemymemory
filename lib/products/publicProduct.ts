import { cache } from "react";
import { connectDB } from "@/lib/db/connect";
import { Product } from "@/lib/db/models/Product";
import { ProductOption } from "@/lib/db/models/ProductOption";
import type { Product as PublicProduct } from "@/lib/types";

const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&h=500&fit=crop";

/**
 * The storefront's shape of a product. Shared by GET /api/products and the
 * server-rendered pages so the browser and the HTML always agree. Round-tripped
 * through JSON so Mongo ObjectIds/Dates become plain values that can be passed
 * as props to client components.
 */
export function toPublicProduct(p: any): PublicProduct {
  return JSON.parse(JSON.stringify({
    id:                     p._id.toString(),
    name:                   p.name,
    slug:                   p.slug,
    description:            p.description,
    price:                  p.price,
    originalPrice:          p.originalPrice,
    images:                 p.images && p.images.length > 0 ? p.images : [FALLBACK_IMAGE],
    videos:                 p.videos || [],
    category:               p.category,
    badge:                  p.badge,
    inStock:                p.inStock,
    avgRating:              p.avgRating || 0,
    reviewCount:            p.reviewCount || 0,
    customizationFields:    p.customizationFields || [],
    details:                p.details || [],
    descriptionAttachments: p.descriptionAttachments || [],
    enabledOptions:         p.enabledOptions,
  }));
}

/**
 * Newest products first, in-stock before out-of-stock — the same order as
 * GET /api/products with no filters. Returns [] if the database is
 * unreachable, so callers fall back to fetching in the browser.
 */
export async function getPublicProducts(limit = 12): Promise<PublicProduct[]> {
  try {
    await connectDB();
    const docs = await Product.find({})
      .sort({ inStock: -1, createdAt: -1 })
      .limit(limit)
      .lean();
    return docs.map(toPublicProduct);
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
    const [product, options] = await Promise.all([
      Product.findOne({ slug }).lean(),
      ProductOption.find({ group: { $in: OPTION_GROUPS } }).sort({ sortOrder: 1, createdAt: 1 }).lean(),
    ]);
    const optionsByGroup: Record<string, any[]> = {};
    for (const o of JSON.parse(JSON.stringify(options))) (optionsByGroup[o.group] ??= []).push(o);
    return { product: product ? toPublicProduct(product) : null, optionsByGroup, raw: product as any };
  } catch {
    return { product: null, optionsByGroup: null, raw: null };
  }
});
