import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connect";
import { Order }     from "@/lib/db/models/Order";
import { confirmCapturedPayment } from "@/lib/razorpay/confirm";
import { applyCouponToOrder } from "@/lib/coupon/couponUtils";
import { quoteCheckout, CheckoutPricingError } from "@/lib/coupon/checkout";
import { validateOrderInventory, updateInventoryOnOrderConfirm } from "@/lib/inventory/inventoryUtils";
import { validateCODOrder, COD_ADVANCE_INR } from "@/lib/razorpay/validation";
import { sendEmail, sendOrderConfirmationEmail, ADMIN_EMAIL, adminNewOrderEmail } from "@/lib/email/resend";
import { refundAfterFailedOrder } from "@/lib/razorpay/refund";

/**
 * POST /api/payment/cod
 * Creates a COD order after the ₹149 advance has been paid via Razorpay and
 * independently verified here, including capture status and advance amount.
 * The remaining balance is paid in cash on delivery.
 */
export async function POST(req: NextRequest) {
  // Set once the advance is confirmed captured; if the request fails after
  // that, the money must be given back rather than silently kept.
  let capturedAdvance = 0;
  let razorpayPaymentIdForRefund = "";
  try {
    let body: any;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const {
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
      shippingAddress,
      items,
      subtotal,
      shippingCharge,
      total,
      couponCode,
      offerCodes,
      userId,
    } = body;

    // ── Validate ──────────────────────────────────────────────────────────────
    if (typeof razorpayOrderId !== "string" || !razorpayOrderId.startsWith("order_")) {
      return NextResponse.json({ error: "Invalid razorpayOrderId — advance payment is required for COD" }, { status: 400 });
    }
    if (typeof razorpayPaymentId !== "string" || !razorpayPaymentId.startsWith("pay_")) {
      return NextResponse.json({ error: "Invalid razorpayPaymentId — advance payment is required for COD" }, { status: 400 });
    }
    razorpayPaymentIdForRefund = razorpayPaymentId;
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

    // Advance can't exceed the order total (e.g. a coupon brought the total
    // below ₹149) — cap it so codRemainingAmount never goes negative.
    const advancePaid = Math.min(COD_ADVANCE_INR, total as number);
    const remainingAmount = (total as number) - advancePaid;

    // Item prices come from quoteCheckout (server-side catalogue pricing),
    // never from the request body — see lib/checkout/priceCart.ts.

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

    // ── Idempotency: prevent duplicate orders for the same advance payment ────
    const existing = await Order.findOne({ razorpayOrderId }).lean();
    if (existing) {
      return NextResponse.json(
        { success: true, orderId: (existing as any).orderId, duplicate: true },
        { status: 200 }
      );
    }

    const quote = await quoteCheckout({ subtotal, shippingCharge, items, paymentMethod: "cod", couponCode, offerCodes, userId });
    if (Math.round(total * 100) !== Math.round(quote.total * 100)) throw new CheckoutPricingError("Order total does not match the selected offers");

    // ── Validate inventory ────────────────────────────────────────────────────
    const inventoryCheck = await validateOrderInventory(quote.lineItems);
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

    // ── Verify the advance LAST, so nothing below can reject an order the
    //    customer has already paid for. Anything that fails after this point
    //    refunds the advance (see the catch at the bottom).
    const paymentCheck = await confirmCapturedPayment({
      orderId: razorpayOrderId, paymentId: razorpayPaymentId,
      signature: razorpaySignature, amountINR: advancePaid,
    });
    if (!paymentCheck.ok) {
      return NextResponse.json(
        { success: false, error: paymentCheck.error }, { status: paymentCheck.status }
      );
    }
    capturedAdvance = advancePaid;

    // ── Create order ──────────────────────────────────────────────────────────
    const order = await Order.create({
      paymentMethod:      "cod",
      razorpayOrderId,
      razorpayPaymentId,
      isCOD:              true,
      codAdvancePaid:     advancePaid,
      codRemainingAmount: remainingAmount,
      items:              quote.lineItems,
      shippingAddress,
      subtotal:           quote.subtotal,
      shippingCharge:     typeof shippingCharge === "number" ? shippingCharge : 0,
      total:              quote.total,
      appliedCouponCode:  quote.appliedCouponCode,
      discountAmount:     quote.discountAmount,
      status:             "confirmed",
      trackingEvents: [
        {
          status:      "confirmed",
          description: `COD order placed. ₹${advancePaid.toLocaleString("en-IN")} advance paid online — ₹${remainingAmount.toLocaleString("en-IN")} due in cash on delivery.`,
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

    // ── Emails: awaited so a fast function exit can't drop them. Each send
    //    swallows its own errors, so a mail failure never fails the order. ──
    const orderObj = order.toObject();
    const customerEmail = orderObj.shippingAddress?.email;
    const customerName  = orderObj.shippingAddress?.fullName || "Valued Customer";

    if (customerEmail) {
      await sendOrderConfirmationEmail({
        orderId:         orderObj.orderId,
        email:           customerEmail,
        customerName,
        items:           orderObj.items,
        total:           orderObj.total,
        shippingAddress: orderObj.shippingAddress,
      }).catch((e) => console.error("[cod] customer email error:", e));
    }

    if (ADMIN_EMAIL) {
      await sendEmail({
        to: ADMIN_EMAIL,
        subject: `🛍️ New COD Order: ${orderObj.orderId} — ₹${advancePaid.toLocaleString("en-IN")} advance paid, ₹${remainingAmount.toLocaleString("en-IN")} on delivery`,
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

    return NextResponse.json(
      { success: true, orderId: order.orderId, advancePaid, remainingAmount },
      { status: 201 }
    );

  } catch (error: any) {
    // The advance was captured but no order exists — give the money back.
    if (capturedAdvance > 0 && razorpayPaymentIdForRefund) {
      await refundAfterFailedOrder({
        paymentId: razorpayPaymentIdForRefund,
        amountINR: capturedAdvance,
        reason: `COD order creation failed: ${error?.message ?? error}`,
        context: { route: "/api/payment/cod" },
      });
      return NextResponse.json(
        { success: false, error: "We couldn't place your order, so your ₹" + capturedAdvance + " advance is being refunded. Please try again or contact support." },
        { status: 500 }
      );
    }
    if (error instanceof CheckoutPricingError) return NextResponse.json({ success: false, error: error.message }, { status: 400 });
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
