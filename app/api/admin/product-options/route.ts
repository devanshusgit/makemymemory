import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connect";
import { ProductOption } from "@/lib/db/models/ProductOption";

export const dynamic = "force-dynamic";

function isAdmin(req: NextRequest) {
  return req.cookies.get("admin_session")?.value === process.env.ADMIN_PASSWORD;
}

// GET — list all options in a group
export async function GET(req: NextRequest) {
  if (!isAdmin(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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

// POST — create a new option within a group
export async function POST(req: NextRequest) {
  if (!isAdmin(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const body = await req.json();
    const { group, id, label, price, color } = body;

    if (!group || !id || !label) {
      return NextResponse.json({ error: "group, id and label are required" }, { status: 400 });
    }

    await connectDB();

    // Check if an option with this id already exists in this group
    const existing = await ProductOption.findOne({ group, id });
    if (existing) {
      return NextResponse.json({ error: "An option with this ID already exists in this group" }, { status: 400 });
    }

    // Default sortOrder to end of the group's list
    const count = await ProductOption.countDocuments({ group });
    const option = await ProductOption.create({
      group,
      id,
      label,
      price: price ?? 0,
      color: color ?? undefined,
      sortOrder: count,
    });

    return NextResponse.json({ option: JSON.parse(JSON.stringify(option)) }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message ?? "Failed to create option" }, { status: 500 });
  }
}
