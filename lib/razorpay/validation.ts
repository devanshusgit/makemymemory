/**
 * Shared validation helpers for payment-related API routes.
 */

export const MIN_AMOUNT_INR = 1;       // ₹1
export const MAX_AMOUNT_INR = 500_000; // ₹5,00,000 — Razorpay limit per transaction
export const COD_MAX_ORDER_INR = 5_000;
export const COD_ADVANCE_INR   = 150;

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
  if (typeof signature !== "string" || signature.length !== 64) {
    return { ok: false, error: "Invalid razorpay_signature" };
  }
  return { ok: true };
}

export function validateCODOrder(total: unknown): ValidationResult {
  if (typeof total !== "number" || !Number.isFinite(total)) {
    return { ok: false, error: "total must be a finite number" };
  }
  if (total > COD_MAX_ORDER_INR) {
    return {
      ok: false,
      error: `COD is only available for orders up to ₹${COD_MAX_ORDER_INR.toLocaleString("en-IN")}`,
    };
  }
  return { ok: true };
}

/** Convert INR to paise (Razorpay uses smallest currency unit) */
export function toPaise(amountINR: number): number {
  return Math.round(amountINR * 100);
}
