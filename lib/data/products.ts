import type { Product } from "@/lib/types";

// Product catalog now lives in MongoDB (managed via /admin/products).
// This file is kept only as a placeholder for legacy imports.
export const ALL_PRODUCTS: Product[] = [];

export const FEATURED_PRODUCTS = ALL_PRODUCTS.filter((p) => p.badge).slice(0, 4);
