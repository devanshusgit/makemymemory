import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connect";
import { Order } from "@/lib/db/models/Order";
import { sendOrderNotification } from "@/lib/notifications/notificationService";

/**
 * POST /api/admin/orders/collect-cod-payment
 * Mark COD payment as collected
 * 
 * Body: { orderId, amountReceived }
 */
function isAdmin(req: NextRequest) {
  return req.cookies.get("admin_session")?.value === process.env.ADMIN_PASSWORD;
}

export async function POST(req: NextRequest) {
  if (!isAdmin(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const { orderId, amountReceived } = await req.json();

    if (!orderId || typeof amountReceived !== "number") {
      return NextResponse.json(
        { error: "orderId and amountReceived are required" },
        { status: 400 }
      );
    }

    await connectDB();
    const order = await Order.findOne({ orderId });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    if (order.paymentMethod !== "cod") {
      return NextResponse.json(
        { error: "This order is not a COD order" },
        { status: 400 }
      );
    }

    if (amountReceived < 0) {
      return NextResponse.json(
        { error: "Amount received cannot be negative" },
        { status: 400 }
      );
    }

    if (amountReceived > order.total) {
      return NextResponse.json(
        { error: `Amount cannot exceed order total (₹${order.total})` },
        { status: 400 }
      );
    }

    // Update payment details
    order.codAdvancePaid = (order.codAdvancePaid || 0) + amountReceived;
    order.codRemainingAmount = Math.max(0, order.total - order.codAdvancePaid);

    // Add tracking event
    order.trackingEvents.push({
      status: "confirmed",
      description: `COD payment received: ₹${amountReceived}. ${
        order.codRemainingAmount > 0
          ? `Remaining: ₹${order.codRemainingAmount}`
          : "Full payment collected"
      }`,
      location: "Warehouse",
      timestamp: new Date(),
    });

    // If full payment collected, mark as confirmed
    if (order.codRemainingAmount === 0 && order.status === "pending") {
      order.status = "confirmed";
    }

    await order.save();

    // Send notification to customer
    try {
      await sendOrderNotification(
        order.shippingAddress.email,
        order.orderId,
        "confirmed",
        {
          amountReceived,
          remainingAmount: order.codRemainingAmount,
        }
      );
    } catch (emailErr) {
      // Don't fail if email fails
    }

    return NextResponse.json({
      success: true,
      message: `Payment of ₹${amountReceived} recorded successfully`,
      order: {
        orderId: order.orderId,
        total: order.total,
        codAdvancePaid: order.codAdvancePaid,
        codRemainingAmount: order.codRemainingAmount,
        status: order.status,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to record COD payment" },
      { status: 500 }
    );
  }
}
