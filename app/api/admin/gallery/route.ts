import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connect";
import { GalleryItem } from "@/lib/db/models/GalleryItem";

function isAdmin(req: NextRequest) {
  return req.cookies.get("admin_session")?.value === process.env.ADMIN_PASSWORD;
}

// GET — list all gallery items ordered by sortOrder
export async function GET(req: NextRequest) {
  if (!isAdmin(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    await connectDB();
    const items = await GalleryItem.find().sort({ sortOrder: 1, createdAt: -1 }).lean();
    return NextResponse.json({ items: JSON.parse(JSON.stringify(items)) });
  } catch {
    return NextResponse.json({ error: "Failed to fetch gallery items" }, { status: 500 });
  }
}

// POST — add a new gallery item
export async function POST(req: NextRequest) {
  if (!isAdmin(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const body = await req.json();
    const { url, type, alt, tall, sortOrder } = body;

    if (!url || !type) {
      return NextResponse.json({ error: "url and type are required" }, { status: 400 });
    }

    await connectDB();

    // Default sortOrder to end of list
    const count = await GalleryItem.countDocuments();
    const item = await GalleryItem.create({
      url,
      type,
      alt:       alt       ?? "",
      tall:      tall      ?? false,
      sortOrder: sortOrder ?? count,
    });

    return NextResponse.json({ item: JSON.parse(JSON.stringify(item)) }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message ?? "Failed to create item" }, { status: 500 });
  }
}
