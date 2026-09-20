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
    // An empty collection is a legitimate 200 — the gallery really is empty.
    return NextResponse.json({ items: JSON.parse(JSON.stringify(items)) });
  } catch (error) {
    console.error("[gallery GET]", error);
    // Answering 200 with an empty list made a dead database indistinguishable
    // from an empty gallery, so the outage was invisible and got cached.
    return NextResponse.json(
      { error: "Gallery temporarily unavailable" },
      { status: 503 }
    );
  }
}
