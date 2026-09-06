import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connect";
import { User } from "@/lib/db/models/User";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import { parseSession, sessionUserFilter } from "@/lib/auth/session";

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    // Get user from session
    const cookieStore = cookies();
    const filter = sessionUserFilter(parseSession(cookieStore.get("user_session")?.value));

    if (!filter) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { oldPassword, newPassword } = body;

    if (!oldPassword || !newPassword) {
      return NextResponse.json(
        { error: "Old password and new password are required" },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: "New password must be at least 6 characters" },
        { status: 400 }
      );
    }

    // Find user
    const foundUser = await User.findOne(filter);
    if (!foundUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Verify old password
    console.log("[change-password] Verifying old password...");
    const isPasswordValid = await bcrypt.compare(oldPassword, foundUser.passwordHash);
    if (!isPasswordValid) {
      console.log("[change-password] Old password incorrect");
      return NextResponse.json(
        { error: "Current password is incorrect" },
        { status: 401 }
      );
    }

    // Hash new password
    console.log("[change-password] Hashing new password...");
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    foundUser.passwordHash = hashedPassword;
    await foundUser.save();
    console.log("[change-password] Password updated successfully");

    return NextResponse.json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error) {
    console.error("[change-password] Error:", error);
    return NextResponse.json({ error: "Internal server error", details: String(error) }, { status: 500 });
  }
}
