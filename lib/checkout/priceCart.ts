import { connectDB } from "@/lib/db/connect";
import { Product } from "@/lib/db/models/Product";
import { ProductOption } from "@/lib/db/models/ProductOption";
import {
  type VariantOption,
  DEFAULT_FRAME_TYPES, DEFAULT_FRAME_COLORS, DEFAULT_FINISHES,
  DEFAULT_PAPER_COLORS, DEFAULT_FONTS, DEFAULT_LAYOUTS,
} from "@/lib/data/defaultProductOptions";

export class CartPricingError extends Error {}

/** Cart surcharge keys → the option group they are priced from. */
const SURCHARGE_GROUPS: Record<string, { group: string; fallback: VariantOption[] }> = {
  frameType:  { group: "frame-type",  fallback: DEFAULT_FRAME_TYPES },
  frameColor: { group: "frame-color", fallback: DEFAULT_FRAME_COLORS },
  finish:     { group: "foil-finish", fallback: DEFAULT_FINISHES },
  paperColor: { group: "paper-color", fallback: DEFAULT_PAPER_COLORS },
  font:       { group: "font",        fallback: DEFAULT_FONTS },
  layout:     { group: "layout",      fallback: DEFAULT_LAYOUTS },
};

export interface PricedLineItem {
  productId: string;
  name: string;
  emoji: string;
  price: number;        // unit price INCLUDING variant surcharges
  quantity: number;
  customization: string | Record<string, string>;
  surcharges?: Record<string, number>;
}

/**
 * Re-prices a cart on the server.
 *
 * The browser sends whatever prices it likes (cart state lives in
 * localStorage), so every amount used for payment must be recomputed here
 * from the catalogue. Base prices come from the Product document; variant
 * surcharges are accepted only if they match a price that the matching
 * option group actually offers for that product (the cart records surcharge
 * AMOUNTS, not option ids, so the amount is validated against the allowed
 * set rather than looked up by id).
 */
export async function priceCart(rawItems: unknown): Promise<{ lineItems: PricedLineItem[]; subtotal: number }> {
  if (!Array.isArray(rawItems) || rawItems.length === 0) throw new CartPricingError("Your cart is empty");
  if (rawItems.length > 50) throw new CartPricingError("Too many items in one order");

  await connectDB();

  // Resolve every product from the catalogue by id or slug.
  const wanted = rawItems.map((item: any) => {
    const product = item?.product ?? item ?? {};
    return {
      id:   String(product.id ?? product.productId ?? product._id ?? item?.productId ?? "").trim(),
      slug: String(product.slug ?? "").trim(),
    };
  });
  const ids = wanted.map((w) => w.id).filter((id) => /^[a-f0-9]{24}$/i.test(id));
  const slugs = wanted.map((w) => w.slug).filter(Boolean);
  const products = await Product.find({ $or: [{ _id: { $in: ids } }, { slug: { $in: slugs } }] }).lean();
  const byId = new Map(products.map((p: any) => [String(p._id), p]));
  const bySlug = new Map(products.map((p: any) => [p.slug, p]));

  // Allowed surcharge amounts per group (admin options if configured, else defaults).
  const dbOptions = await ProductOption.find({ group: { $in: Object.values(SURCHARGE_GROUPS).map((g) => g.group) } }).lean();
  const optionsByGroup = new Map<string, VariantOption[]>();
  for (const o of dbOptions as any[]) {
    const list = optionsByGroup.get(o.group) ?? [];
    list.push(o as VariantOption);
    optionsByGroup.set(o.group, list);
  }

  const lineItems: PricedLineItem[] = [];
  let subtotal = 0;

  rawItems.forEach((item: any, index) => {
    const quantity = item?.quantity ?? 1;
    if (!Number.isSafeInteger(quantity) || quantity < 1 || quantity > 20) throw new CartPricingError("Invalid product quantity");

    const product = byId.get(wanted[index].id) ?? bySlug.get(wanted[index].slug);
    if (!product) throw new CartPricingError("One of the products in your cart is no longer available");
    if (product.inStock === false) throw new CartPricingError(`${product.name} is out of stock`);

    // Variant surcharges: every amount must be one this product actually offers.
    const claimed = (item?.surcharges ?? {}) as Record<string, unknown>;
    const surcharges: Record<string, number> = {};
    let surchargeTotal = 0;
    for (const [key, { group, fallback }] of Object.entries(SURCHARGE_GROUPS)) {
      const amount = claimed[key];
      if (amount === undefined || amount === null) continue;
      if (typeof amount !== "number" || !Number.isFinite(amount) || amount < 0) {
        throw new CartPricingError("Invalid customisation pricing — please rebuild your cart");
      }
      if (amount === 0) continue; // a free choice is always allowed

      const configured = optionsByGroup.get(group) ?? [];
      let allowed: VariantOption[] = configured.length ? configured : fallback;
      const enabled = (product.enabledOptions ?? {})[key] as string[] | undefined;
      if (enabled?.length) allowed = allowed.filter((o) => enabled.includes(o.id));

      if (!allowed.some((o) => Math.round((o.price ?? 0) * 100) === Math.round(amount * 100))) {
        throw new CartPricingError("Selected customisation is not available for this product");
      }
      surcharges[key] = amount;
      surchargeTotal += amount;
    }

    const unitPrice = Math.round((product.price + surchargeTotal) * 100) / 100;
    subtotal += unitPrice * quantity;
    lineItems.push({
      productId:     String(product._id),
      name:          product.name,
      emoji:         "",
      price:         unitPrice,
      quantity,
      customization: item?.customization ?? "",
      ...(surchargeTotal > 0 ? { surcharges: { ...surcharges, total: surchargeTotal } } : {}),
    });
  });

  return { lineItems, subtotal: Math.round(subtotal * 100) / 100 };
}
