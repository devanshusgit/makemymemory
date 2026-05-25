/**
 * Resend Email Service
 * Handles all transactional emails for Make My Memory
 */

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const EMAIL_FROM = process.env.EMAIL_FROM || "noreply@makemymemory.in";

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  replyTo?: string;
}

/**
 * Send email via Resend
 */
export async function sendEmail(options: EmailOptions) {
  if (!RESEND_API_KEY) {
    console.warn("[email] RESEND_API_KEY not configured — skipping email send");
    return { success: false, error: "Email service not configured" };
  }

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: EMAIL_FROM,
        to: options.to,
        subject: options.subject,
        html: options.html,
        reply_to: options.replyTo,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error("[email] Resend error:", error);
      return { success: false, error: error.message || "Failed to send email" };
    }

    const data = await response.json();
    return { success: true, id: data.id };
  } catch (error) {
    console.error("[email] Error sending email:", error);
    return { success: false, error: String(error) };
  }
}

/**
 * Send order confirmation email
 */
export async function sendOrderConfirmationEmail(order: any) {
  const email = order.shippingAddress?.email;
  if (!email) return;

  const itemsHtml = (order.items || [])
    .map(
      (item: any) =>
        `<tr>
          <td style="padding: 12px; border-bottom: 1px solid #E8D5A3;">
            <strong>${item.name}</strong> × ${item.quantity}
          </td>
          <td style="padding: 12px; border-bottom: 1px solid #E8D5A3; text-align: right;">
            ₹${(item.price * item.quantity).toLocaleString("en-IN")}
          </td>
        </tr>`
    )
    .join("");

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: 'DM Sans', sans-serif; color: #1A1A1A; line-height: 1.6; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #1A1A1A 0%, #2d2520 100%); color: #FAF8F4; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
          .header h1 { margin: 0; font-size: 28px; }
          .content { background: #FAF8F4; padding: 30px; border-radius: 0 0 8px 8px; }
          .order-id { color: #C9A84C; font-weight: bold; font-size: 18px; }
          .section { margin: 20px 0; }
          .section-title { color: #C9A84C; font-weight: bold; font-size: 14px; text-transform: uppercase; margin-bottom: 10px; }
          table { width: 100%; border-collapse: collapse; }
          .total-row { background: rgba(201,168,76,0.1); font-weight: bold; }
          .button { display: inline-block; background: #C9A84C; color: #1A1A1A; padding: 12px 24px; border-radius: 24px; text-decoration: none; font-weight: bold; margin-top: 20px; }
          .footer { text-align: center; color: #6B6560; font-size: 12px; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>✨ Order Confirmed!</h1>
            <p>Thank you for your order</p>
          </div>
          <div class="content">
            <p>Hi ${order.shippingAddress?.fullName},</p>
            <p>Your order has been confirmed and we're getting started on crafting your personalised keepsake!</p>

            <div class="section">
              <div class="section-title">Order Details</div>
              <p><strong>Order ID:</strong> <span class="order-id">${order.orderId}</span></p>
              <p><strong>Order Date:</strong> ${new Date().toLocaleDateString("en-IN")}</p>
            </div>

            <div class="section">
              <div class="section-title">Items Ordered</div>
              <table>
                <tbody>
                  ${itemsHtml}
                  <tr class="total-row">
                    <td style="padding: 12px;">Total</td>
                    <td style="padding: 12px; text-align: right;">₹${order.total?.toLocaleString("en-IN")}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div class="section">
              <div class="section-title">Delivery Address</div>
              <p>
                ${order.shippingAddress?.fullName}<br>
                ${order.shippingAddress?.address}<br>
                ${order.shippingAddress?.city}, ${order.shippingAddress?.state} — ${order.shippingAddress?.pincode}<br>
                <strong>Phone:</strong> ${order.shippingAddress?.phone}
              </p>
            </div>

            <div class="section">
              <div class="section-title">What's Next?</div>
              <p>✓ We'll start crafting your order within 1–2 business days</p>
              <p>✓ You'll receive a shipping notification with tracking details</p>
              <p>✓ Estimated delivery: 2–3 days from shipment</p>
            </div>

            <a href="${process.env.NEXT_PUBLIC_APP_URL}/track?orderId=${order.orderId}" class="button">Track Your Order</a>

            <div class="footer">
              <p>Make My Memory | Mira Road, Thane, Maharashtra</p>
              <p>Questions? Reply to this email or contact us at support@makemymemory.in</p>
            </div>
          </div>
        </div>
      </body>
    </html>
  `;

  return sendEmail({
    to: email,
    subject: `Order Confirmed — ${order.orderId} 🎁`,
    html,
  });
}

/**
 * Send welcome/signup email
 */
export async function sendWelcomeEmail(user: { name: string; email: string }) {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: 'DM Sans', sans-serif; color: #1A1A1A; line-height: 1.6; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #1A1A1A 0%, #2d2520 100%); color: #FAF8F4; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
          .header h1 { margin: 0; font-size: 28px; }
          .content { background: #FAF8F4; padding: 30px; border-radius: 0 0 8px 8px; }
          .button { display: inline-block; background: #C9A84C; color: #1A1A1A; padding: 12px 24px; border-radius: 24px; text-decoration: none; font-weight: bold; margin-top: 20px; }
          .footer { text-align: center; color: #6B6560; font-size: 12px; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Welcome to Make My Memory! 🎉</h1>
          </div>
          <div class="content">
            <p>Hi ${user.name},</p>
            <p>Welcome to Make My Memory! We're thrilled to have you join our community of people who turn their precious moments into beautiful, lasting keepsakes.</p>

            <p><strong>What can you do now?</strong></p>
            <ul>
              <li>Browse our collection of personalised gifts</li>
              <li>Create custom photo books, frames, and more</li>
              <li>Track your orders in real-time</li>
              <li>Save your favourite items to your wishlist</li>
            </ul>

            <a href="${process.env.NEXT_PUBLIC_APP_URL}/shop" class="button">Start Shopping</a>

            <p style="margin-top: 30px; color: #6B6560; font-size: 14px;">
              Have questions? We're here to help! Reply to this email or visit our FAQ page.
            </p>

            <div class="footer">
              <p>Make My Memory | Crafted for Lifetime</p>
              <p>Mira Road, Thane, Maharashtra</p>
            </div>
          </div>
        </div>
      </body>
    </html>
  `;

  return sendEmail({
    to: user.email,
    subject: "Welcome to Make My Memory! 🎁",
    html,
  });
}
