// Run: node scripts/test-payment-confirmation.cjs
// Execute the real TS helpers/routes with isolated SDK, DB and email doubles.
// No .env files, network requests, real orders or emails are used.
const test = require("node:test");
const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const ts = require("typescript");
const root = path.resolve(__dirname, "..");
const secret = "isolated-regression-test-secret";
const ids = { orderId: "order_test", paymentId: "pay_test" };
const signature = crypto.createHmac("sha256", secret)
  .update(`${ids.orderId}|${ids.paymentId}`).digest("hex");

function fixture(overrides = {}) {
  const calls = { fetch: 0, db: 0, create: 0, inventory: 0, email: 0, gateway: 0 };
  const saved = [];
  const payment = {
    id: ids.paymentId, order_id: ids.orderId, amount: 237400,
    currency: "INR", status: "captured", amount_refunded: 0,
    ...overrides.payment,
  };
  const cache = new Map();
  const mocks = {
    "next/server": { NextResponse: { json: (body, init) => Response.json(body, init) } },
    "@/lib/db/connect": { connectDB: async () => { calls.db++; } },
    "@/lib/db/models/Order": { Order: {
      findOne: () => ({ lean: async () => overrides.existing ?? null }),
      create: async (data) => {
        calls.create++;
        const order = { ...data, orderId: "MMM-TEST" };
        saved.push(order);
        return { ...order, toObject: () => order };
      },
    } },
    "@/lib/coupon/couponUtils": {
      applyCouponToOrder: async () => {}, ensureDefaultCoupons: async () => {},
      validateAndApplyCoupon: async ({ subtotal }) => overrides.invalidCoupon
        ? { valid: false, discount: 0, message: "Coupon usage limit reached" }
        : { valid: true, discount: subtotal * 0.2, couponCode: "OTHER20" },
    },
    "@/lib/inventory/inventoryUtils": {
      validateOrderInventory: async () => ({ valid: true }),
      updateInventoryOnOrderConfirm: async () => { calls.inventory++; },
    },
    "@/lib/email/resend": {
      ADMIN_EMAIL: "", sendEmail: async () => ({ success: true }),
      sendOrderConfirmationEmail: async () => { calls.email++; return { success: true }; },
    },
  };
  const sdk = { razorpay: { orders: { create: async (data) => { calls.gateway++; return { ...data, id: ids.orderId }; } }, payments: { fetch: async () => {
    calls.fetch++;
    if (overrides.fetchError) throw new Error("simulated upstream failure");
    return payment;
  } } } };
  function load(file) {
    const absolute = path.resolve(root, file);
    if (cache.has(absolute)) return cache.get(absolute).exports;
    const module = { exports: {} };
    cache.set(absolute, module);
    const compiled = ts.transpileModule(fs.readFileSync(absolute, "utf8"), {
      compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true },
    }).outputText;
    const localRequire = (name) => {
      if (name in mocks) return mocks[name];
      if (name === "./server" || name === "@/lib/razorpay/server") return sdk;
      if (name.startsWith("@/")) return load(name.slice(2) + ".ts");
      if (name.startsWith(".")) return load(path.resolve(path.dirname(absolute), name + ".ts"));
      return require(name);
    };
    vm.runInNewContext(compiled, {
      module, exports: module.exports, require: localRequire, Buffer, console,
      process: { env: overrides.missingSecret ? {} : {
        RAZORPAY_KEY_SECRET: secret, RAZORPAY_WEBHOOK_SECRET: secret,
      } },
    }, { filename: absolute });
    return module.exports;
  }
  return { load, calls, saved };
}

function payload(method, extra = {}) {
  return {
    paymentMethod: method, razorpayOrderId: ids.orderId, razorpayPaymentId: ids.paymentId,
    razorpaySignature: signature,
    total: method === "cod" ? 2499 : 2374, subtotal: method === "cod" ? 2499 : 2374, shippingCharge: 0,
    items: [{ productId: "test-product", name: "Test", price: 2499, quantity: 1 }],
    shippingAddress: { fullName: "Test", email: "checkout@example.invalid" },
    ...extra,
  };
}

