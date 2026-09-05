# PROJECT_MAP.md

Concise orientation map for this repo. Not exhaustive — see `AGENT_HANDOFF.md` for narrative context and current task state. When in doubt, `grep`/read the actual file rather than trusting a stale map.

**Repo root**: `C:\Users\dell\Downloads\make my memory (3)\make my memory`

---

## ⚠️ First thing to know

There are **two copies of this project** on disk:
- **This one** (repo root, `app/`, `components/`, `lib/` directly under root) — **this is the live/deployed one. Work here.**
- `make-my-memory/` — a nested subfolder containing a second, full copy of the project. Per `README.md` this is meant to be a manual backup mirror, but it has **diverged significantly** (different `Order` status enum, older Razorpay/PayPal/COD checkout that predates the current live flow). It was used this session as a **read-only reference** to port working Razorpay code from. **Do not edit it** without explicit instruction. When any instruction below refers to a path like `app/api/orders/route.ts`, it means the top-level one, never the nested copy, unless stated otherwise.

---

## Important directories

| Path | What's in it |
|---|---|
| `app/` | Next.js App Router pages + API routes. Customer pages at the top level (`app/shop`, `app/checkout`, `app/account`, `app/track`, `app/gallery`, `app/faq`, `app/privacy-policy`, `app/terms-of-service`, etc.), admin pages under `app/admin/**`, a separate `app/(admin-auth)/admin/login` route group for the admin login page, all API routes under `app/api/**/route.ts`. |
| `components/` | Client/server React components, organised by feature: `components/checkout/`, `components/admin/`, `components/home/` (homepage sections), `components/layout/` (Navbar, Footer, ClientLayout), `components/shop/`, `components/faq/`, `components/settings/`, `components/reviews/`, etc. |
| `lib/` | Shared server + client logic. See table below for the important subfolders/files. |
| `public/` | Static assets — images (`public/images/`, includes the navbar logo `logo-icon.png`, hero images `gallery.jpeg`/`gallery-vertical.png`), fonts, manifest. |
| `make-my-memory/` | **Diverged backup copy — read-only reference, do not edit.** See warning above. |
| `scratch/` | One-off scripts, e.g. `test_delhivery.js` (manual Delhivery credential sanity check, run via `node scratch/test_delhivery.js`). |
| `scripts/` | Maintenance scripts, e.g. `seed-categories.js`. |

## Important entry points

- `app/layout.tsx` — root layout, loads fonts (Cormorant Garamond, DM Sans, local IBM Plex Serif Bold), wraps the app in `CartProvider` / `WishlistProvider` / `ToastProvider` / `ClientLayout` / `PageTransition`.
- `app/page.tsx` — homepage, composes all the `components/home/*Section.tsx` components in order (`HeroSection`, `AnimatedStats`, `HomeGallerySection`, `IntroSection`, `ProductGridSection`, `ValuesSection`, `SocialProofSection`, `FinalCTA` — note `ReviewsSection` is intentionally **not** rendered here anymore, hidden per an earlier request this session).
- `components/layout/Navbar.tsx` — the fixed header: offer-strip marquee + logo + nav links + account/wishlist/cart icons + mobile drawer. Uses `next/image` for the logo (`public/images/logo-icon.png`) with `mix-blend-multiply`.
- `components/layout/Footer.tsx` — footer link columns (`Shop`, `Company`, `Support`, `Legal`).

## Main components (checkout — current focus area)

- `components/checkout/CheckoutClient.tsx` — the whole checkout form + payment-method picker (Razorpay/COD) + order summary. See `CURRENT_TASK.md`.
- `components/checkout/SuccessClient.tsx` — post-order confirmation page content.
- `components/checkout/CouponInput.tsx` — coupon code entry, re-wired into checkout this session (existed before, was unused).
- `app/checkout/page.tsx` / `app/checkout/success/page.tsx` — thin page wrappers around the above two client components.

## APIs / routes (non-exhaustive — grep `app/api` for the full list)

