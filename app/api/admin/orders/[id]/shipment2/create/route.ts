import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connect";
import { Order } from "@/lib/db/models/Order";
import { createDelhiveryShipment } from "@/lib/shipping/delhiveryClient";
import { deductFinalStock } from "@/lib/inventory/inventoryService";
import { sendOrderNotification } from "@/lib/notifications/notificationService";

function isAdmin(req: NextRequest) {
  return req.cookies.get("admin_session")?.value === process.env.ADMIN_PASSWORD;
}

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  if (!isAdmin(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const orderId = params.id;

  try {
    await connectDB();
    const order = await Order.findOne({ orderId });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    if (order.shipment2 && order.shipment2.awb) {
      return NextResponse.json({ error: "Shipment 2 already created" }, { status: 400 });
    }

    // Validation: Shipment 2 cannot be created until Shipment 1 is completed/delivered 
    // and custom assets are processed (Order status should be final_ready, final_production, etc.)
    const invalidStatuses = ["pending", "confirmed", "kit_ready", "kit_shipped"];
    if (invalidStatuses.includes(order.status)) {
      return NextResponse.json({ 
        error: "Cannot create Shipment 2. Shipment 1 must be delivered and custom photos/details submitted." 
      }, { status: 400 });
    }

    // Call Delhivery API with -FINAL suffix
    const delhiveryRes = await createDelhiveryShipment({
      consigneeName: order.shippingAddress.fullName,
      address: order.shippingAddress.address,
      pincode: order.shippingAddress.pincode,
      city: order.shippingAddress.city,
      state: order.shippingAddress.state,
      phone: order.shippingAddress.phone,
      orderId: `${order.orderId}-FINAL`,
      isCOD: false, // Final stage is usually prepaid since COD advance covers raw materials
      amount: 0,
      packageDesc: "Final Customised Personalised Frame",
      weight: 1.5,
    });

    if (!delhiveryRes.packages || delhiveryRes.packages.length === 0 || !delhiveryRes.packages[0].waybill) {
      return NextResponse.json({ 
        error: "Delhivery shipment creation failed", 
        details: delhiveryRes 
      }, { status: 502 });
    }

    const awb = delhiveryRes.packages[0].waybill;

    // Deduct stock for Final product
    await deductFinalStock(order.orderId);

    // Update order shipment2 fields
    order.shipment2 = {
      awb,
      trackingNumber: awb,
      labelUrl: `/api/admin/orders/${order.orderId}/shipment/label?awb=${awb}`,
      status: "final_shipped",
      dispatchDate: new Date(),
      deliveryTimeline: "Dispatched",
      events: [
        {
          status: "final_shipped",
          description: "Final personalised product dispatched via Delhivery.",
          location: "Workshop",
          timestamp: new Date()
        }
      ]
    };

    order.status = "final_shipped";

    // Save to trackingEvents array for backwards compatibility
    order.trackingEvents.push({
      status: "final_shipped",
      description: "Final customized memory frame successfully shipped.",
      location: "Workshop",
      timestamp: new Date()
    });

    await order.save();

    // Send notifications
    try {
      await sendOrderNotification(order.toObject(), "final_shipped");
    } catch (notifErr) {
      console.error("[Notification Error] Failed to send notification:", notifErr);
    }

    return NextResponse.json({
      success: true,
      message: "Shipment 2 (Final Customized Product) created successfully",
      shipment: order.shipment2,
      orderStatus: order.status,
    });

  } catch (error) {
    console.error("[Shipment2 API] Error:", error);
    return NextResponse.json({ error: "Failed to create shipment 2" }, { status: 500 });
  }
}