for (const method of ["razorpay", "cod"]) {
  const route = method === "cod" ? "app/api/payment/cod/route.ts" : "app/api/orders/route.ts";
  const amount = method === "cod" ? 14900 : 237400;
  for (const [name, extra, payment, status] of [
    ["missing signature", { razorpaySignature: undefined }, {}, 400],
    ["forged signature", { razorpaySignature: "0".repeat(64) }, {}, 400],
    ["malformed hex signature", { razorpaySignature: "g".repeat(64) }, {}, 400],
    ["wrong payment ID", {}, { id: "pay_other" }, 400],
    ["wrong order ID", {}, { order_id: "order_other" }, 400],
    ["underpaid", {}, { amount: amount - 100 }, 400],
    ["wrong currency", {}, { currency: "USD" }, 400],
    ["authorized only", {}, { status: "authorized" }, 409],
    ["failed payment", {}, { status: "failed" }, 409],
    ["partially refunded", {}, { amount_refunded: 1 }, 409],
  ]) {
    test(`${method}: ${name} cannot reach DB or side effects`, async () => {
      const f = fixture({ payment: { amount, ...payment } });
      const response = await f.load(route).POST({ json: async () => payload(method, extra) });
      assert.equal(response.status, status);
      assert.equal((await response.json()).success, false);
      assert.equal(f.calls.db, 0);
      assert.equal(f.calls.create + f.calls.inventory + f.calls.email, 0);
      if (name.includes("signature")) assert.equal(f.calls.fetch, 0);
    });
  }
  test(`${method}: valid captured payment confirms one order`, async () => {
    const f = fixture({ payment: { amount } });
    const response = await f.load(route).POST({ json: async () => payload(method) });
    assert.equal(response.status, 201);
    assert.equal(f.calls.create, 1);
    assert.equal(f.calls.inventory, 1);
    assert.equal(f.calls.email, 1);
    assert.equal(f.saved[0].status, "confirmed");
    assert.equal(f.saved[0].paymentMethod, method);
    if (method === "cod") {
      assert.equal(f.saved[0].codAdvancePaid, 149);
      assert.equal(f.saved[0].codRemainingAmount, 2350);
    }
  });
  test(`${method}: sequential retry does not create a second order`, async () => {
    const f = fixture({ payment: { amount }, existing: { orderId: "MMM-EXISTING" } });
    const response = await f.load(route).POST({ json: async () => payload(method) });
    assert.equal(response.status, 200);
    assert.equal((await response.json()).duplicate, true);
    assert.equal(f.calls.create + f.calls.inventory + f.calls.email, 0);
  });
  for (const failure of ["fetchError", "missingSecret"]) {
    test(`${method}: ${failure} fails closed`, async () => {
      const f = fixture({ payment: { amount }, [failure]: true });
      const response = await f.load(route).POST({ json: async () => payload(method) });
      assert.equal(response.status, 503);
      assert.equal(f.calls.db, 0);
    });
  }
}

test("COD: total below 149 caps advance and leaves zero balance", async () => {
  const f = fixture({ payment: { amount: 9900 } });
  const response = await f.load("app/api/payment/cod/route.ts").POST({ json: async () => payload("cod", { total: 99, subtotal: 99 }) });
  assert.equal(response.status, 201);
  assert.equal(f.saved[0].codAdvancePaid, 99);
  assert.equal(f.saved[0].codRemainingAmount, 0);
});

test("signature helpers reject malformed input and verify exact webhook bytes", () => {
  const { verifyPaymentSignature, verifyWebhookSignature } = fixture().load("lib/razorpay/verify.ts");
  for (const bad of ["", "ab", "g".repeat(64), "0".repeat(64) + "x"]) {
    assert.equal(verifyPaymentSignature({ ...ids, signature: bad }), false);
    assert.equal(verifyWebhookSignature({ rawBody: "{}", signature: bad }), false);
  }
  const rawBody = '{"event":"payment.captured"}';
  const signed = crypto.createHmac("sha256", secret).update(rawBody).digest("hex");
  assert.equal(verifyWebhookSignature({ rawBody, signature: signed }), true);
  assert.equal(verifyWebhookSignature({ rawBody: rawBody + " ", signature: signed }), false);
});

for (const [method, offerCodes, expected] of [
  ["razorpay", [], 2000], ["cod", [], 2000],
  ["razorpay", ["PREPAID5"], 1900], ["razorpay", ["BUY2GET10"], 1800],
  ["razorpay", ["PREPAID5", "BUY2GET10"], 1700], ["cod", ["BUY2GET10"], 1800],
]) {
  test(`${method}: explicit ${offerCodes.join("+") || "no offers"} agrees across quote, gateway and saved order`, async () => {
    const amount = method === "cod" ? 149 : expected;
    const f = fixture({ payment: { amount: amount * 100 } });
    const body = payload(method, { subtotal: 2000, total: expected, offerCodes,
      items: [{ productId: "same-product", price: 1000, quantity: 2 }] });
    const quote = await f.load("lib/coupon/checkout.ts").quoteCheckout(body);
    assert.equal(quote.total, expected);
    const gateway = await f.load("app/api/payment/create-order/route.ts").POST({ json: async () => ({ ...body, amount }) });
    assert.equal(gateway.status, 200);
    assert.equal((await gateway.json()).amount, amount * 100);
    const route = method === "cod" ? "app/api/payment/cod/route.ts" : "app/api/orders/route.ts";
    const saved = await f.load(route).POST({ json: async () => body });
    assert.equal(saved.status, 201);
    assert.equal(f.saved[0].total, expected);
    assert.equal(f.saved[0].discountAmount, 2000 - expected);
    if (method === "cod") assert.equal(f.saved[0].codRemainingAmount, expected - amount);
  });
}

