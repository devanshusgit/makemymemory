import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db/connect";
import Settings from "@/lib/db/models/Settings";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const { password } = await req.json();
    
    if (!password) {
      return NextResponse.json({ error: "Password is required" }, { status: 400 });
    }

    let adminPasswordHash = process.env.ADMIN_PASSWORD_HASH;
    
    // Try to get password from database, but don't fail if DB connection fails
    try {
      await connectDB();
      const settings = await Settings.findOne({});
      // Use database password hash if available, otherwise fall back to env
      if (settings?.adminPasswordHash) {
        adminPasswordHash = settings.adminPasswordHash;
      }
    } catch (dbError) {
      // Continue with env password as fallback
    }

    if (!adminPasswordHash) {
      return NextResponse.json({ error: "Admin authentication not configured" }, { status: 503 });
    }

    // Compare password with hash using bcrypt
    const isValid = await bcrypt.compare(password, adminPasswordHash);
    if (!isValid) {
      return NextResponse.json({ error: "Invalid password" }, { status: 401 });
    }

    const res = NextResponse.json({ success: true, message: "Admin logged in successfully" });
    res.cookies.set("admin_session", adminPasswordHash, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });
    return res;
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
