/**
 * Shared validation helpers for payment-related API routes.
 */

export const MIN_AMOUNT_INR = 1;       // ₹1
export const MAX_AMOUNT_INR = 500_000; // ₹5,00,000 — Razorpay limit per transaction
// COD charge: added ON TOP of the order total for Cash on Delivery (online
// payment has no such charge), and paid upfront via Razorpay. The product
// price itself is then paid in cash on delivery.
export const COD_ADVANCE_INR   = 149;

export type Currency = "INR" | "USD" | "EUR" | "GBP" | "AED" | "SGD";
const ALLOWED_CURRENCIES: Currency[] = ["INR", "USD", "EUR", "GBP", "AED", "SGD"];

export interface ValidationResult {
  ok: boolean;
  error?: string;
}

export function validateAmount(
  amount: unknown,
  currency: unknown = "INR"
): ValidationResult {
  if (typeof amount !== "number" || !Number.isFinite(amount)) {
    return { ok: false, error: "amount must be a finite number" };
  }
  if (amount < MIN_AMOUNT_INR) {
    return { ok: false, error: `amount must be at least ₹${MIN_AMOUNT_INR}` };
  }
  if (amount > MAX_AMOUNT_INR) {
    return { ok: false, error: `amount exceeds maximum of ₹${MAX_AMOUNT_INR}` };
  }
  if (!ALLOWED_CURRENCIES.includes(currency as Currency)) {
    return { ok: false, error: `currency must be one of: ${ALLOWED_CURRENCIES.join(", ")}` };
  }
  return { ok: true };
}

export function validateRazorpayIds(
  orderId: unknown,
  paymentId: unknown,
  signature: unknown
): ValidationResult {
  if (typeof orderId !== "string"   || !orderId.startsWith("order_")) {
    return { ok: false, error: "Invalid razorpay_order_id" };
  }
  if (typeof paymentId !== "string" || !paymentId.startsWith("pay_")) {
    return { ok: false, error: "Invalid razorpay_payment_id" };
  }
  if (typeof signature !== "string" || !/^[a-f0-9]{64}$/i.test(signature)) {
    return { ok: false, error: "Invalid razorpay_signature" };
  }
  return { ok: true };
}

export function validateCODOrder(total: unknown): ValidationResult {
  // No upper limit on COD orders — the ₹149 charge still applies on top.
  if (typeof total !== "number" || !Number.isFinite(total)) {
    return { ok: false, error: "total must be a finite number" };
  }
  return { ok: true };
}

/** Convert INR to paise (Razorpay uses smallest currency unit) */
export function toPaise(amountINR: number): number {
  return Math.round(amountINR * 100);
}
