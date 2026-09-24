import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connect";
import { Review } from "@/lib/db/models/Review";
import { isAdminRequest } from "@/lib/auth/admin";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    // The shared constant-time check, which also refuses when ADMIN_PASSWORD is
    // unset (a raw compare would then let a request with no cookie through).
    if (!isAdminRequest(req)) {
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
