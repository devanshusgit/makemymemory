import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connect";
import { Order }     from "@/lib/db/models/Order";

/**
 * GET /api/orders/[id]?contact=<phone_or_email>
 *
 * Fetches a single order for the tracking page.
 * Requires the contact field to prevent order enumeration.
 * Returns only non-sensitive fields.
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const orderId = params.id?.trim().toUpperCase();
  const contact = new URL(req.url).searchParams.get("contact")?.trim().toLowerCase() ?? "";

  if (!orderId || orderId.length < 4) {
    return NextResponse.json({ error: "Invalid order ID" }, { status: 400 });
  }

  const isPhone = /^[6-9]\d{9}$/.test(contact);
  const isEmail = /^\S+@\S+\.\S+$/.test(contact);

  if (!contact || (!isPhone && !isEmail)) {
    return NextResponse.json(
      { error: "Enter a valid phone number or email address." },
      { status: 400 }
    );
  }

  try {
    await connectDB();

    // Use exec() without lean() and convert via toObject() to get a plain JS object
    const doc = await Order.findOne({
      orderId,
      $or: [
        { "shippingAddress.phone": contact },
        { "shippingAddress.email": contact },
      ],
    }).select(
      "orderId status paymentMethod isCOD codAdvancePaid codRemainingAmount " +
      "total items trackingEvents courierName courierTrackingId courierTrackingUrl " +
      "estimatedDelivery shippingAddress createdAt"
    ).exec();

    if (!doc) {
      return NextResponse.json(
        { error: "No order found with that ID and contact details." },
        { status: 404 }
      );
    }

    // Convert Mongoose document to plain object via JSON round-trip
    // This avoids all Mongoose sub-document type issues
    const o = JSON.parse(JSON.stringify(doc.toObject())) as Record<string, any>;

    return NextResponse.json(
      {
        orderId:            o.orderId,
        status:             o.status,
        paymentMethod:      o.paymentMethod,
        estimatedDelivery:  o.estimatedDelivery ?? null,
        courierName:        o.courierName ?? null,
        courierTrackingId:  o.courierTrackingId ?? null,
        courierTrackingUrl: o.courierTrackingUrl ?? null,
        events:             o.trackingEvents ?? [],
        items:              (o.items ?? []).map((i: Record<string, any>) => ({
          name:     i.name,
          emoji:    i.emoji,
          quantity: i.quantity,
          price:    i.price,
        })),
        shippingAddress: {
          fullName: o.shippingAddress?.fullName ?? "",
          city:     o.shippingAddress?.city     ?? "",
          state:    o.shippingAddress?.state    ?? "",
          pincode:  o.shippingAddress?.pincode  ?? "",
        },
        total:              o.total,
        isCOD:              o.isCOD,
        codAdvancePaid:     o.codAdvancePaid,
        codRemainingAmount: o.codRemainingAmount,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("[orders GET]", error);
    return NextResponse.json(
      { error: "Failed to fetch order. Please try again." },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/orders/[id]
 *
 * Internal route for updating order status and adding tracking events.
 * Protected by INTERNAL_API_SECRET header.
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.INTERNAL_API_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const orderId = params.id?.trim().toUpperCase();

  try {
    let body: Record<string, unknown>;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const {
      status,
      trackingEvent,
      courierName,
      courierTrackingId,
      courierTrackingUrl,
      estimatedDelivery,
      razorpayPaymentId,
    } = body;

    await connectDB();

    const update: Record<string, unknown> = {};
    const push:   Record<string, unknown> = {};

    if (status)             update.status             = status;
    if (courierName)        update.courierName        = courierName;
    if (courierTrackingId)  update.courierTrackingId  = courierTrackingId;
    if (courierTrackingUrl) update.courierTrackingUrl = courierTrackingUrl;
    if (estimatedDelivery)  update.estimatedDelivery  = new Date(estimatedDelivery as string);
    if (razorpayPaymentId)  update.razorpayPaymentId  = razorpayPaymentId;

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

    const r = result as Record<string, any>;
    return NextResponse.json({ success: true, orderId: r.orderId, status: r.status });
  } catch (error) {
    console.error("[orders PATCH]", error);
    return NextResponse.json({ error: "Failed to update order" }, { status: 500 });
  }
}
