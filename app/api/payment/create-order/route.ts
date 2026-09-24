import { NextRequest, NextResponse } from "next/server";
import { razorpay }        from "@/lib/razorpay/server";
import { validateAmount, toPaise } from "@/lib/razorpay/validation";
import { COD_ADVANCE_INR, validateCODOrder } from "@/lib/razorpay/validation";
import { quoteCheckout, CheckoutPricingError } from "@/lib/coupon/checkout";
import { razorpayKeyId, razorpayMode, describeKeyId } from "@/lib/razorpay/config";

/**
 * POST /api/payment/create-order
 *
 * Creates a Razorpay order server-side.
 * The Key Secret never leaves the server.
 *
 * Body: { amount: number (INR), currency?: string, receipt?: string, notes?: object }
 * Returns: Razorpay Order object (id, amount, currency, receipt, status)
 */
export async function POST(req: NextRequest) {
  try {
    // ── Parse body ──────────────────────────────────────────────────────────
    let body: Record<string, unknown>;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const { amount, currency = "INR", receipt, notes } = body;

    // ── Validate ─────────────────────────────────────────────────────────────
    const validation = validateAmount(amount, currency);
    if (!validation.ok) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const quote = await quoteCheckout({
      subtotal: body.subtotal, shippingCharge: body.shippingCharge, items: body.items,
      paymentMethod: body.paymentMethod, couponCode: body.couponCode,
      offerCodes: body.offerCodes, userId: body.userId,
    });
    const cod = body.paymentMethod === "cod";
    if (cod && !validateCODOrder(quote.total).ok) throw new CheckoutPricingError("COD is only available for orders up to ₹5,000");
    const expectedAmount = cod ? Math.min(COD_ADVANCE_INR, quote.total) : quote.total;
    if (quote.total <= 0 || toPaise(amount as number) !== toPaise(expectedAmount)) {
      throw new CheckoutPricingError("Your checkout total changed. Review your offers and try again.");
    }

    // ── Create order ─────────────────────────────────────────────────────────
    const order = await razorpay.orders.create({
      amount:   toPaise(expectedAmount),
      currency: (currency as string).toUpperCase(),
      receipt:  typeof receipt === "string" ? receipt : `rcpt_${Date.now()}`,
      notes:    typeof notes === "object" && notes !== null
                  ? (notes as Record<string, string>)
                  : {},
    });

    // Return only the fields the client needs — never expose key_secret.
    // keyId is the SAME id this order was created with, so the checkout modal
    // cannot open with a different key than the one that owns the order. It is
    // public: every visitor's browser already sees it in the Razorpay modal.
    return NextResponse.json(
      {
        id:       order.id,
        amount:   order.amount,
        currency: order.currency,
        receipt:  order.receipt,
        status:   order.status,
        keyId:    razorpayKeyId(),
      },
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof CheckoutPricingError) return NextResponse.json({ error: error.message }, { status: 400 });
    const statusCode =
      typeof error === "object" && error !== null && "statusCode" in error
        ? Number((error as { statusCode?: unknown }).statusCode)
        : undefined;
    if (statusCode === 401) {
      // Name the key that was rejected (the id is public; the secret never is),
      // so the next occurrence is diagnosable straight from the Vercel logs.
      let key = "unset";
      try { const id = razorpayKeyId(); key = `${describeKeyId(id)} (${razorpayMode(id)} mode)`; } catch { /* unset */ }
      console.error(`[create-order] Razorpay rejected the key pair: ${key}. ` +
        "RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET must come from the same key, in the same mode, " +
        "and env changes only take effect after a redeploy.");
      return NextResponse.json(
        { error: "Payment gateway authentication failed. Please contact support." },
        { status: 401 }
      );
    }
    // Razorpay SDK errors can contain request/auth details; do not log the raw object.
    console.error("[create-order] Razorpay order creation failed", { statusCode });
    return NextResponse.json(
      { error: "Failed to create payment order. Please try again." },
      { status: 500 }
    );
  }
}
