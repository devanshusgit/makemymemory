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
    const { status, trackingEvent, courierName, courierTrackingId, courierTrackingUrl, estimatedDelivery } = body;

    await connectDB();

    const update: Record<string, unknown> = {};
    const push: Record<string, unknown> = {};

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

    const result = await Order.findOneAndUpdate(
      { orderId },
      {
        ...(Object.keys(update).length ? { $set: update } : {}),
        ...(Object.keys(push).length   ? { $push: push }  : {}),
      },
      { new: true, select: "orderId status" }
    ).lean();

    if (!result) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, orderId: (result as any).orderId, status: (result as any).status });
  } catch {
    return NextResponse.json({ error: "Failed to update order" }, { status: 500 });
  }
}
