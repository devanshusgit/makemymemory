import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connect";
import { Order } from "@/lib/db/models/Order";
import { sendOrderNotification } from "@/lib/notifications/notificationService";

/**
 * PATCH /api/admin/orders/update-status
 * Update order status with state machine validation
 */
export async function PATCH(req: NextRequest) {
  try {
    const { orderId, status } = await req.json();

    if (!orderId || !status) {
      return NextResponse.json(
        { error: "orderId and status are required" },
        { status: 400 }
      );
    }

    // Valid order statuses
    const validStatuses = [
      "confirmed",
      "processing",
      "shipped",
      "out_for_delivery",
      "delivered",
      "cancelled",
      "payment_failed",
    ];

    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: `Invalid status. Must be one of: ${validStatuses.join(", ")}` },
        { status: 400 }
      );
    }

    await connectDB();
    const order = await Order.findOne({ orderId });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // State machine validation - prevent invalid transitions
    const validTransitions: Record<string, string[]> = {
      confirmed: ["processing", "cancelled", "payment_failed"],
      processing: ["shipped", "cancelled"],
      shipped: ["out_for_delivery", "cancelled"],
      out_for_delivery: ["delivered", "cancelled"],
      delivered: [], // Final state
      cancelled: [], // Final state
      payment_failed: ["confirmed", "cancelled"], // Can retry or cancel
    };

    const currentStatus = order.status;
    if (!validTransitions[currentStatus]?.includes(status)) {
      return NextResponse.json(
        {
          error: `Cannot transition from ${currentStatus} to ${status}. Valid transitions: ${validTransitions[currentStatus]?.join(", ") || "none"}`,
        },
        { status: 400 }
      );
    }

    // Update order status
    order.status = status as any;
    order.trackingEvents.push({
      status,
      description: getStatusDescription(status),
      location: "Online",
      timestamp: new Date(),
    });

    await order.save();

    // Send notification email to customer
    try {
      await sendOrderNotification(
        order.shippingAddress.email,
        order.orderId,
        status,
        {
          trackingId: order.courierTrackingId,
          estimatedDelivery: order.estimatedDelivery,
        }
      );
    } catch (emailErr) {
      // Don't fail if email fails
    }

    return NextResponse.json({
      success: true,
      message: `Order status updated to ${status}`,
      order: order.toObject(),
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update order status" },
      { status: 500 }
    );
  }
}

function getStatusDescription(status: string): string {
  const descriptions: Record<string, string> = {
    confirmed: "Order confirmed and payment verified",
    processing: "Order is being prepared for shipment",
    shipped: "Order has been dispatched",
    out_for_delivery: "Order is out for delivery today",
    delivered: "Order has been delivered",
    cancelled: "Order has been cancelled",
    payment_failed: "Payment verification failed",
  };
  return descriptions[status] || "Order status updated";
}
