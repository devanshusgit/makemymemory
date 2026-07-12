import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connect";
import { Order } from "@/lib/db/models/Order";
import { createDelhiveryShipment } from "@/lib/shipping/delhiveryClient";
import { deductKitStock } from "@/lib/inventory/inventoryService";
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

    if (order.shipment1 && order.shipment1.awb) {
      return NextResponse.json({ error: "Shipment 1 already created" }, { status: 400 });
    }

    // Call Delhivery API with -KIT suffix
    const delhiveryRes = await createDelhiveryShipment({
      consigneeName: order.shippingAddress.fullName,
      address: order.shippingAddress.address,
      pincode: order.shippingAddress.pincode,
      city: order.shippingAddress.city,
      state: order.shippingAddress.state,
      phone: order.shippingAddress.phone,
      orderId: `${order.orderId}-KIT`,
      isCOD: order.paymentMethod === "cod",
      amount: order.total,
      packageDesc: "DIY Memory Kit Component",
      weight: 0.5,
    });

    if (!delhiveryRes.packages || delhiveryRes.packages.length === 0 || !delhiveryRes.packages[0].waybill) {
      return NextResponse.json({ 
        error: "Delhivery shipment creation failed", 
        details: delhiveryRes 
      }, { status: 502 });
    }

    const awb = delhiveryRes.packages[0].waybill;

    // Deduct stock for DIY Kit
    await deductKitStock(order.orderId);

    // Update order shipment1 fields
    order.shipment1 = {
      awb,
      trackingNumber: awb,
      labelUrl: `/api/admin/orders/${order.orderId}/shipment/label?awb=${awb}`,
      status: "kit_shipped",
      dispatchDate: new Date(),
      deliveryTimeline: "Dispatched",
      events: [
        {
          status: "kit_shipped",
          description: "DIY Kit manifested and dispatched via Delhivery.",
          location: "Warehouse",
          timestamp: new Date()
        }
      ]
    };

    order.status = "kit_shipped";
    
    // Save to trackingEvents array for backwards compatibility
    order.trackingEvents.push({
      status: "kit_shipped",
      description: "DIY Kit components successfully shipped.",
      location: "Warehouse",
      timestamp: new Date()
    });

    await order.save();

    // Send notifications
    try {
      await sendOrderNotification(order.toObject(), "kit_shipped");
    } catch (notifErr) {
      console.error("[Notification Error] Failed to send notification:", notifErr);
    }

    return NextResponse.json({
      success: true,
      message: "Shipment 1 (DIY Kit) created successfully",
      shipment: order.shipment1,
      orderStatus: order.status,
    });

  } catch (error) {
    console.error("[Shipment1 API] Error:", error);
    return NextResponse.json({ error: "Failed to create shipment 1" }, { status: 500 });
  }
}
