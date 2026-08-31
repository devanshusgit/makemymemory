import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connect";
import { Order } from "@/lib/db/models/Order";
import { updateInventoryOnOrderConfirm } from "@/lib/inventory/inventoryUtils";
import { sendOrderConfirmationEmail } from "@/lib/email/resend";

function isAdmin(req: NextRequest) {
  return req.cookies.get("admin_session")?.value === process.env.ADMIN_PASSWORD;
}

/**
 * POST /api/admin/orders/confirm-payment
 * Admin confirms a WhatsApp payment was received — moves the order from
 * "pending_payment" to "confirmed", reserves kit/final stock, and sends
 * the customer their order confirmation email. This is the point at which
 * the existing kit/final two-stage delivery pipeline actually starts.
 *
 * Body: { orderId }
 */
export async function POST(req: NextRequest) {
  if (!isAdmin(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { orderId } = await req.json();
    if (!orderId || typeof orderId !== "string") {
      return NextResponse.json({ error: "orderId is required" }, { status: 400 });
    }

    await connectDB();
    const order = await Order.findOne({ orderId: orderId.trim().toUpperCase() });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }
    if (order.status !== "pending_payment") {
      return NextResponse.json(
        { error: `Order is already "${order.status}" — cannot confirm payment again.` },
        { status: 400 }
      );
    }

    order.status = "confirmed";
    order.trackingEvents.push({
      status:      "confirmed",
      description: "Payment confirmed by admin.",
      location:    "Admin",
      timestamp:   new Date(),
    });
    await order.save();

    try {
      await updateInventoryOnOrderConfirm(order.orderId);
    } catch (inventoryErr) {
      // Don't fail if inventory update fails
    }

    const orderObj = order.toObject();
    const customerEmail = orderObj.shippingAddress?.email;
    if (customerEmail) {
      try {
        const result = await sendOrderConfirmationEmail({
          orderId:         orderObj.orderId,
          email:           customerEmail,
          customerName:    orderObj.shippingAddress?.fullName || "Valued Customer",
          items:           orderObj.items,
          total:           orderObj.total,
          shippingAddress: orderObj.shippingAddress,
        });
        if (!result.success) {
          console.error(`❌ Failed to send customer email:`, result.error);
        }
      } catch (err) {
        console.error(`❌ Error sending customer email:`, err);
      }
    }

    return NextResponse.json({
      success: true,
      order: { orderId: order.orderId, status: order.status },
    });
  } catch (error) {
    console.error("[confirm-payment] Error:", error);
    return NextResponse.json({ error: "Failed to confirm payment" }, { status: 500 });
  }
}
