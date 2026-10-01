/**
 * The storefront's default product order, used everywhere products are listed
 * (homepage, /shop, "You may also like") so they always agree.
 *
 *   1. Best Seller   2. Popular   3. Best Value   4. New
 *   5. products with no badge
 *   6. Coming Soon and anything out of stock, last
 *
 * Inside each group the admin's drag-and-drop order (Admin -> Products) wins,
 * then newest first. Products used to be listed newest-first only, so the last
 * upload always sat at the top and the drag order was ignored by the shop.
 */

/** The badges customers can browse by, in display order. */
export const HIGHLIGHTS = [
  { badge: "Best Seller", label: "Best Sellers" },
  { badge: "Popular",     label: "Popular" },
  { badge: "Best Value",  label: "Best Value" },
  { badge: "New",         label: "New Arrivals" },
] as const;

const RANK_BY_BADGE: Record<string, number> = Object.fromEntries(
  HIGHLIGHTS.map((h, i) => [h.badge.toLowerCase(), i])
);
const NO_BADGE_RANK = HIGHLIGHTS.length;

export function badgeRank(badge?: string | null): number {
  const key = (badge ?? "").trim().toLowerCase();
  if (!key) return NO_BADGE_RANK;
  if (key === "coming soon") return NO_BADGE_RANK + 1;
  return RANK_BY_BADGE[key] ?? NO_BADGE_RANK;
}

interface Rankable {
  badge?: string | null;
  inStock?: boolean;
  sortOrder?: number | null;
  createdAt?: string | Date | null;
}

export function rankProducts<T extends Rankable>(list: T[]): T[] {
  const time = (d: Rankable["createdAt"]) => (d ? new Date(d).getTime() || 0 : 0);
  return [...list].sort((a, b) => {
    const aAvail = a.inStock !== false ? 0 : 1;
    const bAvail = b.inStock !== false ? 0 : 1;
    if (aAvail !== bAvail) return aAvail - bAvail;
    const byBadge = badgeRank(a.badge) - badgeRank(b.badge);
    if (byBadge) return byBadge;
    const byAdminOrder = (a.sortOrder ?? 0) - (b.sortOrder ?? 0);
    if (byAdminOrder) return byAdminOrder;
    return time(b.createdAt) - time(a.createdAt);
  });
}
