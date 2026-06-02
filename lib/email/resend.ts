// Using direct SMTP via nodemailer - Brevo SMTP relay
// nodemailer is in serverComponentsExternalPackages so it won't be bundled

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
    // Require inside function so it's always resolved at runtime, never bundled
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const nodemailer = require("nodemailer");

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || "smtp-relay.brevo.com",
      port: Number(process.env.SMTP_PORT) || 587,
      secure: false,
      requireTLS: true,
      auth: {
        user: process.env.SMTP_USER || "ad5185001@smtp-brevo.com",
        pass: process.env.SMTP_PASS || "0nK3FwbOpx6vjyS7",
      },
      logger: false,
      debug: false,
    });

    const info = await transporter.sendMail({
      from: `"Make My Memory" <${process.env.EMAIL_FROM || "devanshup416@gmail.com"}>`,
      to: Array.isArray(to) ? to.join(", ") : to,
      subject,
      html,
    });

    console.log("✅ Email sent:", info.messageId, "→", to);
    return { success: true, data: info };
  } catch (error: any) {
    console.error("❌ Email send error:", error?.message || error);
    return { success: false, error };
  }
}

export const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "devanshup416@gmail.com";

// Re-export email template functions
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

// Convenience wrappers
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
