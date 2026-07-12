import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connect";
import { Review } from "@/lib/db/models/Review";

/**
 * POST /api/reviews/moderate
 * Admin endpoint to approve/reject reviews
 * 
 * Body: { reviewId, action, reason? }
 * - action: "approve" | "reject"
 * - reason: Optional reason for rejection
 */
export async function POST(req: NextRequest) {
  try {
    const { reviewId, action, reason } = await req.json();

    if (!reviewId || !["approve", "reject"].includes(action)) {
      return NextResponse.json(
        { error: "reviewId and action are required" },
        { status: 400 }
      );
    }

    await connectDB();
    const review = await Review.findById(reviewId);

    if (!review) {
      return NextResponse.json({ error: "Review not found" }, { status: 404 });
    }

    if (action === "approve") {
      review.approved = true;
      review.rejected = false;
    } else {
      review.approved = false;
      review.rejected = true;
    }

    await review.save();

    return NextResponse.json({
      success: true,
      message: `Review ${action}d successfully`,
      review: review.toObject(),
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to moderate review" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/reviews/moderate
 * Get pending reviews for moderation
 */
export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const pendingReviews = await Review.find({
      isApproved: false,
      rejectionReason: { $exists: false },
    })
      .sort({ createdAt: -1 })
      .limit(50);

    return NextResponse.json({
      success: true,
      reviews: pendingReviews,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch pending reviews" },
      { status: 500 }
    );
  }
}
