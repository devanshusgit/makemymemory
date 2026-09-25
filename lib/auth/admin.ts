import { createHmac, timingSafeEqual } from "crypto";
import type { NextRequest } from "next/server";

/**
 * The single admin check for every /api/admin route and the /admin pages.
 *
 * The admin_session cookie is a signed, expiring token issued by
 * /api/admin/login. It used to hold ADMIN_PASSWORD itself, which meant the
 * password sat in the browser, and anyone who knew the env password could set
 * the cookie by hand without ever passing the login check — even after the
 * password was changed in Settings.
 *
 * The key is separate from the customer session key (different prefix), so a
 * customer's signed user_session can never be replayed as an admin cookie.
 * Rotating SESSION_SECRET logs every admin out immediately.
 */
export const ADMIN_SESSION_MAX_AGE_S = 60 * 60 * 24 * 7; // 7 days

function adminKey(): string | null {
  const secret = process.env.SESSION_SECRET || process.env.ADMIN_PASSWORD;
  return secret ? `mmm-admin-session::${secret}` : null;
}

function sign(body: string, key: string): string {
  return createHmac("sha256", key).update(body).digest("hex");
}

/** Cookie value for a freshly logged-in admin. */
export function signAdminSession(): string {
  const key = adminKey();
  if (!key) throw new Error("SESSION_SECRET is not configured");
  const payload = { role: "admin", exp: Date.now() + ADMIN_SESSION_MAX_AGE_S * 1000 };
  const body = Buffer.from(JSON.stringify(payload), "utf8").toString("base64url");
  return `${body}.${sign(body, key)}`;
}

/** Same check for server components / route handlers that hold a cookie store. */
export function isAdminCookieValue(value: string | undefined | null): boolean {
  if (!value) return false;
  const key = adminKey();
  if (!key) {
    console.error("[admin-auth] SESSION_SECRET is not configured — denying admin access");
    return false;
  }
  const dot = value.lastIndexOf(".");
  if (dot <= 0) return false;
  const body = value.slice(0, dot);
  const given = Buffer.from(value.slice(dot + 1));
  const want = Buffer.from(sign(body, key));
  if (given.length !== want.length || !timingSafeEqual(given, want)) return false;
  try {
    const payload = JSON.parse(Buffer.from(body, "base64url").toString("utf8"));
    return payload?.role === "admin" && typeof payload.exp === "number" && payload.exp > Date.now();
  } catch {
    return false;
  }
}

export function isAdminRequest(req: NextRequest | { cookies: { get(name: string): { value: string } | undefined } }): boolean {
  return isAdminCookieValue(req.cookies.get("admin_session")?.value);
}
