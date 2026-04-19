import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connect";
import { Order }     from "@/lib/db/models/Order";
import { sendOrderConfirmation, sendAdminNotification } from "@/lib/email";

/**
 * POST /api/payment/cod
 * Creates a COD order directly — no advance payment required.
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

    // ── Validate ──────────────────────────────────────────────────────────────
    if (!shippingAddress || typeof shippingAddress !== "object") {
      return NextResponse.json({ error: "shippingAddress is required" }, { status: 400 });
    }
    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "items must be a non-empty array" }, { status: 400 });
    }
    if (typeof total !== "number" || total <= 0) {
      return NextResponse.json({ error: "total must be a positive number" }, { status: 400 });
    }

    // ── Normalise items from cart format → Order schema format ────────────────
    // Cart items have shape: { product: { id, name, emoji, price, slug }, quantity, customization }
    // Order schema expects:  { productId, name, emoji, price, quantity, customization }
    const normalisedItems = (items as any[]).map((item: any) => {
      // Support both pre-normalised and cart-context shapes
      if (item.productId) return item; // already normalised
      const product = item.product ?? item;
      return {
        productId:     product.id ?? product._id ?? "unknown",
        name:          product.name ?? item.name ?? "Product",
        emoji:         product.emoji ?? item.emoji ?? "🎁",
        price:         product.price ?? item.price ?? 0,
        quantity:      item.quantity ?? 1,
        customization: item.customization ?? "",
      };
    });

    // ── Connect DB ────────────────────────────────────────────────────────────
    try {
      await connectDB();
    } catch (dbErr) {
      console.error("[cod] DB connection failed:", dbErr);
      return NextResponse.json(
        { success: false, error: "Database not configured yet. Please try again later." },
        { status: 503 }
      );
    }

    // ── Create order ──────────────────────────────────────────────────────────
    const order = await Order.create({
      paymentMethod:      "cod",
      isCOD:              true,
      codAdvancePaid:     0,
      codRemainingAmount: total as number,
      items:              normalisedItems,
      shippingAddress,
      subtotal:           typeof subtotal === "number" ? subtotal : total as number,
      shippingCharge:     typeof shippingCharge === "number" ? shippingCharge : 0,
      total:              total as number,
      status:             "confirmed",
      trackingEvents: [
        {
          status:      "confirmed",
          description: "COD order placed. Our team will contact you for advance payment before dispatch.",
          location:    "Online",
          timestamp:   new Date(),
        },
      ],
    });

    console.log("[cod] Order created:", order.orderId);

    // Send emails (non-blocking — don't let email failure break the order)
    const orderObj = order.toObject();
    sendOrderConfirmation(orderObj).catch((e) => console.error("[cod] email error:", e));
    sendAdminNotification(orderObj).catch((e) => console.error("[cod] admin email error:", e));

    return NextResponse.json({ success: true, orderId: order.orderId }, { status: 201 });

  } catch (error: any) {
    console.error("[cod] Error:", error?.message ?? error);
    if (error?.name === "ValidationError") {
      const fields = Object.keys(error.errors ?? {}).join(", ");
      return NextResponse.json(
        { error: `Validation failed: ${fields}. Please check your order details.` },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Failed to place COD order. Please contact support." },
      { status: 500 }
    );
  }
}
