import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connect";
import { Order }     from "@/lib/db/models/Order";
import { applyCouponToOrder } from "@/lib/coupon/couponUtils";
import { validateOrderInventory, updateInventoryOnOrderConfirm } from "@/lib/inventory/inventoryUtils";
import { validateCODOrder } from "@/lib/razorpay/validation";
import { sendEmail, sendOrderConfirmationEmail, ADMIN_EMAIL, adminNewOrderEmail } from "@/lib/email/resend";

/**
 * POST /api/payment/cod
 * Creates a COD order directly — no advance payment required.
 */
export async function POST(req: NextRequest) {
  try {
    let body: any;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const { shippingAddress, items, subtotal, shippingCharge, total, couponCode, userId } = body;

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
    const codCheck = validateCODOrder(total);
    if (!codCheck.ok) {
      return NextResponse.json({ error: codCheck.error }, { status: 400 });
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
      console.error("[cod] DB connection failed:", dbErr);
      return NextResponse.json(
        { success: false, error: "Database not configured yet. Please try again later." },
        { status: 503 }
      );
    }

    // ── Validate inventory ────────────────────────────────────────────────────
    const inventoryCheck = await validateOrderInventory(normalisedItems);
    if (!inventoryCheck.valid) {
      return NextResponse.json(
        {
          success: false,
          error: "Some items are out of stock",
          unavailableItems: inventoryCheck.unavailableItems,
        },
        { status: 400 }
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
      appliedCouponCode:  couponCode ? couponCode.toUpperCase() : undefined,
      status:             "confirmed",
      trackingEvents: [
        {
          status:      "confirmed",
          description: "COD order placed. Pay the full amount in cash when your order arrives.",
          location:    "Online",
          timestamp:   new Date(),
        },
      ],
      deliveries: [
        {
          deliveryType:   "kit",
          status:         "pending",
          trackingEvents: [
            {
              status:      "pending",
              description: "Kit delivery is being prepared. We will dispatch your materials kit shortly.",
              location:    "Warehouse",
              timestamp:   new Date(),
            },
          ],
        },
        {
          deliveryType:   "final",
          status:         "pending",
          trackingEvents: [
            {
              status:      "pending",
              description: "Final product delivery will be dispatched once your kit has been processed.",
              location:    "Workshop",
              timestamp:   new Date(),
            },
          ],
        },
      ],
    });

    // Apply coupon if provided
    if (couponCode && userId) {
      try {
        await applyCouponToOrder(couponCode, userId as string);
      } catch (couponErr) {
        // Don't fail the order if coupon application fails
      }
    }

    // Update inventory now that the order is confirmed
    try {
      await updateInventoryOnOrderConfirm(order.orderId);
    } catch (inventoryErr) {
      console.error("[cod] Inventory update failed:", inventoryErr);
    }

    // ── Emails (non-blocking) ───────────────────────────────────────────────
    const orderObj = order.toObject();
    const customerEmail = orderObj.shippingAddress?.email;
    const customerName  = orderObj.shippingAddress?.fullName || "Valued Customer";

    if (customerEmail) {
      sendOrderConfirmationEmail({
        orderId:         orderObj.orderId,
        email:           customerEmail,
        customerName,
        items:           orderObj.items,
        total:           orderObj.total,
        shippingAddress: orderObj.shippingAddress,
      }).catch((e) => console.error("[cod] customer email error:", e));
    }

    if (ADMIN_EMAIL) {
      sendEmail({
        to: ADMIN_EMAIL,
        subject: `🛍️ New COD Order: ${orderObj.orderId} — ₹${orderObj.total?.toLocaleString("en-IN")}`,
        html: adminNewOrderEmail({
          orderId:         orderObj.orderId,
          customerName,
          email:           customerEmail,
          phone:           orderObj.shippingAddress?.phone,
          items:           orderObj.items,
          total:           orderObj.total,
          shippingAddress: orderObj.shippingAddress,
        }),
      }).catch((e) => console.error("[cod] admin email error:", e));
    }

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
