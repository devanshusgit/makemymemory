import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connect";
import { verifyOtp } from "@/lib/otp/otpService";

export const dynamic = "force-dynamic";

/**
 * Verify OTP
 * POST /api/auth/otp/verify
 * 
 * Body:
 * {
 *   email: string,
 *   code: string,
 *   type: "password_reset" | "login" | "account_deletion" | "email_verification"
 * }
 */
export async function POST(req: NextRequest) {
  try {
    console.log("✔️ OTP verification request received");
    
    const { email, code, type } = await req.json();

    // Validation
    if (!email || !code || !type) {
      console.error("❌ Missing required fields");
      return NextResponse.json(
        { error: "Email, code, and type are required" },
        { status: 400 }
      );
    }

    if (!/^\d{6}$/.test(code)) {
      return NextResponse.json(
        { error: "Invalid OTP format" },
        { status: 400 }
      );
    }

    await connectDB();
    console.log("✓ Database connected");

    const result = await verifyOtp(email.toLowerCase(), code, type);

    if (!result.valid) {
      console.log("❌ OTP verification failed:", result.message);
      return NextResponse.json(
        { valid: false, message: result.message },
        { status: 400 }
      );
    }

    console.log("✓ OTP verified successfully");
    return NextResponse.json({
      valid: true,
      message: result.message,
      data: result.data,
    });
  } catch (error) {
    console.error("❌ Error verifying OTP:", error);
    return NextResponse.json(
      { error: "Failed to verify OTP" },
      { status: 500 }
    );
  }
}
