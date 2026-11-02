import { Order } from "@/lib/db/models/Order";
import { Inventory } from "@/lib/db/models/Inventory";
import { priceCart, CartPricingError, type PricedLineItem } from "@/lib/checkout/priceCart";
import { calculateOffers, CHECKOUT_OFFERS, COMBO_OFFER, type CheckoutOffer } from "@/lib/coupon/offers";
import { validateAndApplyCoupon } from "@/lib/coupon/couponUtils";
import { validateOrderInventory } from "@/lib/inventory/inventoryUtils";
import { COD_ADVANCE_INR, toPaise } from "@/lib/razorpay/validation";
import { razorpay } from "@/lib/razorpay/server";
import { razorpayKeyId } from "@/lib/razorpay/config";
import { confirmCapturedPayment } from "@/lib/razorpay/confirm";
import { sessionMatchesContact, type SessionPayload } from "@/lib/auth/session";
import { sendEmail, ADMIN_EMAIL } from "@/lib/email/resend";
import { orderUpdatedEmail } from "@/lib/email/templates";
import { editState } from "./editWindow";

/**
 * Customer self-service edits: change frame options, swap the product, change
 * quantity, or correct the shipping address — within the window in
 * ./editWindow.ts.
 *
 * Money rules
 * - Costs more, paid online: the customer pays only the difference, in a new
 *   Razorpay payment. The edit is applied only after that payment is verified
 *   as captured for exactly that amount.
 * - Costs less, paid online: the edit is applied, then the difference is
 *   refunded. Refunds come out of edit payments first (newest first) and only
 *   then the original payment, which is never refunded in full: the Razorpay
 *   webhook treats a fully refunded original payment as a cancelled order and
 *   releases its stock.
 * - Cash on delivery: no online money moves. The cash balance collected with
 *   the kit simply follows the new total — the kit shipment reads it at the
 *   moment it is created, which is always after any edit.
 *
 * Every failure to refund is recorded on the order and emailed to the admin;
 * an edit is never lost because a refund call failed.
 */

export class OrderEditError extends Error {
  constructor(message: string, public status = 400) {
    super(message);
  }
}

const round2 = (n: number) => Math.round(n * 100) / 100;

/* ── Loading and ownership ────────────────────────────────────────────── */

export async function loadOwnedOrder(session: SessionPayload | null, orderId: string) {
  if (!session) throw new OrderEditError("Please sign in to change your order.", 401);
  const order = await Order.findOne({ orderId: String(orderId).toUpperCase() });
  // Same answer for "not yours" and "does not exist", so order ids can't be probed.
  if (!order || !sessionMatchesContact(session, order.shippingAddress)) {
    throw new OrderEditError("Order not found.", 404);
  }
  return order;
}

export function assertEditable(order: any) {
  const state = editState(order);
  if (!state.editable) throw new OrderEditError(state.reason, 409);
  return state;
}

/* ── Address ──────────────────────────────────────────────────────────── */

export interface EditAddress {
  fullName: string; email: string; phone: string; address: string;
  landmark: string; city: string; state: string; pincode: string;
}

function text(v: unknown, min: number, max: number, label: string): string {
  const s = typeof v === "string" ? v.replace(/\s+/g, " ").trim() : "";
  if (s.length < min || s.length > max) throw new OrderEditError(`Please check the ${label}.`);
  return s;
}

/**
 * The email is never editable: it is how the account finds the order. The
 * phone is, unless the account is linked by phone alone — then changing it
 * would hand the order to nobody.
 */
export function sanitizeAddress(input: any, current: any, session: SessionPayload): EditAddress {
  const phone = String(input?.phone ?? "").replace(/\D/g, "").replace(/^91(?=\d{10}$)/, "");
  if (!/^[6-9]\d{9}$/.test(phone)) throw new OrderEditError("Please enter a valid 10-digit mobile number.");
  const pincode = String(input?.pincode ?? "").trim();
  if (!/^\d{6}$/.test(pincode)) throw new OrderEditError("Please enter a valid 6-digit pincode.");
  const next: EditAddress = {
    fullName: text(input?.fullName, 2, 100, "name"),
    email: String(current.email),
    phone,
    address: text(input?.address, 5, 300, "address"),
    landmark: typeof input?.landmark === "string" ? input.landmark.replace(/\s+/g, " ").trim().slice(0, 200) : "",
    city: text(input?.city, 2, 100, "city"),
    state: text(input?.state, 2, 100, "state"),
    pincode,
  };
  if (!sessionMatchesContact(session, next)) {
    throw new OrderEditError("This account is linked to your phone number, so it can't be changed here. Please contact support to change it.");
  }
  return next;
}

