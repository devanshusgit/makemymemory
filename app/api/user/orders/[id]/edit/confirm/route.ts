import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connect";
import { parseSession } from "@/lib/auth/session";
import { confirmEditPayment, loadOwnedOrder, notifyEdit, OrderEditError } from "@/lib/orders/editOrder";

/**
 * POST /api/user/orders/[id]/edit/confirm
 * Body: { razorpayOrderId, razorpayPaymentId, razorpaySignature }
 *
 * Verifies the difference was paid and applies the waiting edit. Safe to call
 * twice for the same payment. If the edit can no longer be applied, the
 * payment is refunded and the error says so.
 */
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await req.json().catch(() => null);
    if (!body) return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    await connectDB();
    const session = parseSession(req.cookies.get("user_session")?.value);
    // Ownership only — the edit window is re-checked inside confirmEditPayment,
    // which refunds instead of refusing if it has closed during payment.
    const order = await loadOwnedOrder(session, params.id);
    const quote = order.pendingEdit?.quote;
    const result = await confirmEditPayment(order, body);
    if (!result.alreadyApplied && quote) await notifyEdit(result.order, quote, { paid: quote.difference });
    return NextResponse.json({ done: true });
  } catch (e) {
    if (e instanceof OrderEditError) return NextResponse.json({ error: e.message }, { status: e.status });
    console.error("[order-edit confirm]", e);
    return NextResponse.json(
      { error: "Your payment went through but we couldn't confirm the change. Please contact support with your order ID." },
      { status: 500 },
    );
  }
}
