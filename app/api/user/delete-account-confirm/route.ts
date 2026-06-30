import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connect";
import { User } from "@/lib/db/models/User";
import { Order } from "@/lib/db/models/Order";
import { Review } from "@/lib/db/models/Review";
import { OTP } from "@/lib/db/models/Otp";
import { verifyOtp } from "@/lib/otp/otpService";

/**
 * POST /api/user/delete-account-confirm
 * Verify OTP and permanently delete user account
 * 
 * Body: { email, otp }
 */
export async function POST(req: NextRequest) {
  try {
    const { email, otp } = await req.json();

    if (!email || !otp) {
      return NextResponse.json(
        { error: "Email and OTP are required" },
        { status: 400 }
      );
    }

    // Verify OTP
    const otpVerification = await verifyOtp(email, otp, "account_deletion");
    if (!otpVerification.valid) {
      return NextResponse.json(
        { error: otpVerification.message },
        { status: 401 }
      );
    }

    // Connect to database
    await connectDB();

    // Find user
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Delete user's data cascade
    // 1. Delete all orders
    await Order.deleteMany({ "shippingAddress.email": email.toLowerCase() });

    // 2. Delete all reviews
    await Review.deleteMany({ userEmail: email.toLowerCase() });

    // 3. Delete user
    await User.deleteOne({ email: email.toLowerCase() });

    // Clear session
    const res = NextResponse.json({
      success: true,
      message: "Account deleted successfully",
    });
    res.cookies.delete("user_session");

    return res;
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete account" },
      { status: 500 }
    );
  }
}
