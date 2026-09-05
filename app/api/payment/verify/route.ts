import { NextRequest, NextResponse } from "next/server";
import { verifyPaymentSignature }    from "@/lib/razorpay/verify";
import { validateRazorpayIds }       from "@/lib/razorpay/validation";

/**
 * POST /api/payment/verify
 *
 * Verifies the HMAC-SHA256 signature Razorpay's checkout modal hands back
 * (timing-safe) — the Key Secret stays server-side. The order document
 * itself is created right after this succeeds, by /api/orders, which is
 * why this route only confirms the signature rather than touching the DB.
 *
 * Body: { razorpay_order_id, razorpay_payment_id, razorpay_signature }
 */
export async function POST(req: NextRequest) {
  try {
    let body: Record<string, unknown>;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ success: false, error: "Invalid JSON body" }, { status: 400 });
    }

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = body;

    // ── 1. Validate field shapes ──────────────────────────────────────────────
    const validation = validateRazorpayIds(
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    );
    if (!validation.ok) {
      return NextResponse.json({ success: false, error: validation.error }, { status: 400 });
    }

    // ── 2. Verify HMAC signature ──────────────────────────────────────────────
    let isValid: boolean;
    try {
      isValid = verifyPaymentSignature({
        orderId:   razorpay_order_id as string,
        paymentId: razorpay_payment_id as string,
        signature: razorpay_signature as string,
      });
    } catch (err) {
      console.error("[verify] Signature check error:", err);
      return NextResponse.json(
        { success: false, error: "Signature verification failed" },
        { status: 500 }
      );
    }

    if (!isValid) {
      console.warn("[verify] Invalid signature for order:", razorpay_order_id);
      return NextResponse.json(
        { success: false, error: "Payment signature is invalid" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: true, paymentId: razorpay_payment_id },
      { status: 200 }
    );
  } catch (error) {
    console.error("[verify]", error);
    return NextResponse.json(
      { success: false, error: "Verification failed. Please contact support." },
      { status: 500 }
    );
  }
}