const ADDRESS_KEYS: (keyof EditAddress)[] = ["fullName", "phone", "address", "landmark", "city", "state", "pincode"];
const addressChanged = (a: any, b: any) => ADDRESS_KEYS.some((k) => String(a?.[k] ?? "") !== String(b?.[k] ?? ""));

/* ── Items ────────────────────────────────────────────────────────────── */

const itemKey = (productId: unknown, quantity: unknown, selections: any[] | undefined) =>
  `${String(productId)}|${Number(quantity)}|${(selections ?? [])
    .filter((s) => s && s.group)
    .map((s) => `${s.group}:${s.id}`)
    .sort()
    .join(",")}`;

function sameItems(orderItems: any[], input: any[]): boolean {
  if (orderItems.length !== input.length) return false;
  const a = orderItems.map((i) => itemKey(i.productId, i.quantity, i.selections)).sort();
  const b = input.map((i) => itemKey(i?.product?.id ?? i?.productId, i?.quantity, i?.selections)).sort();
  return a.every((k, i) => k === b[i]);
}

/** appliedCouponCode holds either one coupon, or offers joined by " + " — never both. */
export function parseDiscounts(applied: unknown): { couponCode: string; offerCodes: CheckoutOffer[] } {
  const raw = typeof applied === "string" ? applied.trim() : "";
  if (!raw) return { couponCode: "", offerCodes: [] };
  const parts = raw.split(" + ").map((p) => p.trim());
  if (parts.every((p) => (CHECKOUT_OFFERS as readonly string[]).includes(p))) {
    return { couponCode: "", offerCodes: parts as CheckoutOffer[] };
  }
  return { couponCode: raw.toUpperCase(), offerCodes: [] };
}

/* ── Quoting ──────────────────────────────────────────────────────────── */

export interface EditQuote {
  itemsChanged: boolean;
  addressChanged: boolean;
  lineItems: PricedLineItem[] | any[];
  subtotal: number;
  discountAmount: number;
  appliedCouponCode?: string;
  codCharge: number;
  total: number;
  oldTotal: number;
  difference: number;
  action: "pay" | "refund" | "none" | "cod";
  /** Why the discount differs from before, in words for the customer. */
  notes: string[];
  address: EditAddress;
}

