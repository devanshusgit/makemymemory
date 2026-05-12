import nodemailer from "nodemailer";
import { emailTemplates } from "./email-templates";

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

export async function sendOrderConfirmation(order: any) {
  const transporter = getTransporter();
  if (!transporter) return;

  const email = order.shippingAddress?.email;
  if (!email) return;

  const html = emailTemplates.wrapper(emailTemplates.orderConfirmation(order));

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
      <p><strong>Payment:</strong> ${order.paymentMethod?.toUpperCase()}${order.isCOD ? " (Cash on Delivery)" : ""}</p>
      <p><strong>Total:</strong> ₹${order.total?.toLocaleString("en-IN")}</p>
      <p><strong>Address:</strong> ${order.shippingAddress?.address}, ${order.shippingAddress?.city}, ${order.shippingAddress?.state} — ${order.shippingAddress?.pincode}</p>
      <h3>Items:</h3>
      <ul>
        ${(order.items ?? []).map((i: any) => `<li>${i.name} × ${i.quantity} — ₹${i.price?.toLocaleString("en-IN")}${i.customization ? ` (${i.customization})` : ""}</li>`).join("")}
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

export async function sendPaymentFailureNotification(order: any, reason: string) {
  const transporter = getTransporter();
  if (!transporter) return;

  const email = order.shippingAddress?.email;
  if (!email) return;

  const html = emailTemplates.wrapper(emailTemplates.paymentFailure(order, reason));

  await transporter.sendMail({
    from: `"Make My Memory" <${process.env.SMTP_USER}>`,
    to: email,
    subject: `Payment Failed — ${order.orderId}`,
    html,
  });
}

export async function sendShipmentNotification(order: any, trackingInfo: any) {
  const transporter = getTransporter();
  if (!transporter) return;

  const email = order.shippingAddress?.email;
  if (!email) return;

  const html = emailTemplates.wrapper(emailTemplates.shipmentNotification(order, trackingInfo));

  await transporter.sendMail({
    from: `"Make My Memory" <${process.env.SMTP_USER}>`,
    to: email,
    subject: `Your Order is on the Way! — ${order.orderId} 📦`,
    html,
  });
}

export async function sendReviewRequest(order: any) {
  const transporter = getTransporter();
  if (!transporter) return;

  const email = order.shippingAddress?.email;
  if (!email) return;

  const html = emailTemplates.wrapper(emailTemplates.reviewRequest(order));

  await transporter.sendMail({
    from: `"Make My Memory" <${process.env.SMTP_USER}>`,
    to: email,
    subject: `Share Your Experience! — ${order.orderId} ⭐`,
    html,
  });
}
