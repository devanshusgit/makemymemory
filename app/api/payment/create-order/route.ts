import { NextRequest, NextResponse } from "next/server";
import { razorpay }        from "@/lib/razorpay/server";
import { validateAmount, toPaise } from "@/lib/razorpay/validation";

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

    // ── Create order ─────────────────────────────────────────────────────────
    const order = await razorpay.orders.create({
      amount:   toPaise(amount as number),
      currency: (currency as string).toUpperCase(),
      receipt:  typeof receipt === "string" ? receipt : `rcpt_${Date.now()}`,
      notes:    typeof notes === "object" && notes !== null
                  ? (notes as Record<string, string>)
                  : {},
    });

    // Return only the fields the client needs — never expose key_secret
    return NextResponse.json(
      {
        id:       order.id,
        amount:   order.amount,
        currency: order.currency,
        receipt:  order.receipt,
        status:   order.status,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("[create-order]", error);
    return NextResponse.json(
      { error: "Failed to create payment order. Please try again." },
      { status: 500 }
    );
  }
}
