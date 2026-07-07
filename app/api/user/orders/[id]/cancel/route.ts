import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connect";
import { Order } from "@/lib/db/models/Order";
import { sendEmail, ADMIN_EMAIL } from "@/lib/email/resend";

const CANCELLABLE_STATUSES = new Set(["confirmed", "processing"]);

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  /* ── Auth ── */
  const session = req.cookies.get("user_session")?.value;
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let userEmail: string;
  try {
    userEmail = JSON.parse(session).email;
    if (!userEmail) throw new Error();
  } catch {
    return NextResponse.json({ error: "Invalid session" }, { status: 401 });
  }

  const { reason } = await req.json().catch(() => ({ reason: "" }));
  const orderId = params.id;

  try {
    await connectDB();

    const order = await Order.findOne({ orderId });
    if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });

    /* ── Ownership check ── */
    if (order.shippingAddress.email.toLowerCase() !== userEmail.toLowerCase()) {
      return NextResponse.json({ error: "You can only cancel your own orders" }, { status: 403 });
    }

    /* ── Eligibility check ── */
    if (!CANCELLABLE_STATUSES.has(order.status)) {
      return NextResponse.json({
        error: `Cannot cancel an order with status "${order.status}". Only confirmed or processing orders can be cancelled.`,
        success: false,
      }, { status: 400 });
    }

    /* ── Cancel the order ── */
    order.status = "cancelled";
    order.trackingEvents.push({
      status:      "cancelled",
      description: reason
        ? `Order cancelled by customer. Reason: ${reason}`
        : "Order cancelled by customer.",
      location:  "Online",
      timestamp: new Date(),
    } as any);
    await order.save();

    /* ── Send cancellation emails (non-blocking) ── */
    const o = order.toObject();

    const customerEmail = o.shippingAddress?.email;
    if (customerEmail) {
      const itemsHtml = o.items
        .map((item: any) => `<li style="margin-bottom:6px;font-size:14px;">${item.name} × ${item.quantity} = ₹${(item.price * item.quantity).toLocaleString("en-IN")}</li>`)
        .join("");

      const refundNote = o.paymentMethod === "cod"
        ? "Since this was a COD order, no payment was made, so no refund is needed."
        : "A refund will be processed to your original payment method within 5–7 business days.";

      sendEmail({
        to: customerEmail,
        subject: `Order Cancelled — ${o.orderId}`,
        html: `
          <h2>Order Cancelled</h2>
          <p>Hi ${o.shippingAddress.fullName},</p>
          <p>Your order <strong>${o.orderId}</strong> has been successfully cancelled.</p>
          ${reason ? `<p><strong>Reason:</strong> ${reason}</p>` : ""}
          <h3>Cancelled Items:</h3>
          <ul style="list-style:none;padding:0;">${itemsHtml}</ul>
          <p><strong>Order Total:</strong> ₹${o.total.toLocaleString("en-IN")}</p>
          <p>${refundNote}</p>
          <p>If you have any questions, please <a href="${process.env.NEXT_PUBLIC_APP_URL || "https://makemymemory.in"}/contact">contact our support team</a>.</p>
          <p>Best regards,<br/>Make My Memory Team</p>
        `,
      }).catch(() => {});

      if (ADMIN_EMAIL) {
        sendEmail({
          to: ADMIN_EMAIL,
          subject: `🚫 Order Cancelled: ${o.orderId}`,
          html: `
            <h2>Order Cancelled by Customer</h2>
            <p><strong>Order ID:</strong> ${o.orderId}</p>
            <p><strong>Customer:</strong> ${o.shippingAddress.fullName} (${o.shippingAddress.email})</p>
            <p><strong>Reason:</strong> ${reason || "Not provided"}</p>
            <p><strong>Original Total:</strong> ₹${o.total.toLocaleString("en-IN")}</p>
            <p><strong>Payment Method:</strong> ${o.paymentMethod}</p>
            <p><a href="${process.env.NEXT_PUBLIC_APP_URL || "https://makemymemory.in"}/admin/orders/${o.orderId}">View in Admin Panel</a></p>
          `,
        }).catch(() => {});
      }
    }

    return NextResponse.json({ success: true, orderId: order.orderId, status: "cancelled" });

  } catch (err: any) {
    console.error("[cancel order]", err?.message ?? err);
    return NextResponse.json({ error: "Failed to cancel order. Please try again." }, { status: 500 });
  }
}
