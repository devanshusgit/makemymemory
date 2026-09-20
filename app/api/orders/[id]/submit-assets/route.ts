import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connect";
import { Order } from "@/lib/db/models/Order";
import { sendOrderNotification } from "@/lib/notifications/notificationService";
import { parseSession, sessionMatchesContact } from "@/lib/auth/session";

// Customer uploads land on Cloudinary via /api/upload; anything else is not
// something this route should store and hand to the workshop.
const ALLOWED_ASSET_HOST = "res.cloudinary.com";
const MAX_ASSETS = 20;

function cleanAssetUrls(raw: unknown): string[] | null {
  if (raw === undefined || raw === null) return [];
  if (!Array.isArray(raw) || raw.length > MAX_ASSETS) return null;
  const urls: string[] = [];
  for (const value of raw) {
    if (typeof value !== "string") return null;
    try {
      const url = new URL(value);
      if (url.protocol !== "https:" || url.hostname !== ALLOWED_ASSET_HOST) return null;
      urls.push(value);
    } catch {
      return null;
    }
  }
  return urls;
}

function isAuthorized(req: NextRequest, orderContact: { email?: string; phone?: string }) {
  // Allow Admin
  if (req.cookies.get("admin_session")?.value === process.env.ADMIN_PASSWORD) {
    return true;
  }
  // Allow Customer
  const session = parseSession(req.cookies.get("user_session")?.value);
  return sessionMatchesContact(session, orderContact);
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

    if (!isAuthorized(req, order.shippingAddress)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only an order that is actually waiting for assets may be moved forward —
    // this used to accept a resubmission at any stage and push a shipped or
    // completed order back into production.
    if (order.status !== "waiting_submission") {
      return NextResponse.json(
        { error: "This order is not waiting for your photos right now. Please contact support if you need to change them." },
        { status: 409 }
      );
    }

    const cleanedAssets = cleanAssetUrls(assets);
    if (cleanedAssets === null) {
      return NextResponse.json({ error: "Invalid photo uploads. Please upload your photos again." }, { status: 400 });
    }

    // Save the uploaded custom files/notes to the first item's customization field
    if (order.items && order.items.length > 0) {
      const currentCustomization = order.items[0].customization || {};
      order.items[0].customization = {
        ...currentCustomization,
        customerAssets: cleanedAssets,
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
