import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db/connect";
import { User } from "@/lib/db/models/User";
import { OTP } from "@/lib/db/models/Otp";
import { verifyOtpExpiry } from "@/lib/notifications/notificationService";
import { findUserByPhone } from "@/lib/auth/phoneLookup";

const MAX_CODE_ATTEMPTS = 5;

/**
 * Phone reset: { phone, otpCode, password }. The code was sent by SMS from
 * forgot-password. After 5 wrong codes it stops working and a new one must be
 * requested, so the 6 digits can't be guessed.
 */
async function resetWithSmsCode(phone: unknown, otpCode: unknown, password: unknown) {
  if (typeof phone !== "string" || typeof otpCode !== "string" || !/^\d{6}$/.test(otpCode)
      || typeof password !== "string" || !password) {
    return NextResponse.json({ error: "Phone, 6-digit code and new password are required" }, { status: 400 });
  }
  if (password.length < 6) {
    return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 });
  }
  try {
    await connectDB();
  } catch {
    return NextResponse.json({ error: "Database not configured yet" }, { status: 503 });
  }

  const invalid = NextResponse.json({ error: "Invalid or expired code. Please request a new one." }, { status: 400 });
  const user = await findUserByPhone(phone);
  if (!user?.phone) return invalid;

  const otp = await OTP.findOne({ phone: user.phone, type: "password_reset", isUsed: false })
    .sort({ createdAt: -1 });
  if (!otp || !verifyOtpExpiry(otp.createdAt, 10) || (otp.attempts ?? 0) >= MAX_CODE_ATTEMPTS) return invalid;

  if (otp.code !== otpCode) {
    otp.attempts = (otp.attempts ?? 0) + 1;
    if (otp.attempts >= MAX_CODE_ATTEMPTS) {
      otp.isUsed = true;
      otp.usedAt = new Date();
      await otp.save();
      return NextResponse.json({ error: "Too many wrong codes. Please request a new one." }, { status: 400 });
    }
    await otp.save();
    return NextResponse.json({ error: "Wrong code. Please check the SMS and try again." }, { status: 400 });
  }

  otp.isUsed = true;
  otp.usedAt = new Date();
  await otp.save();

  user.passwordHash = await bcrypt.hash(password, 12);
  user.resetToken = undefined;
  user.resetTokenExpiry = undefined;
  await user.save();
  return NextResponse.json({ success: true, message: "Password reset successfully" });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (body?.phone !== undefined) {
      return await resetWithSmsCode(body.phone, body.otpCode, body.password);
    }
    const { token, password } = body;

    // Tokens are 64 hex chars (forgot-password). Checking the type matters: an
    // object like {"$ne": null} would otherwise match any user with a pending
    // reset and let a stranger set their password.
    if (typeof token !== "string" || !/^[a-f0-9]{64}$/.test(token) || typeof password !== "string" || !password) {
      console.log("[reset-password] Missing token or password");
      return NextResponse.json({ error: "Token and password are required" }, { status: 400 });
    }
    if (password.length < 6) {
      console.log("[reset-password] Password too short");
      return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 });
    }

    try {
      await connectDB();
      console.log("[reset-password] Database connected");
    } catch (error) {
      console.error("[reset-password] Database connection failed:", error);
      return NextResponse.json({ error: "Database not configured yet" }, { status: 503 });
    }

    // Find user by reset token
    const user = await User.findOne({
      resetToken: token,
      resetTokenExpiry: { $gt: new Date() },
    });

    console.log("[reset-password] User found:", !!user);
    if (!user) {
      console.log("[reset-password] Invalid or expired reset link");
      return NextResponse.json({ error: "Invalid or expired reset link" }, { status: 400 });
    }

    console.log("[reset-password] Hashing new password...");
    const hashedPassword = await bcrypt.hash(password, 12);
    
    // Update the user with new password and clear reset token
    user.passwordHash = hashedPassword;
    user.resetToken = undefined;
    user.resetTokenExpiry = undefined;
    
    console.log("[reset-password] Saving user...");
    await user.save();
    console.log("[reset-password] User saved successfully");

    return NextResponse.json({ success: true, message: "Password reset successfully" });
  } catch (error) {
    console.error("[reset-password] Error:", error);
    return NextResponse.json({ error: "Something went wrong.", details: String(error) }, { status: 500 });
  }
}
