import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connect";
import { Coupon } from "@/lib/db/models/Coupon";
import { generateCouponCode, couponCodeExists } from "@/lib/coupon/couponUtils";

export const dynamic = "force-dynamic";

function isAdmin(req: NextRequest) {
  return req.cookies.get("admin_session")?.value === process.env.ADMIN_PASSWORD;
}

// GET - Fetch all coupons
export async function GET(req: NextRequest) {
  if (!isAdmin(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    await connectDB();
    const coupons = await Coupon.find().sort({ createdAt: -1 }).lean();
    return NextResponse.json({ coupons });
  } catch (error) {
    console.error("Error fetching coupons:", error);
    return NextResponse.json({ error: "Failed to fetch coupons" }, { status: 500 });
  }
}

// POST - Create new coupon
export async function POST(req: NextRequest) {
  if (!isAdmin(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    await connectDB();
    const body = await req.json();
    const {
      code,
      discountType,
      discountValue,
      description,
      applicableCategories,
      minOrderValue,
      maxUsagePerUser,
      maxTotalUsage,
      couponType,
      minCategoriesRequired,
      expiryDate,
    } = body;

    // Validate required fields
    if (!discountType || discountValue === undefined) {
      return NextResponse.json(
        { error: "Discount type and value are required" },
        { status: 400 }
      );
    }

    // Generate code if not provided
    let couponCode = code;
    if (!couponCode) {
      let isUnique = false;
      while (!isUnique) {
        couponCode = generateCouponCode();
        isUnique = !(await couponCodeExists(couponCode));
      }
    } else {
      // Check if code already exists
      if (await couponCodeExists(couponCode)) {
        return NextResponse.json(
          { error: "Coupon code already exists" },
          { status: 400 }
        );
      }
    }

    // Validate discount value
    if (discountType === "percentage" && (discountValue < 0 || discountValue > 100)) {
      return NextResponse.json(
        { error: "Percentage discount must be between 0 and 100" },
        { status: 400 }
      );
    }

    if (discountType === "fixed" && discountValue < 0) {
      return NextResponse.json(
        { error: "Fixed discount cannot be negative" },
        { status: 400 }
      );
    }

    const coupon = new Coupon({
      code: couponCode.toUpperCase(),
      discountType,
      discountValue,
      description,
      applicableCategories: applicableCategories || [],
      minOrderValue: minOrderValue || 0,
      maxUsagePerUser: maxUsagePerUser || 0,
      maxTotalUsage: maxTotalUsage || 0,
      couponType: couponType || "general",
      minCategoriesRequired: minCategoriesRequired || 2,
      expiryDate: expiryDate ? new Date(expiryDate) : undefined,
      isActive: true,
      startDate: new Date(),
    });

    await coupon.save();

    return NextResponse.json(
      { success: true, coupon, message: "Coupon created successfully" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating coupon:", error);
    return NextResponse.json({ error: "Failed to create coupon" }, { status: 500 });
  }
}
