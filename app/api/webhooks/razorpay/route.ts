import { NextRequest, NextResponse } from "next/server";
import { connectDB }              from "@/lib/db/connect";
import { Order }                  from "@/lib/db/models/Order";
import { verifyWebhookSignature } from "@/lib/razorpay/verify";
import { sendOrderConfirmation, sendAdminNotification } from "@/lib/email";

/**
 * POST /api/webhooks/razorpay
 *
 * Receives and processes Razorpay webhook events.
 * Register URL in: Razorpay Dashboard → Settings → Webhooks
 * Webhook URL: https://yourdomain.com/api/webhooks/razorpay
 *
 * Security:
 * - Reads raw body bytes before parsing — signature covers exact bytes
 * - HMAC-SHA256 + timing-safe compare via RAZORPAY_WEBHOOK_SECRET
 * - Always returns 200 to prevent Razorpay retries on handler errors
 */
export async function POST(req: NextRequest) {
  // ── 1. Read raw body ──────────────────────────────────────────────────────
  let rawBody: string;
  try {
    rawBody = await req.text();
  } catch {
    return NextResponse.json({ error: "Could not read body" }, { status: 400 });
  }

  // ── 2. Verify signature ───────────────────────────────────────────────────
  const signature = req.headers.get("x-razorpay-signature") ?? "";
  if (!signature) {
    console.warn("[webhook] Missing X-Razorpay-Signature");
    return NextResponse.json({ error: "Missing signature" }, { status: 401 });
  }

  let isValid: boolean;
  try {
    isValid = verifyWebhookSignature({ rawBody, signature });
  } catch (err) {
    console.error("[webhook] Secret not configured:", err);
    return NextResponse.json({ error: "Webhook secret not configured" }, { status: 500 });
  }

  if (!isValid) {
    console.warn("[webhook] Invalid signature — possible spoofed request");
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  // ── 3. Parse payload ──────────────────────────────────────────────────────
  let event: RazorpayWebhookEvent;
  try {
    event = JSON.parse(rawBody) as RazorpayWebhookEvent;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { event: eventName, payload } = event;
  console.log(`[webhook] ${eventName}`);

  // ── 4. Handle events ──────────────────────────────────────────────────────
  try {
    await connectDB();

    switch (eventName) {

      /* ── payment.captured ─────────────────────────────────────────────── */
      case "payment.captured": {
        const p = payload.payment?.entity;
        if (!p) break;

        const updatedOrder = await Order.findOneAndUpdate(
          { razorpayOrderId: p.order_id },
          {
            $set: {
              razorpayPaymentId: p.id,
              status:            "processing",
            },
            $push: {
              trackingEvents: {
                status:      "processing",
                description: `Payment of ₹${p.amount / 100} captured via ${p.method}.`,
                location:    "Online",
                timestamp:   new Date(),
              },
            },
          },
          { new: true }
        );

        console.log("[webhook] payment.captured — order updated:", p.order_id);
        
        // EMAIL_DISABLED: Send confirmation emails
        /*
        if (updatedOrder) {
          try {
            await sendOrderConfirmation(updatedOrder);
            await sendAdminNotification(updatedOrder);
            console.log("[webhook] Confirmation emails sent for order:", p.order_id);
          } catch (emailError) {
            console.error("[webhook] Failed to send emails:", emailError);
          }
        }
        */
        break;
      }

      /* ── payment.failed ───────────────────────────────────────────────── */
      case "payment.failed": {
        const p = payload.payment?.entity;
        if (!p) break;

        const failedOrder = await Order.findOneAndUpdate(
          { razorpayOrderId: p.order_id },
          {
            $set: { status: "payment_failed" },
            $push: {
              trackingEvents: {
                status:      "payment_failed",
                description: `Payment failed: ${p.error_description ?? p.error_code ?? "Unknown error"}.`,
                location:    "Online",
                timestamp:   new Date(),
              },
            },
          },
          { new: true }
        );

        console.warn("[webhook] payment.failed:", p.order_id, p.error_code);
        
        // EMAIL_DISABLED: Send payment failure notification to admin
        /*
        if (failedOrder) {
          try {
            await sendAdminNotification(failedOrder);
            console.log("[webhook] Payment failure notification sent for order:", p.order_id);
          } catch (emailError) {
            console.error("[webhook] Failed to send payment failure notification:", emailError);
          }
        }
        */
        break;
      }

      /* ── order.paid ───────────────────────────────────────────────────── */
      case "order.paid": {
        const o = payload.order?.entity;
        if (!o) break;

        // order.paid fires when all payments for an order are captured
        await Order.findOneAndUpdate(
          { razorpayOrderId: o.id },
          {
            $set: { status: "processing" },
            $push: {
              trackingEvents: {
                status:      "processing",
                description: "Full payment received. Order is now being processed.",
                location:    "Make My Memory Studio",
                timestamp:   new Date(),
              },
            },
          }
        );
        break;
      }

      /* ── refund.created ───────────────────────────────────────────────── */
      case "refund.created": {
        const r = payload.refund?.entity;
        if (!r) break;

        await Order.findOneAndUpdate(
          { razorpayPaymentId: r.payment_id },
          {
            $push: {
              trackingEvents: {
                status:      "cancelled",
                description: `Refund of ₹${r.amount / 100} initiated.`,
                location:    "Online",
                timestamp:   new Date(),
              },
            },
          }
        );
        break;
      }

      /* ── refund.processed ─────────────────────────────────────────────── */
      case "refund.processed": {
        const r = payload.refund?.entity;
        if (!r) break;

        await Order.findOneAndUpdate(
          { razorpayPaymentId: r.payment_id },
          {
            $set: { status: "cancelled" },
            $push: {
              trackingEvents: {
                status:      "cancelled",
                description: `Refund of ₹${r.amount / 100} processed successfully.`,
                location:    "Online",
                timestamp:   new Date(),
              },
            },
          }
        );
        break;
      }

      default:
        console.log(`[webhook] Unhandled event: ${eventName}`);
    }
  } catch (handlerError) {
    // Log but always return 200 — prevents Razorpay from retrying indefinitely
    console.error(`[webhook] Handler error for ${eventName}:`, handlerError);
  }

  return NextResponse.json({ received: true }, { status: 200 });
}

/* ─────────────────────────────────────────────
   Webhook payload types
───────────────────────────────────────────── */
interface RazorpayPaymentEntity {
  id: string; order_id: string; amount: number; currency: string;
  status: string; method: string; email?: string; contact?: string;
  error_code?: string; error_description?: string; error_reason?: string;
}
interface RazorpayOrderEntity {
  id: string; amount: number; amount_paid: number; amount_due: number;
  currency: string; status: string;
}
interface RazorpayRefundEntity {
  id: string; payment_id: string; amount: number; currency: string; status: string;
}
interface RazorpayWebhookEvent {
  entity: string; account_id: string; event: string; contains: string[];
  payload: {
    payment?: { entity: RazorpayPaymentEntity };
    order?:   { entity: RazorpayOrderEntity };
    refund?:  { entity: RazorpayRefundEntity };
  };
  created_at: number;
}
