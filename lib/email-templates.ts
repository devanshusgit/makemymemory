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
      Hi <strong>${order.shippingAddress?.fullName || 'Valued Customer'}</strong>, your order has been placed successfully and is being prepared with care.
    </p>
    <div style="background:#F5F0EB;border-radius:10px;padding:12px 16px;margin-bottom:20px;border-left:4px solid #8FBC8F;">
      <p style="margin:0;font-size:13px;color:#57534e;">Order ID</p>
      <p style="margin:4px 0 0;font-size:16px;font-weight:700;color:#2C2520;font-family:monospace;">${order.orderId}</p>
      <p style="margin:8px 0 0;font-size:12px;color:#78716c;">Placed on ${new Date(order.createdAt || Date.now()).toLocaleDateString('en-IN')}</p>
    </div>
    ${emailTemplates.itemsTable(order.items ?? [])}
    <div style="border-top:2px solid #F5F0EB;margin-top:12px;padding-top:12px;text-align:right;">
      <p style="font-size:16px;font-weight:700;color:#2C2520;margin:0;">
        Total: ₹${order.total?.toLocaleString("en-IN")}
      </p>
      ${order.isCOD ? `<p style="font-size:12px;color:#b45309;margin:4px 0 0;font-weight:600;">💵 Pay on Delivery - Full amount due at doorstep</p>` : `<p style="font-size:12px;color:#166534;margin:4px 0 0;font-weight:600;">✓ Payment Received - Thank you!</p>`}
    </div>
    <div style="background:#f5f0eb;border-radius:10px;padding:16px;margin-top:20px;">
      <p style="margin:0;font-size:13px;font-weight:600;color:#2C2520;">What's Next?</p>
      <ul style="margin:8px 0 0;padding-left:20px;font-size:13px;color:#78716c;line-height:1.6;">
        <li>We're carefully preparing your keepsake</li>
        <li>You'll receive a tracking update within 24 hours</li>
        <li>Typical delivery time: 5-7 business days</li>
      </ul>
    </div>
    <p style="color:#78716c;font-size:12px;margin:20px 0 0;">
      Have questions? <a href="mailto:${process.env.ADMIN_EMAIL}" style="color:#8FBC8F;text-decoration:none;font-weight:600;">Contact our team</a>
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
      Hi <strong>${order.shippingAddress?.fullName || 'Valued Customer'}</strong>, your precious keepsake has been dispatched and is on its way to you!
    </p>
    <div style="background:#F5F0EB;border-radius:10px;padding:16px;margin:16px 0;border-left:4px solid #8FBC8F;">
      <p style="margin:0;font-size:13px;color:#57534e;font-weight:600;">📍 Tracking Information</p>
      <p style="margin:8px 0 0;font-size:14px;color:#2C2520;">
        <strong>Courier Partner:</strong> ${trackingInfo.courierName || 'Express Shipping'}
      </p>
      <p style="margin:4px 0 0;font-size:14px;color:#2C2520;">
        <strong>Tracking ID:</strong> <code style="background:#fff;padding:4px 8px;border-radius:4px;font-family:monospace;font-weight:600;border:1px solid #C9A84C;">${trackingInfo.courierTrackingId || 'Will be updated soon'}</code>
      </p>
      ${trackingInfo.courierTrackingUrl ? `
      <p style="margin:12px 0 0;">
        <a href="${trackingInfo.courierTrackingUrl}" style="display:inline-block;background:#8FBC8F;color:#fff;padding:8px 16px;border-radius:6px;text-decoration:none;font-weight:600;font-size:13px;">Track Your Package →</a>
      </p>
      ` : `<p style="margin:8px 0 0;font-size:12px;color:#78716c;font-style:italic;">Tracking details will be available shortly</p>`}
    </div>
    <div style="background:#f5f0eb;border-radius:10px;padding:16px;margin:16px 0;">
      <p style="margin:0;font-size:13px;font-weight:600;color:#2C2520;">📅 Estimated Delivery</p>
      <p style="margin:6px 0 0;font-size:14px;color:#78716c;line-height:1.6;">
        Your order should arrive within 5-7 business days. We've packaged it with extra care to ensure it arrives in perfect condition.
      </p>
    </div>
    ${emailTemplates.button("Track Order", `${process.env.NEXT_PUBLIC_APP_URL}/track?orderId=${order.orderId}`)}
    <p style="color:#a8a29e;font-size:12px;margin:20px 0 0;text-align:center;">
      Thank you for trusting Make My Memory with your precious moments! 💝
    </p>
  `,

  reviewRequest: (order: any) => `
    ${emailTemplates.header("Share Your Experience! ⭐")}
    <p style="color:#78716c;font-size:14px;margin:0 0 16px;">
      Hi <strong>${order.shippingAddress?.fullName || 'Valued Customer'}</strong>, we hope you absolutely love your keepsake!
    </p>
    <div style="background:#FEF3C7;border-left:4px solid #F59E0B;border-radius:10px;padding:16px;margin:16px 0;">
      <p style="margin:0;font-size:14px;color:#78716c;line-height:1.6;">
        Your feedback means the world to us. It helps us continue creating beautiful, meaningful keepsakes and helps other families find the perfect way to preserve their memories.
      </p>
    </div>
    <div style="text-align:center;margin:24px 0;">
      ${emailTemplates.button("Leave a Review", `${process.env.NEXT_PUBLIC_APP_URL}/reviews?orderId=${order.orderId}`)}
    </div>
    <div style="background:#f5f0eb;border-radius:10px;padding:16px;margin:16px 0;">
      <p style="margin:0;font-size:13px;font-weight:600;color:#2C2520;">💝 Why Your Review Matters</p>
      <ul style="margin:8px 0 0;padding-left:20px;font-size:13px;color:#78716c;line-height:1.8;">
        <li>Help other families discover the joy of keepsakes</li>
        <li>Share tips on how you're treasuring your item</li>
        <li>Inspire us to keep improving our craft</li>
        <li>Every review gets a personal thank you from our team!</li>
      </ul>
    </div>
    <p style="color:#a8a29e;font-size:12px;margin:20px 0 0;text-align:center;">
      With gratitude,<br/>
      <strong>The Make My Memory Family</strong> 🎁
    </p>
  `,
};
