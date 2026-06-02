import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connect";
import { Coupon } from "@/lib/db/models/Coupon";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    console.log("Starting coupon seed...");
    await connectDB();
    console.log("Database connected");

    // Check existing coupons
    const existingCount = await Coupon.countDocuments({});
    console.log("Existing coupons:", existingCount);

    // Clear existing coupons
    await Coupon.deleteMany({});
    console.log("Cleared existing coupons");

    // Create test coupons with explicit defaults
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
        usageCount: 0,
        usedByUsers: [],
      },
      {
        code: "COMBO20",
        discountType: "percentage",
        discountValue: 20,
        description: "20% off on all orders",
        applicableCategories: [],
        minOrderValue: 0,
        maxTotalUsage: 0,
        usageCount: 0,
        maxUsagePerUser: 0,
        usedByUsers: [],
        couponType: "general",
        isActive: true,
        startDate: new Date("2024-01-01"),
        expiryDate: null,
      },
      {
        code: "SAVE50",
        discountType: "fixed",
        discountValue: 50,
        description: "Flat ₹50 off on orders above ₹500",
        applicableCategories: [],
        minOrderValue: 500,
        maxUsagePerUser: 0,
        maxTotalUsage: 0,
        couponType: "general",
        isActive: true,
        startDate: new Date("2024-01-01"),
        expiryDate: new Date("2026-12-31"),
        usageCount: 0,
        usedByUsers: [],
      },
      {
        code: "SUMMER20",
        discountType: "percentage",
        discountValue: 20,
        description: "20% off on all items",
        applicableCategories: [],
        minOrderValue: 0,
        maxUsagePerUser: 0,
        maxTotalUsage: 0,
        couponType: "general",
        isActive: true,
        startDate: new Date("2024-01-01"),
        expiryDate: new Date("2026-12-31"),
        usageCount: 0,
        usedByUsers: [],
      },
      {
        code: "FLAT100",
        discountType: "fixed",
        discountValue: 100,
        description: "Flat ₹100 off on orders above ₹1000",
        applicableCategories: [],
        minOrderValue: 1000,
        maxUsagePerUser: 0,
        maxTotalUsage: 0,
        couponType: "general",
        isActive: true,
        startDate: new Date("2024-01-01"),
        expiryDate: new Date("2026-12-31"),
        usageCount: 0,
        usedByUsers: [],
      },
    ];

    const created = await Coupon.insertMany(testCoupons);
    console.log("Test coupons created:", created.length);

    return NextResponse.json({
      success: true,
      message: `Created ${created.length} test coupons`,
      coupons: created.map((c: any) => ({
        code: c.code,
        discountType: c.discountType,
        discountValue: c.discountValue,
        description: c.description,
        minOrderValue: c.minOrderValue,
        isActive: c.isActive,
      })),
    });
  } catch (error) {
    console.error("Error seeding coupons:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: "Failed to seed coupons", 
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    console.log("Fetching coupons...");
    await connectDB();
    console.log("Database connected");

    const coupons = await Coupon.find({}).lean();
    console.log("Found coupons:", coupons.length);

    return NextResponse.json({
      success: true,
      count: coupons.length,
      coupons: coupons.map((c: any) => ({
        code: c.code,
        discountType: c.discountType,
        discountValue: c.discountValue,
        description: c.description,
        minOrderValue: c.minOrderValue,
        isActive: c.isActive,
        startDate: c.startDate,
        expiryDate: c.expiryDate,
      })),
    });
  } catch (error) {
    console.error("Error fetching coupons:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: "Failed to fetch coupons", 
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
