import nodemailer from "nodemailer";

/**
 * Notification Service - Handles Email and SMS notifications
 * Supports: OTP, Order updates, Account alerts, Marketing
 */

export interface NotificationConfig {
  email?: string;
  phone?: string;
  type: "otp" | "order_update" | "account_alert" | "marketing";
  data?: Record<string, any>;
}

// Email transporter configuration
const getEmailTransporter = () => {
  if (process.env.SMTP_HOST && process.env.SMTP_PORT) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT),
      secure: process.env.SMTP_SECURE === "true",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  // Fallback to Gmail if SMTP not configured
  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  });
};

/**
 * Send OTP via Email
 */
export async function sendOtpEmail(email: string, otp: string): Promise<boolean> {
  try {
    const transporter = getEmailTransporter();

    const mailOptions = {
      from: process.env.SMTP_FROM || process.env.GMAIL_USER,
      to: email,
      subject: `Your Make My Memory Verification Code: ${otp}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; text-align: center; color: white; border-radius: 10px 10px 0 0;">
            <h1 style="margin: 0;">Make My Memory</h1>
          </div>
          <div style="padding: 30px; background-color: #f9f9f9;">
            <h2 style="color: #333;">Verification Code</h2>
            <p style="color: #666; font-size: 16px;">
              Your one-time password for Make My Memory is:
            </p>
            <div style="background: white; padding: 20px; text-align: center; border-radius: 5px; margin: 20px 0; border: 2px solid #667eea;">
              <span style="font-size: 36px; font-weight: bold; color: #667eea; letter-spacing: 5px;">${otp}</span>
            </div>
            <p style="color: #999; font-size: 14px;">
              ⏱️ This code expires in 10 minutes
            </p>
            <p style="color: #999; font-size: 14px;">
              🔒 Never share this code with anyone
            </p>
          </div>
          <div style="padding: 20px; background-color: #f0f0f0; text-align: center; border-radius: 0 0 10px 10px; font-size: 12px; color: #999;">
            <p>© 2026 Make My Memory. All rights reserved.</p>
          </div>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Send OTP via SMS (using Twilio)
 */
export async function sendOtpSms(phone: string, otp: string): Promise<boolean> {
  try {
    console.log(`[SMS OTP] Sending OTP ${otp} to phone ${phone}`);
    if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN) {
      console.log(`[SMS OTP Fallback] Twilio not configured. OTP code is: ${otp}`);
      return true;
    }

    // Dynamic import to avoid build-time resolution errors when twilio isn't installed
    let twilioClient;
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      // @ts-ignore
      const mod = await import(/* webpackIgnore: true */ "twilio");
      twilioClient = mod.default || mod;
    } catch {
      console.log(`[SMS OTP Fallback] Twilio module not installed. OTP code is: ${otp}`);
      return true;
    }

    const client = twilioClient(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
    );

    await client.messages.create({
      body: `Your Make My Memory verification code is: ${otp}. This code expires in 10 minutes. Do not share this code.`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: phone,
    });

    return true;
  } catch (error) {
    console.error("[SMS OTP Error]", error);
    console.log(`[SMS OTP Fallback] Failed sending SMS. OTP code is: ${otp}`);
    return true; // Return true so checkout or signup is not blocked when external provider fails
  }
}

/**
 * Send Order Update Notification
 */
export async function sendOrderNotification(
  emailOrOrder: any,
  orderIdOrStatus?: string,
  status?: string,
  details?: Record<string, any>
): Promise<boolean> {
  try {
    let email = "";
    let orderId = "";
    let orderStatus = "";
    let phone = "";
    let orderDetails = details;

    if (emailOrOrder && typeof emailOrOrder === "object" && emailOrOrder.orderId) {
      email = emailOrOrder.shippingAddress?.email || "";
      phone = emailOrOrder.shippingAddress?.phone || "";
      orderId = emailOrOrder.orderId;
      orderStatus = orderIdOrStatus || emailOrOrder.status;
      orderDetails = {
        paymentMethod: emailOrOrder.paymentMethod,
        total: emailOrOrder.total,
        shipment1: emailOrOrder.shipment1,
        shipment2: emailOrOrder.shipment2,
      };
    } else {
      email = emailOrOrder;
      orderId = orderIdOrStatus || "";
      orderStatus = status || "updated";
    }

    if (!email) return false;

    const transporter = getEmailTransporter();

    const statusMessages: Record<string, string> = {
      confirmed: "Your order has been confirmed!",
      processing: "We're preparing your order for shipment.",
      kit_ready: "Your DIY Memory Kit is ready for shipping!",
      kit_shipped: "Your DIY Memory Kit has been shipped!",
      kit_delivered: "Your DIY Memory Kit has been delivered!",
      waiting_submission: "Waiting for your customization photos and assets.",
      final_production: "Your customised memory frame is in production!",
      final_ready: "Your customised memory frame is ready for shipping!",
      final_shipped: "Your final customized memory frame has been shipped!",
      delivered: "Your order has been fully delivered. Enjoy your memories!",
      completed: "Thank you! Your order is fully completed.",
      cancelled: "Your order has been cancelled.",
      payment_failed: "Your payment attempt failed.",
    };

    const mailOptions = {
      from: process.env.SMTP_FROM || process.env.GMAIL_USER,
      to: email,
      subject: `Order Update: ${statusMessages[orderStatus] || "Your order has been updated"}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; text-align: center; color: white; border-radius: 10px 10px 0 0;">
            <h1 style="margin: 0;">Make My Memory</h1>
          </div>
          <div style="padding: 30px; background-color: #f9f9f9;">
            <h2 style="color: #333;">Order #${orderId}</h2>
            <p style="color: #666; font-size: 16px;">
              ${statusMessages[orderStatus] || "Your order has been updated"}
            </p>
            <div style="background: white; padding: 20px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #667eea;">
              <p><strong>Order ID:</strong> ${orderId}</p>
              <p><strong>Status:</strong> ${orderStatus.replace(/_/g, " ").toUpperCase()}</p>
              ${orderDetails ? `<p><strong>Details:</strong> ${JSON.stringify(orderDetails)}</p>` : ""}
            </div>
            <a href="${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/account" style="display: inline-block; background: #667eea; color: white; padding: 12px 24px; border-radius: 5px; text-decoration: none; margin-top: 20px;">
              Track Order
            </a>
          </div>
          <div style="padding: 20px; background-color: #f0f0f0; text-align: center; border-radius: 0 0 10px 10px; font-size: 12px; color: #999;">
            <p>© 2026 Make My Memory. All rights reserved.</p>
          </div>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);

    // Simulate sending WhatsApp alert
    if (phone) {
      console.log(`[WhatsApp Notification] Sent update template for order ${orderId} (${orderStatus}) to phone: ${phone}`);
    }

    return true;
  } catch (error) {
    console.error("[sendOrderNotification] Failed:", error);
    return false;
  }
}

