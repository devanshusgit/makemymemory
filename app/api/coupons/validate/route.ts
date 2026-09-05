import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connect";
import { validateAndApplyCoupon, ensureDefaultCoupons } from "@/lib/coupon/couponUtils";
import { calculateOffers, CHECKOUT_OFFERS, type CheckoutOffer } from "@/lib/coupon/offers";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { couponCode, userId, subtotal, items, offerCodes, paymentMethod } = body;
    if (offerCodes !== undefined) {
      try {
        if (!Array.isArray(items) || !items.length || items.some(item => !item || !Number.isSafeInteger(item.quantity) || item.quantity < 1)) throw new Error("Invalid product quantity");
        const result = calculateOffers({ subtotal, itemCount: items.reduce((sum, item) => sum + item.quantity, 0), paymentMethod, offerCodes, couponCode });
        return NextResponse.json({ valid: true, ...result });
      } catch (error) {
        return NextResponse.json({ valid: false, discount: 0, message: error instanceof Error ? error.message : "Invalid offer" }, { status: 400 });
      }
    }
    if (CHECKOUT_OFFERS.includes(String(couponCode).trim().toUpperCase() as CheckoutOffer)) {
      return NextResponse.json({ valid: false, discount: 0, message: "Choose this offer using Apply Offer", couponCode: "" }, { status: 400 });
    }

    if (!couponCode || !userId || !subtotal || !items) {
      return NextResponse.json(
        { valid: false, discount: 0, message: "Missing required fields", couponCode: "" },
        { status: 400 }
      );
    }

    await connectDB();
    await ensureDefaultCoupons();

    const result = await validateAndApplyCoupon({
      couponCode,
      userId,
      subtotal,
      items,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error validating coupon:", error);
    return NextResponse.json(
      { valid: false, discount: 0, message: "Error validating coupon", couponCode: "" },
      { status: 500 }
    );
  }
}