export async function quoteEdit(order: any, input: any, session: SessionPayload): Promise<EditQuote> {
  const address = sanitizeAddress(input?.shippingAddress ?? order.shippingAddress, order.shippingAddress, session);
  const items: any[] | undefined = Array.isArray(input?.items) ? input.items : undefined;
  const itemsChanged = !!items && !sameItems(order.items, items);
  const addrChanged = addressChanged(order.shippingAddress, address);
  if (!itemsChanged && !addrChanged) throw new OrderEditError("Nothing has changed yet.");

  const oldTotal = round2(Number(order.total) || 0);
  const isCOD = order.paymentMethod === "cod";
  const notes: string[] = [];

  // An address-only edit keeps every price exactly as ordered. Re-pricing
  // would charge or refund for catalogue changes the customer never asked for.
  if (!itemsChanged) {
    return {
      itemsChanged, addressChanged: addrChanged,
      lineItems: JSON.parse(JSON.stringify(order.items)),
      subtotal: order.subtotal, discountAmount: order.discountAmount ?? 0,
      appliedCouponCode: order.appliedCouponCode, codCharge: order.codCharge ?? 0,
      total: oldTotal, oldTotal, difference: 0, action: isCOD ? "cod" : "none", notes, address,
    };
  }

  if (items!.length === 0) throw new OrderEditError("Your order needs at least one item.");
  let priced;
  try {
    priced = await priceCart(items);
  } catch (e) {
    throw new OrderEditError(e instanceof CartPricingError ? e.message : "We couldn't price these changes. Please try again.");
  }
  const inventory = await validateOrderInventory(priced.lineItems);
  if (!inventory.valid) throw new OrderEditError("One of the items you picked is out of stock.");

  const subtotal = priced.subtotal;
  const itemCount = priced.lineItems.reduce((n, l) => n + l.quantity, 0);
  let { couponCode, offerCodes } = parseDiscounts(order.appliedCouponCode);

  if (offerCodes.includes(COMBO_OFFER) && itemCount < 2) {
    offerCodes = offerCodes.filter((c) => c !== COMBO_OFFER);
    notes.push("The buy-2 offer no longer applies, because the order now has one item.");
  }
  const offers = calculateOffers({ subtotal, itemCount, paymentMethod: order.paymentMethod, offerCodes, couponCode });

  let couponDiscount = 0;
  if (couponCode) {
    const result = await validateAndApplyCoupon({
      couponCode, userId: String(order.shippingAddress.email), subtotal, redeemed: true,
      items: priced.lineItems.map((l) => ({ productId: l.productId, category: "", quantity: l.quantity })),
    });
    if (result.valid) couponDiscount = result.discount;
    else {
      notes.push(`Coupon ${couponCode} no longer applies: ${result.message}.`);
      couponCode = "";
    }
  }

  // Same arithmetic as lib/coupon/checkout.ts quoteCheckout, so an edit
  // prices exactly as the checkout would have.
  const discountAmount = round2(couponDiscount + offers.discount);
  const codCharge = isCOD ? (Number(order.codCharge) || COD_ADVANCE_INR) : 0;
  const total = round2(Math.max(0, subtotal - discountAmount) + codCharge);
  const difference = round2(total - oldTotal);
  return {
    itemsChanged, addressChanged: addrChanged,
    lineItems: priced.lineItems, subtotal, discountAmount,
    appliedCouponCode: couponCode || offerCodes.join(" + ") || undefined,
    codCharge, total, oldTotal, difference,
    action: isCOD ? "cod" : difference > 0 ? "pay" : difference < 0 ? "refund" : "none",
    notes, address,
  };
}

/* ── Stock ────────────────────────────────────────────────────────────── */

async function releaseItems(items: any[]) {
  for (const item of items) {
    const inv = await Inventory.findOne({ productId: item.productId });
    if (!inv) continue;
    await Inventory.updateOne(
      { productId: item.productId },
      {
        kitReserved: Math.max(0, (inv.kitReserved || 0) - item.quantity),
        finalReserved: Math.max(0, (inv.finalReserved || 0) - item.quantity),
        reserved: Math.max(0, (inv.reserved || 0) - item.quantity),
        lastUpdated: new Date(),
      },
    );
  }
}

async function reserveItems(items: any[]) {
  for (const item of items) {
    await Inventory.findOneAndUpdate(
      { productId: item.productId },
      { $inc: { kitReserved: item.quantity, finalReserved: item.quantity, reserved: item.quantity }, lastUpdated: new Date() },
      { upsert: true },
    );
  }
}

/* ── Applying ─────────────────────────────────────────────────────────── */

function describeChanges(order: any, quote: EditQuote): string[] {
  const out: string[] = [];
  if (quote.itemsChanged) {
    const line = (i: any) => `${i.name} × ${i.quantity}`;
    out.push(`Items: ${order.items.map(line).join(", ")} → ${quote.lineItems.map(line).join(", ")}`);
  }
  if (quote.addressChanged) out.push("Shipping address updated");
  return out;
}

/**
 * Writes the edit, guarded so it lands only if nothing moved underneath it:
 * the order is still confirmed, its kit shipment still uncreated, and no
 * other edit has been applied since this one was quoted.
 */
