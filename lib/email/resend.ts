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
