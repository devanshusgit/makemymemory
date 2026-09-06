import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connect";
import { Order } from "@/lib/db/models/Order";
import { parseSession } from "@/lib/auth/session";

export async function GET(req: NextRequest) {
  const session = parseSession(req.cookies.get("user_session")?.value);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Match orders by whichever contact channel the account has — checkout
  // always collects both email and phone regardless of how the account
  // itself was signed up, so a phone-only account still finds its orders.
  const contactMatch = [
    session.email ? { "shippingAddress.email": session.email.toLowerCase() } : null,
    session.phone ? { "shippingAddress.phone": session.phone } : null,
  ].filter(Boolean) as Record<string, unknown>[];
  if (contactMatch.length === 0) {
    return NextResponse.json({ error: "Invalid session" }, { status: 401 });
  }

  try {
    await connectDB();
    const orders = await Order.find({ $or: contactMatch })
      .sort({ createdAt: -1 })
      .lean();
    return NextResponse.json({ orders: JSON.parse(JSON.stringify(orders)) });
  } catch {
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 });
  }
}
