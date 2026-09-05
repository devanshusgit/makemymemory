# CURRENT_TASK.md

Snapshot of exactly what's in progress at handoff time. See `AGENT_HANDOFF.md` for full background — this file is the short version to orient quickly.

**Last updated**: 2026-09-05, during Codex takeover.

## Codex status correction (takes precedence over the original snapshot below)

- **Current owner request completed locally:** added supplied Shipping Policy text while owner handles Vercel values later. Updated `app/shipping-policy/page.tsx` default content/metadata and added footer link in `components/layout/Footer.tsx`. Local page compiled, returned HTTP 200, and browser confirmed all four sections, updated metadata and footer link with no error overlay. New copy states free India shipping only for prepaid orders, dispatch usually within 7 working days, logistics coverage/delay caveats, Rs.149 COD per article, and no exchange/returns on sale products. Existing Policy DB override is preserved. Changes are uncommitted/undeployed.
- **New validation limitation:** full `tsc --noEmit` now encounters generated `.next` route-validation error for pre-existing exported helper `isValidStatusTransition` in `app/api/admin/orders/validate-status/route.ts`; source is unchanged from HEAD. This generated check was absent before the preceding production build. Source-only typecheck excluding generated `.next` files passes. Do not misreport full tsc as passing for this turn or refactor the unrelated admin route as part of the shipping-copy task.
- **Content/checkout discrepancy:** user-supplied policy says Rs.149 per article; checkout currently charges one Rs.149 advance per order credited toward the balance and computes free shipping for all orders. This request changes policy copy, not checkout pricing. Resolve the business-rule difference only under a separate owner instruction; do not silently alter payment calculations.
- Repository remains on `375212f`; Codex changes are uncommitted. Read CODEX_CHANGELOG.md for every modified file and verification status.
- Original claims that configuration is the only blocker were disproved by source inspection. Both order endpoints trusted payment IDs without enforcing payment verification. Codex added signature and captured-payment checks at both write endpoints, plus client signature forwarding. Verification passed: 30 isolated regression tests, standalone typecheck, production build, local browser display/error checks, and HTTP 400 rejection of missing signatures at both built order endpoints.
- `.env.example` and README payment/setup documentation are updated.
- **Latest Vercel status: owner reports variable setup is done.** After entering values, owner reported Production duplicate-name errors for `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET` and `RAZORPAY_WEBHOOK_SECRET`, then confirmed "yes woh done hogya". Earlier all-four-missing observations are historical. The errors establish that those three names already exist; Codex has not independently rechecked all four saved names, credential correctness or redeployment. Required fourth name is `NEXT_PUBLIC_RAZORPAY_KEY_ID`, matching the server key ID. No secret values were printed or changed by Codex. Last deployment observation remains `dpl_8Rc78EdriPoKYszbaCXsRegdHRFp` READY at the earlier commit; no deployment performed by Codex.
- Remaining release concerns: catalogue prices/surcharges/quantities/coupons and totals still come from the client; calculate authoritative pricing before charging. Existing order idempotency is not atomic; paid-but-unsaved orders lack durable recovery. Webhook handler failures return 200 and processed partial refunds cancel the entire order. These require follow-up, not an unsupported "code complete" claim.
- Local configuration evidence: `.env.local` has none of the four Razorpay variables. The gitignored `.env.production` contains placeholder values for all four (names/presence/placeholder classification only inspected; values not printed or changed). The built client therefore reaches create-order; with server credentials disabled locally it shows the API error "Failed to create payment order. Please try again." This does not establish Vercel configuration.
- Owner steering remains: **do not operate Razorpay for now**; owner supplies keys and handles Razorpay. Codex previously restored the four-name draft after it disappeared; the owner has now completed their setup. Do not recreate duplicate variables, delete saved variables or overwrite credentials. No dummy values were inserted.
- Next: on deployment follow-up, verify saved variable names/Production scope without exposing values and redeploy so the public key enters the new browser build. Redeployment is not yet confirmed. Owner must still confirm canonical webhook hostname, matching webhook secret and capture settings; those are not established by the variable-setup confirmation. Address the documented payment concerns and verify both payment modes before declaring readiness. Do not resume Razorpay automation without a new owner instruction. Local test server is stopped; no commit, push or deployment was made.

---

The remainder records Claude's original handoff and is retained for context. Its "code finished / configuration only" assessment is superseded above.

---

## Exact feature/task currently being worked on

**Checkout payment methods**: migrate from WhatsApp-based manual payment to Razorpay (online) + Cash on Delivery with a ₹149 upfront advance. The *code* for this is done. The *external configuration* (Razorpay account credentials in Vercel) is the only remaining piece, and it's not something a coding agent can do — it requires the site owner logging into the Razorpay Dashboard.

## Expected behavior

