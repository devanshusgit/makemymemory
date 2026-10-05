import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connect";
import { Order } from "@/lib/db/models/Order";
import { createDelhiveryShipment, delhiveryManifestResult } from "@/lib/shipping/delhiveryClient";
import { deductKitStock } from "@/lib/inventory/inventoryService";
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

    if (order.shipment1 && order.shipment1.awb) {
      return NextResponse.json({ error: "Shipment 1 already created" }, { status: 400 });
    }

    // Never ship a cancelled order or one whose payment failed.
    if (order.status === "cancelled" || order.status === "payment_failed") {
      return NextResponse.json(
        { error: `This order is ${order.status.replace("_", " ")} — it can't be shipped.` },
        { status: 400 }
      );
    }

    if (order.status === "pending_payment") {
      return NextResponse.json(
        { error: "Cannot create Shipment 1. Payment has not been confirmed for this order yet." },
        { status: 400 }
      );
    }

    // Call Delhivery API with -KIT suffix
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
      orderId: `${order.orderId}-KIT`,
      isCOD: order.paymentMethod === "cod",
      // Only the BALANCE: the ₹149 advance was already paid online. Sending
      // order.total had the courier collect the advance a second time.
      amount: Math.max(0, (order.total || 0) - (order.codAdvancePaid || 0)),
      packageDesc: `${(order.items || []).map((i: any) => i.name).filter(Boolean).join(", ") || "Imprint frame"} - Imprint Kit`,
      weight: 0.5,
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
