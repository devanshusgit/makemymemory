import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connect";
import { Product } from "@/lib/db/models/Product";
import { isAdminRequest } from "@/lib/auth/admin";

export const dynamic = "force-dynamic";

// POST — bulk update sortOrder for all products
// Body: { ids: string[] }  — ordered array of product IDs
export async function POST(req: NextRequest) {
  if (!isAdminRequest(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const { ids } = await req.json() as { ids: string[] };
    if (!Array.isArray(ids)) return NextResponse.json({ error: "ids must be an array" }, { status: 400 });

    await connectDB();
    await Promise.all(
      ids.map((id, index) => Product.findByIdAndUpdate(id, { sortOrder: index }))
    );
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message ?? "Failed to reorder" }, { status: 500 });
  }
}
