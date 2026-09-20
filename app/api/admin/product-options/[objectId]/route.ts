import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connect";
import { ProductOption } from "@/lib/db/models/ProductOption";
import { isAdminRequest } from "@/lib/auth/admin";

export const dynamic = "force-dynamic";

// PATCH — update an option
export async function PATCH(req: NextRequest, { params }: { params: { objectId: string } }) {
  if (!isAdminRequest(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const body = await req.json();
    const { label, price, meta, image } = body;

    await connectDB();
    const option = await ProductOption.findByIdAndUpdate(
      params.objectId,
      { $set: { label, price, meta, image } },
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
  if (!isAdminRequest(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    await connectDB();
    await ProductOption.findByIdAndDelete(params.objectId);
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message ?? "Failed to delete" }, { status: 500 });
  }
}
