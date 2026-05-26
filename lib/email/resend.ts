import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY || "re_placeholder_for_build");

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
    const data = await resend.emails.send({
      from: "Make My Memory <orders@makemymemory.in>",
      to,
      subject,
      html,
    });

    console.log("Email sent successfully:", data);
    return { success: true, data };
  } catch (error) {
    console.error("Email send error:", error);
    return { success: false, error };
  }
}

export const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@makemymemory.in";

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

// Convenience wrapper functions for sending emails
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

export async function sendNewProductToUsers(product: any, users: Array<{ name: string; email: string }>) {
  const { userNewProductEmail } = await import("./templates");
  
  const emailPromises = users.map(user => 
    sendEmail({
      to: user.email,
      subject: `New Product: ${product.name} - Make My Memory`,
      html: userNewProductEmail(product, user.name),
    })
  );

  return Promise.allSettled(emailPromises);
}
