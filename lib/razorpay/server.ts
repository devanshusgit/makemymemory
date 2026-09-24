import Razorpay from "razorpay";
import { razorpayKeyId, razorpayKeySecret } from "@/lib/razorpay/config";

let _razorpay: Razorpay | null = null;

export function getRazorpay(): Razorpay {
  if (_razorpay) return _razorpay;
  let keyId: string, keySecret: string;
  try {
    keyId = razorpayKeyId();
    keySecret = razorpayKeySecret();
  } catch {
    throw new Error("Missing Razorpay credentials. Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in your environment.");
  }
  _razorpay = new Razorpay({ key_id: keyId, key_secret: keySecret });
  return _razorpay;
}

// Lazy proxy so callers can just `import { razorpay } from "@/lib/razorpay/server"`
// without needing to know about lazy initialisation.
export const razorpay = new Proxy({} as Razorpay, {
  get(_target, prop) {
    return (getRazorpay() as any)[prop];
  },
});
