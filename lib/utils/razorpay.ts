/**
 * Client-side Razorpay utilities.
 * Only a public key id is ever used here — the Key Secret never reaches the browser.
 */

/** Razorpay checkout response returned to the handler callback */
export interface RazorpayPaymentResponse {
  razorpay_order_id:   string;
  razorpay_payment_id: string;
  razorpay_signature:  string;
}

export interface RazorpayPaymentFailureResponse {
  error?: {
    code?:        string;
    description?: string;
    source?:      string;
    step?:        string;
    reason?:      string;
  };
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
    Razorpay: new (options: RazorpayOptions) => {
      open(): void;
      close(): void;
      on(event: "payment.failed", handler: (response: RazorpayPaymentFailureResponse) => void): void;
    };
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
 * Opens the Razorpay checkout modal and resolves with the payment response.
 *
 * Resolves as soon as ANY attempt succeeds. Rejects only when the customer
 * closes the modal without paying — with the last failure reason if an attempt
 * failed, otherwise "Payment cancelled".
 *
 * It used to reject on the first `payment.failed`. But Razorpay keeps the modal
 * open after a failed attempt and offers Retry, so a customer whose first UPI
 * collect timed out could retry and pay successfully — and by then this promise
 * had already rejected, so the success was silently dropped. The money was
 * captured, nothing was verified, no order was written, and pressing Pay again
 * created a second Razorpay order and could charge them twice.
 */
export function openRazorpayCheckout(
  options: Omit<RazorpayOptions, "handler">
): Promise<RazorpayPaymentResponse> {
  return new Promise((resolve, reject) => {
    const originalDismiss = options.modal?.ondismiss;
    let settled = false;
    let lastFailure: string | null = null;

    const rzp = new window.Razorpay({
      ...options,
      modal: {
        ...options.modal,
        ondismiss: () => {
          originalDismiss?.();
          if (settled) return;
          settled = true;
          reject(new Error(lastFailure ?? "Payment cancelled"));
        },
        escape: false,
      },
      handler: (response) => {
        if (settled) return;
        settled = true;
        resolve(response);
      },
    });

    // A failed attempt is not the end: the modal stays open and the customer
    // can retry. Remember why it failed, in case they give up and close it.
    rzp.on("payment.failed", (response) => {
      lastFailure = response.error?.description || "Payment failed. Please try another payment method.";
    });

    rzp.open();
  });
}

/** Converts INR to paise */
export function toPaise(amountINR: number): number {
  return Math.round(amountINR * 100);
}
