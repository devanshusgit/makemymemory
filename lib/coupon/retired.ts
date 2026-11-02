/**
 * The ₹200 welcome offer, retired on 25 Oct 2026.
 *
 * From May to October 2026 the signup route minted one coupon per new account:
 * code WELCOME + the last six hex characters of the user id, couponType
 * "signup", a fixed ₹200 off, valid 30 days. Removing that code stopped new
 * ones being made, but the ones already in the database stayed active and
 * spendable — and /api/coupons/my-coupon kept offering them at checkout.
 *
 * Rather than edit production data, they are refused here by their shape.
 * Signup coupons an admin creates by hand do not match it and still work.
 */
const AUTO_WELCOME_CODE = /^WELCOME[0-9A-F]{6}$/i;

export function isRetiredWelcomeCoupon(coupon: {
  code?: string; couponType?: string; discountType?: string; discountValue?: number;
} | null | undefined): boolean {
  return (
    !!coupon &&
    coupon.couponType === "signup" &&
    AUTO_WELCOME_CODE.test(String(coupon.code ?? "")) &&
    coupon.discountType === "fixed" &&
    Number(coupon.discountValue) === 200
  );
}

/** Mongo filter matching the same coupons, for queries that should skip them. */
export const RETIRED_WELCOME_FILTER = {
  $nor: [{ couponType: "signup", code: AUTO_WELCOME_CODE, discountType: "fixed", discountValue: 200 }],
};
