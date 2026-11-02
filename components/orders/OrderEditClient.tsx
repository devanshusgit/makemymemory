"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Minus, Plus, Trash2, CheckCircle2 } from "lucide-react";
import {
  type VariantOption,
  DEFAULT_FRAME_TYPES, DEFAULT_FRAME_COLORS, DEFAULT_FINISHES,
  DEFAULT_PAPER_COLORS, DEFAULT_FONTS, DEFAULT_LAYOUTS,
} from "@/lib/data/defaultProductOptions";
import { BABY_AGE_GROUP, BABY_AGE_LABEL, BABY_AGE_OPTIONS } from "@/lib/data/babyAge";
import { loadRazorpayScript, openRazorpayCheckout } from "@/lib/utils/razorpay";

/** The option groups a line can have, in product-page order. */
const GROUPS = [
  { key: "frameType",  group: "frame-type",  label: "Frame Type",              enabledKey: "frameType",  fallback: DEFAULT_FRAME_TYPES },
  { key: "frameColor", group: "frame-color", label: "Frame Colour",            enabledKey: "frameColor", fallback: DEFAULT_FRAME_COLORS },
  { key: "finish",     group: "foil-finish", label: "Metallic Imprint Colour", enabledKey: "foilFinish", fallback: DEFAULT_FINISHES },
  { key: "paperColor", group: "paper-color", label: "Paper Colour",            enabledKey: "paperColor", fallback: DEFAULT_PAPER_COLORS },
  { key: "font",       group: "font",        label: "Font Type",               enabledKey: "font",       fallback: DEFAULT_FONTS },
  { key: "layout",     group: "layout",      label: "Detailed Layout",         enabledKey: "layout",     fallback: DEFAULT_LAYOUTS },
] as const;

interface EditProduct {
  id: string; name: string; price: number; inStock: boolean;
  enabledOptions: Record<string, string[] | undefined>;
}
interface Line {
  key: string;
  productId: string;
  quantity: number;
  /** groupKey → option id */
  picks: Record<string, string>;
  age: string;
}
interface Address {
  fullName: string; email: string; phone: string; address: string;
  landmark: string; city: string; state: string; pincode: string;
}
interface Quote {
  lineItems: Array<{ name: string; quantity: number; price: number; selections?: Array<{ groupLabel: string; label: string }> }>;
  subtotal: number; discountAmount: number; total: number; oldTotal: number; difference: number;
  action: "pay" | "refund" | "none" | "cod"; notes: string[];
}

const rupees = (n: number) => `₹${Number(n).toLocaleString("en-IN")}`;
const inputClass =
  "w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/40";

