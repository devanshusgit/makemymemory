import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connect";
import { Review } from "@/lib/db/models/Review";

/**
 * GET /api/admin/reviews/pending
 * Get all pending reviews for moderation
 */
export async function GET(req: NextRequest) {
  try {
    const page = parseInt(req.nextUrl.searchParams.get("page") || "1");
    const limit = parseInt(req.nextUrl.searchParams.get("limit") || "20");
    const skip = (page - 1) * limit;

    await connectDB();

    const pendingReviews = await Review.find({
      $and: [
        { approved: { $ne: true } },
        { rejected: { $ne: true } },
      ],
    })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Review.countDocuments({
      $and: [
        { approved: { $ne: true } },
        { rejected: { $ne: true } },
      ],
    });

    return NextResponse.json({
      success: true,
      reviews: pendingReviews,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch pending reviews" }, { status: 500 });
  }
}
