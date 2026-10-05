import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connect";
import { Order } from "@/lib/db/models/Order";
import { createDelhiveryShipment, delhiveryManifestResult } from "@/lib/shipping/delhiveryClient";
import { deductFinalStock } from "@/lib/inventory/inventoryService";
import { sendOrderNotification } from "@/lib/notifications/notificationService";
import { isAdminRequest } from "@/lib/auth/admin";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  if (!isAdminRequest(req)) {
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

    // Never ship a cancelled order or one whose payment failed.
    if (order.status === "cancelled" || order.status === "payment_failed") {
      return NextResponse.json(
        { error: `This order is ${order.status.replace("_", " ")} — it can't be shipped.` },
        { status: 400 }
      );
    }

    // Validation: Shipment 2 cannot be created until Shipment 1 is completed/delivered 
    // and custom assets are processed (Order status should be final_ready, final_production, etc.)
    const invalidStatuses = ["pending_payment", "pending", "confirmed", "kit_ready", "kit_shipped"];
    if (invalidStatuses.includes(order.status)) {
      return NextResponse.json({ 
        error: "Cannot create Shipment 2. Shipment 1 must be delivered and custom photos/details submitted." 
      }, { status: 400 });
    }

    // Call Delhivery API with -FINAL suffix
    const delhiveryRes = await createDelhiveryShipment({
      consigneeName: order.shippingAddress.fullName,
      // Landmark included: checkout tells the customer it "helps the delivery
      // partner find you", but it was never sent to the courier.
      address: [order.shippingAddress.address, order.shippingAddress.landmark]
        .filter((part: unknown) => typeof part === "string" && part.trim())
        .join(", "),
      pincode: order.shippingAddress.pincode,
      city: order.shippingAddress.city,
      state: order.shippingAddress.state,
      phone: order.shippingAddress.phone,
      orderId: `${order.orderId}-FINAL`,
      isCOD: false, // Final stage is usually prepaid since COD advance covers raw materials
      amount: 0,
      packageDesc: `${(order.items || []).map((i: any) => i.name).filter(Boolean).join(", ") || "Personalised frame"} - Final Frame`,
      weight: 1.5,
      declaredValue: order.total || 0,
      quantity: (order.items || []).reduce((n: number, i: any) => n + (Number(i.quantity) || 1), 0) || 1,
    });

    // Only a package Delhivery accepted counts — a rejected one can still
    // carry a waybill, and we must not deduct stock or notify the customer.
    const manifest = delhiveryManifestResult(delhiveryRes);
    if (!manifest.ok) {
      return NextResponse.json(
        { error: `Delhivery shipment creation failed: ${manifest.error}`, details: delhiveryRes },
        { status: 502 }
      );
    }

    const awb = manifest.waybill;

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
