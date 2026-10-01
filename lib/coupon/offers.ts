// These explicit checkout selections share the existing coupon section.
// They never activate merely because a cart/payment method qualifies.
export const PREPAID_OFFER = "PREPAID5";
export const COMBO_OFFER = "BUY2GET10";
export const CHECKOUT_OFFERS = [PREPAID_OFFER, COMBO_OFFER] as const;
export type CheckoutOffer = typeof CHECKOUT_OFFERS[number];

export function calculateOffers({ subtotal, itemCount, paymentMethod, offerCodes, couponCode = "" }: {
  subtotal: number; itemCount: number; paymentMethod: string;
  offerCodes: unknown; couponCode?: string;
}) {
  if (paymentMethod !== "razorpay" && paymentMethod !== "cod") throw new Error("Invalid payment method");
  if (!Number.isFinite(subtotal) || subtotal < 0 || !Number.isSafeInteger(itemCount) || itemCount < 0) {
    throw new Error("Invalid cart amount or quantity");
  }
  if (!Array.isArray(offerCodes) || offerCodes.some(code => !CHECKOUT_OFFERS.includes(code)) || new Set(offerCodes).size !== offerCodes.length) {
    throw new Error("Invalid or duplicate offer selection");
  }
  if (offerCodes.length && couponCode.trim()) throw new Error("These offers cannot be combined with another coupon. Remove it first.");
  const prepaid = offerCodes.includes(PREPAID_OFFER);
  const combo = offerCodes.includes(COMBO_OFFER);
  if (prepaid && paymentMethod !== "razorpay") throw new Error("The prepaid offer requires Pay Online");
  if (combo && itemCount < 2) throw new Error("Add at least 2 products to apply this offer");
  // Whole rupees, so totals never show paise (5% of ₹2,399 is ₹120, not ₹119.95).
  const prepaidDiscount = prepaid ? Math.round(subtotal * 5 / 100) : 0;
  const comboDiscount = combo ? Math.round(subtotal * 10 / 100) : 0;
  return {
    prepaidDiscount,
    comboDiscount,
    discount: prepaidDiscount + comboDiscount,
  };
}
