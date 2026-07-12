import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connect";
import { Order } from "@/lib/db/models/Order";
import { sendOrderNotification } from "@/lib/notifications/notificationService";

function isAuthorized(req: NextRequest, orderEmail: string) {
  // Allow Admin
  if (req.cookies.get("admin_session")?.value === process.env.ADMIN_PASSWORD) {
    return true;
  }
  // Allow Customer
  const sessionCookie = req.cookies.get("user_session")?.value;
  if (sessionCookie) {
    try {
      const { email } = JSON.parse(sessionCookie);
      return email && email.toLowerCase() === orderEmail.toLowerCase();
    } catch {
      return false;
    }
  }
  return false;
}

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const orderId = params.id;

  try {
    const { assets, notes } = await req.json().catch(() => ({ assets: [], notes: "" }));

    await connectDB();
    const order = await Order.findOne({ orderId });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    if (!isAuthorized(req, order.shippingAddress.email)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Save the uploaded custom files/notes to the first item's customization field
    if (order.items && order.items.length > 0) {
      const currentCustomization = order.items[0].customization || {};
      order.items[0].customization = {
        ...currentCustomization,
        customerAssets: assets,
        customerNotes: notes,
        submittedAt: new Date(),
      };
      order.markModified("items");
    }

    // Transition overall order status to final_production
    order.status = "final_production";
    
    order.trackingEvents.push({
      status: "final_production",
      description: "Customer customization assets successfully submitted. Commencing production of customized frame.",
      location: "Workshop",
      timestamp: new Date()
    });

    await order.save();

    // Send notifications
    try {
      await sendOrderNotification(order.toObject(), "final_production");
    } catch (notifErr) {
      console.error("[Notification Error] Failed to send notification:", notifErr);
    }

    return NextResponse.json({
      success: true,
      message: "Customization assets submitted successfully",
      status: order.status,
      customization: order.items[0]?.customization,
    });

  } catch (error) {
    console.error("[Submit Assets API] Error:", error);
    return NextResponse.json({ error: "Failed to submit customization assets" }, { status: 500 });
  }
}
