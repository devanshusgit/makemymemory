import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connect";
import { Order }     from "@/lib/db/models/Order";
import { sendOrderConfirmation, sendAdminNotification } from "@/lib/email";

/**
 * POST /api/payment/cod
 *
 * Creates a COD order directly — no advance payment required.
 * Our team will collect ₹150 advance via UPI/call before dispatch.
 */
export async function POST(req: NextRequest) {
  try {
    let body: Record<string, unknown>;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const { shippingAddress, items, subtotal, shippingCharge, total } = body;

    if (!shippingAddress || typeof shippingAddress !== "object") {
      return NextResponse.json({ error: "shippingAddress is required" }, { status: 400 });
    }
    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "items must be a non-empty array" }, { status: 400 });
    }
    if (typeof total !== "number" || total <= 0) {
      return NextResponse.json({ error: "total must be a positive number" }, { status: 400 });
    }

    await connectDB().catch(() => { throw new Error("DB_UNAVAILABLE"); });

    const order = await Order.create({
      paymentMethod:      "cod",
      isCOD:              true,
      codAdvancePaid:     0,
      codRemainingAmount: total as number,
      items,
      shippingAddress,
      subtotal:       subtotal as number,
      shippingCharge: (shippingCharge as number) ?? 0,
      total:          total as number,
      status:         "confirmed",
      trackingEvents: [
        {
          status:      "confirmed",
          description: "COD order placed. Our team will contact you for ₹150 advance before dispatch.",
          location:    "Online",
          timestamp:   new Date(),
        },
      ],
    });

    console.log("[cod] Order created:", order.orderId);

    // Send email notifications (non-blocking)
    const orderObj = order.toObject();
    sendOrderConfirmation(orderObj).catch(console.error);
    sendAdminNotification(orderObj).catch(console.error);

    return NextResponse.json({ success: true, orderId: order.orderId }, { status: 201 });
  } catch (error) {
    console.error("[cod]", error);
    if (error instanceof Error && error.message === "DB_UNAVAILABLE") {
      return NextResponse.json(
        { success: false, error: "Database not configured yet. Please try again later." },
        { status: 503 }
      );
    }
    return NextResponse.json(
      { error: "Failed to place COD order. Please contact support." },
      { status: 500 }
    );
  }
}
