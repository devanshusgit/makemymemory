import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connect";
import { ProductOption } from "@/lib/db/models/ProductOption";

// GET — public endpoint to list all options in a group
export async function GET(req: NextRequest) {
  try {
    const group = req.nextUrl.searchParams.get("group");
    if (!group) return NextResponse.json({ error: "group is required" }, { status: 400 });

    await connectDB();
    const options = await ProductOption.find({ group }).sort({ sortOrder: 1, createdAt: 1 }).lean();
    return NextResponse.json({ options: JSON.parse(JSON.stringify(options)) });
  } catch {
    return NextResponse.json({ error: "Failed to fetch options" }, { status: 500 });
  }
}
