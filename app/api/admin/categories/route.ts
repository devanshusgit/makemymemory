import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connect";
import { Category } from "@/lib/db/models/Category";

function isAdmin(req: NextRequest) {
  return req.cookies.get("admin_session")?.value === process.env.ADMIN_PASSWORD;
}

// GET — list all categories
export async function GET(req: NextRequest) {
  if (!isAdmin(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    await connectDB();
    const categories = await Category.find().sort({ sortOrder: 1, createdAt: 1 }).lean();
    return NextResponse.json({ categories: JSON.parse(JSON.stringify(categories)) });
  } catch {
    return NextResponse.json({ error: "Failed to fetch categories" }, { status: 500 });
  }
}

// POST — create a new category
export async function POST(req: NextRequest) {
  if (!isAdmin(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const body = await req.json();
    const { id, title, description } = body;

    if (!id || !title) {
      return NextResponse.json({ error: "id and title are required" }, { status: 400 });
    }

    await connectDB();

    // Check if category already exists
    const existing = await Category.findOne({ id });
    if (existing) {
      return NextResponse.json({ error: "Category with this ID already exists" }, { status: 400 });
    }

    // Default sortOrder to end of list
    const count = await Category.countDocuments();
    const category = await Category.create({
      id,
      title,
      description: description ?? "",
      sortOrder: count,
    });

    return NextResponse.json({ category: JSON.parse(JSON.stringify(category)) }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message ?? "Failed to create category" }, { status: 500 });
  }
}
