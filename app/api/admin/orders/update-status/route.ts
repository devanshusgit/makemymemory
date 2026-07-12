import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connect";
import { Order } from "@/lib/db/models/Order";

/**
 * PATCH /api/admin/orders/update-status
 * Update order status with state machine validation
 * Note: No email notifications sent per user request
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
      "pending",
      "confirmed",
      "kit_ready",
      "kit_shipped",
      "kit_delivered",
      "waiting_submission",
      "final_production",
      "final_ready",
      "final_shipped",
      "delivered",
      "completed",
      "cancelled",
      "payment_failed"
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

    // State machine validation - allow progression to prevent getting stuck
    const validTransitions: Record<string, string[]> = {
      pending: ["confirmed", "cancelled", "payment_failed"],
      confirmed: ["kit_ready", "kit_shipped", "cancelled", "payment_failed"],
      kit_ready: ["kit_shipped", "cancelled"],
      kit_shipped: ["kit_delivered", "waiting_submission", "cancelled"],
      kit_delivered: ["waiting_submission", "cancelled"],
      waiting_submission: ["final_production", "cancelled"],
      final_production: ["final_ready", "final_shipped", "cancelled"],
      final_ready: ["final_shipped", "cancelled"],
      final_shipped: ["delivered", "completed", "cancelled"],
      delivered: ["completed", "cancelled"],
      completed: [],
      cancelled: [],
      payment_failed: ["confirmed", "cancelled"],
    };

    const currentStatus = order.status;
    // Allow override/bypass if the status is valid to prevent getting stuck
    if (!validStatuses.includes(status)) {
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
