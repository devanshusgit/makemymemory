import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connect";
import { parseSession } from "@/lib/auth/session";
import { assertEditable, loadOwnedOrder, OrderEditError, quoteEdit } from "@/lib/orders/editOrder";

/**
 * POST /api/user/orders/[id]/edit/quote
 * Body: { items, shippingAddress }
 *
 * Prices a proposed change without making it, so the customer sees the new
 * total and what they would pay or get back before confirming.
 */
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await req.json().catch(() => null);
    if (!body) return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    await connectDB();
    const session = parseSession(req.cookies.get("user_session")?.value);
    const order = await loadOwnedOrder(session, params.id);
    assertEditable(order);
    const quote = await quoteEdit(order, body, session!);
    return NextResponse.json({ quote });
  } catch (e) {
    if (e instanceof OrderEditError) return NextResponse.json({ error: e.message }, { status: e.status });
    console.error("[order-edit quote]", e);
    return NextResponse.json({ error: "Could not price these changes. Please try again." }, { status: 500 });
  }
}