| Route | Purpose |
|---|---|
| `POST /api/orders` | Create a confirmed **Razorpay (online)** order. Requires IDs plus `razorpaySignature`; independently checks HMAC, capture status, INR currency and payment amount before DB access. |
| `POST /api/payment/create-order` | Server-side Razorpay order creation (used by both Razorpay and COD-advance flows). |
| `POST /api/payment/verify` | Verifies the Razorpay payment signature (HMAC). |
| `POST /api/payment/cod` | Create a confirmed **COD** order. Independently checks signature and captured advance of min(₹149, submitted total) before DB access. |
| `POST /api/webhooks/razorpay` | Razorpay webhook receiver (signature-verified, handles capture/failure/refund events). |
| `GET/POST /api/orders/track` | Order tracking lookup (public, by order ID + contact). |
| `GET/PATCH /api/orders/[id]` | Single order fetch/update (used by e.g. asset-submission flow). |
| `POST /api/orders/[id]/submit-assets` | Customer uploads their personalisation photos/files for an order (part of the Delhivery two-stage kit→final pipeline — see `README.md`). |
| `app/api/admin/orders/**` | Admin order management: list/detail (`route.ts`, `[id]/route.ts`), status updates (`update-status`, `validate-status`), the legacy `confirm-payment` (was for manually confirming WhatsApp payments — likely only relevant to old orders now), `collect-cod-payment` (records COD cash collected on delivery — **already compatible with the new ₹149-advance flow, unchanged this session**), and the Delhivery shipment-manifest routes (`[id]/shipment1/create`, `[id]/shipment2/create`, `[id]/shipment/label`, `[id]/shipment/pickup`). |
| `app/api/admin/products/**`, `/categories`, `/product-options`, `/reviews`, `/users`, `/settings/**` | Standard admin CRUD for the shop catalogue and site settings. |
| `app/api/auth/**` | Customer auth: login, signup, OTP request/verify/resend, password reset/change, logout, `me` (session check). |
| `app/api/coupons/**` | Coupon validation/lookup for checkout. |
| `app/api/delhivery/webhook` | Delhivery courier status webhook (untouched this session). |
| `app/api/user/**` | Customer account: profile, addresses, cart sync, wishlist, orders, account deletion. |

## Database-related files

