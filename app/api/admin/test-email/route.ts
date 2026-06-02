import { NextRequest, NextResponse } from "next/server";
import { sendEmail } from "@/lib/email/resend";

export const dynamic = "force-dynamic";

// GET /api/admin/test-email?to=youremail@gmail.com
export async function GET(req: NextRequest) {
  const to = req.nextUrl.searchParams.get("to") || "devanshup416@gmail.com";

  const config = {
    host: process.env.SMTP_HOST || "MISSING",
    port: process.env.SMTP_PORT || "MISSING",
    user: process.env.SMTP_USER || "MISSING",
    passSet: !!process.env.SMTP_PASS,
    from: process.env.EMAIL_FROM || "MISSING",
  };

  console.log("[test-email] SMTP config:", config);

  // Test raw nodemailer connection first
  let verifyResult = null;
  try {
    const nodemailer = require("nodemailer");
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || "smtp-relay.brevo.com",
      port: Number(process.env.SMTP_PORT) || 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
    await transporter.verify();
    verifyResult = "SMTP connection verified OK";
    console.log("[test-email] SMTP verify OK");
  } catch (err: any) {
    verifyResult = `SMTP verify FAILED: ${err.message}`;
    console.error("[test-email] SMTP verify error:", err);
  }

  const result = await sendEmail({
    to,
    subject: "✅ Email Test — Make My Memory",
    html: `<h2>Email is working!</h2><p>Sent at: ${new Date().toISOString()}</p>`,
  });

  return NextResponse.json({
    success: result.success,
    to,
    verifyResult,
    smtpConfig: config,
    error: result.error ? String(result.error) : undefined,
  });
}
