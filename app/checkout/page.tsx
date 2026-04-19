import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import CheckoutClient from "@/components/checkout/CheckoutClient";
import { buildMeta } from "@/lib/seo";

export const metadata = buildMeta({
  title:       "Checkout",
  description: "Complete your personalised gift order securely with Razorpay, PayPal, or Cash on Delivery.",
  path:        "/checkout",
  noIndex:     true,
});

export default function CheckoutPage() {
  const cookieStore = cookies();
  const session = cookieStore.get("user_session");
  let isLoggedIn = false;
  try {
    if (session?.value) {
      const parsed = JSON.parse(session.value);
      isLoggedIn = !!parsed?.email;
    }
  } catch { /* invalid cookie */ }

  if (!isLoggedIn) {
    redirect("/login?redirect=/checkout");
  }

  return (
    <div className="bg-canvas min-h-screen">
      {/* Minimal checkout header */}
      <div className="bg-white border-b border-stone-100">
        <div className="section-wrap h-14 flex items-center justify-between">
          <a href="/" className="font-serif text-base font-bold text-ink">
            Make My <span className="text-sage-dark">Memory</span>
          </a>
          <div className="flex items-center gap-1.5 text-xs text-stone-400">
            <span className="w-4 h-4 rounded-full bg-sage/20 flex items-center
                             justify-center text-sage-dark text-[10px] font-bold">✓</span>
            Cart
            <span className="w-4 h-px bg-stone-200" />
            <span className="text-ink font-semibold">Checkout</span>
            <span className="w-4 h-px bg-stone-200" />
            <span>Confirmation</span>
          </div>
        </div>
      </div>

      <div className="section-wrap py-10 sm:py-14">
        <div className="mb-8">
          <span className="label-tag mb-3 inline-flex">Secure Checkout</span>
          <h1 className="section-heading">Complete Your Order</h1>
        </div>
        <Suspense fallback={
          <div className="flex items-center justify-center py-24">
            <div className="w-8 h-8 border-2 border-sage border-t-transparent rounded-full animate-spin" />
          </div>
        }>
          <CheckoutClient />
        </Suspense>
      </div>
    </div>
  );
}
