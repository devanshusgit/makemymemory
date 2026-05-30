import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connect";
import { validateAndApplyCoupon } from "@/lib/coupon/couponUtils";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();
    const { couponCode, userId, subtotal, items } = body;

    console.log("Coupon validation request:", { couponCode, userId, subtotal, items });

    if (!couponCode || !userId || !subtotal || !items) {
      console.log("Missing required fields:", { couponCode, userId, subtotal, items });
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const result = await validateAndApplyCoupon({
      couponCode,
      userId,
      subtotal,
      items,
    });

    console.log("Coupon validation result:", result);

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error validating coupon:", error);
    return NextResponse.json(
      { valid: false, discount: 0, message: "Error validating coupon" },
      { status: 500 }
    );
  }
}
