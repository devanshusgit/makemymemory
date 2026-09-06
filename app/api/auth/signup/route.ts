import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db/connect";
import { User } from "@/lib/db/models/User";
import { Coupon } from "@/lib/db/models/Coupon";
import { sendWelcomeEmail } from "@/lib/email/resend";
import { verifyOtp } from "@/lib/otp/otpService";

export async function POST(req: NextRequest) {
  try {
    const { name, email, phone, password, otpCode, signupMethod } = await req.json();

    // Whichever channel the customer chose to sign up with is the one that
    // must be present and OTP-verified; the other is simply not collected.
    const method: "email" | "phone" = signupMethod === "phone" ? "phone" : "email";
    const normalizedEmail = typeof email === "string" ? email.trim().toLowerCase() : "";
    const normalizedPhone = typeof phone === "string" ? phone.trim() : "";

    if (!name || !password || !otpCode) {
      return NextResponse.json({ error: "All fields, including verification code, are required" }, { status: 400 });
    }
    if (method === "email" && !normalizedEmail) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }
    if (method === "phone" && !normalizedPhone) {
      return NextResponse.json({ error: "Phone number is required" }, { status: 400 });
    }

    // Validate phone format (10 digits, starts with 6-9) whenever provided
    if (normalizedPhone && !/^[6-9]\d{9}$/.test(normalizedPhone)) {
      return NextResponse.json({ error: "Phone must be 10 digits starting with 6-9" }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 });
    }

    try {
      await connectDB();
    } catch {
      return NextResponse.json({ error: "Database not configured yet" }, { status: 503 });
    }

    // Verify OTP first, against whichever contact channel was used to request it
    const otpVerification = method === "email"
      ? await verifyOtp(normalizedEmail, otpCode, "email_verification")
      : await verifyOtp(normalizedPhone, otpCode, "phone_verification");
    if (!otpVerification.valid) {
      return NextResponse.json({ error: otpVerification.message }, { status: 400 });
    }

    // Check existing phone (only if one was provided)
    if (normalizedPhone) {
      const existingPhone = await User.findOne({ phone: normalizedPhone });
      if (existingPhone) {
        return NextResponse.json({ error: "An account with this phone number already exists" }, { status: 409 });
      }
    }

    // Check existing email (only if one was provided)
    if (normalizedEmail) {
      const existingEmail = await User.findOne({ email: normalizedEmail });
      if (existingEmail) {
        return NextResponse.json({ error: "An account with this email already exists" }, { status: 409 });
      }
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await User.create({
      name,
      ...(normalizedEmail ? { email: normalizedEmail } : {}),
      ...(normalizedPhone ? { phone: normalizedPhone } : {}),
      passwordHash,
    });

    // Create welcome coupon for new user (₹200 off)
    try {
      const welcomeCoupon = await Coupon.create({
        code: `WELCOME${user._id.toString().slice(-6).toUpperCase()}`,
        discountType: "fixed",
        discountValue: 200,
        description: "Welcome to Make My Memory! ₹200 off on your first order",
        applicableCategories: [],
        minOrderValue: 0,
        maxUsagePerUser: 1,
        maxTotalUsage: 1,
        couponType: "signup",
        isActive: true,
        startDate: new Date(),
        expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        usageCount: 0,
        usedByUsers: [],
      });
      console.log("Welcome coupon created:", welcomeCoupon.code);
    } catch (couponErr) {
      console.error("Failed to create welcome coupon:", couponErr);
      // Don't fail signup if coupon creation fails
    }

    // Send welcome email (fire and forget) — only possible when one was collected
    if (normalizedEmail) {
      sendWelcomeEmail({ name, email: normalizedEmail }).catch((err) => {
        console.error("[signup] Failed to send welcome email:", err);
      });
    }

    return NextResponse.json({ success: true, message: "Account created successfully" });
  } catch (error) {
    console.error("[signup]", error);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
