import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connect";
import { Order } from "@/lib/db/models/Order";
import Settings from "@/lib/db/models/Settings";
import { sendEmail } from "@/lib/email/resend";
import {
  orderProcessingEmail,
  orderShippedEmail,
  orderDeliveredEmail,
  orderCancelledEmail,
} from "@/lib/email/templates";

export const dynamic = "force-dynamic";

export async function PUT(req: NextRequest) {
  try {
    const cookieStore = cookies();
    const session = cookieStore.get("admin_session");

    if (!session?.value) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const body = await req.json();
    const { orderId, status, trackingId, courierName, courierTrackingUrl, reason } = body;

    // Validate inputs
    if (!orderId || !status) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const validStatuses = ["confirmed", "processing", "shipped", "out_for_delivery", "delivered", "cancelled", "payment_failed"];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    // Find order
    const order = await Order.findOne({ orderId });
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const oldStatus = order.status;

    // Update order status
    order.status = status;

    // Add tracking event
    order.trackingEvents.push({
      status,
      description: getStatusDescription(status),
      timestamp: new Date(),
    });

    // Update tracking info if provided
    if (trackingId) order.courierTrackingId = trackingId;
    if (courierName) order.courierName = courierName;
    if (courierTrackingUrl) order.courierTrackingUrl = courierTrackingUrl;

    await order.save();

    // Check if notifications are enabled
    const settings = await Settings.findOne({});
    const notificationsEnabled = settings?.orderNotifications !== false;

    // Send email notification if enabled
    if (notificationsEnabled) {
      const customerEmail = order.shippingAddress.email;
      const customerName = order.shippingAddress.fullName;

      let emailSubject = "";
      let emailHtml = "";

      switch (status) {
        case "processing":
          emailSubject = "Your Order is Being Prepared";
          emailHtml = orderProcessingEmail({
            orderId: order.orderId,
            customerName,
            total: order.total,
            items: order.items,
            shippingAddress: order.shippingAddress,
          });
          break;

        case "shipped":
          emailSubject = "Your Order is On Its Way!";
          emailHtml = orderShippedEmail(
            {
              orderId: order.orderId,
              customerName,
              total: order.total,
              items: order.items,
              shippingAddress: order.shippingAddress,
            },
            trackingId || "N/A",
            courierName || "Standard Shipping"
          );
          break;

        case "out_for_delivery":
          emailSubject = "Your Order is Out for Delivery";
          emailHtml = orderShippedEmail(
            {
              orderId: order.orderId,
              customerName,
              total: order.total,
              items: order.items,
              shippingAddress: order.shippingAddress,
            },
            trackingId || "N/A",
            courierName || "Standard Shipping"
          );
          break;

        case "delivered":
          emailSubject = "Your Order Has Been Delivered!";
          emailHtml = orderDeliveredEmail({
            orderId: order.orderId,
            customerName,
            total: order.total,
            items: order.items,
            shippingAddress: order.shippingAddress,
          });
          break;

        case "cancelled":
          emailSubject = "Your Order Has Been Cancelled";
          emailHtml = orderCancelledEmail(
            {
              orderId: order.orderId,
              customerName,
              total: order.total,
              items: order.items,
              shippingAddress: order.shippingAddress,
            },
            reason || "Order cancelled by admin"
          );
          break;

        case "payment_failed":
          emailSubject = "Payment Failed - Please Retry";
          emailHtml = orderCancelledEmail(
            {
              orderId: order.orderId,
              customerName,
              total: order.total,
              items: order.items,
              shippingAddress: order.shippingAddress,
            },
            "Payment processing failed. Please try again."
          );
          break;
      }

      // Send email
      if (emailSubject && emailHtml) {
        try {
          await sendEmail({
            to: customerEmail,
            subject: emailSubject,
            html: emailHtml,
          });
        } catch (emailError) {
          console.error("Failed to send email:", emailError);
          // Don't fail the request if email fails
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: `Order status updated to ${status}`,
      order: {
        orderId: order.orderId,
        status: order.status,
        trackingEvents: order.trackingEvents,
      },
    });
  } catch (error) {
    console.error("Error updating order status:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

function getStatusDescription(status: string): string {
  const descriptions: Record<string, string> = {
    confirmed: "Order confirmed and payment received",
    processing: "Order is being prepared",
    shipped: "Order has been shipped",
    out_for_delivery: "Order is out for delivery",
    delivered: "Order has been delivered",
    cancelled: "Order has been cancelled",
    payment_failed: "Payment failed",
  };
  return descriptions[status] || "Order status updated";
}
