/**
 * Server-side signature verification helpers.
 * Uses Node's built-in `crypto` — never runs in the browser.
 */
import crypto from "crypto";
import { razorpayKeySecret, razorpayWebhookSecret } from "@/lib/razorpay/config";

/**
 * Verifies a Razorpay payment signature.
 * Called after the checkout modal succeeds.
 */
export function verifyPaymentSignature({
  orderId,
  paymentId,
  signature,
}: {
  orderId: string;
  paymentId: string;
  signature: string;
}): boolean {
  if (!/^[a-f0-9]{64}$/i.test(signature)) return false;
  const secret = razorpayKeySecret();

  const body     = `${orderId}|${paymentId}`;
  const expected = crypto
    .createHmac("sha256", secret)
    .update(body)
    .digest("hex");

  // Constant-time comparison to prevent timing attacks
  return crypto.timingSafeEqual(
    Buffer.from(expected, "hex"),
    Buffer.from(signature, "hex")
  );
}

/**
 * Verifies a Razorpay webhook signature.
 * Called in the /api/webhooks/razorpay route.
 */
export function verifyWebhookSignature({
  rawBody,
  signature,
}: {
  rawBody: string;
  signature: string;
}): boolean {
  if (!/^[a-f0-9]{64}$/i.test(signature)) return false;
  const secret = razorpayWebhookSecret();

  const expected = crypto
    .createHmac("sha256", secret)
    .update(rawBody)
    .digest("hex");

  return crypto.timingSafeEqual(
    Buffer.from(expected, "hex"),
    Buffer.from(signature, "hex")
  );
}
