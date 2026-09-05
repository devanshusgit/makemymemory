import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connect";
import { Order }     from "@/lib/db/models/Order";
import { confirmCapturedPayment } from "@/lib/razorpay/confirm";
import { applyCouponToOrder } from "@/lib/coupon/couponUtils";
import { quoteCheckout, CheckoutPricingError } from "@/lib/coupon/checkout";
import { validateOrderInventory, updateInventoryOnOrderConfirm } from "@/lib/inventory/inventoryUtils";
import { sendEmail, sendOrderConfirmationEmail, ADMIN_EMAIL, adminNewOrderEmail } from "@/lib/email/resend";

/**
 * POST /api/orders
 * Creates a confirmed online order only after independently verifying the
 * signature and captured payment. COD advance orders use /api/payment/cod.
 */
export async function POST(req: NextRequest) {
  try {
    let body: any;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const {
      paymentMethod,
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
      items,
      shippingAddress,
      subtotal,
      shippingCharge,
      total,
      couponCode,
      offerCodes,
      userId,
    } = body;

    // ── Validate required fields ──────────────────────────────────────────────
    if (paymentMethod !== "razorpay") {
      return NextResponse.json({ error: "Invalid paymentMethod" }, { status: 400 });
    }
    if (typeof razorpayOrderId !== "string" || !razorpayOrderId.startsWith("order_")) {
      return NextResponse.json({ error: "Invalid razorpayOrderId" }, { status: 400 });
    }
    if (typeof razorpayPaymentId !== "string" || !razorpayPaymentId.startsWith("pay_")) {
      return NextResponse.json({ error: "Invalid razorpayPaymentId" }, { status: 400 });
    }
    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "items must be a non-empty array" }, { status: 400 });
    }
    if (!shippingAddress || typeof shippingAddress !== "object") {
      return NextResponse.json({ error: "shippingAddress is required" }, { status: 400 });
    }
    if (typeof total !== "number" || !Number.isFinite(total) || total <= 0) {
      return NextResponse.json({ error: "total must be a positive number" }, { status: 400 });
    }

    const paymentCheck = await confirmCapturedPayment({
      orderId: razorpayOrderId, paymentId: razorpayPaymentId,
      signature: razorpaySignature, amountINR: total,
    });
    if (!paymentCheck.ok) {
      return NextResponse.json(
        { success: false, error: paymentCheck.error }, { status: paymentCheck.status }
      );
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

    // ── Idempotency: prevent duplicate orders for the same Razorpay order ────
    const existing = await Order.findOne({ razorpayOrderId }).lean();
    if (existing) {
      return NextResponse.json(
        { success: true, orderId: (existing as any).orderId, duplicate: true },
        { status: 200 }
      );
    }

    const quote = await quoteCheckout({ subtotal, shippingCharge, items, paymentMethod, couponCode, offerCodes, userId });
    if (Math.round(total * 100) !== Math.round(quote.total * 100)) throw new CheckoutPricingError("Order total does not match the selected offers");

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

    // ── Create order (payment already verified) ───────────────────────────────
    const order = await Order.create({
      paymentMethod:      "razorpay",
      razorpayOrderId,
      razorpayPaymentId,
      isCOD:               false,
      codAdvancePaid:      0,
      codRemainingAmount:  0,
      items:               normalisedItems,
      shippingAddress,
      subtotal:            typeof subtotal === "number" ? subtotal : total as number,
      shippingCharge:      typeof shippingCharge === "number" ? shippingCharge : 0,
      total:               quote.total,
      appliedCouponCode:   quote.appliedCouponCode,
      discountAmount:      quote.discountAmount,
      status:              "confirmed",
      trackingEvents: [
        {
          status:      "confirmed",
          description: "Order placed and payment confirmed via Razorpay.",
          location:    "Online",
          timestamp:   new Date(),
        },
      ],
      // ── Dual-delivery system ─────────────────────────────────────────────
      // deliveries[0] = Kit dispatch (raw materials sent to customer first)
      // deliveries[1] = Final product dispatch (personalised product ships after)
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
        await applyCouponToOrder(couponCode, userId);
      } catch (couponErr) {
        // Don't fail the order if coupon application fails
      }
    }

    // Update inventory now that the order is confirmed
    try {
      await updateInventoryOnOrderConfirm(order.orderId);
    } catch (inventoryErr) {
      console.error("[orders] Inventory update failed:", inventoryErr);
    }

    // ── Emails (non-blocking) ───────────────────────────────────────────────
    const orderObj = order.toObject();
    const customerEmail = orderObj.shippingAddress?.email;
    const customerName  = orderObj.shippingAddress?.fullName || "Valued Customer";

    if (customerEmail) {
      try {
        const confirmResult = await sendOrderConfirmationEmail({
          orderId:         orderObj.orderId,
          email:           customerEmail,
          customerName,
          items:           orderObj.items,
          total:           orderObj.total,
          shippingAddress: orderObj.shippingAddress,
        });
        if (!confirmResult.success) {
          console.error("❌ Failed to send order confirmation email:", confirmResult.error);
        }
      } catch (err) {
        console.error("❌ Error sending order confirmation email:", err);
      }
    }

    if (ADMIN_EMAIL) {
      try {
        const adminResult = await sendEmail({
          to: ADMIN_EMAIL,
          subject: `🛍️ New Order: ${orderObj.orderId} — ₹${orderObj.total?.toLocaleString("en-IN")}`,
          html: adminNewOrderEmail({
            orderId:         orderObj.orderId,
            customerName,
            email:           customerEmail,
            phone:           orderObj.shippingAddress?.phone,
            items:           orderObj.items,
            total:           orderObj.total,
            shippingAddress: orderObj.shippingAddress,
          }),
        });
        if (!adminResult.success) {
          console.error("❌ Failed to send admin notification:", adminResult.error);
        }
      } catch (err) {
        console.error("❌ Error sending admin notification:", err);
      }
    }

    return NextResponse.json({ success: true, orderId: order.orderId }, { status: 201 });

  } catch (error: any) {
    if (error instanceof CheckoutPricingError) return NextResponse.json({ success: false, error: error.message }, { status: 400 });
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
