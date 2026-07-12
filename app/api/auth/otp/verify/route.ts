import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connect";
import { verifyOtp } from "@/lib/otp/otpService";

export const dynamic = "force-dynamic";

/**
 * POST /api/auth/otp/verify
 * Verify OTP code
 * 
 * Body: { email, code, type }
 */
export async function POST(req: NextRequest) {
  try {
    const { email, phone, code, type } = await req.json();

    const contact = email || phone;

    // Validation
    if (!contact || !code || !type) {
      return NextResponse.json(
        { error: "Email/Phone, code, and type are required" },
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

    const result = await verifyOtp(contact, code, type);

    if (!result.valid) {
      return NextResponse.json(
        { valid: false, message: result.message },
        { status: 400 }
      );
    }

    return NextResponse.json({
      valid: true,
      message: result.message,
      data: result.data,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to verify OTP" },
      { status: 500 }
    );
  }
}
