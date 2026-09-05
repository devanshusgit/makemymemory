import { razorpay } from "./server";
import { verifyPaymentSignature } from "./verify";
import { validateAmount, validateRazorpayIds, toPaise } from "./validation";

/** Verify payment again at the order-writing boundary: callers can skip /verify. */
export async function confirmCapturedPayment({
  orderId, paymentId, signature, amountINR,
}: {
  orderId: unknown;
  paymentId: unknown;
  signature: unknown;
  amountINR: number;
}): Promise<{ ok: true } | { ok: false; status: number; error: string }> {
  const ids = validateRazorpayIds(orderId, paymentId, signature);
  if (!ids.ok) return { ok: false, status: 400, error: ids.error! };
  const amount = validateAmount(amountINR, "INR");
  if (!amount.ok) return { ok: false, status: 400, error: amount.error! };

  try {
    if (!verifyPaymentSignature({
      orderId: orderId as string,
      paymentId: paymentId as string,
      signature: signature as string,
    })) {
      return { ok: false, status: 400, error: "Payment signature is invalid" };
    }

    const payment = await razorpay.payments.fetch(paymentId as string);
    if (
      payment.id !== paymentId || payment.order_id !== orderId ||
      payment.currency !== "INR" || Number(payment.amount) !== toPaise(amountINR)
    ) {
      return { ok: false, status: 400, error: "Payment does not match this order or amount" };
    }
    if (payment.status !== "captured" || Number(payment.amount_refunded ?? 0) > 0) {
      return {
        ok: false, status: 409,
        error: "Payment is not captured or has been refunded. Please contact support before paying again.",
      };
    }
    return { ok: true };
  } catch {
    // SDK errors may contain authorization headers; never log the raw error.
    return {
      ok: false, status: 503,
      error: "Payment could not be confirmed. Please contact support before paying again.",
    };
  }
}
