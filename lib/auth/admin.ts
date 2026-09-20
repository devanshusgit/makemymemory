import { timingSafeEqual } from "crypto";
import type { NextRequest } from "next/server";

/**
 * The single admin check for every /api/admin route.
 *
 * It replaces ~35 copy-pasted `isAdmin()` helpers, plus three routes
 * (settings/toggle, settings/store, settings/stats) that only checked whether
 * an admin_session cookie EXISTED — so any value at all unlocked maintenance
 * mode, store details and the homepage counters.
 *
 * The cookie still carries ADMIN_PASSWORD, matching what /api/admin/login
 * issues today; the comparison is constant-time so the value can't be guessed
 * a character at a time. Replacing that scheme with a random session token is
 * a separate change that has to move the login route at the same time.
 */
export function isAdminRequest(req: NextRequest | { cookies: { get(name: string): { value: string } | undefined } }): boolean {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) {
    console.error("[admin-auth] ADMIN_PASSWORD is not configured — denying admin access");
    return false;
  }
  const provided = req.cookies.get("admin_session")?.value;
  if (!provided) return false;
  const a = Buffer.from(provided);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

/** Same check for server components / route handlers that hold a cookie store. */
export function isAdminCookieValue(value: string | undefined | null): boolean {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected || !value) return false;
  const a = Buffer.from(value);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}