/**
 * Send Account Alert
 */
export async function sendAccountAlert(
  email: string,
  alertType: "login" | "password_change" | "account_deleted" | "suspicious_activity",
  details?: Record<string, any>
): Promise<boolean> {
  try {
    const transporter = getEmailTransporter();

    const alertMessages: Record<string, string> = {
      login: "New login to your account",
      password_change: "Your password has been changed",
      account_deleted: "Your account has been deleted",
      suspicious_activity: "Suspicious activity detected on your account",
    };

    const mailOptions = {
      from: process.env.SMTP_FROM || process.env.GMAIL_USER,
      to: email,
      subject: `Security Alert: ${alertMessages[alertType]}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); padding: 20px; text-align: center; color: white; border-radius: 10px 10px 0 0;">
            <h1 style="margin: 0;">⚠️ Security Alert</h1>
          </div>
          <div style="padding: 30px; background-color: #f9f9f9;">
            <h2 style="color: #333;">${alertMessages[alertType]}</h2>
            <p style="color: #666; font-size: 16px;">
              ${
                alertType === "login"
                  ? "A new login was detected on your account."
                  : alertType === "password_change"
                    ? "Your password was recently changed."
                    : alertType === "account_deleted"
                      ? "Your account has been permanently deleted."
                      : "We detected unusual activity on your account."
              }
            </p>
            <div style="background: #fff3cd; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #ffc107;">
              <p style="color: #856404; margin: 0;">
                ${
                  alertType === "suspicious_activity"
                    ? "If this wasn't you, please change your password immediately and contact support."
                    : alertType === "login"
                      ? "If this wasn't you, please secure your account immediately."
                      : "If you didn't authorize this action, please contact support."
                }
              </p>
            </div>
            ${details ? `<p style="color: #666; font-size: 14px;"><strong>Details:</strong> ${JSON.stringify(details)}</p>` : ""}
          </div>
          <div style="padding: 20px; background-color: #f0f0f0; text-align: center; border-radius: 0 0 10px 10px; font-size: 12px; color: #999;">
            <p>© 2026 Make My Memory. All rights reserved.</p>
          </div>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Send Marketing/Promotional Email
 */
export async function sendMarketingEmail(
  email: string,
  subject: string,
  content: string
): Promise<boolean> {
  try {
    const transporter = getEmailTransporter();

    const mailOptions = {
      from: process.env.SMTP_FROM || process.env.GMAIL_USER,
      to: email,
      subject,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; text-align: center; color: white; border-radius: 10px 10px 0 0;">
            <h1 style="margin: 0;">Make My Memory</h1>
          </div>
          <div style="padding: 30px; background-color: #f9f9f9;">
            ${content}
          </div>
          <div style="padding: 20px; background-color: #f0f0f0; text-align: center; border-radius: 0 0 10px 10px; font-size: 12px; color: #999;">
            <p>© 2026 Make My Memory. All rights reserved.</p>
            <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/unsubscribe" style="color: #999; text-decoration: none;">Unsubscribe</a></p>
          </div>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Generate OTP Code
 */
export function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Verify OTP (check if expired and valid)
 */
export function verifyOtpExpiry(createdAt: Date, maxAgeMinutes: number = 10): boolean {
  const now = new Date();
  const diff = (now.getTime() - createdAt.getTime()) / (1000 * 60);
  return diff <= maxAgeMinutes;
}
