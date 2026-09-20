import { createHmac, timingSafeEqual } from "crypto";
import { connectDB } from "@/lib/db/connect";
import { User } from "@/lib/db/models/User";

export interface SessionPayload {
  id?: string;
  name?: string;
  email?: string;
  phone?: string;
}

/**
 * The cookie is signed with an HMAC so it cannot be forged. Before this, the
 * cookie was plain JSON and every route trusted the id/email inside it, so
 * anyone could set user_session={"email":"someone@example.com"} and read that
 * customer's orders and addresses.
 *
 * Set SESSION_SECRET in the environment. Until it is set we derive a key from
 * ADMIN_PASSWORD so signing still works on an existing deployment; rotating
 * either value simply logs everyone out.
 */
function sessionKey(): string {
  const secret = process.env.SESSION_SECRET || process.env.ADMIN_PASSWORD;
  if (!secret) throw new Error("SESSION_SECRET is not configured");
  return `mmm-session::${secret}`;
}

function sign(payloadB64: string): string {
  return createHmac("sha256", sessionKey()).update(payloadB64).digest("hex");
}

/** Cookie value for a logged-in user: base64url(JSON) + "." + HMAC. */
export function signSession(payload: SessionPayload): string {
  const body = Buffer.from(JSON.stringify(payload), "utf8").toString("base64url");
  return `${body}.${sign(body)}`;
}

/**
 * Parse the raw `user_session` cookie value. Returns null for anything
 * missing, malformed, unsigned, tampered with, or carrying no usable identity —
 * callers must treat null as "not logged in" rather than falling through to an
 * empty filter. Cookies issued before signing existed are rejected, so those
 * customers simply sign in again.
 */
export function parseSession(raw: string | undefined | null): SessionPayload | null {
  if (!raw) return null;
  const dot = raw.lastIndexOf(".");
  if (dot <= 0) return null;
  const body = raw.slice(0, dot);
  const signature = raw.slice(dot + 1);
  let expected: string;
  try {
    expected = sign(body);
  } catch {
    return null; // no secret configured — refuse rather than trust the cookie
  }
  const given = Buffer.from(signature);
  const want = Buffer.from(expected);
  if (given.length !== want.length || !timingSafeEqual(given, want)) return null;
  try {
    const parsed = JSON.parse(Buffer.from(body, "base64url").toString("utf8"));
    if (!parsed || typeof parsed !== "object") return null;
    if (!parsed.id && !parsed.email && !parsed.phone) return null;
    return parsed;
  } catch {
    return null;
  }
}

/**
 * Mongo filter identifying the session's user. Prefers the durable `_id`
 * (present on sessions issued since phone-only signup was added); falls
 * back to email/phone for older cookies still out there so already-logged-in
 * users aren't force-logged-out by this change.
 *
 * Never returns an empty object. `User.findOne({ email: undefined })` isn't
 * "no match" — the Mongo driver drops the undefined key and the query
 * becomes `{}`, silently matching an arbitrary user. Every caller must
 * treat a null filter as unauthenticated, not fall through to `User.findOne({})`.
 */
export function sessionUserFilter(session: SessionPayload | null): Record<string, unknown> | null {
  if (!session) return null;
  if (session.id) return { _id: session.id };
  if (session.email) return { email: session.email };
  if (session.phone) return { phone: session.phone };
  return null;
}

/** Fetch the session's User document, or null if unauthenticated/not found. */
export async function getSessionUser(session: SessionPayload | null) {
  const filter = sessionUserFilter(session);
  if (!filter) return null;
  await connectDB();
  return User.findOne(filter);
}

/**
 * Whether a session belongs to the given order contact details (email
 * and/or phone captured at checkout, independent of how the account
 * itself was signed up).
 */
export function sessionMatchesContact(
  session: SessionPayload | null,
  contact: { email?: string; phone?: string }
): boolean {
  if (!session) return false;
  if (session.email && contact.email && session.email.toLowerCase() === contact.email.toLowerCase()) return true;
  if (session.phone && contact.phone && session.phone === contact.phone) return true;
  return false;
}
