import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connect";
import { parseSession } from "@/lib/auth/session";
import { rateLimit } from "@/lib/middleware/rateLimit";
import {
  applyEdit, assertEditable, loadOwnedOrder, notifyEdit, OrderEditError, quoteEdit,
  refundDifference, startEditPayment,
} from "@/lib/orders/editOrder";

/**
 * POST /api/user/orders/[id]/edit/start
 * Body: { items, shippingAddress }
 *
 * Re-prices the change here rather than trusting the quote the browser saw,
 * then either opens a Razorpay payment for the difference (the edit is
 * applied in /confirm once it is paid) or applies the edit straight away and
 * refunds anything owed.
 */
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    if (!rateLimit(`order-edit:${String(params.id).toUpperCase()}`, 20, 60 * 60 * 1000)) {
      return NextResponse.json({ error: "Too many attempts. Please try again in a while." }, { status: 429 });
    }
    const body = await req.json().catch(() => null);
    if (!body) return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    await connectDB();
    const session = parseSession(req.cookies.get("user_session")?.value);
    const order = await loadOwnedOrder(session, params.id);
    assertEditable(order);
    const quote = await quoteEdit(order, body, session!);

    if (quote.action === "pay") {
      const razorpayOrder = await startEditPayment(order, quote);
      return NextResponse.json({
        needsPayment: true,
        quote,
        razorpay: razorpayOrder,
        prefill: {
          name: order.shippingAddress.fullName,
          email: order.shippingAddress.email,
          contact: `+91${order.shippingAddress.phone}`,
        },
      });
    }

    const updated = await applyEdit(order, quote);
    let refund = { refunded: 0, short: 0 };
    if (quote.action === "refund") refund = await refundDifference(updated, -quote.difference);
    await notifyEdit(updated, quote, { refunded: refund.refunded, refundShort: refund.short });

    return NextResponse.json({ done: true, quote, refunded: refund.refunded, refundShort: refund.short });
  } catch (e) {
    if (e instanceof OrderEditError) return NextResponse.json({ error: e.message }, { status: e.status });
    console.error("[order-edit start]", e);
    return NextResponse.json({ error: "Could not update your order. Please try again." }, { status: 500 });
  }
}
