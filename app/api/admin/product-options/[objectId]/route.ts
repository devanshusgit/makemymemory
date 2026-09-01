import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connect";
import { ProductOption } from "@/lib/db/models/ProductOption";

export const dynamic = "force-dynamic";

function isAdmin(req: NextRequest) {
  return req.cookies.get("admin_session")?.value === process.env.ADMIN_PASSWORD;
}

// PATCH — update an option
export async function PATCH(req: NextRequest, { params }: { params: { objectId: string } }) {
  if (!isAdmin(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const body = await req.json();
    const { label, price, meta } = body;

    await connectDB();
    const option = await ProductOption.findByIdAndUpdate(
      params.objectId,
      { $set: { label, price, meta } },
      { new: true }
    ).lean();
    if (!option) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ option: JSON.parse(JSON.stringify(option)) });
  } catch (err: any) {
    return NextResponse.json({ error: err.message ?? "Failed to update" }, { status: 500 });
  }
}

// DELETE — remove an option
export async function DELETE(req: NextRequest, { params }: { params: { objectId: string } }) {
  if (!isAdmin(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    await connectDB();
    await ProductOption.findByIdAndDelete(params.objectId);
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message ?? "Failed to delete" }, { status: 500 });
  }
}
