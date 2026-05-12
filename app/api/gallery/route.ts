import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connect";
import { GalleryItem } from "@/lib/db/models/GalleryItem";

// Public endpoint — no auth required
export async function GET() {
  try {
    await connectDB();
    const items = await GalleryItem.find()
      .sort({ sortOrder: 1, createdAt: -1 })
      .lean();
    return NextResponse.json({ items: JSON.parse(JSON.stringify(items)) });
  } catch {
    return NextResponse.json({ items: [] });
  }
}
