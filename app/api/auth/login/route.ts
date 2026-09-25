import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db/connect";
import { User } from "@/lib/db/models/User";
import { signSession } from "@/lib/auth/session";
import { rateLimit, getRateLimitKey } from "@/lib/middleware/rateLimit";

export async function POST(req: NextRequest) {
  // Brute-force guard: 10 tries per 15 minutes per IP.
  if (!rateLimit(`login:${getRateLimitKey(req)}`, 10, 15 * 60 * 1000)) {
    return NextResponse.json({ error: "Too many attempts. Please wait 15 minutes and try again." }, { status: 429 });
  }
  try {
    const { email, password } = await req.json();

    if (typeof email !== "string" || typeof password !== "string" || !email || !password) {
      return NextResponse.json({ error: "Email/Phone and password are required" }, { status: 400 });
    }

    try {
      await connectDB();
    } catch {
      return NextResponse.json({ error: "Database not configured yet" }, { status: 503 });
    }

    const credential = email.trim();
    const user = await User.findOne({
      $or: [
        { email: credential.toLowerCase() },
        { phone: credential },
      ],
    });
    if (!user) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

    const response = NextResponse.json({
      success: true,
      user: { name: user.name, email: user.email },
    });

    // `id` is the durable identity the rest of the account API keys off of —
    // required now that a user can exist with only an email or only a phone,
    // neither of which alone is guaranteed to be present on every account.
    response.cookies.set("user_session", signSession({
      id: user._id.toString(), name: user.name, email: user.email, phone: user.phone,
    }), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("[login]", error);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
