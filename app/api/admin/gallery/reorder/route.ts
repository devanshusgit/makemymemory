import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connect";
import { GalleryItem } from "@/lib/db/models/GalleryItem";

export const dynamic = "force-dynamic";

function isAdmin(req: NextRequest) {
  return req.cookies.get("admin_session")?.value === process.env.ADMIN_PASSWORD;
}

// POST — bulk update sortOrder for all gallery items
// Body: { ids: string[] }  — ordered array of item IDs
export async function POST(req: NextRequest) {
  if (!isAdmin(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const { ids } = await req.json() as { ids: string[] };
    if (!Array.isArray(ids)) return NextResponse.json({ error: "ids must be an array" }, { status: 400 });

    await connectDB();
    await Promise.all(
      ids.map((id, index) => GalleryItem.findByIdAndUpdate(id, { sortOrder: index }))
    );
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message ?? "Failed to reorder" }, { status: 500 });
  }
}
