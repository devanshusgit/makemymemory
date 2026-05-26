import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connect";
import { Review } from "@/lib/db/models/Review";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const adminSession = req.cookies.get("admin_session")?.value;
    if (adminSession !== process.env.ADMIN_PASSWORD) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    try { await connectDB(); } catch {
      return NextResponse.json({ error: "Database not configured" }, { status: 503 });
    }
    const reviews = await Review.find().sort({ createdAt: -1 }).lean();
    return NextResponse.json({ reviews });
  } catch {
    return NextResponse.json({ error: "Failed to fetch reviews" }, { status: 500 });
  }
}
