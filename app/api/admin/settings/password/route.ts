import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { isAdminCookieValue } from "@/lib/auth/admin";
import { verifyAdminPassword, setAdminPassword } from "@/lib/auth/adminPassword";
import { rateLimit, getRateLimitKey } from "@/lib/middleware/rateLimit";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    if (!isAdminCookieValue(cookies().get("admin_session")?.value)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!rateLimit(`admin-password:${getRateLimitKey(req)}`, 5, 15 * 60 * 1000)) {
      return NextResponse.json({ error: "Too many attempts. Please wait 15 minutes." }, { status: 429 });
    }

    const { oldPassword, newPassword } = await req.json();

    if (typeof oldPassword !== "string" || typeof newPassword !== "string") {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    if (newPassword.length < 10) {
      return NextResponse.json({ error: "Password must be at least 10 characters" }, { status: 400 });
    }

    // Checked exactly the way login checks it, and saved as a bcrypt hash that
    // login reads. The old form stored plaintext in a field login ignored.
    if (!(await verifyAdminPassword(oldPassword))) {
      return NextResponse.json({ error: "Current password is incorrect" }, { status: 401 });
    }

    await setAdminPassword(newPassword);

    return NextResponse.json({ success: true, message: "Password changed successfully" });
  } catch (error) {
    console.error("Error changing password:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