- Customer adds items to cart, goes to `/checkout`, fills delivery details.
- Customer picks either:
  - **"Pay Online"** (Razorpay) — pays the full order total minus an automatic 5% "prepaid" discount, via a Razorpay checkout modal (UPI/cards/net banking/wallets).
  - **"Cash on Delivery"** — pays a ₹149 advance via the same Razorpay modal (fixed amount), and the remaining balance in cash when the order is delivered. Only available for orders totaling ≤ ₹5,000.
- On successful payment, an `Order` document is created in MongoDB with status `"confirmed"`, a confirmation email is sent to the customer, an admin notification email is sent, and the customer lands on `/checkout/success` with method-appropriate copy.
- Order then flows into the existing (untouched) two-stage Delhivery kit→final-product shipping pipeline, same as before.

## Current behavior

Identical to expected, **except**: clicking either payment button opens (or attempts to open) the Razorpay checkout modal, which immediately fails with **"Payment is not configured. Please contact support."** — because the required Razorpay environment variables are not set in Vercel. This was verified as the *correct, expected* failure point given the current configuration state — it is not a bug in the code, it is the code correctly detecting missing configuration. See `AGENT_HANDOFF.md` → "Known Bugs / Problems" #1.

Everything up to that point — page load, form validation, payment-method switching, discount/advance recalculation display, coupon application — works correctly and was verified live on `https://www.makemymemory.in/checkout`.

## Acceptance criteria

This task is "done" when:
1. `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `NEXT_PUBLIC_RAZORPAY_KEY_ID`, `RAZORPAY_WEBHOOK_SECRET` are set in Vercel (site owner action, not a coding task).
2. A webhook is registered in Razorpay Dashboard pointing at `https://makemymemory.in/api/webhooks/razorpay` for events `payment.captured`, `payment.failed`, `order.paid`, `refund.created`, `refund.processed` (site owner action).
3. A real (test-mode is fine) end-to-end order has been placed successfully via **both** "Pay Online" and "Cash on Delivery", confirmed to appear correctly in `/admin/orders`, and confirmed to trigger the expected confirmation email.
4. `README.md` and `.env.example` are updated to reflect Razorpay/COD instead of WhatsApp (nice-to-have, not blocking).

None of criteria 1–3 can be completed by a coding agent alone — they require the site owner's Razorpay account access. **If Codex is asked to "finish" this task, the honest answer is: the code is finished; ask the user whether they've added the Razorpay credentials yet, and if not, that is the blocker, not more code.**

## Relevant files

- `components/checkout/CheckoutClient.tsx` — the checkout form + payment-method UI (main file, ~900 lines)
- `components/checkout/SuccessClient.tsx` — post-checkout confirmation page
- `app/api/orders/route.ts` — creates the `Order` document for the Razorpay (online) path
- `app/api/payment/cod/route.ts` — creates the `Order` document for the COD path (after ₹149 advance verified)
- `app/api/payment/create-order/route.ts` — server-side Razorpay order creation (used by both paths)
- `app/api/payment/verify/route.ts` — HMAC signature verification (used by both paths)
- `app/api/webhooks/razorpay/route.ts` — Razorpay webhook handler
- `lib/razorpay/server.ts`, `lib/razorpay/verify.ts`, `lib/razorpay/validation.ts` — shared payment logic
- `lib/utils/razorpay.ts` — client-side Razorpay checkout.js loader/wrapper
- `lib/db/models/Order.ts` — the `Order` Mongoose schema (already had all needed fields before this session)
- `app/api/admin/orders/collect-cod-payment/route.ts` — pre-existing admin route for recording COD cash collected on delivery (already compatible, unchanged)

## Next 3–10 actions

1. **Ask the user** whether they've added the 4 Razorpay env vars to Vercel yet. This is almost certainly the first thing to check/do.
2. If not, walk them through it (Razorpay Dashboard → Settings → API Keys for the first 3, → Settings → Webhooks for the 4th, after registering the webhook URL above).
3. Once added, trigger a Vercel redeploy (an empty `git commit --allow-empty` + push is the pattern this project has used before for env-var-only changes — see commits `ad8a9a3`, `44b7f41` in `git log` for the exact style/wording used previously).
4. Do a real test order through both payment paths on the live site (or in Razorpay test mode if the keys added are test keys).
5. Verify the order shows correctly in `/admin/orders` and that emails arrive.
6. Test `/api/admin/orders/collect-cod-payment` against a real COD test order to confirm the remaining-balance reconciliation works end-to-end.
7. Update `.env.example` with the 4 new variable names (values redacted/placeholder, matching the file's existing style).
8. Update `README.md`'s payments description and env var table.
9. Only after all of the above: consider this task fully closed, and update this file to describe whatever the *next* task is (or delete/blank this file if there's genuinely nothing in progress).
