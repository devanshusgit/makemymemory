import type { Product } from "@/lib/types";

// All hardcoded products have been removed.
// Products are now fetched from the database via /api/products
// Product catalog now lives in MongoDB (managed via /admin/products).
export const ALL_PRODUCTS: Product[] = [];

export const FEATURED_PRODUCTS: Product[] = [];
