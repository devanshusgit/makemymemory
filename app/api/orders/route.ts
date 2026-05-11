import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connect";
import { Order }     from "@/lib/db/models/Order";
import { sendOrderConfirmation, sendAdminNotification } from "@/lib/email";

/**
 * POST /api/orders
 * Creates a new order after payment is verified (Razorpay or PayPal).
 * COD orders go through /api/payment/cod instead.
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

    // ── Razorpay-specific validation ──────────────────────────────────────────
    if (paymentMethod === "razorpay") {
      if (typeof razorpayOrderId !== "string" || !razorpayOrderId.startsWith("order_")) {
        return NextResponse.json({ error: "Invalid razorpayOrderId" }, { status: 400 });
      }
      if (typeof razorpayPaymentId !== "string" || !razorpayPaymentId.startsWith("pay_")) {
        return NextResponse.json({ error: "Invalid razorpayPaymentId" }, { status: 400 });
      }
    }

    // ── Normalise items (support both cart and pre-normalised shapes) ─────────
    const normalisedItems = (items as any[]).map((item: any) => {
      if (item.productId) return item;
      const product = item.product ?? item;
      return {
        productId:     product.id ?? product._id ?? "unknown",
        name:          product.name ?? item.name ?? "Product",
        emoji:         "",
        price:         product.price ?? item.price ?? 0,
        quantity:      item.quantity ?? 1,
        customization: item.customization ?? "",
      };
    });

    // ── Connect DB ────────────────────────────────────────────────────────────
    try {
      await connectDB();
    } catch (dbErr) {
      console.error("[orders] DB connection failed:", dbErr);
      return NextResponse.json(
        { success: false, error: "Database not configured yet. Please try again later." },
        { status: 503 }
      );
    }

    // ── Idempotency: prevent duplicate orders ─────────────────────────────────
    if (razorpayOrderId) {
      const existing = await Order.findOne({ razorpayOrderId }).lean();
      if (existing) {
        return NextResponse.json(
          { success: true, orderId: (existing as any).orderId, duplicate: true },
          { status: 200 }
        );
      }
    }

    const isCOD = paymentMethod === "cod";

    // ── Create order ──────────────────────────────────────────────────────────
    const order = await Order.create({
      paymentMethod,
      razorpayOrderId:    razorpayOrderId   ?? undefined,
      razorpayPaymentId:  razorpayPaymentId ?? undefined,
      isCOD,
      codAdvancePaid:     0,
      codRemainingAmount: isCOD ? total as number : 0,
      items:              normalisedItems,
      shippingAddress,
      subtotal:           typeof subtotal === "number" ? subtotal : total as number,
      shippingCharge:     typeof shippingCharge === "number" ? shippingCharge : 0,
      total:              total as number,
      status:             "confirmed",
      trackingEvents: [
        {
          status:      "confirmed",
          description: isCOD
            ? "COD order placed. Our team will contact you before dispatch."
            : "Order placed and payment confirmed.",
          location:    "Online",
          timestamp:   new Date(),
        },
      ],
    });

    console.log("[orders] Created:", order.orderId);

    // EMAIL_DISABLED: Send emails (non-blocking)
    // const orderObj = order.toObject();
    // sendOrderConfirmation(orderObj).catch((e) => console.error("[orders] email error:", e));
    // sendAdminNotification(orderObj).catch((e) => console.error("[orders] admin email error:", e));

    return NextResponse.json({ success: true, orderId: order.orderId }, { status: 201 });

  } catch (error: any) {
    console.error("[orders POST] Error:", error?.message ?? error);
    if (error?.name === "ValidationError") {
      const fields = Object.keys(error.errors ?? {}).join(", ");
      return NextResponse.json(
        { error: `Validation failed: ${fields}. Please check your order details.` },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Failed to create order. Please contact support." },
      { status: 500 }
    );
  }
}
