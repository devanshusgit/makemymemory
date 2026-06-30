import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connect";
import { Review } from "@/lib/db/models/Review";

/**
 * POST /api/admin/reviews/moderate
 * Approve or reject a review
 */
export async function POST(req: NextRequest) {
  try {
    const { reviewId, action, reason } = await req.json();

    if (!reviewId || !action || !["approve", "reject"].includes(action)) {
      return NextResponse.json(
        { error: "Invalid reviewId or action (approve/reject)" },
        { status: 400 }
      );
    }

    await connectDB();

    const update = {
      approved: action === "approve",
      rejected: action === "reject",
      rejectionReason: action === "reject" ? reason : undefined,
    };

    const review = await Review.findByIdAndUpdate(reviewId, update, { new: true });

    if (!review) {
      return NextResponse.json({ error: "Review not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: `Review ${action}ed successfully`,
      review,
    });
  } catch (error) {
    return NextResponse.json({ error: "Failed to moderate review" }, { status: 500 });
  }
}