for (const [label, change] of [
  ["duplicate offer", { offerCodes: ["BUY2GET10", "BUY2GET10"] }],
  ["unknown offer", { offerCodes: ["FREE100"] }],
  ["prepaid on COD", { paymentMethod: "cod", offerCodes: ["PREPAID5"] }],
  ["one unit combo", { items: [{ productId: "p", quantity: 1 }], offerCodes: ["BUY2GET10"] }],
  ["fractional units", { items: [{ productId: "p", quantity: 1.5 }], offerCodes: ["BUY2GET10"] }],
  ["coupon plus offers", { couponCode: "OTHER20", offerCodes: ["BUY2GET10"] }],
  ["implicit discounted amount", { amount: 1900 }],
  ["unapplied combined discount", { amount: 1700 }],
  ["reserved offer as ordinary coupon", { couponCode: "PREPAID5" }],
]) {
  test(`gateway rejects ${label} before creating a payment`, async () => {
    const f = fixture();
    const response = await f.load("app/api/payment/create-order/route.ts").POST({ json: async () => ({
      subtotal: 2000, shippingCharge: 0, paymentMethod: "razorpay", amount: 2000,
      items: [{ productId: "p", quantity: 2 }], offerCodes: [], ...change,
    }) });
    assert.equal(response.status, 400);
    assert.equal(f.calls.gateway, 0);
  });
}

test("rounding, removal and repeated calculation preserve an additive 15%", () => {
  const { calculateOffers } = fixture().load("lib/coupon/offers.ts");
  const input = { subtotal: 1999, itemCount: 2, paymentMethod: "razorpay", offerCodes: ["PREPAID5", "BUY2GET10"] };
  const first = calculateOffers(input);
  assert.equal(first.discount, 299.85);
  assert.equal(Math.round((first.prepaidDiscount + first.comboDiscount) * 100), 29985);
  assert.equal(calculateOffers(input).discount, first.discount);
  assert.equal(calculateOffers({ ...input, offerCodes: ["PREPAID5"] }).discount, 99.95);
  assert.equal(calculateOffers({ ...input, offerCodes: [] }).discount, 0);
});

test("existing ordinary coupon remains available on its own", async () => {
  const quote = await fixture().load("lib/coupon/checkout.ts").quoteCheckout({
    subtotal: 2000, shippingCharge: 0, paymentMethod: "razorpay", offerCodes: [],
    couponCode: "OTHER20", userId: "test@example.invalid", items: [{ productId: "p", quantity: 2 }],
  });
  assert.equal(quote.total, 1600);
  assert.equal(quote.appliedCouponCode, "OTHER20");
});

test("COD combo can bring an order under the existing 5000 limit", async () => {
  const f = fixture();
  const response = await f.load("app/api/payment/create-order/route.ts").POST({ json: async () => ({
    subtotal: 5400, shippingCharge: 0, paymentMethod: "cod", amount: 149,
    items: [{ productId: "p", quantity: 2 }], offerCodes: ["BUY2GET10"],
  }) });
  assert.equal(response.status, 200);
});

for (const method of ["razorpay", "cod"]) {
  test(`${method}: saved-order retry succeeds even when its coupon is now used up`, async () => {
    const f = fixture({ payment: { amount: method === "cod" ? 14900 : 237400 }, existing: { orderId: "MMM-EXISTING" }, invalidCoupon: true });
    const response = await f.load(method === "cod" ? "app/api/payment/cod/route.ts" : "app/api/orders/route.ts").POST({
      json: async () => payload(method, { couponCode: "OTHER20", userId: "test@example.invalid" }),
    });
    assert.equal(response.status, 200);
    assert.equal((await response.json()).duplicate, true);
    assert.equal(f.calls.create, 0);
  });
  test(`${method}: order write rejects discount without explicit selection`, async () => {
    const f = fixture({ payment: { amount: method === "cod" ? 14900 : 170000 } });
    const response = await f.load(method === "cod" ? "app/api/payment/cod/route.ts" : "app/api/orders/route.ts").POST({
      json: async () => payload(method, { subtotal: 2000, total: 1700, items: [{ productId: "p", quantity: 2 }], offerCodes: [] }),
    });
    assert.equal(response.status, 400);
    assert.equal(f.calls.create, 0);
  });
}
