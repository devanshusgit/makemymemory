import nodemailer from "nodemailer";

function getTransporter() {
  const host = process.env.SMTP_HOST;
  const port = parseInt(process.env.SMTP_PORT ?? "587", 10);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    console.warn("[email] SMTP not configured — skipping email send");
    return null;
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });
}

function formatItems(items: any[]): string {
  return items
    .map(
      (i) =>
        `<tr>
          <td style="padding:8px 12px;border-bottom:1px solid #f0ece8;">${i.emoji ?? "🎁"} ${i.name}</td>
          <td style="padding:8px 12px;border-bottom:1px solid #f0ece8;text-align:center;">×${i.quantity}</td>
          <td style="padding:8px 12px;border-bottom:1px solid #f0ece8;text-align:right;">₹${i.price?.toLocaleString("en-IN")}</td>
        </tr>`
    )
    .join("");
}

export async function sendOrderConfirmation(order: any) {
  const transporter = getTransporter();
  if (!transporter) return;

  const email = order.shippingAddress?.email;
  if (!email) return;

  const html = `
    <div style="font-family:Inter,sans-serif;max-width:560px;margin:0 auto;background:#F5F0EB;padding:32px 16px;">
      <div style="background:#2C2520;border-radius:16px;padding:24px;text-align:center;margin-bottom:24px;">
        <h1 style="color:#F5F0EB;font-size:22px;margin:0;font-family:Georgia,serif;">
          Make My <span style="color:#8FBC8F;">Memory</span>
        </h1>
      </div>
      <div style="background:#fff;border-radius:16px;padding:28px;margin-bottom:16px;">
        <h2 style="color:#2C2520;font-size:18px;margin:0 0 8px;">Order Confirmed! 🎉</h2>
        <p style="color:#78716c;font-size:14px;margin:0 0 20px;">
          Hi ${order.shippingAddress?.fullName}, your order has been placed successfully.
        </p>
        <div style="background:#F5F0EB;border-radius:10px;padding:12px 16px;margin-bottom:20px;">
          <p style="margin:0;font-size:13px;color:#57534e;">Order ID</p>
          <p style="margin:4px 0 0;font-size:16px;font-weight:700;color:#2C2520;font-family:monospace;">${order.orderId}</p>
        </div>
        <table style="width:100%;border-collapse:collapse;font-size:14px;">
          <thead>
            <tr style="background:#F5F0EB;">
              <th style="padding:8px 12px;text-align:left;color:#78716c;font-weight:600;">Item</th>
              <th style="padding:8px 12px;text-align:center;color:#78716c;font-weight:600;">Qty</th>
              <th style="padding:8px 12px;text-align:right;color:#78716c;font-weight:600;">Price</th>
            </tr>
          </thead>
          <tbody>${formatItems(order.items ?? [])}</tbody>
        </table>
        <div style="border-top:2px solid #F5F0EB;margin-top:12px;padding-top:12px;text-align:right;">
          <p style="font-size:16px;font-weight:700;color:#2C2520;margin:0;">
            Total: ₹${order.total?.toLocaleString("en-IN")}
          </p>
          ${order.isCOD ? `<p style="font-size:12px;color:#b45309;margin:4px 0 0;">Our team will contact you for ₹150 advance before dispatch.</p>` : ""}
        </div>
      </div>
      <p style="text-align:center;font-size:12px;color:#a8a29e;">
        Questions? Reply to this email or contact us at ${process.env.SMTP_USER}
      </p>
    </div>
  `;

  await transporter.sendMail({
    from: `"Make My Memory" <${process.env.SMTP_USER}>`,
    to: email,
    subject: `Order Confirmed — ${order.orderId} 🎁`,
    html,
  });
}

export async function sendAdminNotification(order: any) {
  const transporter = getTransporter();
  if (!transporter) return;

  const adminEmail = process.env.ADMIN_EMAIL;
  if (!adminEmail) return;

  const html = `
    <div style="font-family:Inter,sans-serif;max-width:560px;margin:0 auto;">
      <h2 style="color:#2C2520;">New Order: ${order.orderId}</h2>
      <p><strong>Customer:</strong> ${order.shippingAddress?.fullName} (${order.shippingAddress?.email})</p>
      <p><strong>Phone:</strong> ${order.shippingAddress?.phone}</p>
      <p><strong>Payment:</strong> ${order.paymentMethod?.toUpperCase()}${order.isCOD ? " (COD — collect ₹150 advance)" : ""}</p>
      <p><strong>Total:</strong> ₹${order.total?.toLocaleString("en-IN")}</p>
      <p><strong>Address:</strong> ${order.shippingAddress?.address}, ${order.shippingAddress?.city}, ${order.shippingAddress?.state} — ${order.shippingAddress?.pincode}</p>
      <h3>Items:</h3>
      <ul>
        ${(order.items ?? []).map((i: any) => `<li>${i.emoji} ${i.name} × ${i.quantity} — ₹${i.price?.toLocaleString("en-IN")}${i.customization ? ` (${i.customization})` : ""}</li>`).join("")}
      </ul>
      <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/admin/orders/${order.orderId}" style="color:#8FBC8F;">View in Admin Panel →</a></p>
    </div>
  `;

  await transporter.sendMail({
    from: `"Make My Memory Orders" <${process.env.SMTP_USER}>`,
    to: adminEmail,
    subject: `🛍️ New Order: ${order.orderId} — ₹${order.total?.toLocaleString("en-IN")}`,
    html,
  });
}
