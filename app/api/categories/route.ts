import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connect";
import { Category } from "@/lib/db/models/Category";

// GET — public endpoint to list all categories
export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const categories = await Category.find().sort({ sortOrder: 1, createdAt: 1 }).lean();
    return NextResponse.json({ categories: JSON.parse(JSON.stringify(categories)) });
  } catch {
    return NextResponse.json({ error: "Failed to fetch categories" }, { status: 500 });
  }
}
