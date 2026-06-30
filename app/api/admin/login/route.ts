import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { connectDB } from "@/lib/db/connect";
import Settings from "@/lib/db/models/Settings";

export async function POST(req: NextRequest) {
  try {
    const { password } = await req.json();
    
    await connectDB();
    const settings = await Settings.findOne({});
    
    // Check database password first, fallback to env variable
    const adminPassword = settings?.adminPassword || process.env.ADMIN_PASSWORD;

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
    console.error("Login error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
