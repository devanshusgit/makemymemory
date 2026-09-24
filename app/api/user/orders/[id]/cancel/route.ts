import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connect";
import { Order } from "@/lib/db/models/Order";
import { sendEmail, ADMIN_EMAIL } from "@/lib/email/resend";
import { parseSession, sessionMatchesContact } from "@/lib/auth/session";

const CANCELLABLE_STATUSES = new Set(["pending_payment", "confirmed", "processing"]);

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  /* ── Auth ── */
  const session = parseSession(req.cookies.get("user_session")?.value);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { reason } = await req.json().catch(() => ({ reason: "" }));
  const orderId = params.id;

  try {
    await connectDB();

    const order = await Order.findOne({ orderId });
    if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });

    /* ── Ownership check ── */
    if (!sessionMatchesContact(session, order.shippingAddress)) {
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
    const previousStatus = order.status;
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
    const esc = (v: unknown) => String(v ?? "")
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

    // What the customer actually paid, and so what has to go back. A COD order
    // DID take money — the online advance — and an order still awaiting
    // payment took none. Nothing here refunds automatically.
    const paidOnline = o.paymentMethod === "cod"
      ? (o.codAdvancePaid || 0)
      : previousStatus === "pending_payment" ? 0 : (o.total || 0);

    const customerEmail = o.shippingAddress?.email;
    if (customerEmail) {
      const itemsHtml = o.items
        .map((item: any) => `<li style="margin-bottom:6px;font-size:14px;">${esc(item.name)} × ${item.quantity} = ₹${(item.price * item.quantity).toLocaleString("en-IN")}</li>`)
        .join("");

      // The COD text used to say no payment was made — but the customer paid
      // the advance online.
      const refundNote = paidOnline > 0
        ? `The ₹${paidOnline.toLocaleString("en-IN")} you paid online will be refunded to your original payment method within 5–7 business days.`
        : "No payment was taken for this order, so there is nothing to refund.";

      sendEmail({
        to: customerEmail,
        subject: `Order Cancelled — ${o.orderId}`,
        html: `
          <h2>Order Cancelled</h2>
          <p>Hi ${esc(o.shippingAddress.fullName)},</p>
          <p>Your order <strong>${o.orderId}</strong> has been successfully cancelled.</p>
          ${reason ? `<p><strong>Reason:</strong> ${esc(reason)}</p>` : ""}
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
          subject: paidOnline > 0 ? `ACTION: refund ₹${paidOnline} — order ${o.orderId} cancelled` : `🚫 Order Cancelled: ${o.orderId}`,
          html: `
            <h2>Order Cancelled by Customer</h2>
            ${paidOnline > 0 ? `<p style="color:#B0301F"><strong>ACTION NEEDED: refund ₹${paidOnline.toLocaleString("en-IN")} in the Razorpay dashboard${o.razorpayPaymentId ? ` (payment ${esc(o.razorpayPaymentId)})` : ""}. It is NOT refunded automatically, and the customer has been told to expect it within 5–7 business days.</strong></p>` : ""}
            <p><strong>Order ID:</strong> ${o.orderId}</p>
            <p><strong>Customer:</strong> ${esc(o.shippingAddress.fullName)} (${esc(o.shippingAddress.email)})</p>
            <p><strong>Reason:</strong> ${esc(reason || "Not provided")}</p>
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
