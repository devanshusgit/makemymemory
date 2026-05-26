// Email template wrapper
function emailWrapper(content: string): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #FAF8F4;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #FAF8F4; padding: 40px 20px;">
          <tr>
            <td align="center">
              <table width="600" cellpadding="0" cellspacing="0" style="max-width: 600px; width: 100%;">
                
                <!-- Header -->
                <tr>
                  <td style="background-color: #C9A84C; border-radius: 16px 16px 0 0; padding: 32px; text-align: center;">
                    <h1 style="margin: 0; font-family: Georgia, serif; font-size: 28px; color: #1A1A1A; font-weight: 700;">
                      Make My Memory
                    </h1>
                    <p style="margin: 8px 0 0; font-size: 12px; color: #1A1A1A; opacity: 0.8; letter-spacing: 1px;">
                      CRAFTED FOR LIFETIME
                    </p>
                  </td>
                </tr>

                <!-- Content -->
                <tr>
                  <td style="background-color: #FFFFFF; padding: 40px 32px;">
                    ${content}
                  </td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td style="background-color: #1A1A1A; border-radius: 0 0 16px 16px; padding: 32px; text-align: center;">
                    <p style="margin: 0 0 12px; font-size: 14px; color: #C9A84C; font-weight: 600;">
                      Make My Memory
                    </p>
                    <p style="margin: 0 0 16px; font-size: 12px; color: #E8D5A3; line-height: 1.6;">
                      Mira Road, Thane, Maharashtra<br>
                      India
                    </p>
                    <p style="margin: 0; font-size: 11px; color: #6B6560;">
                      <a href="https://makemymemory.in/unsubscribe" style="color: #C9A84C; text-decoration: none;">Unsubscribe</a>
                    </p>
                  </td>
                </tr>

              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `;
}

// USER EMAILS

export function orderConfirmationEmail(order: any): string {
  const itemsHtml = order.items
    .map(
      (item: any) => `
        <tr>
          <td style="padding: 12px 0; border-bottom: 1px solid #F0EBE1;">
            <strong style="color: #1A1A1A;">${item.name}</strong><br>
            <span style="font-size: 13px; color: #6B6560;">Qty: ${item.quantity} × ₹${item.price.toLocaleString("en-IN")}</span>
          </td>
          <td style="padding: 12px 0; border-bottom: 1px solid #F0EBE1; text-align: right; color: #1A1A1A; font-weight: 600;">
            ₹${(item.quantity * item.price).toLocaleString("en-IN")}
          </td>
        </tr>
      `
    )
    .join("");

  const content = `
    <h2 style="margin: 0 0 8px; font-family: Georgia, serif; font-size: 24px; color: #1A1A1A;">
      Order Confirmed! 🎉
    </h2>
    <p style="margin: 0 0 24px; font-size: 15px; color: #6B6560; line-height: 1.6;">
      Thank you for your order, <strong>${order.customerName}</strong>! We're excited to create something special for you.
    </p>

    <div style="background-color: #FAF8F4; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
      <p style="margin: 0 0 8px; font-size: 12px; color: #6B6560; text-transform: uppercase; font-weight: 600; letter-spacing: 1px;">
        Order ID
      </p>
      <p style="margin: 0; font-size: 18px; color: #C9A84C; font-weight: 700; font-family: monospace;">
        ${order.orderId}
      </p>
    </div>

    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 24px;">
      ${itemsHtml}
      <tr>
        <td style="padding: 16px 0; text-align: right; font-size: 18px; color: #1A1A1A; font-weight: 700;">
          Total:
        </td>
        <td style="padding: 16px 0; text-align: right; font-size: 18px; color: #C9A84C; font-weight: 700;">
          ₹${order.total.toLocaleString("en-IN")}
        </td>
      </tr>
    </table>

    <div style="background-color: #FAF8F4; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
      <p style="margin: 0 0 8px; font-size: 12px; color: #6B6560; text-transform: uppercase; font-weight: 600; letter-spacing: 1px;">
        Delivery Address
      </p>
      <p style="margin: 0; font-size: 14px; color: #1A1A1A; line-height: 1.6;">
        ${order.shippingAddress.fullName}<br>
        ${order.shippingAddress.address}<br>
        ${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.pincode}<br>
        Phone: ${order.shippingAddress.phone}
      </p>
    </div>

    <p style="margin: 24px 0 0; font-size: 13px; color: #6B6560; line-height: 1.6;">
      We'll send you another email once your order is being prepared. Track your order anytime at 
      <a href="https://makemymemory.in/account" style="color: #C9A84C; text-decoration: none;">your account</a>.
    </p>
  `;

  return emailWrapper(content);
}

export function orderProcessingEmail(order: any): string {
  const content = `
    <h2 style="margin: 0 0 8px; font-family: Georgia, serif; font-size: 24px; color: #1A1A1A;">
      We're Preparing Your Order
    </h2>
    <p style="margin: 0 0 24px; font-size: 15px; color: #6B6560; line-height: 1.6;">
      Hi <strong>${order.customerName}</strong>, great news! We've started working on your order.
    </p>

    <div style="background-color: #FAF8F4; border-radius: 12px; padding: 20px; margin-bottom: 24px; text-align: center;">
      <p style="margin: 0 0 8px; font-size: 12px; color: #6B6560; text-transform: uppercase; font-weight: 600; letter-spacing: 1px;">
        Order ID
      </p>
      <p style="margin: 0; font-size: 18px; color: #C9A84C; font-weight: 700; font-family: monospace;">
        ${order.orderId}
      </p>
    </div>

    <p style="margin: 0; font-size: 14px; color: #6B6560; line-height: 1.6;">
      Our team is carefully crafting your personalized keepsake. We'll notify you as soon as it's ready to ship!
    </p>
  `;

  return emailWrapper(content);
}

export function orderShippedEmail(order: any, trackingId: string, courierName: string): string {
  const content = `
    <h2 style="margin: 0 0 8px; font-family: Georgia, serif; font-size: 24px; color: #1A1A1A;">
      Your Order is On Its Way! 📦
    </h2>
    <p style="margin: 0 0 24px; font-size: 15px; color: #6B6560; line-height: 1.6;">
      Hi <strong>${order.customerName}</strong>, your order has been shipped and is heading your way!
    </p>

    <div style="background-color: #FAF8F4; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td style="padding-bottom: 12px;">
            <p style="margin: 0 0 4px; font-size: 12px; color: #6B6560; text-transform: uppercase; font-weight: 600; letter-spacing: 1px;">
              Order ID
            </p>
            <p style="margin: 0; font-size: 16px; color: #1A1A1A; font-weight: 600; font-family: monospace;">
              ${order.orderId}
            </p>
          </td>
        </tr>
        <tr>
          <td style="padding-bottom: 12px;">
            <p style="margin: 0 0 4px; font-size: 12px; color: #6B6560; text-transform: uppercase; font-weight: 600; letter-spacing: 1px;">
              Tracking ID
            </p>
            <p style="margin: 0; font-size: 16px; color: #C9A84C; font-weight: 700; font-family: monospace;">
              ${trackingId}
            </p>
          </td>
        </tr>
        <tr>
          <td>
            <p style="margin: 0 0 4px; font-size: 12px; color: #6B6560; text-transform: uppercase; font-weight: 600; letter-spacing: 1px;">
              Courier
            </p>
            <p style="margin: 0; font-size: 16px; color: #1A1A1A; font-weight: 600;">
              ${courierName}
            </p>
          </td>
        </tr>
      </table>
    </div>

    <p style="margin: 0; font-size: 14px; color: #6B6560; line-height: 1.6;">
      Estimated delivery: <strong>2-3 business days</strong>
    </p>
  `;

  return emailWrapper(content);
}

export function orderDeliveredEmail(order: any): string {
  const content = `
    <h2 style="margin: 0 0 8px; font-family: Georgia, serif; font-size: 24px; color: #1A1A1A;">
      Your Order Has Been Delivered! ✨
    </h2>
    <p style="margin: 0 0 24px; font-size: 15px; color: #6B6560; line-height: 1.6;">
      Hi <strong>${order.customerName}</strong>, your order has been successfully delivered!
    </p>

    <div style="background-color: #FAF8F4; border-radius: 12px; padding: 20px; margin-bottom: 24px; text-align: center;">
      <p style="margin: 0 0 8px; font-size: 12px; color: #6B6560; text-transform: uppercase; font-weight: 600; letter-spacing: 1px;">
        Order ID
      </p>
      <p style="margin: 0; font-size: 18px; color: #C9A84C; font-weight: 700; font-family: monospace;">
        ${order.orderId}
      </p>
    </div>

    <p style="margin: 0 0 16px; font-size: 14px; color: #6B6560; line-height: 1.6;">
      We hope you love your personalized keepsake! If you have any questions or concerns, please don't hesitate to reach out.
    </p>

    <p style="margin: 0; font-size: 14px; color: #6B6560; line-height: 1.6;">
      <strong>Love what you received?</strong> Share your experience by leaving a review on our website!
    </p>
  `;

  return emailWrapper(content);
}

export function orderCancelledEmail(order: any, reason: string): string {
  const content = `
    <h2 style="margin: 0 0 8px; font-family: Georgia, serif; font-size: 24px; color: #1A1A1A;">
      Order Cancelled
    </h2>
    <p style="margin: 0 0 24px; font-size: 15px; color: #6B6560; line-height: 1.6;">
      Hi <strong>${order.customerName}</strong>, your order has been cancelled.
    </p>

    <div style="background-color: #FAF8F4; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
      <p style="margin: 0 0 8px; font-size: 12px; color: #6B6560; text-transform: uppercase; font-weight: 600; letter-spacing: 1px;">
        Order ID
      </p>
      <p style="margin: 0 0 16px; font-size: 18px; color: #1A1A1A; font-weight: 700; font-family: monospace;">
        ${order.orderId}
      </p>
      <p style="margin: 0 0 4px; font-size: 12px; color: #6B6560; text-transform: uppercase; font-weight: 600; letter-spacing: 1px;">
        Reason
      </p>
      <p style="margin: 0; font-size: 14px; color: #1A1A1A;">
        ${reason}
      </p>
    </div>

    <div style="background-color: #FEF3C7; border-left: 4px solid #F59E0B; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
      <p style="margin: 0; font-size: 14px; color: #92400E; line-height: 1.6;">
        <strong>Refund Information:</strong> If you've already paid, your refund will be processed within 5-7 business days to your original payment method.
      </p>
    </div>

    <p style="margin: 0; font-size: 14px; color: #6B6560; line-height: 1.6;">
      If you have any questions, please contact us at <a href="mailto:support@makemymemory.in" style="color: #C9A84C; text-decoration: none;">support@makemymemory.in</a>
    </p>
  `;

  return emailWrapper(content);
}

export function welcomeEmail(name: string): string {
  const content = `
    <h2 style="margin: 0 0 8px; font-family: Georgia, serif; font-size: 24px; color: #1A1A1A;">
      Welcome to Make My Memory! 🎉
    </h2>
    <p style="margin: 0 0 24px; font-size: 15px; color: #6B6560; line-height: 1.6;">
      Hi <strong>${name}</strong>, we're thrilled to have you join our community!
    </p>

    <p style="margin: 0 0 24px; font-size: 14px; color: #6B6560; line-height: 1.6;">
      At Make My Memory, we believe every moment deserves to be preserved beautifully. Whether it's a tiny handprint, a special photo, or a cherished memory — we're here to help you create keepsakes that last a lifetime.
    </p>

    <div style="text-align: center; margin: 32px 0;">
      <a href="https://makemymemory.in/shop" style="display: inline-block; background-color: #C9A84C; color: #1A1A1A; text-decoration: none; padding: 14px 32px; border-radius: 50px; font-weight: 600; font-size: 14px;">
        Start Shopping
      </a>
    </div>

    <p style="margin: 0; font-size: 13px; color: #6B6560; line-height: 1.6; text-align: center;">
      Need help? We're just an email away at <a href="mailto:support@makemymemory.in" style="color: #C9A84C; text-decoration: none;">support@makemymemory.in</a>
    </p>
  `;

  return emailWrapper(content);
}

export function passwordResetEmail(name: string, resetLink: string): string {
  const content = `
    <h2 style="margin: 0 0 8px; font-family: Georgia, serif; font-size: 24px; color: #1A1A1A;">
      Reset Your Password
    </h2>
    <p style="margin: 0 0 24px; font-size: 15px; color: #6B6560; line-height: 1.6;">
      Hi <strong>${name}</strong>, we received a request to reset your password.
    </p>

    <p style="margin: 0 0 24px; font-size: 14px; color: #6B6560; line-height: 1.6;">
      Click the button below to create a new password. This link will expire in 1 hour.
    </p>

    <div style="text-align: center; margin: 32px 0;">
      <a href="${resetLink}" style="display: inline-block; background-color: #C9A84C; color: #1A1A1A; text-decoration: none; padding: 14px 32px; border-radius: 50px; font-weight: 600; font-size: 14px;">
        Reset Password
      </a>
    </div>

    <p style="margin: 0; font-size: 13px; color: #6B6560; line-height: 1.6;">
      If you didn't request this, you can safely ignore this email. Your password will remain unchanged.
    </p>
  `;

  return emailWrapper(content);
}

export function couponEmail(name: string): string {
  const content = `
    <h2 style="margin: 0 0 8px; font-family: Georgia, serif; font-size: 24px; color: #1A1A1A;">
      Thank You! Here's a Gift 🎁
    </h2>
    <p style="margin: 0 0 24px; font-size: 15px; color: #6B6560; line-height: 1.6;">
      Hi <strong>${name}</strong>, thank you for your first order! We're so grateful to be part of your memory-making journey.
    </p>

    <div style="background: linear-gradient(135deg, #C9A84C 0%, #E8D5A3 100%); border-radius: 16px; padding: 32px; text-align: center; margin: 24px 0;">
      <p style="margin: 0 0 12px; font-size: 14px; color: #1A1A1A; font-weight: 600; text-transform: uppercase; letter-spacing: 2px;">
        Your Exclusive Coupon
      </p>
      <p style="margin: 0 0 8px; font-size: 32px; color: #1A1A1A; font-weight: 700; font-family: monospace; letter-spacing: 4px;">
        WELCOME15
      </p>
      <p style="margin: 0; font-size: 14px; color: #1A1A1A; opacity: 0.8;">
        15% OFF your next order
      </p>
    </div>

    <div style="background-color: #FAF8F4; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
      <p style="margin: 0 0 8px; font-size: 13px; color: #6B6560; line-height: 1.6;">
        <strong>How to use:</strong> Enter code <strong>WELCOME15</strong> at checkout
      </p>
      <p style="margin: 0; font-size: 13px; color: #6B6560; line-height: 1.6;">
        <strong>Valid for:</strong> 30 days from today
      </p>
    </div>

    <div style="text-align: center; margin: 32px 0;">
      <a href="https://makemymemory.in/shop" style="display: inline-block; background-color: #1A1A1A; color: #FFFFFF; text-decoration: none; padding: 14px 32px; border-radius: 50px; font-weight: 600; font-size: 14px;">
        Shop Now
      </a>
    </div>
  `;

  return emailWrapper(content);
}

// ADMIN NOTIFICATION EMAILS

export function adminNewOrderEmail(order: any): string {
  const itemsHtml = order.items
    .map(
      (item: any) => `
        <tr>
          <td style="padding: 8px 0; border-bottom: 1px solid #F0EBE1; color: #1A1A1A;">
            ${item.name} × ${item.quantity}
          </td>
          <td style="padding: 8px 0; border-bottom: 1px solid #F0EBE1; text-align: right; color: #1A1A1A;">
            ₹${(item.quantity * item.price).toLocaleString("en-IN")}
          </td>
        </tr>
      `
    )
    .join("");

  const content = `
    <h2 style="margin: 0 0 8px; font-family: Georgia, serif; font-size: 22px; color: #1A1A1A;">
      New Order Received
    </h2>
    <p style="margin: 0 0 24px; font-size: 14px; color: #6B6560;">
      Order ID: <strong style="color: #C9A84C; font-family: monospace;">${order.orderId}</strong>
    </p>

    <div style="background-color: #FAF8F4; border-radius: 12px; padding: 16px; margin-bottom: 20px;">
      <p style="margin: 0 0 8px; font-size: 12px; color: #6B6560; text-transform: uppercase; font-weight: 600;">Customer</p>
      <p style="margin: 0; font-size: 14px; color: #1A1A1A;">
        ${order.customerName}<br>
        ${order.email}<br>
        ${order.phone}
      </p>
    </div>

    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 20px;">
      ${itemsHtml}
      <tr>
        <td style="padding: 12px 0; font-weight: 700; color: #1A1A1A;">Total:</td>
        <td style="padding: 12px 0; text-align: right; font-weight: 700; color: #C9A84C;">₹${order.total.toLocaleString("en-IN")}</td>
      </tr>
    </table>

    <div style="background-color: #FAF8F4; border-radius: 12px; padding: 16px;">
      <p style="margin: 0 0 8px; font-size: 12px; color: #6B6560; text-transform: uppercase; font-weight: 600;">Shipping Address</p>
      <p style="margin: 0; font-size: 13px; color: #1A1A1A; line-height: 1.6;">
        ${order.shippingAddress.address}<br>
        ${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.pincode}
      </p>
    </div>
  `;

  return emailWrapper(content);
}

export function adminNewContactEmail(contact: any): string {
  const content = `
    <h2 style="margin: 0 0 8px; font-family: Georgia, serif; font-size: 22px; color: #1A1A1A;">
      New Contact Form Submission
    </h2>
    <p style="margin: 0 0 24px; font-size: 14px; color: #6B6560;">
      From: <strong>${contact.name}</strong>
    </p>

    <div style="background-color: #FAF8F4; border-radius: 12px; padding: 16px; margin-bottom: 20px;">
      <p style="margin: 0 0 8px; font-size: 12px; color: #6B6560; text-transform: uppercase; font-weight: 600;">Contact Details</p>
      <p style="margin: 0; font-size: 14px; color: #1A1A1A; line-height: 1.6;">
        <strong>Email:</strong> ${contact.email}<br>
        ${contact.phone ? `<strong>Phone:</strong> ${contact.phone}<br>` : ""}
        <strong>Subject:</strong> ${contact.subject}
      </p>
    </div>

    <div style="background-color: #FAF8F4; border-radius: 12px; padding: 16px;">
      <p style="margin: 0 0 8px; font-size: 12px; color: #6B6560; text-transform: uppercase; font-weight: 600;">Message</p>
      <p style="margin: 0; font-size: 14px; color: #1A1A1A; line-height: 1.6; white-space: pre-wrap;">
        ${contact.message}
      </p>
    </div>
  `;

  return emailWrapper(content);
}

export function adminNewUserEmail(user: any): string {
  const content = `
    <h2 style="margin: 0 0 8px; font-family: Georgia, serif; font-size: 22px; color: #1A1A1A;">
      New User Signup
    </h2>
    <p style="margin: 0 0 24px; font-size: 14px; color: #6B6560;">
      A new user has registered on the platform.
    </p>

    <div style="background-color: #FAF8F4; border-radius: 12px; padding: 16px;">
      <p style="margin: 0 0 8px; font-size: 12px; color: #6B6560; text-transform: uppercase; font-weight: 600;">User Details</p>
      <p style="margin: 0; font-size: 14px; color: #1A1A1A; line-height: 1.6;">
        <strong>Name:</strong> ${user.name}<br>
        <strong>Email:</strong> ${user.email}<br>
        <strong>Registered:</strong> ${new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
      </p>
    </div>
  `;

  return emailWrapper(content);
}

export function adminNewReviewEmail(review: any): string {
  const starsHtml = "★".repeat(review.rating) + "☆".repeat(5 - review.rating);

  const content = `
    <h2 style="margin: 0 0 8px; font-family: Georgia, serif; font-size: 22px; color: #1A1A1A;">
      New Review Submitted
    </h2>
    <p style="margin: 0 0 24px; font-size: 14px; color: #6B6560;">
      A new review is awaiting approval.
    </p>

    <div style="background-color: #FAF8F4; border-radius: 12px; padding: 16px; margin-bottom: 20px;">
      <p style="margin: 0 0 8px; font-size: 12px; color: #6B6560; text-transform: uppercase; font-weight: 600;">Reviewer</p>
      <p style="margin: 0; font-size: 14px; color: #1A1A1A; line-height: 1.6;">
        <strong>Name:</strong> ${review.name}<br>
        <strong>Email:</strong> ${review.email}<br>
        ${review.product ? `<strong>Product:</strong> ${review.product}<br>` : ""}
        <strong>Rating:</strong> <span style="color: #C9A84C; font-size: 16px;">${starsHtml}</span>
      </p>
    </div>

    <div style="background-color: #FAF8F4; border-radius: 12px; padding: 16px;">
      <p style="margin: 0 0 8px; font-size: 12px; color: #6B6560; text-transform: uppercase; font-weight: 600;">Review</p>
      <p style="margin: 0; font-size: 14px; color: #1A1A1A; line-height: 1.6; white-space: pre-wrap;">
        ${review.review}
      </p>
    </div>
  `;

  return emailWrapper(content);
}

export function adminNewProductEmail(product: any): string {
  const content = `
    <h2 style="margin: 0 0 8px; font-family: Georgia, serif; font-size: 22px; color: #1A1A1A;">
      New Product Added
    </h2>
    <p style="margin: 0 0 24px; font-size: 14px; color: #6B6560;">
      A new product has been added to your store.
    </p>

    <div style="background-color: #FAF8F4; border-radius: 12px; padding: 20px; margin-bottom: 20px;">
      ${product.images?.[0] ? `
        <img src="${product.images[0]}" alt="${product.name}" 
          style="width: 100%; max-width: 300px; height: auto; border-radius: 8px; margin-bottom: 16px;" />
      ` : ""}
      
      <h3 style="margin: 0 0 12px; font-size: 18px; color: #1A1A1A; font-weight: 600;">
        ${product.name}
      </h3>
      
      <p style="margin: 0 0 16px; font-size: 14px; color: #6B6560; line-height: 1.6;">
        ${product.description}
      </p>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 16px;">
        <div>
          <p style="margin: 0 0 4px; font-size: 12px; color: #6B6560; text-transform: uppercase; font-weight: 600;">Price</p>
          <p style="margin: 0; font-size: 16px; color: #C9A84C; font-weight: 700;">₹${product.price.toLocaleString("en-IN")}</p>
        </div>
        <div>
          <p style="margin: 0 0 4px; font-size: 12px; color: #6B6560; text-transform: uppercase; font-weight: 600;">Category</p>
          <p style="margin: 0; font-size: 14px; color: #1A1A1A;">${product.category}</p>
        </div>
      </div>

      ${product.customizationFields && product.customizationFields.length > 0 ? `
        <div style="border-top: 1px solid #E8D5A3; padding-top: 16px;">
          <p style="margin: 0 0 12px; font-size: 12px; color: #6B6560; text-transform: uppercase; font-weight: 600;">
            Customization Fields (${product.customizationFields.length})
          </p>
          ${product.customizationFields.map((field: any) => `
            <div style="margin-bottom: 8px;">
              <span style="font-size: 13px; color: #1A1A1A;">
                • ${field.label} 
                <span style="color: #6B6560; font-size: 11px;">(${field.type}${field.required ? ", required" : ""})</span>
              </span>
            </div>
          `).join("")}
        </div>
      ` : ""}
    </div>

    <div style="text-align: center;">
      <a href="${process.env.NEXT_PUBLIC_APP_URL || "https://makemymemory.in"}/admin/products" 
        style="display: inline-block; background-color: #C9A84C; color: #1A1A1A; text-decoration: none; 
               padding: 12px 32px; border-radius: 8px; font-weight: 600; font-size: 14px;">
        View in Admin Panel
      </a>
    </div>
  `;

  return emailWrapper(content);
}

export function userNewProductEmail(product: any, userName: string): string {
  const content = `
    <h2 style="margin: 0 0 8px; font-family: Georgia, serif; font-size: 24px; color: #1A1A1A;">
      New Product Alert! 🎉
    </h2>
    <p style="margin: 0 0 24px; font-size: 16px; color: #6B6560;">
      Hi ${userName}, we just added something special you might love!
    </p>

    <div style="background-color: #FAF8F4; border-radius: 16px; padding: 24px; margin-bottom: 24px;">
      ${product.images?.[0] ? `
        <img src="${product.images[0]}" alt="${product.name}" 
          style="width: 100%; height: auto; border-radius: 12px; margin-bottom: 20px;" />
      ` : ""}
      
      <h3 style="margin: 0 0 12px; font-size: 20px; color: #1A1A1A; font-weight: 700;">
        ${product.name}
      </h3>
      
      ${product.badge ? `
        <span style="display: inline-block; background-color: #C9A84C; color: #1A1A1A; 
                     padding: 4px 12px; border-radius: 20px; font-size: 11px; font-weight: 700; 
                     text-transform: uppercase; margin-bottom: 12px;">
          ${product.badge}
        </span>
      ` : ""}
      
      <p style="margin: 0 0 20px; font-size: 15px; color: #6B6560; line-height: 1.7;">
        ${product.description}
      </p>

      <div style="margin-bottom: 20px;">
        <p style="margin: 0 0 8px; font-size: 13px; color: #6B6560;">Starting at</p>
        <p style="margin: 0; font-size: 28px; color: #C9A84C; font-weight: 700;">
          ₹${product.price.toLocaleString("en-IN")}
          ${product.originalPrice ? `
            <span style="font-size: 16px; color: #A8A29E; text-decoration: line-through; margin-left: 8px;">
              ₹${product.originalPrice.toLocaleString("en-IN")}
            </span>
          ` : ""}
        </p>
      </div>

      ${product.customizationFields && product.customizationFields.length > 0 ? `
        <div style="background-color: #FFFFFF; border-radius: 8px; padding: 16px; margin-bottom: 20px;">
          <p style="margin: 0 0 12px; font-size: 13px; color: #6B6560; font-weight: 600;">
            ✨ Fully Customizable
          </p>
          <p style="margin: 0; font-size: 13px; color: #6B6560; line-height: 1.6;">
            Personalize with your own ${product.customizationFields.map((f: any) => f.label.toLowerCase()).join(", ")} and more!
          </p>
        </div>
      ` : ""}

      <div style="text-align: center;">
        <a href="${process.env.NEXT_PUBLIC_APP_URL || "https://makemymemory.in"}/shop/${product.slug}" 
          style="display: inline-block; background-color: #1A1A1A; color: #FAF8F4; text-decoration: none; 
                 padding: 14px 40px; border-radius: 10px; font-weight: 600; font-size: 15px;">
          View Product
        </a>
      </div>
    </div>

    <p style="margin: 0; font-size: 13px; color: #A8A29E; text-align: center; line-height: 1.6;">
      Make your memories last forever with our handcrafted keepsakes.
    </p>
  `;

  return emailWrapper(content);
}
