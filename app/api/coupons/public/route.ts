import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connect";
import { Coupon } from "@/lib/db/models/Coupon";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    // Fetch all active, non-expired coupons (public view - only code + description)
    const coupons = await Coupon.find({
      isActive: true,
      startDate: { $lte: new Date() },
      $or: [
        { expiryDate: null },
        { expiryDate: { $gte: new Date() } },
      ],
    })
      .select("code description discountType discountValue minOrderValue")
      .limit(10)
      .lean();

    console.log("Public coupons fetched:", coupons.length);

    return NextResponse.json({
      coupons: coupons.map((coupon: any) => {
        const badge = coupon.discountType === "percentage" 
          ? `${coupon.discountValue}% OFF` 
          : `₹${coupon.discountValue} OFF`;
        
        return {
          code: coupon.code,
          description: coupon.description || badge,
          discountType: coupon.discountType,
          discountValue: coupon.discountValue,
          minOrderValue: coupon.minOrderValue || 0,
          badge: badge,
        };
      }),
    });
  } catch (error) {
    console.error("Error fetching public coupons:", error);
    return NextResponse.json(
      { coupons: [] },
      { status: 500 }
    );
  }
}
