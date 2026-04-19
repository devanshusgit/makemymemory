import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { connectDB } from "@/lib/db/connect";
import { User } from "@/lib/db/models/User";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    try {
      await connectDB();
    } catch {
      return NextResponse.json({ error: "Database not configured yet" }, { status: 503 });
    }

    const user = await User.findOne({ email: email.toLowerCase() });

    // Always return success to prevent email enumeration
    if (!user) {
      return NextResponse.json({
        success: true,
        message: "If an account exists, a reset link has been sent.",
      });
    }

    const token = crypto.randomBytes(32).toString("hex");
    user.resetToken = token;
    user.resetTokenExpiry = new Date(Date.now() + 1000 * 60 * 60); // 1 hour
    await user.save();

    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${token}`;
    console.log("[forgot-password] Reset URL:", resetUrl);

    return NextResponse.json({
      success: true,
      message: "If an account exists, a reset link has been sent.",
      devResetUrl: process.env.NODE_ENV === "development" ? resetUrl : undefined,
    });
  } catch (error) {
    console.error("[forgot-password]", error);
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}
