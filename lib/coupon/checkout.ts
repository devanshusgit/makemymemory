import { connectDB } from "@/lib/db/connect";
import { validateAndApplyCoupon } from "@/lib/coupon/couponUtils";
import { calculateOffers, CHECKOUT_OFFERS, type CheckoutOffer } from "./offers";

export class CheckoutPricingError extends Error {}

// Validate explicit discounts on the existing cart subtotal contract. Catalogue
// prices/variant surcharges are still client-supplied in this architecture.
export async function quoteCheckout(input: {
  subtotal: unknown; shippingCharge: unknown; items: unknown;
  paymentMethod: unknown; couponCode?: unknown; offerCodes?: unknown; userId?: unknown;
}) {
  const { subtotal, shippingCharge, paymentMethod } = input;
  if (typeof subtotal !== "number" || !Number.isFinite(subtotal) || subtotal <= 0 || shippingCharge !== 0) {
    throw new CheckoutPricingError("Invalid checkout subtotal or shipping amount");
  }
  if (paymentMethod !== "razorpay" && paymentMethod !== "cod") throw new CheckoutPricingError("Invalid payment method");
  if (!Array.isArray(input.items) || !input.items.length) throw new CheckoutPricingError("Your cart is empty");
  const items = input.items.map(item => {
    if (!item || !Number.isSafeInteger(item.quantity) || item.quantity < 1) throw new CheckoutPricingError("Invalid product quantity");
    const product = item.product ?? item;
    return { productId: product.id ?? product.productId ?? product._id, category: product.category, quantity: item.quantity };
  });
  const couponCode = typeof input.couponCode === "string" ? input.couponCode.trim().toUpperCase() : "";
  if (CHECKOUT_OFFERS.includes(couponCode as CheckoutOffer)) throw new CheckoutPricingError("Apply this offer from the checkout offers section");
  const offerCodes = input.offerCodes ?? [];
  let offers;
  try {
    offers = calculateOffers({ subtotal, itemCount: items.reduce((sum, item) => sum + item.quantity, 0), paymentMethod, offerCodes, couponCode });
  } catch (error) {
    throw new CheckoutPricingError(error instanceof Error ? error.message : "Invalid offer selection");
  }
  let couponDiscount = 0;
  if (couponCode) {
    if (typeof input.userId !== "string" || !input.userId.trim()) throw new CheckoutPricingError("Enter your email before applying a coupon");
    await connectDB();
    const result = await validateAndApplyCoupon({ subtotal, items, couponCode, userId: input.userId });
    if (!result.valid) throw new CheckoutPricingError(result.message);
    couponDiscount = result.discount;
  }
  const discountAmount = Math.round((couponDiscount + offers.discount) * 100) / 100;
  return {
    total: Math.max(0, Math.round((subtotal - discountAmount) * 100) / 100),
    discountAmount,
    appliedCouponCode: couponCode || (offerCodes as string[]).join(" + ") || undefined,
  };
}
