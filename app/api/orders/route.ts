import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connect";
import { Order }     from "@/lib/db/models/Order";
import { applyCouponToOrder } from "@/lib/coupon/couponUtils";
import { validateOrderInventory } from "@/lib/inventory/inventoryUtils";
import { sendEmail } from "@/lib/email/resend";

/**
 * POST /api/orders
 * Creates a new order placed via WhatsApp. The order is saved with
 * status "pending_payment" — it only becomes "confirmed" once an admin
 * verifies the payment (received over WhatsApp) and confirms it in
 * /admin/orders, which also triggers the customer confirmation email
 * and kicks off the existing kit/final two-stage delivery pipeline.
 */
export async function POST(req: NextRequest) {
  try {
    let body: any;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const {
      paymentMethod,
      items,
      shippingAddress,
      subtotal,
      shippingCharge,
      total,
      couponCode,
      userId,
    } = body;

    // ── Validate required fields ──────────────────────────────────────────────
    if (paymentMethod !== "whatsapp") {
      return NextResponse.json({ error: "Invalid paymentMethod" }, { status: 400 });
    }
    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "items must be a non-empty array" }, { status: 400 });
    }
    if (!shippingAddress || typeof shippingAddress !== "object") {
      return NextResponse.json({ error: "shippingAddress is required" }, { status: 400 });
    }
    if (typeof total !== "number" || total <= 0) {
      return NextResponse.json({ error: "total must be a positive number" }, { status: 400 });
    }

    // ── Normalise items (support both cart and pre-normalised shapes) ─────────
    const normalisedItems = (items as any[]).map((item: any) => {
      if (item.productId) return item;
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
      console.error("[orders] DB connection failed:", dbErr);
      return NextResponse.json(
        { success: false, error: "Database not configured yet. Please try again later." },
        { status: 503 }
      );
    }

    // ── Validate inventory ────────────────────────────────────────────────────
    const inventoryCheck = await validateOrderInventory(normalisedItems);
    if (!inventoryCheck.valid) {
      return NextResponse.json(
        {
          success: false,
          error: "Some items are out of stock",
          unavailableItems: inventoryCheck.unavailableItems,
        },
        { status: 400 }
      );
    }

    // ── Create order (pending payment confirmation) ───────────────────────────
    const order = await Order.create({
      paymentMethod:      "whatsapp",
      isCOD:               false,
      codAdvancePaid:      0,
      codRemainingAmount:  0,
      items:               normalisedItems,
      shippingAddress,
      subtotal:            typeof subtotal === "number" ? subtotal : total as number,
      shippingCharge:      typeof shippingCharge === "number" ? shippingCharge : 0,
      total:               total as number,
      appliedCouponCode:   couponCode ? couponCode.toUpperCase() : undefined,
      status:              "pending_payment",
      trackingEvents: [
        {
          status:      "pending_payment",
          description: "Order placed via WhatsApp. Awaiting payment confirmation.",
          location:    "Online",
          timestamp:   new Date(),
        },
      ],
      // ── Dual-delivery system ─────────────────────────────────────────────
      // deliveries[0] = Kit dispatch (raw materials sent to customer first)
      // deliveries[1] = Final product dispatch (personalised product ships after)
      // Populated the same way regardless of payment method — the kit/final
      // pipeline only actually starts once the order is confirmed.
      deliveries: [
        {
          deliveryType:   "kit",
          status:         "pending",
          trackingEvents: [
            {
              status:      "pending",
              description: "Kit delivery is being prepared. We will dispatch your materials kit shortly.",
              location:    "Warehouse",
              timestamp:   new Date(),
            },
          ],
        },
        {
          deliveryType:   "final",
          status:         "pending",
          trackingEvents: [
            {
              status:      "pending",
              description: "Final product delivery will be dispatched once your kit has been processed.",
              location:    "Workshop",
              timestamp:   new Date(),
            },
          ],
        },
      ],
    });

    // Apply coupon if provided
    if (couponCode && userId) {
      try {
        await applyCouponToOrder(couponCode, userId);
      } catch (couponErr) {
        // Don't fail the order if coupon application fails
      }
    }

    // Notify admin of the new pending order (non-blocking) — no customer
    // "confirmed" email yet, that only goes out once payment is verified.
    const orderObj = order.toObject();
    if (process.env.ADMIN_EMAIL) {
      const itemsHtml = orderObj.items
        .map((item: any) => `
          <li style="margin-bottom: 8px; font-size: 14px; color: #333;">
            <strong>${item.name}</strong> × ${item.quantity} = ₹${(item.quantity * item.price).toLocaleString("en-IN")}
            ${item.customization ? `<br/><em>${item.customization}</em>` : ""}
          </li>
        `)
        .join("");

      const adminEmailHtml = `
        <h2>New Pending WhatsApp Order</h2>
        <p><strong>Order ID:</strong> ${orderObj.orderId}</p>
        <p>Customer has been redirected to WhatsApp to complete payment. Confirm in the admin panel once payment is received.</p>

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

        <p><a href="${process.env.NEXT_PUBLIC_APP_URL || "https://makemymemory.in"}/admin/orders">View in Admin Panel</a></p>
      `;

      try {
        const adminResult = await sendEmail({
          to: process.env.ADMIN_EMAIL,
          subject: `🕓 New Pending Order: ${orderObj.orderId} — ₹${orderObj.total?.toLocaleString("en-IN")}`,
          html: adminEmailHtml,
        });
        if (!adminResult.success) {
          console.error(`❌ Failed to send admin notification:`, adminResult.error);
        }
      } catch (err) {
        console.error(`❌ Error sending admin notification:`, err);
      }
    }

    return NextResponse.json({ success: true, orderId: order.orderId }, { status: 201 });

  } catch (error: any) {
    console.error("[orders POST] Error:", error?.message ?? error);
    if (error?.name === "ValidationError") {
      const fields = Object.keys(error.errors ?? {}).join(", ");
      return NextResponse.json(
        { error: `Validation failed: ${fields}. Please check your order details.` },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Failed to create order. Please contact support." },
      { status: 500 }
    );
  }
}
