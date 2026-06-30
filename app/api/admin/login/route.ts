import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { connectDB } from "@/lib/db/connect";
import Settings from "@/lib/db/models/Settings";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const { password } = await req.json();
    
    let adminPassword = process.env.ADMIN_PASSWORD;
    
    // Try to get password from database, but don't fail if DB connection fails
    try {
      await connectDB();
      const settings = await Settings.findOne({});
      // Use database password if available, otherwise fall back to env
      if (settings?.adminPassword) {
        adminPassword = settings.adminPassword;
      }
    } catch (dbError) {
      console.warn("[login] Database connection failed, using env password:", dbError);
      // Continue with env password as fallback
    }

    if (!adminPassword || password !== adminPassword) {
      return NextResponse.json({ error: "Invalid password" }, { status: 401 });
    }

    const res = NextResponse.json({ success: true });
    res.cookies.set("admin_session", password, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });
    return res;
  } catch (error) {
    console.error("[login] Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
