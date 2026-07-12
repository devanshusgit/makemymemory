import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { connectDB } from "@/lib/db/connect";
import { Order } from "@/lib/db/models/Order";

export const dynamic = "force-dynamic";

function isAdmin() {
  const cookieStore = cookies();
  const session = cookieStore.get("admin_session");
  return session?.value === process.env.ADMIN_PASSWORD;
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  if (!isAdmin()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const orderId = params.id?.trim().toUpperCase();

  try {
    const body = await req.json();
    const {
      status,
      trackingEvent,
      courierName,
      courierTrackingId,
      courierTrackingUrl,
      estimatedDelivery,
      // ── Dual-delivery fields ───────────────────────────────────────────────
      // deliveryIndex: 0 = kit delivery, 1 = final product delivery
      // If provided, updates that specific delivery sub-document instead of
      // the top-level order fields.
      deliveryIndex,
      deliveryStatus,
      deliveryCourierName,
      deliveryCourierTrackingId,
      deliveryCourierTrackingUrl,
      deliveryEstimatedDelivery,
    } = body;

    await connectDB();

    const update: Record<string, unknown> = {};
    const push: Record<string, unknown> = {};

    // ── Update a specific delivery sub-document ────────────────────────────
    if (typeof deliveryIndex === "number" && (deliveryIndex === 0 || deliveryIndex === 1)) {
      const prefix = `deliveries.${deliveryIndex}`;

      if (deliveryStatus)               update[`${prefix}.status`]             = deliveryStatus;
      if (deliveryCourierName)          update[`${prefix}.courierName`]        = deliveryCourierName;
      if (deliveryCourierTrackingId)    update[`${prefix}.courierTrackingId`]  = deliveryCourierTrackingId;
      if (deliveryCourierTrackingUrl)   update[`${prefix}.courierTrackingUrl`] = deliveryCourierTrackingUrl;
      if (deliveryEstimatedDelivery)    update[`${prefix}.estimatedDelivery`]  = new Date(deliveryEstimatedDelivery);

      if (trackingEvent && typeof trackingEvent === "object") {
        const evt = trackingEvent as { description: string; location?: string };
        push[`${prefix}.trackingEvents`] = {
          status:      deliveryStatus ?? "dispatching",
          description: evt.description,
          location:    evt.location ?? "",
          timestamp:   new Date(),
        };
      }

      // Also bump the overall order status based on delivery milestones
      if (deliveryIndex === 0) {
        if (deliveryStatus === "dispatching") update.status = "kit_dispatching";
        if (deliveryStatus === "dispatched")  update.status = "kit_dispatched";
      }
      if (deliveryIndex === 1) {
        if (deliveryStatus === "shipped")           update.status = "shipped";
        if (deliveryStatus === "out_for_delivery")  update.status = "out_for_delivery";
        if (deliveryStatus === "delivered")         update.status = "delivered";
      }

    } else {
      // ── Update top-level order fields (legacy / overall status) ───────────
      if (status)             update.status             = status;
      if (courierName)        update.courierName        = courierName;
      if (courierTrackingId)  update.courierTrackingId  = courierTrackingId;
      if (courierTrackingUrl) update.courierTrackingUrl = courierTrackingUrl;
      if (estimatedDelivery)  update.estimatedDelivery  = new Date(estimatedDelivery);

      if (trackingEvent && typeof trackingEvent === "object") {
        const evt = trackingEvent as { description: string; location?: string };
        push.trackingEvents = {
          status:      status ?? "processing",
          description: evt.description,
          location:    evt.location ?? "",
          timestamp:   new Date(),
        };
      }
    }

    const result = await Order.findOneAndUpdate(
      { orderId },
      {
        ...(Object.keys(update).length ? { $set: update } : {}),
        ...(Object.keys(push).length   ? { $push: push }  : {}),
      },
      { new: true, select: "orderId status deliveries" }
    ).lean();

    if (!result) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      orderId: (result as any).orderId,
      status:  (result as any).status,
      deliveries: (result as any).deliveries ?? [],
    });
  } catch {
    return NextResponse.json({ error: "Failed to update order" }, { status: 500 });
  }
}
