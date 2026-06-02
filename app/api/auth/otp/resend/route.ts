import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connect";
import { resendOtp } from "@/lib/otp/otpService";

export const dynamic = "force-dynamic";

/**
 * Resend OTP
 * POST /api/auth/otp/resend
 * 
 * Body:
 * {
 *   email: string,
 *   phone?: string,
 *   type: "password_reset" | "login" | "account_deletion" | "email_verification",
 *   method: "email" | "sms" | "both"
 * }
 */
export async function POST(req: NextRequest) {
  try {
    console.log("🔄 OTP resend request received");
    
    const { email, phone, type, method } = await req.json();

    // Validation
    if (!email || !type || !method) {
      console.error("❌ Missing required fields");
      return NextResponse.json(
        { error: "Email, type, and method are required" },
        { status: 400 }
      );
    }

    if (!["password_reset", "login", "account_deletion", "email_verification"].includes(type)) {
      return NextResponse.json(
        { error: "Invalid OTP type" },
        { status: 400 }
      );
    }

    if (!["email", "sms", "both"].includes(method)) {
      return NextResponse.json(
        { error: "Invalid method" },
        { status: 400 }
      );
    }

    await connectDB();
    console.log("✓ Database connected");

    const result = await resendOtp(email.toLowerCase(), type, method, phone);

    if (!result.success) {
      console.error("❌ Failed to resend OTP");
      return NextResponse.json(
        { error: result.message },
        { status: 500 }
      );
    }

    console.log("✓ OTP resent successfully");
    return NextResponse.json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    console.error("❌ Error resending OTP:", error);
    return NextResponse.json(
      { error: "Failed to resend OTP" },
      { status: 500 }
    );
  }
}
