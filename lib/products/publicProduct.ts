import { cache } from "react";
import { connectDB } from "@/lib/db/connect";
import { Product } from "@/lib/db/models/Product";
import { ProductOption } from "@/lib/db/models/ProductOption";
import type { Product as PublicProduct } from "@/lib/types";

/**
 * Shown when a product has no photo of its own yet. It used to be a stock
 * Unsplash shot of a pair of headphones, which is what every product on the
 * shop page was advertising whenever its images array was empty. A local,
 * on-brand "photo coming soon" card is honest, costs no third-party request,
 * and makes the missing upload obvious to whoever is managing the catalogue.
 */
const FALLBACK_IMAGE = "/images/product-placeholder.svg";

/**
 * The admin form used to have two uploaders — "Product files" (which fed
 * descriptionAttachments and only ever showed up further down the product
 * page) and "Photos / Videos" (which feeds `images`, the cover and gallery
 * the shop actually renders). They were easy to mix up, and the whole
 * catalogue ended up with its photos in the first one and nothing in the
 * second, so every product showed the placeholder.
 *
 * The form now has a single uploader. This keeps the products uploaded the
 * old way working immediately, without waiting for each one to be re-saved:
 * when a product has no images of its own, its attached images stand in.
 */
function strandedPhotos(p: any): string[] {
  if (p.images?.length) return [];
  return (p.descriptionAttachments ?? [])
    .filter((a: any) => a?.url && (a.type === "image" || (!a.type && /\.(jpe?g|png|webp|gif|avif)(\?|$)/i.test(a.url))))
    .map((a: any) => a.url as string);
}

function productImages(p: any): string[] {
  if (p.images?.length) return p.images;
  const rescued = strandedPhotos(p);
  return rescued.length ? rescued : [FALLBACK_IMAGE];
}

/** Whatever is left once the rescued photos are being shown as the gallery. */
function productAttachments(p: any): any[] {
  const rescued = strandedPhotos(p);
  const all = p.descriptionAttachments ?? [];
  return rescued.length ? all.filter((a: any) => !rescued.includes(a?.url)) : all;
}

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
    images:                 productImages(p),
    videos:                 p.videos || [],
    category:               p.category,
    badge:                  p.badge,
    inStock:                p.inStock,
    avgRating:              p.avgRating || 0,
    reviewCount:            p.reviewCount || 0,
    customizationFields:    p.customizationFields || [],
    details:                p.details || [],
    descriptionAttachments: productAttachments(p),
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
