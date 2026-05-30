import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connect";
import { Coupon } from "@/lib/db/models/Coupon";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId") || "";

    if (!userId) {
      return NextResponse.json({ coupon: null });
    }

    // Find user's welcome coupon (signup coupon)
    const coupon = await Coupon.findOne({
      couponType: "signup",
      isActive: true,
      startDate: { $lte: new Date() },
      $or: [
        { expiryDate: null },
        { expiryDate: { $gte: new Date() } },
      ],
      // Check if this coupon was created for this user (code contains user ID)
      code: new RegExp(`WELCOME.*${userId.slice(-6)}`, "i"),
    }).lean();

    if (coupon) {
      return NextResponse.json({
        coupon: {
          code: coupon.code,
          discountType: coupon.discountType,
          discountValue: coupon.discountValue,
          description: coupon.description,
          minOrderValue: coupon.minOrderValue,
          isUsed: coupon.usageCount > 0,
        },
      });
    }

    // Fallback: get any active signup coupon
    const genericCoupon = await Coupon.findOne({
      couponType: "signup",
      isActive: true,
      startDate: { $lte: new Date() },
      $or: [
        { expiryDate: null },
        { expiryDate: { $gte: new Date() } },
      ],
    }).lean();

    return NextResponse.json({
      coupon: genericCoupon
        ? {
            code: genericCoupon.code,
            discountType: genericCoupon.discountType,
            discountValue: genericCoupon.discountValue,
            description: genericCoupon.description,
            minOrderValue: genericCoupon.minOrderValue,
            isUsed: genericCoupon.usageCount > 0,
          }
        : null,
    });
  } catch (error) {
    console.error("Error fetching user coupon:", error);
    return NextResponse.json({ coupon: null });
  }
}
