import Razorpay from "razorpay";

let _razorpay: Razorpay | null = null;

export function getRazorpay(): Razorpay {
  if (_razorpay) return _razorpay;
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keyId || !keySecret) {
    throw new Error("Missing Razorpay credentials. Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in your environment.");
  }
  _razorpay = new Razorpay({ key_id: keyId, key_secret: keySecret });
  return _razorpay;
}

// Keep backward compat - lazy proxy
export const razorpay = new Proxy({} as Razorpay, {
  get(_target, prop) {
    return (getRazorpay() as any)[prop];
  },
});
