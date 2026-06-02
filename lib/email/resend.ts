import nodemailer from "nodemailer";

// Create transporter lazily inside each call so env vars are always fresh
function createTransporter() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp-relay.brevo.com",
    port: Number(process.env.SMTP_PORT) || 587,
    secure: false,
    auth: {
      user: process.env.SMTP_USER || "ad5185001@smtp-brevo.com",
      pass: process.env.SMTP_PASS || "0nK3FwbOpx6vjyS7",
    },
  });
}

export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string | string[];
  subject: string;
  html: string;
}) {
  try {
    const transporter = createTransporter();

    // Verify connection before sending
    await transporter.verify();

    const info = await transporter.sendMail({
      from: `"Make My Memory" <${process.env.EMAIL_FROM || "devanshup416@gmail.com"}>`,
      to: Array.isArray(to) ? to.join(", ") : to,
      subject,
      html,
    });

    console.log("✅ Email sent:", info.messageId, "→", to);
    return { success: true, data: info };
  } catch (error) {
    console.error("❌ Email send error:", error);
    return { success: false, error };
  }
}

export const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "devanshup416@gmail.com";

// Re-export email template functions for convenience
export {
  orderConfirmationEmail,
  orderProcessingEmail,
  orderShippedEmail,
  orderDeliveredEmail,
  orderCancelledEmail,
  welcomeEmail,
  passwordResetEmail,
  couponEmail,
  adminNewOrderEmail,
  adminNewContactEmail,
  adminNewUserEmail,
  adminNewReviewEmail,
  adminNewProductEmail,
  userNewProductEmail,
} from "./templates";

// Convenience wrapper functions
export async function sendOrderConfirmationEmail(order: any) {
  const { orderConfirmationEmail } = await import("./templates");
  return sendEmail({
    to: order.email,
    subject: `Order Confirmation - ${order.orderId}`,
    html: orderConfirmationEmail(order),
  });
}

export async function sendWelcomeEmail({ name, email }: { name: string; email: string }) {
  const { welcomeEmail } = await import("./templates");
  return sendEmail({
    to: email,
    subject: "Welcome to Make My Memory!",
    html: welcomeEmail(name),
  });
}

export async function sendNewProductNotification(product: any) {
  const { adminNewProductEmail } = await import("./templates");
  return sendEmail({
    to: ADMIN_EMAIL,
    subject: `New Product Added: ${product.name}`,
    html: adminNewProductEmail(product),
  });
}

export async function sendNewProductToUsers(
  product: any,
  users: Array<{ name: string; email: string }>
) {
  const { userNewProductEmail } = await import("./templates");

  const emailPromises = users.map((user) =>
    sendEmail({
      to: user.email,
      subject: `New Product: ${product.name} - Make My Memory`,
      html: userNewProductEmail(product, user.name),
    })
  );

  return Promise.allSettled(emailPromises);
}
