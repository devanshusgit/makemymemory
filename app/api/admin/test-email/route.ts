import { NextRequest, NextResponse } from "next/server";
import { sendEmail } from "@/lib/email/resend";

export const dynamic = "force-dynamic";

// GET /api/admin/test-email?to=youremail@gmail.com
export async function GET(req: NextRequest) {
  const to = req.nextUrl.searchParams.get("to") || "devanshup416@gmail.com";

  console.log("[test-email] SMTP config:", {
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    user: process.env.SMTP_USER,
    passSet: !!process.env.SMTP_PASS,
    from: process.env.EMAIL_FROM,
  });

  const result = await sendEmail({
    to,
    subject: "✅ Email Test — Make My Memory",
    html: `<h2>Email is working!</h2><p>Sent at: ${new Date().toISOString()}</p>`,
  });

  return NextResponse.json({
    success: result.success,
    to,
    error: result.error ? String(result.error) : undefined,
    smtpConfig: {
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      user: process.env.SMTP_USER,
      from: process.env.EMAIL_FROM,
    },
  });
}
