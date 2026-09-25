import { NextRequest, NextResponse } from "next/server";
import { User } from "@/lib/db/models/User";
import { parseSession, getSessionUser } from "@/lib/auth/session";
import { verifyOtp } from "@/lib/otp/otpService";
import { rateLimit, getRateLimitKey } from "@/lib/middleware/rateLimit";

export const dynamic = "force-dynamic";

/**
 * POST /api/user/delete-account-confirm   Body: { otp }
 * Step 2: permanently delete the signed-in user's account once they enter the
 * code from /api/user/delete-account. Orders stay for sales and tax records.
 *
 * The account is the one in the signed session, not an email from the body —
 * this used to accept any cookie value plus any email, so the only thing
 * standing between a stranger and deleting someone's account was the code.
 */
export async function POST(req: NextRequest) {
  const session = parseSession(req.cookies.get("user_session")?.value);
  if (!session) {
    return NextResponse.json({ error: "Please sign in again." }, { status: 401 });
  }
  if (!rateLimit(`delete-account-confirm:${getRateLimitKey(req)}`, 10, 15 * 60 * 1000)) {
    return NextResponse.json({ error: "Too many attempts. Please try again in 15 minutes." }, { status: 429 });
  }

  try {
    const { otp } = await req.json();
    if (typeof otp !== "string" || !/^\d{6}$/.test(otp)) {
      return NextResponse.json({ error: "Enter the 6-digit code." }, { status: 400 });
    }

    const user = await getSessionUser(session);
    if (!user) {
      return NextResponse.json({ error: "Account not found." }, { status: 404 });
    }

    const contact = user.email ? String(user.email).toLowerCase() : String(user.phone || "");
    const check = await verifyOtp(contact, otp, "account_deletion");
    if (!check.valid) {
      return NextResponse.json({ error: check.message }, { status: 401 });
    }

    await User.deleteOne({ _id: user._id });

    const res = NextResponse.json({
      success: true,
      message: "Account has been permanently deleted.",
    });
    res.cookies.delete("user_session");
    return res;
  } catch (error) {
    console.error("[delete-account-confirm]", error);
    return NextResponse.json({ error: "Failed to delete account" }, { status: 500 });
  }
}