export async function applyEdit(
  order: any,
  quote: EditQuote,
  payment?: { razorpayOrderId: string; razorpayPaymentId: string; amount: number },
) {
  const version = Number(order.editVersion) || 0;
  const changes = describeChanges(order, quote);
  const isCOD = order.paymentMethod === "cod";

  const updated = await Order.findOneAndUpdate(
    {
      _id: order._id,
      status: "confirmed",
      $and: [
        { $or: [{ "shipment1.awb": { $exists: false } }, { "shipment1.awb": "" }, { "shipment1.awb": null }] },
        { $or: [{ editVersion: version }, ...(version === 0 ? [{ editVersion: { $exists: false } }] : [])] },
      ],
    },
    {
      $set: {
        items: quote.lineItems,
        subtotal: quote.subtotal,
        total: quote.total,
        discountAmount: quote.discountAmount,
        appliedCouponCode: quote.appliedCouponCode,
        shippingAddress: quote.address,
        ...(isCOD ? { codRemainingAmount: round2(quote.total - (Number(order.codAdvancePaid) || 0)) } : {}),
      },
      $unset: { pendingEdit: "" },
      $inc: { editVersion: 1 },
      $push: {
        edits: {
          at: new Date(), by: "customer", changes, notes: quote.notes,
          oldTotal: quote.oldTotal, newTotal: quote.total, difference: quote.difference,
          ...(payment ? { payment } : {}),
        },
        trackingEvents: {
          status: "confirmed",
          description: `Order updated by the customer. ${changes.join(". ")}.`,
          location: "Online",
          timestamp: new Date(),
        },
        ...(payment ? { editPayments: { ...payment, refundedAmount: 0, at: new Date() } } : {}),
      },
    },
    { new: true },
  );
  if (!updated) {
    throw new OrderEditError("Your order changed while you were editing it. Please reload and try again.", 409);
  }

  // Swap the stock reservation from the old items to the new. Orders from
  // before stockReserved existed count as reserved (see releaseStockIfCancelled).
  if (quote.itemsChanged && order.stockReserved !== false) {
    try {
      await releaseItems(order.items);
      await reserveItems(updated.items);
    } catch (e) {
      console.error("[order-edit] stock reservation swap failed", { orderId: order.orderId, e });
    }
  }
  return updated;
}

/* ── Refunding a cheaper edit ─────────────────────────────────────────── */

export async function refundDifference(order: any, amountINR: number) {
  let remaining = round2(amountINR);
  const results: Array<{ paymentId: string; refundId?: string; amount: number; ok: boolean; error?: string; at: Date }> = [];

  const editSources = [...(order.editPayments ?? [])].reverse().map((p: any) => ({ id: String(p.razorpayPaymentId), original: false }));
  const sources = [...editSources, ...(order.razorpayPaymentId ? [{ id: String(order.razorpayPaymentId), original: true }] : [])];

  for (const source of sources) {
    if (remaining <= 0) break;
    let available = 0;
    try {
      const p: any = await razorpay.payments.fetch(source.id);
      available = round2((Number(p.amount) - Number(p.amount_refunded ?? 0)) / 100);
    } catch {
      results.push({ paymentId: source.id, amount: 0, ok: false, error: "could not read payment", at: new Date() });
      continue;
    }
    // Leave at least ₹1 on the original payment, so Razorpay never reports it
    // fully refunded and the webhook never mistakes the order for cancelled.
    const cap = source.original ? round2(available - 1) : available;
    const take = round2(Math.min(remaining, cap));
    if (take <= 0) continue;
    try {
      const refund: any = await razorpay.payments.refund(source.id, {
        amount: toPaise(take), speed: "normal",
        notes: { reason: `Order ${order.orderId} edited by customer` },
      } as any);
      results.push({ paymentId: source.id, refundId: refund?.id, amount: take, ok: true, at: new Date() });
      remaining = round2(remaining - take);
    } catch (err: any) {
      results.push({
        paymentId: source.id, amount: take, ok: false, at: new Date(),
        error: err?.error?.description ?? err?.message ?? "refund failed",
      });
    }
  }

  const refunded = round2(results.filter((r) => r.ok).reduce((s, r) => s + r.amount, 0));
  const updates: any = { $push: { editRefunds: { $each: results } } };
  await Order.updateOne({ _id: order._id }, updates);
  for (const r of results.filter((x) => x.ok)) {
    await Order.updateOne(
      { _id: order._id, "editPayments.razorpayPaymentId": r.paymentId },
      { $inc: { "editPayments.$.refundedAmount": r.amount } },
    );
  }

  const short = round2(amountINR - refunded);
  if (short > 0 && ADMIN_EMAIL) {
    await sendEmail({
      to: ADMIN_EMAIL,
      subject: `ACTION NEEDED: refund ₹${short} for edited order ${order.orderId}`,
      html: `<p>Order <b>${order.orderId}</b> was edited by the customer and now costs ₹${amountINR} less.</p>
             <p>₹${refunded} was refunded automatically. <b style="color:#B0301F">₹${short} still needs refunding manually</b> in the Razorpay dashboard.</p>
             <pre>${JSON.stringify(results, null, 2)}</pre>`,
    }).catch(() => {});
  }
  return { refunded, short };
}

