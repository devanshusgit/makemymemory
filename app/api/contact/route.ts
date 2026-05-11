import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";

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
  try {
    const { name, email, subject, message } = await req.json();

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

    // Send email to admin
    // EMAIL_DISABLED: Email sending disabled
    /*
    const transporter = getTransporter();
    if (transporter) {
      try {
        const adminEmail = process.env.ADMIN_EMAIL;
        if (adminEmail) {
          await transporter.sendMail({
            from: `"${name}" <${process.env.SMTP_USER}>`,
            to: adminEmail,
            replyTo: email,
            subject: `📧 New Contact Form: ${subject ?? "General Enquiry"} from ${name}`,
            html: `
              <div style="font-family:Inter,sans-serif;max-width:560px;margin:0 auto;background:#F5F0EB;padding:32px 16px;">
                <div style="background:#2C2520;border-radius:16px;padding:24px;text-align:center;margin-bottom:24px;">
                  <h1 style="color:#F5F0EB;font-size:22px;margin:0;font-family:Georgia,serif;">
                    Make My <span style="color:#8FBC8F;">Memory</span>
                  </h1>
                </div>
                <div style="background:#fff;border-radius:16px;padding:28px;">
                  <h2 style="color:#2C2520;font-size:18px;margin:0 0 16px;">New Contact Form Submission</h2>
                  <p style="color:#78716c;font-size:14px;margin:0 0 16px;">
                    <strong>From:</strong> ${name} (${email})
                  </p>
                  ${subject ? `<p style="color:#78716c;font-size:14px;margin:0 0 16px;"><strong>Subject:</strong> ${subject}</p>` : ""}
                  <div style="background:#F5F0EB;border-radius:10px;padding:16px;margin:16px 0;">
                    <p style="color:#78716c;font-size:12px;margin:0 0 8px;text-transform:uppercase;font-weight:600;">Message</p>
                    <p style="color:#2C2520;font-size:14px;margin:0;white-space:pre-wrap;line-height:1.6;">${message}</p>
                  </div>
                  <p style="color:#78716c;font-size:12px;margin:16px 0 0;">
                    <strong>Reply to:</strong> <a href="mailto:${email}" style="color:#8FBC8F;text-decoration:none;">${email}</a>
                  </p>
                </div>
              </div>
            `,
          });
          console.log("[contact] Admin notification sent for:", name);
        }

        // Send confirmation to user
        await transporter.sendMail({
          from: `"Make My Memory" <${process.env.SMTP_USER}>`,
          to: email,
          subject: "We received your message 🎁",
          html: `
            <div style="font-family:Inter,sans-serif;max-width:560px;margin:0 auto;background:#F5F0EB;padding:32px 16px;">
              <div style="background:#2C2520;border-radius:16px;padding:24px;text-align:center;margin-bottom:24px;">
                <h1 style="color:#F5F0EB;font-size:22px;margin:0;font-family:Georgia,serif;">
                  Make My <span style="color:#8FBC8F;">Memory</span>
                </h1>
              </div>
              <div style="background:#fff;border-radius:16px;padding:28px;">
                <h2 style="color:#2C2520;font-size:18px;margin:0 0 8px;">Thank You, ${name}! 🙏</h2>
                <p style="color:#78716c;font-size:14px;margin:0 0 16px;">
                  We've received your message and will get back to you as soon as possible.
                </p>
                <div style="background:#F5F0EB;border-radius:10px;padding:16px;margin:16px 0;">
                  <p style="color:#78716c;font-size:12px;margin:0 0 8px;text-transform:uppercase;font-weight:600;">Your Message</p>
                  <p style="color:#2C2520;font-size:14px;margin:0;white-space:pre-wrap;line-height:1.6;">${message}</p>
                </div>
                <p style="color:#78716c;font-size:12px;margin:16px 0 0;">
                  In the meantime, feel free to explore our <a href="${process.env.NEXT_PUBLIC_APP_URL}/shop" style="color:#8FBC8F;text-decoration:none;">products</a>.
                </p>
              </div>
            </div>
          `,
        });
        console.log("[contact] Confirmation email sent to:", email);
      } catch (emailError) {
        console.error("[contact] Email send error:", emailError);
        // Don't fail the request if email fails
      }
    }
    */

    console.log("Contact form submission:", { name, email, subject, message });

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
