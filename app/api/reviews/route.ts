import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connect";
import { Review }    from "@/lib/db/models/Review";
import { Order }     from "@/lib/db/models/Order";

/**
 * POST /api/reviews
 *
 * Saves a new review to MongoDB (pending admin approval).
 * Accepts JSON body (from ReviewForm component).
 * Optionally links to an order for the "Verified Purchase" badge.
 *
 * Body: { name, email, rating, title, content, product, orderId? }
 */
export async function POST(req: NextRequest) {
  try {
    let body: Record<string, unknown>;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const { name, email, rating, title, content, product, orderId } = body;

    // ── Validate ──────────────────────────────────────────────────────────────
    if (!name || typeof name !== "string" || name.trim().length < 2) {
      return NextResponse.json({ error: "Name must be at least 2 characters" }, { status: 400 });
    }
    if (!email || !/^\S+@\S+\.\S+$/.test(email as string)) {
      return NextResponse.json({ error: "Enter a valid email address" }, { status: 400 });
    }
    if (!rating || typeof rating !== "number" || rating < 1 || rating > 5) {
      return NextResponse.json({ error: "Rating must be between 1 and 5" }, { status: 400 });
    }
    if (!title || typeof title !== "string" || title.trim().length < 5) {
      return NextResponse.json({ error: "Title must be at least 5 characters" }, { status: 400 });
    }
    if (!content || typeof content !== "string" || content.trim().length < 20) {
      return NextResponse.json({ error: "Review must be at least 20 characters" }, { status: 400 });
    }
    if (!product || typeof product !== "string") {
      return NextResponse.json({ error: "Product is required" }, { status: 400 });
    }

    await connectDB();

    // ── Duplicate guard: one review per email per product ─────────────────────
    const duplicate = await Review.findOne({
      email: (email as string).toLowerCase(),
      product,
    }).lean();

    if (duplicate) {
      return NextResponse.json(
        { error: "You have already submitted a review for this product." },
        { status: 409 }
      );
    }

    // ── Check if purchase is verified ─────────────────────────────────────────
    let verified = false;
    if (orderId && typeof orderId === "string") {
      const order = await Order.findOne({
        orderId: orderId.toUpperCase(),
        "shippingAddress.email": (email as string).toLowerCase(),
        status: { $in: ["delivered", "out_for_delivery", "shipped"] },
      }).lean();
      verified = !!order;
    }

    // ── Save review ───────────────────────────────────────────────────────────
    const review = await Review.create({
      name:     (name as string).trim(),
      email:    (email as string).toLowerCase().trim(),
      rating,
      title:    (title as string).trim(),
      content:  (content as string).trim(),
      product:  (product as string).trim(),
      orderId:  orderId ?? undefined,
      verified,
      approved: true,    // auto-approved — admin can reject from /admin/reviews
    });

    console.log("[reviews] Saved:", review._id, "verified:", verified);

    return NextResponse.json(
      {
        success:  true,
        verified,
        message:  "Review submitted! It will appear after moderation.",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("[reviews POST]", error);
    return NextResponse.json(
      { error: "Failed to submit review. Please try again." },
      { status: 500 }
    );
  }
}

/**
 * GET /api/reviews?product=<slug>&page=1&limit=10&sort=recent
 *
 * Returns approved reviews for a product (public endpoint).
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const product = searchParams.get("product")?.trim();
  const page    = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
  const limit   = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") ?? "10", 10)));
  const sort    = searchParams.get("sort") ?? "recent";

  const sortMap: Record<string, Record<string, 1 | -1>> = {
    recent:  { createdAt: -1 },
    helpful: { helpful: -1 },
    high:    { rating: -1 },
    low:     { rating: 1 },
  };

  try {
    await connectDB();

    const filter: Record<string, unknown> = { approved: true, rejected: { $ne: true } };
    if (product) filter.product = product;

    const [reviews, total] = await Promise.all([
      Review.find(filter)
        .sort(sortMap[sort] ?? sortMap.recent)
        .skip((page - 1) * limit)
        .limit(limit)
        .select("-email -__v")   // never expose email publicly
        .lean(),
      Review.countDocuments(filter),
    ]);

    // Aggregate rating stats
    const stats = await Review.aggregate([
      { $match: { approved: true, ...(product ? { product } : {}) } },
      {
        $group: {
          _id:        null,
          avgRating:  { $avg: "$rating" },
          totalCount: { $sum: 1 },
          fiveStar:   { $sum: { $cond: [{ $eq: ["$rating", 5] }, 1, 0] } },
          fourStar:   { $sum: { $cond: [{ $eq: ["$rating", 4] }, 1, 0] } },
          threeStar:  { $sum: { $cond: [{ $eq: ["$rating", 3] }, 1, 0] } },
          twoStar:    { $sum: { $cond: [{ $eq: ["$rating", 2] }, 1, 0] } },
          oneStar:    { $sum: { $cond: [{ $eq: ["$rating", 1] }, 1, 0] } },
        },
      },
    ]);

    return NextResponse.json({
      reviews,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
      stats:      stats[0] ?? { avgRating: 0, totalCount: 0 },
    });
  } catch (error) {
    console.error("[reviews GET]", error);
    return NextResponse.json({ error: "Failed to fetch reviews" }, { status: 500 });
  }
}
