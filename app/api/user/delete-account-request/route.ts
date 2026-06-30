import { NextRequest, NextResponse } from "next/server";
import { createAndSendOtp } from "@/lib/otp/otpService";

/**
 * POST /api/user/delete-account-request
 * Request OTP for account deletion
 * Must be verified before actual deletion
 */
export async function POST(req: NextRequest) {
  try {
    const userSession = req.cookies.get("user_session")?.value;
    if (!userSession) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    // Send OTP for account deletion verification
    const result = await createAndSendOtp({
      email,
      type: "account_deletion",
      method: "email",
    });

    if (!result.success) {
      return NextResponse.json(
        { error: "Failed to send OTP. Please try again." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "OTP sent to your email. Please verify to confirm deletion.",
    });
  } catch (error) {
    return NextResponse.json({ error: "Failed to process request" }, { status: 500 });
  }
}
