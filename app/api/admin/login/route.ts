import { NextRequest, NextResponse } from "next/server";
import { verifyAdminPassword } from "@/lib/auth/adminPassword";
import { signAdminSession, ADMIN_SESSION_MAX_AGE_S } from "@/lib/auth/admin";
import { rateLimit, getRateLimitKey } from "@/lib/middleware/rateLimit";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    // 5 tries per 15 minutes per IP, so the password can't be guessed by brute force.
    if (!rateLimit(`admin-login:${getRateLimitKey(req)}`, 5, 15 * 60 * 1000)) {
      return NextResponse.json(
        { error: "Too many attempts. Please wait 15 minutes and try again." },
        { status: 429 }
      );
    }

    const { password } = await req.json();

    if (typeof password !== "string" || !password) {
      return NextResponse.json({ error: "Password is required" }, { status: 400 });
    }

    if (!process.env.SESSION_SECRET && !process.env.ADMIN_PASSWORD) {
      return NextResponse.json({ error: "Admin authentication not configured" }, { status: 503 });
    }

    if (!(await verifyAdminPassword(password))) {
      return NextResponse.json({ error: "Invalid password" }, { status: 401 });
    }

    const res = NextResponse.json({ success: true, message: "Admin logged in successfully" });
    res.cookies.set("admin_session", signAdminSession(), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: ADMIN_SESSION_MAX_AGE_S,
    });
    return res;
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
