/**
 * Push an event to GTM's dataLayer. Safe to call even when GTM isn't
 * configured (NEXT_PUBLIC_GTM_ID unset) — it just no-ops.
 *
 * Not yet wired into any page — call this from checkout/cart/product
 * components when you're ready to track view_item / add_to_cart /
 * begin_checkout / purchase, etc.
 */
export function trackEvent(event: string, params: Record<string, unknown> = {}) {
  if (typeof window === "undefined") return;
  const w = window as unknown as { dataLayer?: unknown[] };
  if (!w.dataLayer) return;
  w.dataLayer.push({ event, ...params });
}
