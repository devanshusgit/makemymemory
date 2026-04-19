import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connect";
import { Order } from "@/lib/db/models/Order";

export async function GET(req: NextRequest) {
  const session = req.cookies.get("user_session")?.value;
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let email: string;
  try {
    email = JSON.parse(session).email;
    if (!email) throw new Error();
  } catch {
    return NextResponse.json({ error: "Invalid session" }, { status: 401 });
  }

  try {
    await connectDB();
    const orders = await Order.find({ "shippingAddress.email": email.toLowerCase() })
      .sort({ createdAt: -1 })
      .lean();
    return NextResponse.json({ orders: JSON.parse(JSON.stringify(orders)) });
  } catch {
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 });
  }
}
