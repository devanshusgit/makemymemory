import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connect";
import { Coupon } from "@/lib/db/models/Coupon";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const subtotal = parseFloat(searchParams.get("subtotal") || "0");
    const userId = searchParams.get("userId") || "";

    // Fetch all active coupons that are applicable
    const coupons = await Coupon.find({
      isActive: true,
      startDate: { $lte: new Date() },
      $or: [
        { expiryDate: null },
        { expiryDate: { $gte: new Date() } },
      ],
    })
      .select("code description discountType discountValue minOrderValue applicableCategories")
      .limit(5)
      .lean();

    // Filter coupons based on minimum order value
    const availableCoupons = coupons.filter((coupon: any) => {
      if (coupon.minOrderValue && subtotal < coupon.minOrderValue) {
        return false;
      }
      return true;
    });

    return NextResponse.json({
      coupons: availableCoupons,
    });
  } catch (error) {
    console.error("Error fetching available coupons:", error);
    return NextResponse.json(
      { error: "Failed to fetch coupons", coupons: [] },
      { status: 500 }
    );
  }
}
