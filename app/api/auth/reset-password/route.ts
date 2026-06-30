import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db/connect";
import { User } from "@/lib/db/models/User";

export async function POST(req: NextRequest) {
  try {
    const { token, password } = await req.json();

    console.log("[reset-password] Starting password reset with token:", token?.slice(0, 8) + "...");

    if (!token || !password) {
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
