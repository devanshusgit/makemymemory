import { connectDB } from "@/lib/db/connect";
import { User } from "@/lib/db/models/User";

export interface SessionPayload {
  id?: string;
  name?: string;
  email?: string;
  phone?: string;
}

/**
 * Parse the raw `user_session` cookie value. Returns null for anything
 * missing, malformed, or carrying no usable identity — callers must treat
 * null as "not logged in" rather than falling through to an empty filter.
 */
export function parseSession(raw: string | undefined | null): SessionPayload | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
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
