import { NextRequest, NextResponse } from "next/server";

/**
 * PayPal order creation - NOT YET IMPLEMENTED
 *
 * To implement:
 * 1. Install: npm install @paypal/checkout-server-sdk
 * 2. Set env vars: PAYPAL_CLIENT_ID, PAYPAL_CLIENT_SECRET
 * 3. Replace stub with real PayPal SDK integration
 *
 * Documentation: https://developer.paypal.com/docs/api/orders/v2/
 */
export async function POST(req: NextRequest) {
  try {
    // PayPal integration not yet available
    return NextResponse.json(
      {
        error: "PayPal payment method is not yet available. Please use Razorpay or Cash on Delivery.",
      },
      { status: 501 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: "PayPal integration error" },
      { status: 500 }
    );
  }
}