- `lib/db/connect.ts` — Mongoose connection helper (`connectDB()`), used at the top of nearly every API route. Throws a clear error if `MONGODB_URI` is missing (this is what fires locally, since local dev has no Mongo URI configured).
- `lib/db/models/*.ts` — Mongoose schemas. Most relevant right now: **`Order.ts`** (see `AGENT_HANDOFF.md` for the fields relevant to the current payment work — `paymentMethod`, `razorpayOrderId`, `razorpayPaymentId`, `isCOD`, `codAdvancePaid`, `codRemainingAmount`, the `deliveries` two-stage sub-schema, `OrderStatus` enum). Other models exist for Products, Categories, Coupons, Users, Reviews, ProductOptions, Policy (used by the privacy-policy/terms-of-service pages' optional CMS-override content), etc. — check `lib/db/models/` directly for the full list.

## Payments (Razorpay — new this session)

- `lib/razorpay/server.ts`, `verify.ts`, `validation.ts` — server-side Razorpay SDK client, HMAC verification, validation constants/helpers (`COD_ADVANCE_INR`, `COD_MAX_ORDER_INR`, etc.).
- `lib/razorpay/confirm.ts` — shared signature/captured-payment check enforced by both order-writing routes. `scripts/test-payment-confirmation.cjs` covers the helpers and routes with isolated service doubles.
- `lib/utils/razorpay.ts` — client-side checkout.js loader + modal wrapper.
- See "APIs / routes" table above for the payment endpoints.

## Authentication

- **Customer auth**: cookie/session-based, routes under `app/api/auth/**`. Check `lib/db/models/User.ts` and the auth API routes for the exact mechanism (JWT vs. session cookie — verify before assuming).
- **Admin auth**: a simple `admin_session` cookie whose value is checked against `process.env.ADMIN_PASSWORD` directly (see `isAdmin(req)` helper functions repeated across `app/api/admin/**/route.ts` files, e.g. in `app/api/admin/orders/collect-cod-payment/route.ts`). Admin login page is at `app/(admin-auth)/admin/login/page.tsx`.

## Configuration

- `next.config.js` — Next.js config (check before assuming image domains, redirects, etc. — no redirects were found configured as of this session, which is why the footer's old `/privacy`/`/terms` links were dead until fixed to point at the real `/privacy-policy`/`/terms-of-service` routes).
- `tailwind.config.js` — brand color tokens (`gold`, `ink`, `cream`, `sage`, `canvas`, `hero`) plus the shadcn/ui color-token mappings added this session's earlier shadcn setup (`background`, `foreground`, `primary`, etc., all pointing at CSS variables defined in `app/globals.css`). **Do not add a `borderRadius` override here** — see `AGENT_HANDOFF.md` → Constraints.
- `app/globals.css` — brand CSS custom properties (`:root` block), the offer-strip marquee `@keyframes`, and various utility classes (`.btn-primary`, `.input`, `.card`, `.section-heading`, etc.) used throughout the site instead of raw Tailwind in many places.
- `components.json` — shadcn/ui config.
- `vercel.json` — Vercel-specific config (check before assuming build/deploy behavior).
- `.env.example` — documents expected environment variable **names**, including all four Razorpay variables with placeholders (updated by Codex).
- `.env.local` — actual local dev secrets (gitignored, not present in this handoff's content, only variable *names* were checked: `RESEND_API_KEY`, `EMAIL_FROM`, `ADMIN_EMAIL`, `ADMIN_PASSWORD` — no Mongo, no Razorpay locally).

## Deployment-related files

- Deployed via Vercel, project `makemymemory` (see `AGENT_HANDOFF.md` header for exact IDs). Git remote `devanshu` → `main` branch triggers production deploys automatically on push.
- No CI config files (e.g. no `.github/workflows`) were found — deploys are purely git-push-triggered via Vercel's GitHub integration.

## Reusable utilities

- `lib/context/CartContext.tsx` — cart state (persisted to `localStorage` under key `"mmm_cart"`), exposes `useCart()` with `items`, `subtotal`, `shipping`, `total`, `clearCart()`, etc.
- `lib/context/WishlistContext.tsx`, `lib/context/ToastContext.tsx` — similar pattern for wishlist and toast notifications.
- `lib/email/resend.ts` + `lib/email/templates.ts` — **the current, branded email system** (used by the new Razorpay/COD checkout routes this session). Exports `sendEmail()`, `ADMIN_EMAIL`, and convenience wrappers like `sendOrderConfirmationEmail()`, `sendOrderPlacedEmail()`, plus template functions like `orderConfirmationEmail()`, `adminNewOrderEmail()`.
- `lib/notifications/notificationService.ts` — an **older, separate** notification code path, still used by at least `app/api/admin/orders/collect-cod-payment/route.ts`. Two systems coexist — see `AGENT_HANDOFF.md` → Known Bugs #4. Don't assume one is dead without checking its actual call sites.
- `lib/email.ts` + `lib/email-templates.ts` (top-level, **not** inside `lib/email/`) — appear to be **orphaned/unused legacy files** (a grep for imports found none this session). Not confirmed dead with certainty; verify before deleting.
- `lib/coupon/couponUtils.ts` — `applyCouponToOrder()`, used by both the Razorpay and COD order-creation routes.
- `lib/inventory/inventoryUtils.ts` — `validateOrderInventory()`, `updateInventoryOnOrderConfirm()`, used by the same.
- `lib/utils/cn.ts` (+ `lib/utils.ts` re-exporting it) — the shadcn-style `cn()` classname helper.
- `lib/utils/whatsapp.ts` — `buildOrderWhatsAppUrl()`, now **unused dead code** since WhatsApp was removed from checkout this session; left in place intentionally, not deleted.
- `lib/seo.ts` — `buildMeta()`, used by most pages for Next.js `metadata` export.
