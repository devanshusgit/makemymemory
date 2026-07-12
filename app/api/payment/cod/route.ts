import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connect";
import { Order }     from "@/lib/db/models/Order";
import { applyCouponToOrder } from "@/lib/coupon/couponUtils";
import { sendEmail, ADMIN_EMAIL } from "@/lib/email/resend";

/**
 * POST /api/payment/cod
 * Creates a COD order directly — no advance payment required.
 */
export async function POST(req: NextRequest) {
  try {
    let body: any;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const { shippingAddress, items, subtotal, shippingCharge, total, couponCode, userId } = body;

    // ── Validate ──────────────────────────────────────────────────────────────
    if (!shippingAddress || typeof shippingAddress !== "object") {
      return NextResponse.json({ error: "shippingAddress is required" }, { status: 400 });
    }
    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "items must be a non-empty array" }, { status: 400 });
    }
    if (typeof total !== "number" || total <= 0) {
      return NextResponse.json({ error: "total must be a positive number" }, { status: 400 });
    }

    // ── Normalise items from cart format → Order schema format ────────────────
    // Cart items have shape: { product: { id, name, price, slug }, quantity, customization }
    // Order schema expects:  { productId, name, price, quantity, customization }
    const normalisedItems = (items as any[]).map((item: any) => {
      // Support both pre-normalised and cart-context shapes
      if (item.productId) return item; // already normalised
      const product = item.product ?? item;
      return {
        productId:     product.id ?? product._id ?? "unknown",
        name:          product.name ?? item.name ?? "Product",
        emoji:         "",
        price:         product.price ?? item.price ?? 0,
        quantity:      item.quantity ?? 1,
        customization: item.customization ?? "",
      };
    });

    // ── Connect DB ────────────────────────────────────────────────────────────
    try {
      await connectDB();
    } catch (dbErr) {
      console.error("[cod] DB connection failed:", dbErr);
      return NextResponse.json(
        { success: false, error: "Database not configured yet. Please try again later." },
        { status: 503 }
      );
    }

    // ── Create order ──────────────────────────────────────────────────────────
    const order = await Order.create({
      paymentMethod:      "cod",
      isCOD:              true,
      codAdvancePaid:     0,
      codRemainingAmount: total as number,
      items:              normalisedItems,
      shippingAddress,
      subtotal:           typeof subtotal === "number" ? subtotal : total as number,
      shippingCharge:     typeof shippingCharge === "number" ? shippingCharge : 0,
      total:              total as number,
      status:             "confirmed",
      trackingEvents: [
        {
          status:      "confirmed",
          description: "COD order placed. Our team will contact you for advance payment before dispatch.",
          location:    "Online",
          timestamp:   new Date(),
        },
      ],
    });

    console.log("[cod] Order created:", order.orderId);

    // Apply coupon if provided
    if (couponCode && userId) {
      try {
        await applyCouponToOrder(couponCode, userId);
        console.log("[cod] Coupon applied:", couponCode);
      } catch (couponErr) {
        console.error("[cod] Failed to apply coupon:", couponErr);
        // Don't fail the order if coupon application fails
      }
    }

    // Send emails (non-blocking — don't let email failure break the order)
    const orderObj = order.toObject();
    
    // Send customer confirmation email
    const customerEmail = orderObj.shippingAddress?.email;
    if (customerEmail) {
      const itemsHtml = orderObj.items
        .map((item: any) => `
          <li style="margin-bottom: 8px; font-size: 14px; color: #333;">
            <strong>${item.name}</strong> × ${item.quantity} = ₹${(item.quantity * item.price).toLocaleString("en-IN")}
            ${item.customization ? `<br/><em>${item.customization}</em>` : ""}
          </li>
        `)
        .join("");

      const emailHtml = `
        <h2>Order Confirmed! 🎉</h2>
        <p>Hi ${orderObj.shippingAddress?.fullName},</p>
        <p>Thank you for your order! We're excited to create something special for you.</p>
        
        <h3>Order Details:</h3>
        <p><strong>Order ID:</strong> ${orderObj.orderId}</p>
        
        <h3>Items:</h3>
        <ul style="list-style: none; padding: 0;">
          ${itemsHtml}
        </ul>
        
        <h3>Order Total: ₹${orderObj.total.toLocaleString("en-IN")}</h3>
        
        <h3>Shipping Address:</h3>
        <p>
          ${orderObj.shippingAddress.fullName}<br/>
          ${orderObj.shippingAddress.address}<br/>
          ${orderObj.shippingAddress.city}, ${orderObj.shippingAddress.state} ${orderObj.shippingAddress.pincode}<br/>
          Phone: ${orderObj.shippingAddress.phone}
        </p>
        
        <p><strong>Payment Method:</strong> Cash on Delivery</p>
        <p>We'll send you another email once your order is being prepared. Our team will contact you for payment before dispatch.</p>
        <p>Best regards,<br/>Make My Memory Team</p>
      `;

      sendEmail({
        to: customerEmail,
        subject: `Order Confirmation - ${orderObj.orderId} 🎁`,
        html: emailHtml,
      }).catch((e) => console.error("[cod] customer email error:", e));
    }
    
    // Send admin notification
    if (ADMIN_EMAIL) {
      const itemsHtml = orderObj.items
        .map((item: any) => `
          <li style="margin-bottom: 8px; font-size: 14px; color: #333;">
            <strong>${item.name}</strong> × ${item.quantity} = ₹${(item.quantity * item.price).toLocaleString("en-IN")}
          </li>
        `)
        .join("");

      const adminEmailHtml = `
        <h2>New COD Order Received</h2>
        <p><strong>Order ID:</strong> ${orderObj.orderId}</p>
        
        <h3>Customer:</h3>
        <p>
          Name: ${orderObj.shippingAddress.fullName}<br/>
          Email: ${orderObj.shippingAddress.email}<br/>
          Phone: ${orderObj.shippingAddress.phone}
        </p>
        
        <h3>Items:</h3>
        <ul style="list-style: none; padding: 0;">
          ${itemsHtml}
        </ul>
        
        <p><strong>Total: ₹${orderObj.total.toLocaleString("en-IN")}</strong></p>
        <p><strong>Payment Type:</strong> Cash on Delivery (Full payment due on delivery)</p>
        
        <p><a href="${process.env.NEXT_PUBLIC_APP_URL || "https://makemymemory.in"}/admin/orders/${orderObj.orderId}">View in Admin Panel</a></p>
      `;

      sendEmail({
        to: ADMIN_EMAIL,
        subject: `🛍️ New COD Order: ${orderObj.orderId} — ₹${orderObj.total?.toLocaleString("en-IN")}`,
        html: adminEmailHtml,
      }).catch((e) => console.error("[cod] admin email error:", e));
    }

    return NextResponse.json({ success: true, orderId: order.orderId }, { status: 201 });

  } catch (error: any) {
    console.error("[cod] Error:", error?.message ?? error);
    if (error?.name === "ValidationError") {
      const fields = Object.keys(error.errors ?? {}).join(", ");
      return NextResponse.json(
        { error: `Validation failed: ${fields}. Please check your order details.` },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Failed to place COD order. Please contact support." },
      { status: 500 }
    );
  }
}
