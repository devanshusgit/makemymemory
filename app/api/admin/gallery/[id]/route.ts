import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connect";
import { GalleryItem } from "@/lib/db/models/GalleryItem";
import { isAdminRequest } from "@/lib/auth/admin";

export const dynamic = "force-dynamic";

// PATCH — update alt, tall, sortOrder
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  if (!isAdminRequest(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const body = await req.json();
    await connectDB();
    const item = await GalleryItem.findByIdAndUpdate(
      params.id,
      { $set: body },
      { new: true }
    ).lean();
    if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ item: JSON.parse(JSON.stringify(item)) });
  } catch (err: any) {
    return NextResponse.json({ error: err.message ?? "Failed to update" }, { status: 500 });
  }
}

// DELETE — remove a gallery item
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  if (!isAdminRequest(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    await connectDB();
    await GalleryItem.findByIdAndDelete(params.id);
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message ?? "Failed to delete" }, { status: 500 });
  }
}
