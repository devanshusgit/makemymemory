import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connect";
import { User } from "@/lib/db/models/User";
import { createAndSendOtp } from "@/lib/otp/otpService";

export const dynamic = "force-dynamic";

/**
 * POST /api/user/delete-account
 * Request OTP for account deletion
 * 
 * Body: { email }
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const email = body?.email;

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase();

    // Verify user exists
    await connectDB();
    const userDoc = await User.findOne({ email: normalizedEmail });
    if (!userDoc) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Send OTP for account deletion confirmation
    const otpResult = await createAndSendOtp({
      email: normalizedEmail,
      type: "account_deletion",
      method: "email",
    });

    if (!otpResult.success) {
      return NextResponse.json(
        { error: "Failed to send verification OTP" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "OTP sent to your email. Please verify to delete your account.",
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to process deletion request" },
      { status: 500 }
    );
  }
}
