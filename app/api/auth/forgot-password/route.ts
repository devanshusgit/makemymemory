import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { Resend } from "resend";
import { connectDB } from "@/lib/db/connect";
import { User } from "@/lib/db/models/User";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    try {
      await connectDB();
    } catch {
      return NextResponse.json({ error: "Database not configured yet" }, { status: 503 });
    }

    const user = await User.findOne({ email: email.toLowerCase() });

    // Always return success to prevent email enumeration
    if (!user) {
      return NextResponse.json({
        success: true,
        message: "If an account exists, a reset link has been sent.",
      });
    }

    // Generate reset token
    const token = crypto.randomBytes(32).toString("hex");
    user.resetToken = token;
    user.resetTokenExpiry = new Date(Date.now() + 1000 * 60 * 60); // 1 hour
    await user.save();

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://makemymemory.in";
    const resetUrl = `${appUrl}/reset-password?token=${token}`;

    console.log("[forgot-password] Sending reset email to:", email);
    console.log("[forgot-password] Reset URL:", resetUrl);

    // Send email via Resend
    const { error: emailError } = await resend.emails.send({
      from: "Make My Memory <onboarding@resend.dev>",
      to: email,
      subject: "Reset your password — Make My Memory",
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <title>Reset your password</title>
          </head>
          <body style="margin:0;padding:0;background-color:#FAF8F4;font-family:'DM Sans',Arial,sans-serif;">
            <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#FAF8F4;padding:40px 20px;">
              <tr>
                <td align="center">
                  <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.06);">
                    
                    <!-- Header -->
                    <tr>
                      <td style="background-color:#1A1A1A;padding:32px 40px;text-align:center;">
                        <h1 style="margin:0;font-family:Georgia,serif;font-size:24px;font-weight:700;color:#C9A84C;letter-spacing:1px;">
                          Make My Memory
                        </h1>
                        <p style="margin:6px 0 0;color:rgba(232,213,163,0.6);font-size:12px;letter-spacing:2px;text-transform:uppercase;">
                          Personalised Gifts & Keepsakes
                        </p>
                      </td>
                    </tr>

                    <!-- Body -->
                    <tr>
                      <td style="padding:40px 40px 32px;">
                        <h2 style="margin:0 0 12px;font-size:22px;font-weight:700;color:#1A1A1A;">
                          Reset your password
                        </h2>
                        <p style="margin:0 0 24px;font-size:15px;color:#555;line-height:1.6;">
                          Hi ${user.name || "there"},<br/><br/>
                          We received a request to reset the password for your Make My Memory account.
                          Click the button below to choose a new password.
                        </p>

                        <!-- Button -->
                        <table width="100%" cellpadding="0" cellspacing="0">
                          <tr>
                            <td align="center" style="padding:8px 0 32px;">
                              <a href="${resetUrl}"
                                style="display:inline-block;background-color:#1A1A1A;color:#C9A84C;
                                       text-decoration:none;font-size:15px;font-weight:600;
                                       padding:14px 36px;border-radius:50px;letter-spacing:0.5px;">
                                Reset Password
                              </a>
                            </td>
                          </tr>
                        </table>

                        <p style="margin:0 0 8px;font-size:13px;color:#888;line-height:1.6;">
                          Or copy and paste this link into your browser:
                        </p>
                        <p style="margin:0 0 32px;font-size:12px;color:#C9A84C;word-break:break-all;">
                          ${resetUrl}
                        </p>

                        <div style="background:#FFF8E7;border:1px solid #F0DFA0;border-radius:8px;padding:14px 18px;margin-bottom:24px;">
                          <p style="margin:0;font-size:13px;color:#8B6914;">
                            ⏰ This link expires in <strong>1 hour</strong>.
                            If you didn't request a password reset, you can safely ignore this email.
                          </p>
                        </div>
                      </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                      <td style="background:#F5F3EE;padding:20px 40px;text-align:center;border-top:1px solid #E8E0D0;">
                        <p style="margin:0;font-size:12px;color:#999;">
                          © ${new Date().getFullYear()} Make My Memory · 
                          <a href="${appUrl}" style="color:#C9A84C;text-decoration:none;">makemymemory.in</a>
                        </p>
                        <p style="margin:6px 0 0;font-size:11px;color:#bbb;">
                          You're receiving this because a password reset was requested for your account.
                        </p>
                      </td>
                    </tr>

                  </table>
                </td>
              </tr>
            </table>
          </body>
        </html>
      `,
    });

    if (emailError) {
      console.error("[forgot-password] Resend error:", emailError);
      // Still return success to prevent enumeration, but log the error
    } else {
      console.log("[forgot-password] Reset email sent successfully to:", email);
    }

    return NextResponse.json({
      success: true,
      message: "If an account exists, a reset link has been sent.",
    });
  } catch (error) {
    console.error("[forgot-password]", error);
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}
