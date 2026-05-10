/**
 * Email Templates for Make My Memory
 * Centralized email template management
 */

export const emailTemplates = {
  header: (title: string) => `
    <div style="background:#2C2520;border-radius:16px;padding:24px;text-align:center;margin-bottom:24px;">
      <h1 style="color:#F5F0EB;font-size:22px;margin:0;font-family:Georgia,serif;">
        Make My <span style="color:#8FBC8F;">Memory</span>
      </h1>
      ${title ? `<p style="color:#C9A84C;font-size:14px;margin:8px 0 0;font-weight:600;">${title}</p>` : ""}
    </div>
  `,

  footer: () => `
    <div style="margin-top:32px;padding-top:16px;border-top:1px solid #e8e0d8;text-align:center;">
      <p style="color:#a8a29e;font-size:12px;margin:0;">
        © 2026 Make My Memory. All rights reserved.
      </p>
      <p style="color:#a8a29e;font-size:11px;margin:8px 0 0;">
        <a href="${process.env.NEXT_PUBLIC_APP_URL}" style="color:#8FBC8F;text-decoration:none;">Visit Website</a> • 
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/contact" style="color:#8FBC8F;text-decoration:none;">Contact Us</a> • 
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/privacy-policy" style="color:#8FBC8F;text-decoration:none;">Privacy</a>
      </p>
    </div>
  `,

  wrapper: (content: string) => `
    <div style="font-family:Inter,sans-serif;max-width:560px;margin:0 auto;background:#F5F0EB;padding:32px 16px;">
      <div style="background:#fff;border-radius:16px;padding:28px;">
        ${content}
      </div>
      ${emailTemplates.footer()}
    </div>
  `,

  button: (text: string, url: string) => `
    <a href="${url}" style="display:inline-block;background:#8FBC8F;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;font-size:14px;margin:16px 0;">
      ${text}
    </a>
  `,

  alert: (type: 'success' | 'warning' | 'error', message: string) => {
    const colors = {
      success: { bg: '#dcfce7', text: '#166534', border: '#86efac' },
      warning: { bg: '#fef3c7', text: '#b45309', border: '#fcd34d' },
      error: { bg: '#fee2e2', text: '#991b1b', border: '#fca5a5' },
    };
    const color = colors[type];
    return `
      <div style="background:${color.bg};border-left:4px solid ${color.border};padding:16px;border-radius:8px;margin:16px 0;">
        <p style="color:${color.text};font-size:14px;margin:0;font-weight:600;">${message}</p>
      </div>
    `;
  },

  itemsTable: (items: any[]) => `
    <table style="width:100%;border-collapse:collapse;font-size:14px;margin:16px 0;">
      <thead>
        <tr style="background:#F5F0EB;">
          <th style="padding:8px 12px;text-align:left;color:#78716c;font-weight:600;">Item</th>
          <th style="padding:8px 12px;text-align:center;color:#78716c;font-weight:600;">Qty</th>
          <th style="padding:8px 12px;text-align:right;color:#78716c;font-weight:600;">Price</th>
        </tr>
      </thead>
      <tbody>
        ${items
          .map(
            (i) => `
          <tr>
            <td style="padding:8px 12px;border-bottom:1px solid #f0ece8;">${i.name}</td>
            <td style="padding:8px 12px;border-bottom:1px solid #f0ece8;text-align:center;">×${i.quantity}</td>
            <td style="padding:8px 12px;border-bottom:1px solid #f0ece8;text-align:right;">₹${i.price?.toLocaleString("en-IN")}</td>
          </tr>
        `
          )
          .join("")}
      </tbody>
    </table>
  `,

  orderConfirmation: (order: any) => `
    ${emailTemplates.header("Order Confirmed! 🎉")}
    <p style="color:#78716c;font-size:14px;margin:0 0 20px;">
      Hi ${order.shippingAddress?.fullName}, your order has been placed successfully.
    </p>
    <div style="background:#F5F0EB;border-radius:10px;padding:12px 16px;margin-bottom:20px;">
      <p style="margin:0;font-size:13px;color:#57534e;">Order ID</p>
      <p style="margin:4px 0 0;font-size:16px;font-weight:700;color:#2C2520;font-family:monospace;">${order.orderId}</p>
    </div>
    ${emailTemplates.itemsTable(order.items ?? [])}
    <div style="border-top:2px solid #F5F0EB;margin-top:12px;padding-top:12px;text-align:right;">
      <p style="font-size:16px;font-weight:700;color:#2C2520;margin:0;">
        Total: ₹${order.total?.toLocaleString("en-IN")}
      </p>
      ${order.isCOD ? `<p style="font-size:12px;color:#b45309;margin:4px 0 0;">Our team will contact you for ₹150 advance before dispatch.</p>` : ""}
    </div>
    <p style="color:#78716c;font-size:12px;margin:20px 0 0;">
      Questions? <a href="mailto:${process.env.ADMIN_EMAIL}" style="color:#8FBC8F;text-decoration:none;">Contact us</a>
    </p>
  `,

  paymentFailure: (order: any, reason: string) => `
    ${emailTemplates.header("Payment Failed ⚠️")}
    <p style="color:#78716c;font-size:14px;margin:0 0 16px;">
      Hi ${order.shippingAddress?.fullName}, your payment could not be processed.
    </p>
    ${emailTemplates.alert('error', `Payment failed: ${reason}`)}
    <p style="color:#78716c;font-size:14px;margin:16px 0;">
      <strong>Order ID:</strong> ${order.orderId}
    </p>
    <p style="color:#78716c;font-size:14px;margin:16px 0;">
      Please try again or contact us for assistance.
    </p>
    ${emailTemplates.button("Retry Payment", `${process.env.NEXT_PUBLIC_APP_URL}/checkout`)}
  `,

  shipmentNotification: (order: any, trackingInfo: any) => `
    ${emailTemplates.header("Your Order is on the Way! 📦")}
    <p style="color:#78716c;font-size:14px;margin:0 0 16px;">
      Hi ${order.shippingAddress?.fullName}, your order has been dispatched!
    </p>
    <div style="background:#F5F0EB;border-radius:10px;padding:16px;margin:16px 0;">
      <p style="margin:0;font-size:13px;color:#57534e;font-weight:600;">Tracking Information</p>
      <p style="margin:8px 0 0;font-size:14px;color:#2C2520;">
        <strong>Courier:</strong> ${trackingInfo.courierName || 'N/A'}
      </p>
      <p style="margin:4px 0 0;font-size:14px;color:#2C2520;">
        <strong>Tracking ID:</strong> <code style="background:#fff;padding:2px 6px;border-radius:4px;font-family:monospace;">${trackingInfo.courierTrackingId || 'N/A'}</code>
      </p>
      ${trackingInfo.courierTrackingUrl ? `<p style="margin:8px 0 0;"><a href="${trackingInfo.courierTrackingUrl}" style="color:#8FBC8F;text-decoration:none;">Track Your Package →</a></p>` : ""}
    </div>
    ${emailTemplates.button("Track Order", `${process.env.NEXT_PUBLIC_APP_URL}/track?orderId=${order.orderId}`)}
  `,

  reviewRequest: (order: any) => `
    ${emailTemplates.header("Share Your Experience! ⭐")}
    <p style="color:#78716c;font-size:14px;margin:0 0 16px;">
      Hi ${order.shippingAddress?.fullName}, we'd love to hear what you think about your order!
    </p>
    <p style="color:#78716c;font-size:14px;margin:0 0 16px;">
      Your feedback helps us improve and helps other customers make informed decisions.
    </p>
    ${emailTemplates.button("Leave a Review", `${process.env.NEXT_PUBLIC_APP_URL}/reviews`)}
    <p style="color:#a8a29e;font-size:12px;margin:20px 0 0;">
      Thank you for choosing Make My Memory! 🎁
    </p>
  `,
};
