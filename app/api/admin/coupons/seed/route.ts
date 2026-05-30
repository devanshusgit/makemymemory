import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connect";
import { Coupon } from "@/lib/db/models/Coupon";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    // Clear existing coupons
    await Coupon.deleteMany({});

    // Create test coupons
    const testCoupons = [
      {
        code: "WELCOME10",
        discountType: "percentage",
        discountValue: 10,
        description: "10% off on your first order",
        applicableCategories: [],
        minOrderValue: 0,
        maxUsagePerUser: 1,
        maxTotalUsage: 100,
        couponType: "general",
        isActive: true,
        startDate: new Date("2024-01-01"),
        expiryDate: new Date("2026-12-31"),
      },
      {
        code: "SAVE50",
        discountType: "fixed",
        discountValue: 50,
        description: "Flat ₹50 off on orders above ₹500",
        applicableCategories: [],
        minOrderValue: 500,
        maxUsagePerUser: 0, // unlimited
        maxTotalUsage: 0, // unlimited
        couponType: "general",
        isActive: true,
        startDate: new Date("2024-01-01"),
        expiryDate: new Date("2026-12-31"),
      },
      {
        code: "SUMMER20",
        discountType: "percentage",
        discountValue: 20,
        description: "20% off on all items",
        applicableCategories: [],
        minOrderValue: 0,
        maxUsagePerUser: 0, // unlimited
        maxTotalUsage: 0, // unlimited
        couponType: "general",
        isActive: true,
        startDate: new Date("2024-01-01"),
        expiryDate: new Date("2026-12-31"),
      },
      {
        code: "FLAT100",
        discountType: "fixed",
        discountValue: 100,
        description: "Flat ₹100 off on orders above ₹1000",
        applicableCategories: [],
        minOrderValue: 1000,
        maxUsagePerUser: 0, // unlimited
        maxTotalUsage: 0, // unlimited
        couponType: "general",
        isActive: true,
        startDate: new Date("2024-01-01"),
        expiryDate: new Date("2026-12-31"),
      },
    ];

    const created = await Coupon.insertMany(testCoupons);

    console.log("Test coupons created:", created);

    return NextResponse.json({
      success: true,
      message: `Created ${created.length} test coupons`,
      coupons: created,
    });
  } catch (error) {
    console.error("Error seeding coupons:", error);
    return NextResponse.json(
      { success: false, error: "Failed to seed coupons", details: String(error) },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const coupons = await Coupon.find({});

    console.log("All coupons in database:", coupons);

    return NextResponse.json({
      success: true,
      count: coupons.length,
      coupons,
    });
  } catch (error) {
    console.error("Error fetching coupons:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch coupons", details: String(error) },
      { status: 500 }
    );
  }
}
