/**
 * The one place Razorpay credentials are read.
 *
 * Two failures this closes off, both of which have taken checkout down:
 *
 * 1. Values pasted into the Vercel dashboard often carry a trailing newline or
 *    space, or arrive wrapped in quotes copied from a .env file. Razorpay then
 *    rejects the key pair with a 401 and the app can only say "Payment gateway
 *    authentication failed" — nothing about the value looks wrong on screen.
 *    Razorpay keys and secrets are plain alphanumerics, so trimming whitespace
 *    and one pair of wrapping quotes can never damage a real value.
 *
 * 2. The browser used to take its key from NEXT_PUBLIC_RAZORPAY_KEY_ID while
 *    the server created the order with RAZORPAY_KEY_ID — two variables that
 *    must always match, with nothing enforcing it. NEXT_PUBLIC_ values are
 *    also baked into the bundle at BUILD time, so changing them without a
 *    rebuild left the browser on the old key. The server now hands its own key
 *    id to the browser in the create-order response (a key id is public — it
 *    is what the checkout modal shows anyway), so the order and the modal can
 *    never disagree.
 */

function clean(value: string | undefined): string {
  if (!value) return "";
  let v = value.trim();
  if (v.length >= 2 && ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'")))) {
    v = v.slice(1, -1).trim();
  }
  return v;
}

function required(name: string): string {
  const value = clean(process.env[name]);
  if (!value) throw new Error(`${name} is not set`);
  return value;
}

export const razorpayKeyId         = () => required("RAZORPAY_KEY_ID");
export const razorpayKeySecret     = () => required("RAZORPAY_KEY_SECRET");
export const razorpayWebhookSecret = () => required("RAZORPAY_WEBHOOK_SECRET");

/** "live" / "test" / "unknown" from the key id prefix — safe to log, the id is public. */
export function razorpayMode(keyId: string): "live" | "test" | "unknown" {
  if (keyId.startsWith("rzp_live_")) return "live";
  if (keyId.startsWith("rzp_test_")) return "test";
  return "unknown";
}

const KEY_ID_SHAPE = /^rzp_(live|test)_[A-Za-z0-9]+$/;

/**
 * A key id shortened for logs, e.g. "rzp_live_TdT…efc".
 *
 * Only prints something that actually looks like a key id. The whole point of
 * logging it is to catch a misconfigured key — and the likeliest misconfiguration
 * is a SECRET pasted into RAZORPAY_KEY_ID. Printing that value, even truncated,
 * would put part of the secret into the logs on every single checkout attempt.
 */
export function describeKeyId(keyId: string): string {
  if (!KEY_ID_SHAPE.test(keyId)) {
    return `a value that is not an rzp_ key id (${keyId.length} chars) — check that RAZORPAY_KEY_ID holds the key id, not the secret`;
  }
  if (keyId.length <= 16) return keyId;
  return `${keyId.slice(0, 12)}…${keyId.slice(-3)}`;
}
