import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connect";
import { Order } from "@/lib/db/models/Order";
import { sendOrderNotification } from "@/lib/notifications/notificationService";

/**
 * POST /api/delhivery/webhook
 * Receives tracking updates pushed by Delhivery.
 */
export async function POST(req: NextRequest) {
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

    // Map Delhivery status to internal Order Status
    const normalizedStatus = statusStr.toLowerCase();

    if (isShipment1) {
      if (normalizedStatus.includes("deliver")) {
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
      } else if (normalizedStatus.includes("out for delivery")) {
        order.status = "kit_shipped"; // remains kit_shipped, but add milestone tracking
      }
    } else {
      // Shipment 2
      if (normalizedStatus.includes("deliver")) {
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
