import { NextRequest, NextResponse } from "next/server";
import { connectDB }                 from "@/lib/db/connect";
import { Order }                     from "@/lib/db/models/Order";
import { validateCODOrder, COD_ADVANCE_INR } from "@/lib/razorpay/validation";
import { sendOrderConfirmation, sendAdminNotification } from "@/lib/email";

/**
 * POST /api/orders
 *
 * Creates a new order in MongoDB after payment is verified.
 * Called by the checkout flow once Razorpay payment is confirmed
 * (or after COD advance is verified).
 *
 * Body: {
 *   paymentMethod:      "razorpay" | "paypal" | "cod"
 *   razorpayOrderId?:   string
 *   razorpayPaymentId?: string
 *   items:              Array<{ productId, name, emoji, price, quantity, customization? }>
 *   shippingAddress:    { fullName, email, phone, address, landmark?, city, state, pincode }
 *   subtotal:           number
 *   shippingCharge:     number
 *   total:              number
 * }
 */
export async function POST(req: NextRequest) {
  try {
    let body: Record<string, unknown>;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const {
      paymentMethod,
      razorpayOrderId,
      razorpayPaymentId,
      items,
      shippingAddress,
      subtotal,
      shippingCharge,
      total,
    } = body;

    // ── Validate required fields ──────────────────────────────────────────────
    if (!["razorpay", "paypal", "cod"].includes(paymentMethod as string)) {
      return NextResponse.json({ error: "Invalid paymentMethod" }, { status: 400 });
    }
    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "items must be a non-empty array" }, { status: 400 });
    }
    if (!shippingAddress || typeof shippingAddress !== "object") {
      return NextResponse.json({ error: "shippingAddress is required" }, { status: 400 });
    }
    if (typeof total !== "number" || total <= 0) {
      return NextResponse.json({ error: "total must be a positive number" }, { status: 400 });
    }

    // ── COD-specific validation ───────────────────────────────────────────────
    const isCOD = paymentMethod === "cod";
    if (isCOD) {
      const codCheck = validateCODOrder(total);
      if (!codCheck.ok) {
        return NextResponse.json({ error: codCheck.error }, { status: 400 });
      }
      if (typeof razorpayOrderId !== "string" || !razorpayOrderId.startsWith("order_")) {
        return NextResponse.json({ error: "COD requires a valid razorpayOrderId for the advance" }, { status: 400 });
      }
    }

    // ── Razorpay-specific validation ──────────────────────────────────────────
    if (paymentMethod === "razorpay") {
      if (typeof razorpayOrderId !== "string" || !razorpayOrderId.startsWith("order_")) {
        return NextResponse.json({ error: "Invalid razorpayOrderId" }, { status: 400 });
      }
      if (typeof razorpayPaymentId !== "string" || !razorpayPaymentId.startsWith("pay_")) {
        return NextResponse.json({ error: "Invalid razorpayPaymentId" }, { status: 400 });
      }
    }

    await connectDB().catch(() => {
      throw new Error("DB_UNAVAILABLE");
    });

    // ── Idempotency: prevent duplicate orders for same Razorpay order ─────────
    if (razorpayOrderId) {
      const existing = await Order.findOne({ razorpayOrderId }).lean();
      if (existing) {
        return NextResponse.json(
          { success: true, orderId: existing.orderId, duplicate: true },
          { status: 200 }
        );
      }
    }

    // ── Create order ──────────────────────────────────────────────────────────
    const order = await Order.create({
      paymentMethod,
      razorpayOrderId:   razorpayOrderId ?? undefined,
      razorpayPaymentId: razorpayPaymentId ?? undefined,
      isCOD,
      codAdvancePaid:     isCOD ? COD_ADVANCE_INR : 0,
      codRemainingAmount: isCOD ? (total as number) - COD_ADVANCE_INR : 0,
      items,
      shippingAddress,
      subtotal:       subtotal as number,
      shippingCharge: (shippingCharge as number) ?? 0,
      total:          total as number,
      status:         "confirmed",
      trackingEvents: [
        {
          status:      "confirmed",
          description: "Order placed and payment confirmed.",
          location:    "Online",
          timestamp:   new Date(),
        },
      ],
    });

    console.log("[orders] Created:", order.orderId);

    // Send email notifications (non-blocking)
    const orderObj = order.toObject();
    sendOrderConfirmation(orderObj).catch(console.error);
    sendAdminNotification(orderObj).catch(console.error);

    return NextResponse.json(
      { success: true, orderId: order.orderId },
      { status: 201 }
    );
  } catch (error) {
    console.error("[orders POST]", error);
    if (error instanceof Error && error.message === "DB_UNAVAILABLE") {
      return NextResponse.json(
        { success: false, error: "Database not configured yet. Please try again later." },
        { status: 503 }
      );
    }
    return NextResponse.json(
      { error: "Failed to create order. Please contact support." },
      { status: 500 }
    );
  }
}
