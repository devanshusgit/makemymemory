/**
 * The age the keepsake is for, asked on every product page and required
 * before anything can go in the cart.
 *
 * Shared by the product page (to draw the dropdown) and lib/checkout/priceCart
 * (to accept only these ids). It rides along with the frame options as a
 * CartSelection, so it reaches the order, the admin panel, the emails and the
 * printed label without any of them needing to know about it. It never
 * changes the price.
 */
export const BABY_AGE_GROUP = "babyAge" as const;
export const BABY_AGE_LABEL = "Baby's Age";

export const BABY_AGE_OPTIONS = [
  { id: "yet-to-be-born", label: "Yet to be born" },
  { id: "0-3m",           label: "0–3 months" },
  { id: "3-6m",           label: "3–6 months" },
  { id: "6-12m",          label: "6–12 months" },
  { id: "1-2y",           label: "1–2 years" },
  { id: "2-5y",           label: "2–5 years" },
] as const;

export type BabyAgeId = (typeof BABY_AGE_OPTIONS)[number]["id"];

export function findBabyAge(id: unknown) {
  return BABY_AGE_OPTIONS.find((o) => o.id === id);
}
