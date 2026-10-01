import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connect";
import { User } from "@/lib/db/models/User";
import { isAdminRequest } from "@/lib/auth/admin";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  if (!isAdminRequest(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    await connectDB();
    const raw = await User.find().sort({ createdAt: -1 })
      .select("name email phone createdAt savedCart savedCartUpdatedAt").lean();
    // Send a short summary of each saved cart, not the full product objects.
    const users = raw.map(({ savedCart, ...u }: any) => {
      const lines = (Array.isArray(savedCart) ? savedCart : []).map((i: any) => {
        const unit = (Number(i?.product?.price) || 0) + (Number(i?.surcharges?.total) || 0);
        const qty = Number(i?.quantity) || 1;
        return {
          name: String(i?.product?.name ?? "Product"),
          slug: String(i?.product?.slug ?? ""),
          quantity: qty,
          options: (Array.isArray(i?.selections) ? i.selections : []).map((s: any) => s?.label).filter(Boolean).join(", "),
          lineTotal: unit * qty,
        };
      });
      return {
        ...u,
        cart: lines,
        cartTotal: lines.reduce((sum: number, l: { lineTotal: number }) => sum + l.lineTotal, 0),
      };
    });
    return NextResponse.json({ users });
  } catch {
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
  }
}
