import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { connectDB } from "@/lib/db/connect";
import ContactMessage from "@/lib/db/models/ContactMessage";
import { sendEmail, ADMIN_EMAIL } from "@/lib/email/resend";
import { adminNewContactEmail } from "@/lib/email/templates";
import { rateLimit, getRateLimitKey } from "@/lib/middleware/rateLimit";

function getTransporter() {
  const host = process.env.SMTP_HOST;
  const port = parseInt(process.env.SMTP_PORT ?? "587", 10);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    console.warn("[contact] SMTP not configured — skipping email send");
    return null;
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });
}

export async function POST(req: NextRequest) {
  // Every submission emails the admin; cap it so the form can't be used to
  // flood the inbox or burn the daily email quota.
  if (!rateLimit(`contact:${getRateLimitKey(req)}`, 5, 60 * 60 * 1000)) {
    return NextResponse.json({ error: "Too many messages. Please try again later or email support@makemymemory.in." }, { status: 429 });
  }
  try {
    const { name, email, phone, subject, message } = await req.json();

    const tooLong =
      [name, email, phone, subject].some((v) => v != null && (typeof v !== "string" || v.length > 200)) ||
      (message != null && (typeof message !== "string" || message.length > 5000));
    if (tooLong) {
      return NextResponse.json({ error: "Please keep your message shorter." }, { status: 400 });
    }

    if (!name || !email || !message) {
      return NextResponse.json(
        { error: "Name, email, and message are required" },
        { status: 400 }
      );
    }

    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email address" },
        { status: 400 }
      );
    }

    // Save to database
    await connectDB();
    const contactMessage = await ContactMessage.create({
      name,
      email,
      phone: phone || undefined,
      subject: subject || "General Enquiry",
      message,
      isRead: false,
    });

    console.log("Contact form submission saved:", contactMessage._id);

    // Send email notification to admin
    await sendEmail({
      to: ADMIN_EMAIL,
      subject: `New Contact Form: ${subject || "General Enquiry"}`,
      html: adminNewContactEmail({ name, email, phone, subject: subject || "General Enquiry", message }),
    });

    return NextResponse.json(
      { success: true, message: "Message received. We'll get back to you soon!" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Contact form error:", error);
    return NextResponse.json(
      { error: "Failed to send message" },
      { status: 500 }
    );
  }
}
