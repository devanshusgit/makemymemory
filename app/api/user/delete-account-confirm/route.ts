import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connect";
import { User } from "@/lib/db/models/User";
import { Order } from "@/lib/db/models/Order";
import { Review } from "@/lib/db/models/Review";
import { Coupon } from "@/lib/db/models/Coupon";
import { verifyOtp } from "@/lib/otp/otpService";

/**
 * POST /api/user/delete-account-confirm
 * Verify OTP and permanently delete account
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

    // Soft-delete account (keep data for regulatory compliance)
    const user = await User.findOneAndUpdate(
      { email: email.toLowerCase() },
      {
        isDeleted: true,
        deletedAt: new Date(),
        email: `${email}_deleted_${Date.now()}`, // Obfuscate email
      },
      { new: true }
    );

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Clear user data from related collections
    await Order.updateMany(
      { "shippingAddress.email": email },
      { 
        $set: {
          "shippingAddress.email": "deleted@deleted.com",
          "shippingAddress.phone": "0000000000",
        }
      }
    );

    await Review.updateMany(
      { email },
      { 
        $set: { 
          email: "deleted@deleted.com",
          userName: "Deleted User",
        }
      }
    );

    // Remove user from coupon tracking
    await Coupon.updateMany(
      { usedByUsers: user._id },
      { $pull: { usedByUsers: user._id } }
    );

    const res = NextResponse.json({
      success: true,
      message: "Account successfully deleted. All personal data has been removed.",
    });

    // Clear session
    res.cookies.delete("user_session");

    return res;
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete account" }, { status: 500 });
  }
}
