import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connect";
import { Order } from "@/lib/db/models/Order";
import { sendOrderNotification } from "@/lib/notifications/notificationService";
import { timingSafeEqual } from "crypto";

/**
 * Delhivery does not sign its callbacks, so the URL is protected with a shared
 * token instead. Without this, anyone who knows an AWB number could move an
 * order to "delivered" and trigger customer emails.
 */
function hasValidWebhookToken(req: NextRequest): boolean {
  const expected = process.env.DELHIVERY_WEBHOOK_SECRET;
  if (!expected) return false;
  const provided = req.headers.get("x-delhivery-token") ?? new URL(req.url).searchParams.get("token") ?? "";
  const a = Buffer.from(provided);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

/**
 * POST /api/delhivery/webhook
 * Receives tracking updates pushed by Delhivery.
 */
export async function POST(req: NextRequest) {
  // Never fail open on a route that writes orders and emails customers.
  if (!process.env.DELHIVERY_WEBHOOK_SECRET) {
    console.error("[Delhivery Webhook] DELHIVERY_WEBHOOK_SECRET is not set — rejecting callback");
    return NextResponse.json({ error: "Webhook not configured" }, { status: 503 });
  }
  if (!hasValidWebhookToken(req)) {
    console.warn("[Delhivery Webhook] Rejected callback with a missing/invalid token");
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const payload = await req.json();
    console.log("[Delhivery Webhook] Received payload:", JSON.stringify(payload));

    const waybill = payload.waybill || payload.awb;
    const statusStr = (payload.status || "").trim();
    const location = payload.location || payload.activity || "";
    const description = payload.instructions || payload.remark || `Status: ${statusStr}`;
    const timestamp = payload.timestamp ? new Date(payload.timestamp) : new Date();

    if (!waybill) {
      return NextResponse.json({ error: "Missing waybill in payload" }, { status: 400 });
    }

    await connectDB();

    // Find the order that has this waybill assigned to shipment1 or shipment2
    const order = await Order.findOne({
      $or: [
        { "shipment1.awb": waybill },
        { "shipment2.awb": waybill }
      ]
    });

    if (!order) {
      console.warn(`[Delhivery Webhook] No matching order found for AWB: ${waybill}`);
      return NextResponse.json({ success: false, message: "No matching order found" }, { status: 200 });
    }

    const isShipment1 = order.shipment1.awb === waybill;
    const shipmentKey = isShipment1 ? "shipment1" : "shipment2";
    const shipment = order[shipmentKey];

    // Update shipment status and timeline
    shipment.status = statusStr.toLowerCase();
    shipment.deliveryTimeline = statusStr;

    // Append to tracking events array if not already present
    const eventExists = shipment.events.some((e: any) => 
      e.status === statusStr.toLowerCase() && 
      Math.abs(e.timestamp.getTime() - timestamp.getTime()) < 5000
    );

    if (!eventExists) {
      shipment.events.push({
        status: statusStr.toLowerCase(),
        description: description,
        location: location,
        timestamp: timestamp
      });
    }

    // Map Delhivery status to internal Order Status.
    // Substring matching on "deliver" used to treat BOTH "Undelivered" and
    // "Out for delivery" as a successful delivery, which advanced the order and
    // emailed the customer far too early.
    const normalizedStatus = statusStr.toLowerCase().trim();
    const isOutForDelivery = normalizedStatus.includes("out for delivery") || normalizedStatus === "ofd";
    const isFailedDelivery = normalizedStatus.includes("undelivered") || normalizedStatus.includes("not delivered") || normalizedStatus.includes("rto");
    const isDelivered = !isOutForDelivery && !isFailedDelivery &&
      (normalizedStatus === "delivered" || normalizedStatus === "dlv" || normalizedStatus.startsWith("delivered"));

    if (isShipment1) {
      if (isDelivered) {
        order.status = "waiting_submission";
        order.trackingEvents.push({
          status: "waiting_submission",
          description: "DIY Kit successfully delivered. Waiting for customer customization inputs.",
          location: "Consignee Address",
          timestamp: new Date()
        });
        
        // Notify customer to upload photos
        try {
          await sendOrderNotification(order.toObject(), "waiting_submission");
        } catch (notifErr) {
          console.error("[Webhook Notif] Error:", notifErr);
        }
      } else if (isOutForDelivery) {
        order.status = "kit_shipped"; // remains kit_shipped, but add milestone tracking
      }
    } else {
      // Shipment 2
      if (isDelivered) {
        order.status = "completed";
        order.trackingEvents.push({
          status: "completed",
          description: "Final customized product delivered. Order is fully completed.",
          location: "Consignee Address",
          timestamp: new Date()
        });

        // Notify final delivery
        try {
          await sendOrderNotification(order.toObject(), "delivered");
        } catch (notifErr) {
          console.error("[Webhook Notif] Error:", notifErr);
        }
      }
    }

    order.markModified("shipment1");
    order.markModified("shipment2");
    await order.save();

    console.log(`[Delhivery Webhook] Successfully processed waybill ${waybill} for order ${order.orderId}`);

    return NextResponse.json({ success: true, message: "Webhook processed successfully" });

  } catch (error) {
    console.error("[Delhivery Webhook] Error processing payload:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
