import { track } from "@vercel/analytics";

/**
 * Conversion tracking, sent to GA4, the Meta pixel and Vercel at once.
 *
 * Until this existed the site reported page views and nothing else: no
 * Purchase ever reached Meta, so ad delivery could only optimise for clicks
 * and landing-page views, and ROAS was unknowable. GA4 likewise had no
 * ecommerce data, so the cart-to-order funnel was invisible.
 *
 * Consent is handled upstream — Google Consent Mode holds GA4 and
 * `fbq('consent', ...)` holds the pixel until the visitor accepts — so these
 * are safe to call unconditionally.
 *
 * Browser-side events are lost to ad blockers and tracking prevention for a
 * meaningful share of visitors. Treat these numbers as directional. Meta's
 * Conversions API, sent server-side, is what closes that gap.
 */

type Gtag = (...args: unknown[]) => void;
type Fbq = (...args: unknown[]) => void;

export interface EventItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

const CURRENCY = "INR";

function tags() {
  if (typeof window === "undefined") return {};
  return window as unknown as { gtag?: Gtag; fbq?: Fbq };
}

/** Vercel rejects nested objects, so only scalars go through here. */
function vercelTrack(name: string, props: Record<string, string | number>) {
  try {
    track(name, props);
  } catch {
    /* analytics must never break a checkout */
  }
}

function metaContents(items: EventItem[]) {
  return items.map((i) => ({ id: i.id, quantity: i.quantity, item_price: i.price }));
}

function ga4Items(items: EventItem[]) {
  return items.map((i) => ({
    item_id: i.id,
    item_name: i.name,
    price: i.price,
    quantity: i.quantity,
  }));
}

function sum(items: EventItem[]) {
  return items.reduce((t, i) => t + i.price * i.quantity, 0);
}

export function trackViewItem(item: EventItem) {
  const { gtag, fbq } = tags();
  const value = item.price * item.quantity;

  gtag?.("event", "view_item", { currency: CURRENCY, value, items: ga4Items([item]) });
  fbq?.("track", "ViewContent", {
    content_type: "product",
    content_ids: [item.id],
    content_name: item.name,
    currency: CURRENCY,
    value,
  });
  vercelTrack("view_item", { product: item.name, value });
}

export function trackAddToCart(item: EventItem) {
  const { gtag, fbq } = tags();
  const value = item.price * item.quantity;

  gtag?.("event", "add_to_cart", { currency: CURRENCY, value, items: ga4Items([item]) });
  fbq?.("track", "AddToCart", {
    content_type: "product",
    content_ids: [item.id],
    content_name: item.name,
    currency: CURRENCY,
    value,
  });
  vercelTrack("add_to_cart", { product: item.name, value, quantity: item.quantity });
}

export function trackBeginCheckout(items: EventItem[], value = sum(items)) {
  const { gtag, fbq } = tags();

  gtag?.("event", "begin_checkout", { currency: CURRENCY, value, items: ga4Items(items) });
  fbq?.("track", "InitiateCheckout", {
    content_type: "product",
    content_ids: items.map((i) => i.id),
    contents: metaContents(items),
    num_items: items.reduce((n, i) => n + i.quantity, 0),
    currency: CURRENCY,
    value,
  });
  vercelTrack("begin_checkout", { value, items: items.length });
}

/**
 * Fires at most once per order id. The success page is a normal URL — people
 * refresh it, bookmark it and open it twice from the confirmation email — and
 * every one of those would otherwise be counted as another sale, inflating
 * revenue and teaching Meta to bid on the wrong thing.
 */
export function trackPurchase(params: {
  orderId: string;
  value: number;
  items: EventItem[];
  paymentMethod?: string;
}) {
  const { orderId, value, items, paymentMethod } = params;
  if (!orderId) return;

  const key = `mmm_purchase_tracked_${orderId}`;
  try {
    if (localStorage.getItem(key)) return;
    localStorage.setItem(key, "1");
  } catch {
    // Storage blocked (private mode). Sending a possible duplicate beats
    // losing the conversion entirely.
  }

  const { gtag, fbq } = tags();

  gtag?.("event", "purchase", {
    transaction_id: orderId,
    currency: CURRENCY,
    value,
    items: ga4Items(items),
  });
  fbq?.("track", "Purchase", {
    content_type: "product",
    content_ids: items.map((i) => i.id),
    contents: metaContents(items),
    num_items: items.reduce((n, i) => n + i.quantity, 0),
    currency: CURRENCY,
    value,
    order_id: orderId,
  });
  vercelTrack("purchase", {
    order_id: orderId,
    value,
    items: items.length,
    method: paymentMethod ?? "unknown",
  });
}

/* ── Handing the order from checkout to the success page ──────────────────
 * The success page only receives orderId, method and remaining in the URL, so
 * it cannot know what the order was worth. Putting the value in the URL would
 * publish it and let anyone edit it. Stash it instead, and read it once. */

const PENDING_KEY = "mmm_pending_purchase";

export interface PendingPurchase {
  orderId: string;
  value: number;
  items: EventItem[];
  paymentMethod?: string;
}

export function stashPendingPurchase(p: PendingPurchase) {
  try {
    sessionStorage.setItem(PENDING_KEY, JSON.stringify(p));
  } catch {
    /* storage blocked — the purchase simply goes untracked */
  }
}

export function readPendingPurchase(orderId: string): PendingPurchase | null {
  try {
    const raw = sessionStorage.getItem(PENDING_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as PendingPurchase;
    // A stale stash from an earlier order must not be billed to this one.
    if (!parsed?.orderId || parsed.orderId !== orderId) return null;
    sessionStorage.removeItem(PENDING_KEY);
    return parsed;
  } catch {
    return null;
  }
}