/* ── Paying for a dearer edit ─────────────────────────────────────────── */

export async function startEditPayment(order: any, quote: EditQuote) {
  const rpOrder: any = await razorpay.orders.create({
    amount: toPaise(quote.difference),
    currency: "INR",
    receipt: `edit_${order.orderId}_${(Number(order.editVersion) || 0) + 1}`.slice(0, 40),
    notes: { purpose: "order_edit", orderId: order.orderId },
  });
  await Order.updateOne(
    { _id: order._id },
    { $set: { pendingEdit: { razorpayOrderId: rpOrder.id, quote, editVersion: Number(order.editVersion) || 0, at: new Date() } } },
  );
  return { id: rpOrder.id as string, amount: rpOrder.amount as number, currency: rpOrder.currency as string, keyId: razorpayKeyId() };
}

/**
 * Applies a paid edit. Idempotent: a payment that already went into an edit
 * is reported as done. A payment that cannot be applied — the edit was
 * superseded, or the kit shipped while the customer was paying — is refunded
 * in full rather than kept.
 */
export async function confirmEditPayment(
  order: any,
  body: { razorpayOrderId?: unknown; razorpayPaymentId?: unknown; razorpaySignature?: unknown },
) {
  const paymentId = String(body.razorpayPaymentId ?? "");
  if ((order.editPayments ?? []).some((p: any) => p.razorpayPaymentId === paymentId)) {
    return { order, alreadyApplied: true };
  }
  const pending = order.pendingEdit;
  if (!pending || pending.razorpayOrderId !== body.razorpayOrderId) {
    throw new OrderEditError("This payment doesn't match a change waiting on this order. Please contact support.", 409);
  }
  const quote: EditQuote = pending.quote;
  const check = await confirmCapturedPayment({
    orderId: body.razorpayOrderId, paymentId: body.razorpayPaymentId,
    signature: body.razorpaySignature, amountINR: quote.difference,
  });
  if (!check.ok) throw new OrderEditError(check.error, check.status);

  const payment = { razorpayOrderId: String(body.razorpayOrderId), razorpayPaymentId: paymentId, amount: quote.difference };
  const stillOk = editState(order).editable && (Number(order.editVersion) || 0) === pending.editVersion;
  try {
    if (!stillOk) throw new OrderEditError("Your order changed while you were paying.", 409);
    const updated = await applyEdit(order, quote, payment);
    return { order: updated, alreadyApplied: false };
  } catch (e) {
    // Paid, but the change can't go in — give the money straight back.
    try {
      await razorpay.payments.refund(paymentId, {
        amount: toPaise(quote.difference), speed: "normal",
        notes: { reason: `Order edit for ${order.orderId} could not be applied` },
      } as any);
    } catch {
      if (ADMIN_EMAIL) {
        await sendEmail({
          to: ADMIN_EMAIL,
          subject: `ACTION NEEDED: refund ₹${quote.difference} — edit payment for ${order.orderId} not applied`,
          html: `<p>Payment <b>${paymentId}</b> for an edit to order ${order.orderId} was captured but the edit could not be applied, and the automatic refund failed. Refund it manually.</p>`,
        }).catch(() => {});
      }
    }
    throw new OrderEditError(
      `${e instanceof Error ? e.message : "This change could not be applied."} Your payment of ₹${quote.difference} is being refunded.`,
      409,
    );
  }
}

/* ── Telling people ───────────────────────────────────────────────────── */

export async function notifyEdit(order: any, quote: EditQuote, money: { paid?: number; refunded?: number; refundShort?: number }) {
  const html = orderUpdatedEmail(order, quote, money);
  const to = order.shippingAddress?.email;
  await Promise.all([
    to ? sendEmail({ to, subject: `Your order ${order.orderId} has been updated`, html }).catch(() => {}) : null,
    ADMIN_EMAIL ? sendEmail({ to: ADMIN_EMAIL, subject: `Order ${order.orderId} edited by customer`, html }).catch(() => {}) : null,
  ]);
}
