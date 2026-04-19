import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connect";
import { Order }     from "@/lib/db/models/Order";

/**
 * GET /api/orders/track?orderId=MMM-XXXX&contact=<phone_or_email>
 *
 * Public order tracking endpoint.
 * Requires contact to prevent enumeration — returns only safe fields.
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const orderId = searchParams.get("orderId")?.trim().toUpperCase();
  const contact = searchParams.get("contact")?.trim().toLowerCase();

  if (!orderId || orderId.length < 4) {
    return NextResponse.json({ error: "Please enter a valid Order ID." }, { status: 400 });
  }
  if (!contact) {
    return NextResponse.json(
      { error: "Please enter your phone number or email address." },
      { status: 400 }
    );
  }

  const isPhone = /^[6-9]\d{9}$/.test(contact);
  const isEmail = /^\S+@\S+\.\S+$/.test(contact);
  if (!isPhone && !isEmail) {
    return NextResponse.json(
      { error: "Enter a valid 10-digit phone number or email address." },
      { status: 400 }
    );
  }

  try {
    await connectDB().catch(() => {
      throw new Error("DB_UNAVAILABLE");
    });

    const order = await Order.findOne({
      orderId,
      $or: [
        { "shippingAddress.phone": contact },
        { "shippingAddress.email": contact },
      ],
    })
      .select(
        "orderId status paymentMethod isCOD codAdvancePaid codRemainingAmount " +
        "total items trackingEvents courierName courierTrackingId courierTrackingUrl " +
        "estimatedDelivery shippingAddress.fullName shippingAddress.city " +
        "shippingAddress.state shippingAddress.pincode"
      )
      .lean();

    if (!order) {
      return NextResponse.json(
        { error: "No order found with that ID and contact details. Please check and try again." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      orderId:            (order as any).orderId,
      status:             (order as any).status,
      paymentMethod:      (order as any).paymentMethod,
      estimatedDelivery:  (order as any).estimatedDelivery?.toISOString(),
      courierName:        (order as any).courierName,
      courierTrackingId:  (order as any).courierTrackingId,
      courierTrackingUrl: (order as any).courierTrackingUrl,
      events:             (order as any).trackingEvents,
      items:              ((order as any).items as any[]).map((i: any) => ({
        name:     i.name,
        emoji:    i.emoji,
        quantity: i.quantity,
        price:    i.price,
      })),
      shippingAddress: {
        fullName: (order as any).shippingAddress.fullName,
        city:     (order as any).shippingAddress.city,
        state:    (order as any).shippingAddress.state,
        pincode:  (order as any).shippingAddress.pincode,
      },
      total:              (order as any).total,
      isCOD:              (order as any).isCOD,
      codAdvancePaid:     (order as any).codAdvancePaid,
      codRemainingAmount: (order as any).codRemainingAmount,
    });
  } catch (error) {
    console.error("[track]", error);
    if (error instanceof Error && error.message === "DB_UNAVAILABLE") {
      return NextResponse.json(
        { success: false, error: "Database not configured yet. Please try again later." },
        { status: 503 }
      );
    }
    return NextResponse.json(
      { error: "Failed to fetch order. Please try again." },
      { status: 500 }
    );
  }
}
