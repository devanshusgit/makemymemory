import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connect";
import { Review } from "@/lib/db/models/Review";

function isAdmin(req: NextRequest) {
  return req.cookies.get("admin_session")?.value === process.env.ADMIN_PASSWORD;
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    if (!isAdmin(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { action } = await req.json();
    try { await connectDB(); } catch {
      return NextResponse.json({ error: "Database not configured" }, { status: 503 });
    }
    if (action === "approve") {
      await Review.findByIdAndUpdate(params.id, { approved: true, rejected: false });
    } else if (action === "reject") {
      await Review.findByIdAndUpdate(params.id, { approved: false, rejected: true });
    }
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to update review" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    if (!isAdmin(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    try { await connectDB(); } catch {
      return NextResponse.json({ error: "Database not configured" }, { status: 503 });
    }
    await Review.findByIdAndDelete(params.id);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete review" }, { status: 500 });
  }
}
