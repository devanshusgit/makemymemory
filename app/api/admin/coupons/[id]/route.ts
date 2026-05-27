import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connect";
import { Coupon } from "@/lib/db/models/Coupon";
import { Types } from "mongoose";

export const dynamic = "force-dynamic";

function isAdmin(req: NextRequest) {
  return req.cookies.get("admin_session")?.value === process.env.ADMIN_PASSWORD;
}

// PATCH - Update coupon
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  if (!isAdmin(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    await connectDB();
    const body = await req.json();
    const {
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
      isActive,
    } = body;

    // Validate discount value if provided
    if (discountValue !== undefined) {
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
    }

    const update: Record<string, any> = {};
    if (discountType !== undefined) update.discountType = discountType;
    if (discountValue !== undefined) update.discountValue = discountValue;
    if (description !== undefined) update.description = description;
    if (applicableCategories !== undefined) update.applicableCategories = applicableCategories;
    if (minOrderValue !== undefined) update.minOrderValue = minOrderValue;
    if (maxUsagePerUser !== undefined) update.maxUsagePerUser = maxUsagePerUser;
    if (maxTotalUsage !== undefined) update.maxTotalUsage = maxTotalUsage;
    if (couponType !== undefined) update.couponType = couponType;
    if (minCategoriesRequired !== undefined) update.minCategoriesRequired = minCategoriesRequired;
    if (expiryDate !== undefined) update.expiryDate = expiryDate ? new Date(expiryDate) : null;
    if (isActive !== undefined) update.isActive = isActive;

    const coupon = await Coupon.findByIdAndUpdate(
      new Types.ObjectId(params.id),
      update,
      { new: true }
    );

    if (!coupon) {
      return NextResponse.json({ error: "Coupon not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, coupon });
  } catch (error) {
    console.error("Error updating coupon:", error);
    return NextResponse.json({ error: "Failed to update coupon" }, { status: 500 });
  }
}

// DELETE - Delete coupon
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  if (!isAdmin(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    await connectDB();

    const coupon = await Coupon.findByIdAndDelete(new Types.ObjectId(params.id));

    if (!coupon) {
      return NextResponse.json({ error: "Coupon not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Coupon deleted successfully" });
  } catch (error) {
    console.error("Error deleting coupon:", error);
    return NextResponse.json({ error: "Failed to delete coupon" }, { status: 500 });
  }
}
