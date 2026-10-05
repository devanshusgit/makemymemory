import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connect";
import { Order } from "@/lib/db/models/Order";
import { getDelhiveryPackingSlip, getDelhiveryLabelPdfLink } from "@/lib/shipping/delhiveryClient";
import { isAdminRequest } from "@/lib/auth/admin";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  if (!isAdminRequest(req)) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const awb = searchParams.get("awb");

  if (!awb) {
    return new NextResponse("AWB parameter is required", { status: 400 });
  }

  try {
    // Prefer Delhivery's own label PDF (identical to what Delhivery One
    // prints). ?render=html skips it to view our HTML version instead.
    if (searchParams.get("render") !== "html") {
      const pdfLink = await getDelhiveryLabelPdfLink(awb);
      if (pdfLink) return NextResponse.redirect(pdfLink);
    }

    // Delhivery's JSON gives us shipping details; prices and item lines come
    // from our own Order so the printed label matches the invoice.
    const raw = await getDelhiveryPackingSlip(awb);
    const data = JSON.parse(raw);
    const pkg = data?.packages?.[0];
    if (!pkg) {
      return new NextResponse("Label data not found for this AWB.", { status: 404 });
    }

    const orderIdFromPkg = String(pkg.oid || "");
    const bareOrderId = orderIdFromPkg.replace(/-KIT$|-FINAL$/i, "").toUpperCase();
    let order: any = null;
    try {
      await connectDB();
      order = await Order.findOne({ orderId: bareOrderId }).lean();
    } catch (e) {
      console.error("[Label] Order lookup failed:", e);
    }

    return new NextResponse(buildLabelHtml(pkg, order), {
      status: 200,
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  } catch (error) {
    console.error("[Label Fetch API] Error:", error);
    return new NextResponse("Failed to fetch packing slip from Delhivery.", { status: 500 });
  }
}

function esc(v: unknown): string {
  return String(v ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function fmtDate(d: Date): string {
  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const parts = new Intl.DateTimeFormat("en-GB", {
    day: "2-digit", month: "2-digit", year: "numeric",
    hour: "numeric", minute: "2-digit", hour12: true,
    timeZone: "Asia/Kolkata",
  }).formatToParts(d);
  const g = (t: string) => parts.find((x) => x.type === t)?.value || "";
  const day = g("day");
  const monthIdx = parseInt(g("month"), 10) - 1;
  const year = g("year");
  const hour = g("hour");
  const minute = g("minute");
  const dayPeriod = (g("dayPeriod") || "").toLowerCase();
  return `${day}-${months[monthIdx]}-${year} | ${hour}:${minute} ${dayPeriod}`;
}

function buildLabelHtml(p: Record<string, any>, order: any): string {
  // ── Seller / return (ours) ─────────────────────────────────────────────
  const sellerName   = esc(p.snm);
  const sellerAddr   = esc(p.sadd || p.saddr || "");
  const returnAddr   = esc(p.radd || p.sadd || p.saddr || "");

  // ── AWB / sort ─────────────────────────────────────────────────────────
  const awb          = esc(p.wbn);
  const sortCode     = esc(p.sort_code || p.st || "");
  const originCode   = esc(p.origin_code || p.sid || "");
  const barcodeImg   = typeof p.barcode === "string" ? p.barcode : "";

  // ── Consignee (ship to) ─────────────────────────────────────────────────
  const consName     = esc(p.name);
  const consAddr     = esc(p.address);
  const consDest     = esc(p.destination || "");
  const consState    = esc(p.customer_state || p.st || "");
  const consPin      = esc(p.pin);
  // Delhivery leaves `contact` empty on prepaid labels; fall back to the order.
  const consPhone    = esc(p.contact || order?.shippingAddress?.phone || "");

  // ── Payment ─────────────────────────────────────────────────────────────
  const payment      = esc(p.pt || "Pre-paid");
  const motType      = String(p.mot || "").toUpperCase() === "A" ? "Air" : "Surface";
  const isCod        = /cod/i.test(String(p.pt || ""));
  // Delhivery's `cod` is the amount to collect. For prepaid orders, the label
  // still shows the ORDER total (customer-paid), not 0. Fall back to our order.
  const amountInr    = isCod
    ? Number(p.cod) || 0
    : Number(order?.total ?? p.cod ?? 0);

  // ── Order lines ─────────────────────────────────────────────────────────
  const orderId      = esc(p.oid);
  // Encodable form of the order id — simple barcode drawn with a canvas lib on load.
  const orderIdPlain = String(p.oid || "");

  type Item = { name: string; sku?: string; quantity: number; price: number };
  const items: Item[] = Array.isArray(order?.items) && order.items.length
    ? order.items.map((i: any) => ({
        name: String(i.name || "Item"),
        sku: i.productId ? String(i.productId) : "",
        quantity: Number(i.quantity) || 1,
        price: Number(i.price) || 0,
      }))
    : [{
        name: String(p.prd || "Package"),
        sku: "",
        quantity: 1,
        price: isCod ? Number(p.cod) || 0 : amountInr,
      }];
  const totalQty = items.reduce((s, i) => s + i.quantity, 0);
  const grandTotal = items.reduce((s, i) => s + i.quantity * i.price, 0) || amountInr;

  const dateStr = fmtDate(new Date());

  const headHtml = [
    '<!doctype html>',
    '<html lang="en">',
    '<head>',
    '<meta charset="utf-8" />',
    `<title>Shipping Label — ${awb}</title>`,
    '<script src="https://cdn.jsdelivr.net/npm/jsbarcode@3.11.6/dist/JsBarcode.all.min.js"></script>',
    '<style>',
    ':root { color-scheme: light; }',
    '* { box-sizing: border-box; }',
    'body { margin: 0; padding: 24px; background: #e8e6e1; font-family: Arial, Helvetica, sans-serif; color: #000; }',
    '.toolbar { max-width: 560px; margin: 0 auto 14px; display: flex; justify-content: flex-end; }',
    '.btn { background: #1a1a1a; color: #fff; padding: 10px 18px; border: 0; border-radius: 999px; font-weight: 600; cursor: pointer; }',
    '.label { width: 100mm; max-width: 100%; margin: 0 auto; background: #fff; border: 1.5px solid #000; padding: 10px 12px 8px; font-size: 11px; line-height: 1.3; color: #000; }',
    '.top { display: flex; justify-content: space-between; align-items: center; padding-bottom: 4px; border-bottom: 1px solid #000; }',
    '.top .seller { font-size: 11px; }',
    '.top .brand { font-weight: 900; letter-spacing: 1px; font-size: 15px; font-style: italic; }',
    '.awb-row { padding: 6px 0 2px; font-size: 11px; }',
    '.awb-no { font-weight: 700; }',
    '.barcode-block { text-align: center; padding: 6px 0 2px; }',
    '.barcode-block svg { display: block; margin: 0 auto; max-width: 100%; }',
    '.barcode-block img { display: none; }',
    '.sort-row { display: flex; justify-content: space-between; padding: 2px 0 4px; border-bottom: 1px solid #000; font-size: 11px; font-family: "Courier New", monospace; }',
    '.cols { display: flex; border-bottom: 1px solid #000; }',
    '.cols .l { flex: 1.4; padding: 6px 8px 6px 0; }',
    '.cols .r { flex: 1; padding: 6px 0 6px 8px; border-left: 1px solid #000; }',
    '.section-title { font-weight: 700; }',
    '.pin-strong { font-weight: 700; }',
    '.seller-block { padding: 6px 0; border-bottom: 1px solid #000; }',
    '.order-row { display: flex; justify-content: space-between; align-items: flex-end; padding: 4px 0; border-bottom: 1px solid #000; gap: 8px; }',
    '.order-row .order-id { font-weight: 700; letter-spacing: 0.3px; font-size: 11px; }',
    '.order-row .order-barcode { text-align: right; }',
    '.order-row .order-barcode svg { height: 38px; display: block; margin-left: auto; }',
    '.product-table { width: 100%; border-collapse: collapse; margin: 2px 0 0; }',
    '.product-table th, .product-table td { padding: 4px 2px; text-align: left; font-weight: normal; vertical-align: top; }',
    '.product-table th { font-weight: 700; border-bottom: 1px solid #000; }',
    '.product-table .num { text-align: right; }',
    '.product-table .sku { color: #333; font-size: 10px; }',
    '.footer { display: flex; justify-content: space-between; align-items: flex-end; margin-top: 10px; padding-top: 6px; border-top: 1px solid #000; font-size: 10px; }',
    '.footer .ret { flex: 1; padding-right: 8px; }',
    '.footer .page { white-space: nowrap; }',
    '@media print {',
    '  body { background: #fff; padding: 0; }',
    '  .toolbar { display: none; }',
    '  .label { border-width: 1px; }',
    '  @page { size: A5; margin: 6mm; }',
    '}',
    '</style>',
    '</head>',
  ].join("\n");

  const body = [
    '<body>',
    '  <div class="toolbar">',
    '    <button class="btn" onclick="window.print()">Print label</button>',
    '  </div>',
    '  <div class="label">',
    '    <div class="top">',
    `      <div class="seller">${sellerName}</div>`,
    '      <div class="brand">DELHIVERY</div>',
    '    </div>',
    `    <div class="awb-row">AWB# <span class="awb-no">${awb}</span></div>`,
    '    <div class="barcode-block">',
    `      <svg id="awb-barcode"></svg>`,
    barcodeImg ? `      <img src="${esc(barcodeImg)}" alt="AWB barcode fallback" />` : "",
    '    </div>',
    '    <div class="sort-row">',
    `      <span>${consPin}</span>`,
    `      <span>AWB# ${awb}</span>`,
    `      <span>${sortCode}</span>`,
    '    </div>',
    '    <div class="cols">',
    '      <div class="l">',
    `        <div><span class="section-title">Ship to - ${consName}</span></div>`,
    `        <div>${consAddr}</div>`,
    consDest ? `        <div>${consDest}</div>` : "",
    consState ? `        <div>${consState}</div>` : "",
    `        <div class="pin-strong">PIN - ${consPin}</div>`,
    consPhone ? `        <div>Mobile: ${consPhone}</div>` : "",
    '      </div>',
    '      <div class="r">',
    `        <div class="section-title">${payment} - ${motType}</div>`,
    `        <div style="margin-top: 2px;">INR ${amountInr.toLocaleString("en-IN")}</div>`,
    '        <div style="margin-top: 8px;" class="section-title">Date</div>',
    `        <div>${dateStr}</div>`,
    '      </div>',
    '    </div>',
    '    <div class="seller-block">',
    `      <div><span class="section-title">Seller:</span> ${sellerName}</div>`,
    sellerAddr ? `      <div>${sellerAddr}</div>` : "",
    '    </div>',
    '    <div class="order-row">',
    `      <div class="order-id">${orderId}${originCode ? "  &middot;  " + originCode : ""}</div>`,
    '      <div class="order-barcode">',
    `        <svg id="order-barcode"></svg>`,
    '      </div>',
    '    </div>',
    '    <table class="product-table">',
    '      <thead>',
    '        <tr>',
    '          <th>Product Name &amp; SKU</th>',
    '          <th class="num">Qty.</th>',
    '          <th class="num">Price</th>',
    '          <th class="num">Total</th>',
    '        </tr>',
    '      </thead>',
    '      <tbody>',
    ...items.map((it) => [
      '        <tr>',
      `          <td>${esc(it.name)}${it.sku ? `<div class="sku">SKU: ${esc(it.sku)}</div>` : ""}</td>`,
      `          <td class="num">${it.quantity}</td>`,
      `          <td class="num">${it.price.toFixed(2)}</td>`,
      `          <td class="num">${(it.quantity * it.price).toFixed(2)}</td>`,
      '        </tr>',
    ].join("\n")),
    '        <tr>',
    '          <td></td>',
    `          <td class="num" style="border-top: 1px solid #000; font-weight: 700;">${totalQty}</td>`,
    '          <td class="num" style="border-top: 1px solid #000;"></td>',
    `          <td class="num" style="border-top: 1px solid #000; font-weight: 700;">${grandTotal.toFixed(2)}</td>`,
    '        </tr>',
    '      </tbody>',
    '    </table>',
    '    <div class="footer">',
    '      <div class="ret">',
    `        <div><strong>Return Address:</strong> ${returnAddr}</div>`,
    '      </div>',
    '      <div class="page">Page 1 of 1</div>',
    '    </div>',
    '  </div>',
    '  <script>',
    '    window.addEventListener("load", function () {',
    '      function draw(sel, value, opts) {',
    '        try { JsBarcode(sel, value, opts); } catch (e) { /* CDN or format error */ }',
    '      }',
    `      draw("#awb-barcode", ${JSON.stringify(awb)}, { format: "CODE128", displayValue: false, height: 80, margin: 0, width: 2 });`,
    `      draw("#order-barcode", ${JSON.stringify(orderIdPlain)}, { format: "CODE128", displayValue: false, height: 38, margin: 0, width: 1.4 });`,
    '      // If the CDN was blocked, the Delhivery <img> fallback is still in the DOM — show it when the SVG stayed empty.',
    '      var svg = document.getElementById("awb-barcode");',
    '      if (svg && !svg.children.length) {',
    '        var img = svg.parentElement && svg.parentElement.querySelector("img");',
    '        if (img) img.style.display = "block";',
    '      }',
    '    });',
    '  </script>',
    '</body>',
    '</html>',
  ].filter(Boolean).join("\n");

  return headHtml + "\n" + body;
}
