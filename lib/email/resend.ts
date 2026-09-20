// Using Resend API for email delivery
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

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
    const toAddresses = Array.isArray(to) ? to : [to];
    
    const response = await resend.emails.send({
      from: process.env.EMAIL_FROM || "orders@makemymemory.in",
      to: toAddresses,
      subject,
      html,
    });

    if (response.error) {
      console.error("❌ Email send error:", response.error);
      return { success: false, error: response.error };
    }

    console.log("✅ Email sent:", response.data?.id, "→", to);
    return { success: true, data: response.data };
  } catch (error: any) {
    console.error("❌ Email send error:", error?.message || error);
    return { success: false, error };
  }
}

export const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "devanshup416@gmail.com";

// Re-export email template functions
export {
  orderPlacedEmail,
  orderConfirmationEmail,
  orderProcessingEmail,
  orderShippedEmail,
  orderDeliveredEmail,
  orderCancelledEmail,
  welcomeEmail,
  passwordResetEmail,
  otpEmail,
  couponEmail,
  adminNewOrderEmail,
  adminNewContactEmail,
  adminNewUserEmail,
  adminNewReviewEmail,
  adminNewProductEmail,
  userNewProductEmail,
} from "./templates";

// Convenience wrappers
export async function sendOrderPlacedEmail(order: any) {
  const { orderPlacedEmail } = await import("./templates");
  return sendEmail({
    to: order.email,
    subject: `We've Received Your Order — ${order.orderId}`,
    html: orderPlacedEmail(order),
  });
}

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
  // Firing one request per user at once trips Resend's rate limit on any real
  // list, and allSettled used to discard the rejections silently. Send in
  // small batches and report how many actually went out.
  const BATCH_SIZE = 10;
  const PAUSE_MS = 1000;
  const results: PromiseSettledResult<unknown>[] = [];
  for (let i = 0; i < users.length; i += BATCH_SIZE) {
    const batch = users.slice(i, i + BATCH_SIZE);
    const settled = await Promise.allSettled(batch.map((user) =>
      sendEmail({
        to: user.email,
        subject: `New Product: ${product.name} - Make My Memory`,
        html: userNewProductEmail(product, user.name),
      })
    ));
    results.push(...settled);
    if (i + BATCH_SIZE < users.length) await new Promise((resolve) => setTimeout(resolve, PAUSE_MS));
  }
  const failed = results.filter((r) => r.status === "rejected").length;
  if (failed) console.error(`[email] new-product announcement: ${failed}/${users.length} sends failed`);
  return results;
}
