import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connect";
import { Coupon } from "@/lib/db/models/Coupon";
import { RETIRED_WELCOME_FILTER } from "@/lib/coupon/retired";

export const dynamic = "force-dynamic";

/**
 * GET /api/coupons/my-coupon
 *
 * The signup offer checkout suggests, if there is one: an active "signup"
 * coupon an admin has set up.
 *
 * It used to look first for the caller's own auto-generated ₹200 WELCOME
 * code, then fall back to ANY active signup coupon — and since every new
 * account had one, that fallback handed one customer's personal code to
 * whoever asked. Those codes are retired (lib/coupon/retired.ts) and are
 * never returned now. The userId parameter is no longer needed; it is
 * ignored.
 */
export async function GET() {
  try {
    await connectDB();
    const now = new Date();
    const coupon = await Coupon.findOne({
      ...RETIRED_WELCOME_FILTER,
      couponType: "signup",
      isActive: true,
      startDate: { $lte: now },
      $or: [{ expiryDate: null }, { expiryDate: { $gte: now } }],
    }).lean();

    return NextResponse.json({
      coupon: coupon
        ? {
            code: coupon.code,
            discountType: coupon.discountType,
            discountValue: coupon.discountValue,
            description: coupon.description,
            minOrderValue: coupon.minOrderValue,
            isUsed: (coupon.usageCount ?? 0) > 0,
          }
        : null,
    });
  } catch (error) {
    console.error("Error fetching signup coupon:", error);
    return NextResponse.json({ coupon: null });
  }
}
