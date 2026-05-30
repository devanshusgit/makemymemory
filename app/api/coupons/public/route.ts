import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connect";
import { Coupon } from "@/lib/db/models/Coupon";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    // Fetch all active public coupons (general + combo types)
    const coupons = await Coupon.find({
      isActive: true,
      couponType: { $in: ["general", "combo"] },
      startDate: { $lte: new Date() },
      $or: [
        { expiryDate: null },
        { expiryDate: { $gte: new Date() } },
      ],
    })
      .select("code description discountType discountValue")
      .limit(10)
      .lean();

    console.log("Public coupons fetched:", coupons.length);

    return NextResponse.json({
      success: true,
      coupons: coupons.map((c: any) => ({
        code: c.code,
        description: c.description,
        discountType: c.discountType,
        discountValue: c.discountValue,
        badge: c.discountType === "percentage" 
          ? `${c.discountValue}% OFF` 
          : `₹${c.discountValue} OFF`,
      })),
    });
  } catch (error) {
    console.error("Error fetching public coupons:", error);
    return NextResponse.json(
      { success: false, coupons: [] },
      { status: 500 }
    );
  }
}
