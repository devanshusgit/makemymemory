import { razorpay } from "@/lib/razorpay/server";
import { sendEmail, ADMIN_EMAIL } from "@/lib/email/resend";

/**
 * Refund a captured payment when the order could not be created after the
 * money was already taken. Without this a customer is charged (the ₹149 COD
 * advance, or a full prepaid total) while no order exists anywhere.
 *
 * Never throws: the caller is already handling a failure, and a failed refund
 * must still be reported rather than replacing the original error. The admin
 * is emailed either way so a human can reconcile it in the Razorpay dashboard.
 */
export async function refundAfterFailedOrder(params: {
  paymentId: string;
  amountINR: number;
  reason: string;
  context?: Record<string, unknown>;
}): Promise<{ refunded: boolean; refundId?: string; error?: string }> {
  const { paymentId, amountINR, reason, context } = params;
  let result: { refunded: boolean; refundId?: string; error?: string };

  try {
    const refund = await razorpay.payments.refund(paymentId, {
      amount: Math.round(amountINR * 100),
      speed: "normal",
      notes: { reason: reason.slice(0, 250) },
    } as any);
    result = { refunded: true, refundId: (refund as any)?.id };
    console.error("[refund] Refunded captured payment after failed order", { paymentId, amountINR, reason, refundId: result.refundId });
  } catch (err: any) {
    result = { refunded: false, error: err?.error?.description ?? err?.message ?? "unknown error" };
    console.error("[refund] REFUND FAILED — manual action required", { paymentId, amountINR, reason, error: result.error });
  }

  if (ADMIN_EMAIL) {
    const lines = [
      `<p><b>Payment ID:</b> ${paymentId}</p>`,
      `<p><b>Amount:</b> ₹${amountINR.toLocaleString("en-IN")}</p>`,
      `<p><b>Why the order failed:</b> ${reason}</p>`,
      result.refunded
        ? `<p><b>Refund:</b> issued automatically (${result.refundId ?? "id unknown"}).</p>`
        : `<p style="color:#B0301F"><b>Refund FAILED (${result.error}) — refund this payment manually in the Razorpay dashboard.</b></p>`,
      context ? `<pre>${JSON.stringify(context, null, 2)}</pre>` : "",
    ].join("");
    await sendEmail({
      to: ADMIN_EMAIL,
      subject: result.refunded
        ? `Payment refunded — order could not be created (${paymentId})`
        : `ACTION NEEDED: payment taken but no order created (${paymentId})`,
      html: lines,
    }).catch((e) => console.error("[refund] admin email failed:", e));
  }

  return result;
}
