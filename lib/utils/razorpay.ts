/**
 * Client-side Razorpay utilities.
 * Only NEXT_PUBLIC_RAZORPAY_KEY_ID is used here — Key Secret is never touched.
 */

/** Razorpay checkout response returned to the handler callback */
export interface RazorpayPaymentResponse {
  razorpay_order_id:   string;
  razorpay_payment_id: string;
  razorpay_signature:  string;
}

/** Options passed to new window.Razorpay(options) */
export interface RazorpayOptions {
  key:         string;
  amount:      number;   // paise
  currency:    string;
  name:        string;
  description?: string;
  image?:      string;
  order_id:    string;
  prefill?: {
    name?:    string;
    email?:   string;
    contact?: string;
  };
  notes?:  Record<string, string>;
  theme?:  { color?: string };
  modal?:  { ondismiss?: () => void; escape?: boolean };
  handler: (response: RazorpayPaymentResponse) => void;
}

declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => { open(): void; close(): void };
  }
}

/**
 * Dynamically loads the Razorpay checkout.js script.
 * Safe to call multiple times — resolves immediately if already loaded.
 */
export function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window === "undefined") return resolve(false);
    if (window.Razorpay)               return resolve(true);

    const script    = document.createElement("script");
    script.src      = "https://checkout.razorpay.com/v1/checkout.js";
    script.async    = true;
    script.onload   = () => resolve(true);
    script.onerror  = () => {
      resolve(false);
    };
    document.body.appendChild(script);
  });
}

/**
 * Opens the Razorpay checkout modal and returns the payment response.
 * Rejects if the user dismisses the modal or payment fails.
 */
export function openRazorpayCheckout(
  options: Omit<RazorpayOptions, "handler">
): Promise<RazorpayPaymentResponse> {
  return new Promise((resolve, reject) => {
    const rzp = new window.Razorpay({
      ...options,
      modal: {
        ...options.modal,
        ondismiss: () => reject(new Error("Payment cancelled")),
        escape: false,
      },
      handler: (response) => resolve(response),
    });
    rzp.open();
  });
}

/** Formats a number as Indian Rupees */
export function formatINR(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style:                "currency",
    currency:             "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

/** Converts INR to paise */
export function toPaise(amountINR: number): number {
  return Math.round(amountINR * 100);
}
