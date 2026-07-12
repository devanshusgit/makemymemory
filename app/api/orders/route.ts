import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connect";
import { Order }     from "@/lib/db/models/Order";
import { Coupon }   from "@/lib/db/models/Coupon";
import { applyCouponToOrder } from "@/lib/coupon/couponUtils";
import { validateOrderInventory, updateInventoryOnOrderConfirm } from "@/lib/inventory/inventoryUtils";
import { sendEmail } from "@/lib/email/resend";

/**
 * POST /api/orders
 * Creates a new order after payment is verified (Razorpay or PayPal).
 * COD orders go through /api/payment/cod instead.
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
      razorpayOrderId,
      razorpayPaymentId,
      items,
      shippingAddress,
      subtotal,
      shippingCharge,
      total,
      couponCode,
      userId,
    } = body;

    // ── Validate required fields ──────────────────────────────────────────────
    if (!["razorpay", "paypal", "cod"].includes(paymentMethod as string)) {
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

    // ── Razorpay-specific validation ──────────────────────────────────────────
    if (paymentMethod === "razorpay") {
      if (typeof razorpayOrderId !== "string" || !razorpayOrderId.startsWith("order_")) {
        return NextResponse.json({ error: "Invalid razorpayOrderId" }, { status: 400 });
      }
      if (typeof razorpayPaymentId !== "string" || !razorpayPaymentId.startsWith("pay_")) {
        return NextResponse.json({ error: "Invalid razorpayPaymentId" }, { status: 400 });
      }
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

    // ── Idempotency: prevent duplicate orders ─────────────────────────────────
    if (razorpayOrderId) {
      const existing = await Order.findOne({ razorpayOrderId }).lean();
      if (existing) {
        return NextResponse.json(
          { success: true, orderId: (existing as any).orderId, duplicate: true },
          { status: 200 }
        );
      }
    }

    const isCOD = paymentMethod === "cod";

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

    // ── Create order ──────────────────────────────────────────────────────────
    const order = await Order.create({
      paymentMethod,
      razorpayOrderId:    razorpayOrderId   ?? undefined,
      razorpayPaymentId:  razorpayPaymentId ?? undefined,
      isCOD,
      codAdvancePaid:     0,
      codRemainingAmount: isCOD ? total as number : 0,
      items:              normalisedItems,
      shippingAddress,
      subtotal:           typeof subtotal === "number" ? subtotal : total as number,
      shippingCharge:     typeof shippingCharge === "number" ? shippingCharge : 0,
      total:              total as number,
      appliedCouponCode:  couponCode ? couponCode.toUpperCase() : undefined,
      status:             "confirmed",
      trackingEvents: [
        {
          status:      "confirmed",
          description: isCOD
            ? "COD order placed. Our team will contact you before dispatch."
            : "Order placed and payment confirmed.",
          location:    "Online",
          timestamp:   new Date(),
        },
      ],
      // ── Dual-delivery system ─────────────────────────────────────────────
      // deliveries[0] = Kit dispatch (raw materials sent to customer first)
      // deliveries[1] = Final product dispatch (personalised product ships after)
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

    // Update inventory on order confirm
    try {
      await updateInventoryOnOrderConfirm(order.orderId);
    } catch (inventoryErr) {
      // Don't fail if inventory update fails
    }

    // Send order confirmation email to customer (non-blocking)
    const orderObj = order.toObject();
    const customerEmail = orderObj.shippingAddress?.email;
    if (customerEmail) {
      // Send customer confirmation email using simple HTML
      const customerName = orderObj.shippingAddress?.fullName || "Valued Customer";
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
        <p>Hi ${customerName},</p>
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
        
        <p>We'll send you another email once your order is being prepared.</p>
        <p>Best regards,<br/>Make My Memory Team</p>
      `;

      try {
        const result = await sendEmail({
          to: customerEmail,
          subject: `Order Confirmation - ${orderObj.orderId} 🎁`,
          html: emailHtml,
        });
        if (result.success) {
          console.log(`✅ Customer confirmation email sent to ${customerEmail}`);
        } else {
          console.error(`❌ Failed to send customer email:`, result.error);
        }
      } catch (err) {
        console.error(`❌ Error sending customer email:`, err);
      }

      // Send admin notification
      if (process.env.ADMIN_EMAIL) {
        try {
          const adminEmailHtml = `
            <h2>New Order Received</h2>
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
            
            <p><a href="${process.env.NEXT_PUBLIC_APP_URL || "https://makemymemory.in"}/admin/orders/${orderObj.orderId}">View in Admin Panel</a></p>
          `;

          const adminResult = await sendEmail({
            to: process.env.ADMIN_EMAIL,
            subject: `🛍️ New Order: ${orderObj.orderId} — ₹${orderObj.total?.toLocaleString("en-IN")}`,
            html: adminEmailHtml,
          });
          if (adminResult.success) {
            console.log(`✅ Admin notification sent`);
          } else {
            console.error(`❌ Failed to send admin notification:`, adminResult.error);
          }
        } catch (err) {
          console.error(`❌ Error sending admin notification:`, err);
        }
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
