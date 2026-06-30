import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connect";
import { User } from "@/lib/db/models/User";
import { verifyOtp } from "@/lib/otp/otpService";

/**
 * POST /api/user/delete-account-confirm
 * Permanently delete account (cannot be recovered)
 * Data is kept for regulatory compliance but account cannot be logged in
 */
export async function POST(req: NextRequest) {
  try {
    const userSession = req.cookies.get("user_session")?.value;
    if (!userSession) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { email, otp } = await req.json();

    if (!email || !otp) {
      return NextResponse.json({ error: "Email and OTP are required" }, { status: 400 });
    }

    // Verify OTP first
    const otpVerification = await verifyOtp(email, otp, "account_deletion");
    if (!otpVerification.valid) {
      return NextResponse.json(
        { error: otpVerification.message },
        { status: 401 }
      );
    }

    await connectDB();

    // PERMANENT HARD DELETE - account cannot be recovered
    // Password is hashed with random salt, making login impossible
    // Email is also invalidated
    const user = await User.findOneAndDelete(
      { email: email.toLowerCase() }
    );

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // User data remains in Order, Review collections for admin records
    // but the user account itself is permanently deleted

    const res = NextResponse.json({
      success: true,
      message: "Account has been permanently deleted. You cannot log in with this account anymore.",
    });

    // Clear session
    res.cookies.delete("user_session");

    return res;
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete account" }, { status: 500 });
  }
}
