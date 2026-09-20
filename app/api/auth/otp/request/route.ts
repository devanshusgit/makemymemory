import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connect";
import { createAndSendOtp } from "@/lib/otp/otpService";
import { rateLimit, getRateLimitKey } from "@/lib/middleware/rateLimit";

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
  // Unlimited OTP sends meant unlimited SMS/email cost and unlimited guesses.
  if (!rateLimit(getRateLimitKey(req), 5, 15 * 60 * 1000)) {
    return NextResponse.json({ error: "Too many verification codes requested. Please wait a few minutes and try again." }, { status: 429 });
  }
  try {
    const { email, phone, type, method } = await req.json();

    // Validation
    if ((!email && !phone) || !type || !method) {
      return NextResponse.json(
        { error: "Email/Phone, type, and method are required" },
        { status: 400 }
      );
    }

    if (!["password_reset", "login", "account_deletion", "email_verification", "phone_verification"].includes(type)) {
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
      email: email ? email.toLowerCase() : undefined,
      phone,
      type: type as any,
      method: method as any,
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