export default function OrderEditClient({ orderId }: { orderId: string }) {
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [closedReason, setClosedReason] = useState("");
  const [deadline, setDeadline] = useState<Date | null>(null);
  const [order, setOrder] = useState<any>(null);
  const [products, setProducts] = useState<EditProduct[]>([]);
  const [optionsByGroup, setOptionsByGroup] = useState<Record<string, VariantOption[]>>({});
  const [lines, setLines] = useState<Line[]>([]);
  const [address, setAddress] = useState<Address | null>(null);

  const [quote, setQuote] = useState<Quote | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState<null | { message: string }>(null);

  const allowed = (product: EditProduct | undefined, g: (typeof GROUPS)[number]): VariantOption[] => {
    const configured = optionsByGroup[g.group] ?? [];
    let list: VariantOption[] = configured.length ? configured : [...g.fallback];
    const enabled = product?.enabledOptions?.[g.enabledKey];
    // Same rule as the product page: no list = all, an empty list = group not offered.
    if (Array.isArray(enabled)) list = list.filter((o) => enabled.includes(o.id));
    return list;
  };

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`/api/user/orders/${encodeURIComponent(orderId)}/edit`, { cache: "no-store" });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Could not load your order.");
        setOrder(data.order);
        setProducts(data.products);
        setOptionsByGroup(data.optionsByGroup ?? {});
        setAddress({ landmark: "", ...data.order.shippingAddress });
        if (data.editable) setDeadline(new Date(data.deadline));
        else setClosedReason(data.reason);
        setLines(
          (data.order.items as any[]).map((it, i) => {
            const picks: Record<string, string> = {};
            let age = "";
            for (const s of it.selections ?? []) {
              if (s.group === BABY_AGE_GROUP) age = s.id;
              else if (s.group) picks[s.group] = s.id;
            }
            return { key: `l${i}`, productId: it.productId, quantity: it.quantity, picks, age };
          }),
        );
      } catch (e: any) {
        setLoadError(e.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [orderId]);

  // Any change makes the previous quote stale.
  const touch = () => { setQuote(null); setError(""); };

  const productById = useMemo(() => new Map(products.map((p) => [p.id, p])), [products]);

  const updateLine = (key: string, patch: Partial<Line>) => {
    touch();
    setLines((ls) => ls.map((l) => (l.key === key ? { ...l, ...patch } : l)));
  };

  const changeProduct = (key: string, productId: string) => {
    const product = productById.get(productId);
    setLines((ls) =>
      ls.map((l) => {
        if (l.key !== key) return l;
        const picks: Record<string, string> = {};
        for (const g of GROUPS) {
          const list = allowed(product, g);
          if (!list.length) continue;
          picks[g.key] = list.some((o) => o.id === l.picks[g.key]) ? l.picks[g.key] : list[0].id;
        }
        return { ...l, productId, picks };
      }),
    );
    touch();
  };

  const payload = () => ({
    shippingAddress: address,
    items: lines.map((l) => {
      const product = productById.get(l.productId);
      // Send what the dropdown shows: a group with no saved pick displays its
      // first option, and the server requires every offered group.
      const selections: Array<{ group: string; id: string }> = [];
      for (const g of GROUPS) {
        const list = allowed(product, g);
        if (!list.length) continue;
        const id = list.some((o) => o.id === l.picks[g.key]) ? l.picks[g.key] : list[0].id;
        selections.push({ group: g.key, id });
      }
      if (l.age) selections.push({ group: BABY_AGE_GROUP, id: l.age });
      return { product: { id: l.productId }, quantity: l.quantity, selections };
    }),
  });

  const review = async () => {
    if (lines.some((l) => !l.age)) {
      setError(`Please choose the ${BABY_AGE_LABEL.toLowerCase()} for every frame.`);
      return;
    }
    setBusy(true);
    setError("");
    try {
      const res = await fetch(`/api/user/orders/${encodeURIComponent(orderId)}/edit/quote`, {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload()),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Could not price these changes.");
      setQuote(data.quote);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };

  const confirm = async () => {
    setBusy(true);
    setError("");
    try {
      const res = await fetch(`/api/user/orders/${encodeURIComponent(orderId)}/edit/start`, {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload()),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Could not update your order.");

      if (data.needsPayment) {
        if (!(await loadRazorpayScript())) throw new Error("Could not load the payment window. Check your connection and try again.");
        const paid = await openRazorpayCheckout({
          key: data.razorpay.keyId,
          amount: data.razorpay.amount,
          currency: data.razorpay.currency,
          name: "Make My Memory",
          description: `Change to order ${orderId}`,
          order_id: data.razorpay.id,
          prefill: data.prefill,
          theme: { color: "#C9A84C" },
        });
        const c = await fetch(`/api/user/orders/${encodeURIComponent(orderId)}/edit/confirm`, {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            razorpayOrderId: paid.razorpay_order_id,
            razorpayPaymentId: paid.razorpay_payment_id,
            razorpaySignature: paid.razorpay_signature,
          }),
        });
        const cd = await c.json();
        if (!c.ok) throw new Error(cd.error ?? "We couldn't confirm the change. Please contact support.");
        setDone({ message: `Paid ${rupees(data.quote.difference)} and updated your order.` });
      } else if (data.quote.action === "refund") {
        setDone({
          message: data.refundShort > 0
            ? `Order updated. ${rupees(-data.quote.difference)} will be refunded — our team is processing it.`
            : `Order updated. ${rupees(-data.quote.difference)} is being refunded to your original payment method within 7–12 working days.`,
        });
      } else if (data.quote.action === "cod" && data.quote.difference !== 0) {
        setDone({ message: `Order updated. The cash to pay on delivery is now ${rupees(data.quote.total - (order?.codAdvancePaid ?? 0))}.` });
      } else {
        setDone({ message: "Order updated." });
      }
    } catch (e: any) {
      if (e?.message !== "Payment cancelled") setError(e?.message ?? "Something went wrong.");
    } finally {
      setBusy(false);
    }
  };

  const back = (
    <Link href="/orders" className="mb-6 inline-flex items-center gap-1.5 text-sm text-stone-500 hover:text-ink">
      <ArrowLeft className="w-4 h-4" /> My orders
    </Link>
  );

  if (loading) return <div className="h-64 rounded-3xl bg-white animate-pulse border border-stone-100" />;
  if (loadError) return <div>{back}<p className="text-sm text-red-600">{loadError}</p></div>;

  if (done) {
    return (
      <div>
        {back}
        <div className="rounded-3xl bg-white border border-stone-100 p-8 text-center">
          <CheckCircle2 className="w-10 h-10 mx-auto text-green-600 mb-3" />
          <h1 className="font-serif font-bold text-2xl text-ink mb-2">Done</h1>
          <p className="text-sm text-stone-600">{done.message}</p>
          <p className="mt-2 text-xs text-stone-400">We&apos;ve emailed you the updated order.</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {back}
      <h1 className="section-heading mb-2">Change your order</h1>
      <p className="text-sm text-stone-500 mb-8">
        Order <span className="font-mono font-semibold text-ink">{order?.orderId}</span>
        {deadline && <> · you can change it until <strong>{deadline.toLocaleString("en-IN", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" })}</strong></>}
      </p>

      {closedReason ? (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-900">
          {closedReason} For help, write to <a className="underline" href="mailto:support@makemymemory.com">support@makemymemory.com</a>.
        </div>
      ) : (
        <div className="space-y-6">
          {lines.map((l, idx) => {
            const product = productById.get(l.productId);
            return (
              <div key={l.key} className="rounded-3xl bg-white border border-stone-100 p-5 sm:p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold uppercase tracking-wide text-stone-400">Frame {idx + 1}</p>
                  {lines.length > 1 && (
                    <button type="button" onClick={() => { touch(); setLines((ls) => ls.filter((x) => x.key !== l.key)); }}
                      className="inline-flex items-center gap-1 text-xs text-red-600 hover:underline">
                      <Trash2 className="w-3.5 h-3.5" /> Remove
                    </button>
                  )}
                </div>

                <div>
                  <label className="input-label mb-2" htmlFor={`${l.key}-product`}>Product</label>
                  <select id={`${l.key}-product`} className={inputClass} value={l.productId}
                    onChange={(e) => changeProduct(l.key, e.target.value)}>
                    {!product && <option value={l.productId}>{order.items[idx]?.name ?? "Current product"}</option>}
                    {products.map((p) => (
                      <option key={p.id} value={p.id} disabled={!p.inStock && p.id !== l.productId}>
                        {p.name} — {rupees(p.price)}{!p.inStock ? " (out of stock)" : ""}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  {GROUPS.map((g) => {
                    const list = allowed(product, g);
                    if (!list.length) return null;
                    return (
                      <div key={g.key}>
                        <label className="input-label mb-2" htmlFor={`${l.key}-${g.key}`}>{g.label}</label>
                        <select id={`${l.key}-${g.key}`} className={inputClass}
                          value={list.some((o) => o.id === l.picks[g.key]) ? l.picks[g.key] : list[0].id}
                          onChange={(e) => updateLine(l.key, { picks: { ...l.picks, [g.key]: e.target.value } })}>
                          {list.map((o) => (
                            <option key={o.id} value={o.id}>{o.label}{(o.price ?? 0) > 0 ? ` (+${rupees(o.price)})` : ""}</option>
                          ))}
                        </select>
                      </div>
                    );
                  })}
                  <div>
                    <label className="input-label mb-2" htmlFor={`${l.key}-age`}>{BABY_AGE_LABEL} <span className="text-red-500">*</span></label>
                    <select id={`${l.key}-age`} className={inputClass} value={l.age}
                      onChange={(e) => updateLine(l.key, { age: e.target.value })}>
                      <option value="" disabled>Select age</option>
                      {BABY_AGE_OPTIONS.map((o) => <option key={o.id} value={o.id}>{o.label}</option>)}
                    </select>
                  </div>
                </div>

                <div>
                  <p className="input-label mb-2">Quantity</p>
                  <div className="flex items-center gap-3">
                    <button type="button" aria-label="Fewer" disabled={l.quantity <= 1}
                      onClick={() => updateLine(l.key, { quantity: Math.max(1, l.quantity - 1) })}
                      className="w-9 h-9 rounded-full border border-stone-200 flex items-center justify-center disabled:opacity-40">
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-8 text-center font-bold">{l.quantity}</span>
                    <button type="button" aria-label="More" disabled={l.quantity >= 20}
                      onClick={() => updateLine(l.key, { quantity: Math.min(20, l.quantity + 1) })}
                      className="w-9 h-9 rounded-full border border-stone-200 flex items-center justify-center disabled:opacity-40">
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}

          {address && (
            <div className="rounded-3xl bg-white border border-stone-100 p-5 sm:p-6 space-y-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-stone-400">Shipping address</p>
              <div className="grid gap-4 sm:grid-cols-2">
                {([
                  ["fullName", "Full name"], ["phone", "Mobile number"], ["address", "Address"],
                  ["landmark", "Landmark (optional)"], ["city", "City"], ["state", "State"], ["pincode", "Pincode"],
                ] as const).map(([k, label]) => (
                  <div key={k} className={k === "address" ? "sm:col-span-2" : ""}>
                    <label className="input-label mb-2" htmlFor={`addr-${k}`}>{label}</label>
                    <input id={`addr-${k}`} className={inputClass} value={address[k] ?? ""}
                      inputMode={k === "phone" || k === "pincode" ? "numeric" : undefined}
                      onChange={(e) => { touch(); setAddress({ ...address, [k]: e.target.value }); }} />
                  </div>
                ))}
                <div className="sm:col-span-2">
                  <p className="text-xs text-stone-400">Email: {address.email} — this is how your account finds the order, so it can&apos;t be changed here.</p>
                </div>
              </div>
            </div>
          )}

          {error && <p className="text-sm text-red-600">{error}</p>}

          {!quote ? (
            <button type="button" onClick={review} disabled={busy}
              className="w-full rounded-full py-4 text-sm font-semibold text-white disabled:opacity-60" style={{ backgroundColor: "#1A1A1A" }}>
              {busy ? "Checking…" : "Review changes"}
            </button>
          ) : (
            <div className="rounded-3xl border-2 border-[#C9A84C] bg-white p-5 sm:p-6 space-y-3">
              <p className="font-semibold text-ink">Your updated order</p>
              <ul className="space-y-1 text-sm text-stone-600">
                {quote.lineItems.map((li, i) => (
                  <li key={i} className="flex justify-between gap-3">
                    <span>{li.name} × {li.quantity}</span><span>{rupees(li.price * li.quantity)}</span>
                  </li>
                ))}
              </ul>
              {quote.discountAmount > 0 && (
                <p className="flex justify-between text-sm text-stone-600"><span>Discount</span><span>−{rupees(quote.discountAmount)}</span></p>
              )}
              <p className="flex justify-between text-sm font-semibold text-ink">
                <span>New total</span><span>{rupees(quote.total)} <span className="font-normal text-stone-400">(was {rupees(quote.oldTotal)})</span></span>
              </p>
              {quote.notes.map((n, i) => <p key={i} className="text-xs text-amber-700">{n}</p>)}
              <p className="text-sm text-stone-600">
                {quote.action === "pay" && <>You&apos;ll pay the difference of <strong>{rupees(quote.difference)}</strong> now.</>}
                {quote.action === "refund" && <><strong>{rupees(-quote.difference)}</strong> will be refunded to your original payment method within 7–12 working days.</>}
                {quote.action === "none" && <>No change to the amount.</>}
                {quote.action === "cod" && <>Cash to pay on delivery: <strong>{rupees(quote.total - (order?.codAdvancePaid ?? 0))}</strong>.</>}
              </p>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setQuote(null)} disabled={busy}
                  className="flex-1 rounded-full border border-stone-200 py-3.5 text-sm font-semibold text-ink">Back</button>
                <button type="button" onClick={confirm} disabled={busy}
                  className="flex-[2] rounded-full py-3.5 text-sm font-semibold text-white disabled:opacity-60" style={{ backgroundColor: "#1A1A1A" }}>
                  {busy ? "Updating…" : quote.action === "pay" ? `Pay ${rupees(quote.difference)} & update` : "Update order"}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
