import { NextRequest, NextResponse } from "next/server";

/**
 * PayPal order creation stub.
 *
 * To implement fully:
 * 1. Install: npm install @paypal/checkout-server-sdk
 * 2. Set env vars: PAYPAL_CLIENT_ID, PAYPAL_CLIENT_SECRET
 * 3. Replace the stub below with real PayPal SDK calls
 *
 * Docs: https://developer.paypal.com/docs/api/orders/v2/
 */
export async function POST(req: NextRequest) {
  try {
    const { amount } = await req.json();

    if (!amount || amount <= 0) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
    }

    // TODO: Replace with real PayPal SDK integration
    // const client = new PayPalClient(...)
    // const order  = await client.orders.create({ ... })
    // return NextResponse.json({ approvalUrl: order.links.find(l => l.rel === "approve").href })

    // Stub response — remove when real integration is added
    return NextResponse.json(
      {
        error: "PayPal integration not yet configured. Set PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET.",
      },
      { status: 501 }
    );
  } catch (error) {
    console.error("PayPal order creation error:", error);
    return NextResponse.json(
      { error: "Failed to create PayPal order" },
      { status: 500 }
    );
  }
}
