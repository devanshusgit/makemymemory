import { NextRequest, NextResponse } from "next/server";
import { parseSession, getSessionUser } from "@/lib/auth/session";
import { createAndSendOtp } from "@/lib/otp/otpService";
import { rateLimit, getRateLimitKey } from "@/lib/middleware/rateLimit";

export const dynamic = "force-dynamic";

function mask(value: string, isEmail: boolean): string {
  if (isEmail) {
    const [name, domain] = value.split("@");
    return `${name.slice(0, 2)}***@${domain}`;
  }
  return `******${value.slice(-4)}`;
}

/**
 * POST /api/user/delete-account
 * Step 1 of deleting an account: send a code to the signed-in user's own
 * email (or phone, for phone-only accounts). Step 2 is delete-account-confirm.
 *
 * The address comes from the session, never the request body. This used to
 * take any email with no login at all, so anyone could make the site email
 * deletion codes to any customer (and learn which emails had accounts).
 */
export async function POST(req: NextRequest) {
  const session = parseSession(req.cookies.get("user_session")?.value);
  if (!session) {
    return NextResponse.json({ error: "Please sign in again." }, { status: 401 });
  }
  if (!rateLimit(`delete-account:${getRateLimitKey(req)}`, 3, 15 * 60 * 1000)) {
    return NextResponse.json({ error: "Too many requests. Please try again in 15 minutes." }, { status: 429 });
  }

  try {
    const user = await getSessionUser(session);
    if (!user) {
      return NextResponse.json({ error: "Account not found." }, { status: 404 });
    }

    const email = user.email ? String(user.email).toLowerCase() : "";
    const phone = user.phone ? String(user.phone) : "";
    if (!email && !phone) {
      return NextResponse.json(
        { error: "No email or phone on this account. Please contact support@makemymemory.in." },
        { status: 400 }
      );
    }

    const otpResult = await createAndSendOtp(
      email
        ? { email, type: "account_deletion", method: "email" }
        : { phone, type: "account_deletion", method: "sms" }
    );
    if (!otpResult.success) {
      return NextResponse.json({ error: otpResult.message || "Failed to send the code." }, { status: 500 });
    }

    const sentTo = email ? mask(email, true) : mask(phone, false);
    return NextResponse.json({
      success: true,
      sentTo,
      message: `We sent a 6-digit code to ${sentTo}. Enter it below to delete your account.`,
    });
  } catch (error) {
    console.error("[delete-account]", error);
    return NextResponse.json({ error: "Failed to process deletion request" }, { status: 500 });
  }
}
