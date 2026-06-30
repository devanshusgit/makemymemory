import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connect";
import { createAndSendOtp } from "@/lib/otp/otpService";

export const dynamic = "force-dynamic";

/**
 * POST /api/auth/otp/request
 * Request OTP for authentication
 * 
 * Body: { email, phone?, type, method }
 * - type: "password_reset" | "login" | "account_deletion" | "email_verification"
 * - method: "email" | "sms" | "both"
 */
export async function POST(req: NextRequest) {
  try {
    const { email, phone, type, method } = await req.json();

    // Validation
    if (!email || !type || !method) {
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

    if ((method === "sms" || method === "both") && !phone) {
      return NextResponse.json(
        { error: "Phone number required for SMS" },
        { status: 400 }
      );
    }

    await connectDB();

    const result = await createAndSendOtp({
      email: email.toLowerCase(),
      phone,
      type,
      method,
    });

    if (!result.success) {
      return NextResponse.json(
        { error: result.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to request OTP" },
      { status: 500 }
    );
  }
}
