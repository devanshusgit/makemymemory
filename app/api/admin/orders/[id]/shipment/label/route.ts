import { NextRequest, NextResponse } from "next/server";
import { getDelhiveryPackingSlip } from "@/lib/shipping/delhiveryClient";
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
    // Delhivery's packing_slip endpoint returns JSON — the HTML below lays
    // it out the same way Delhivery's own printed label does.
    const raw = await getDelhiveryPackingSlip(awb);
    const data = JSON.parse(raw);
    const pkg = data?.packages?.[0];
    if (!pkg) {
      return new NextResponse("Label data not found for this AWB.", { status: 404 });
    }
    return new NextResponse(buildLabelHtml(pkg), {
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

function buildLabelHtml(p: Record<string, any>): string {
  const sellerName   = esc(p.snm);
  const sellerAddr   = esc(p.saddr);

  const awb          = esc(p.wbn);
  const sortCode     = esc(p.sort_code || p.st || "");
  const originPin    = esc(p.spin || "");
  const barcode      = typeof p.barcode === "string" ? p.barcode : "";
  const orderBarcode = typeof p.ob === "string" ? p.ob : "";

  const consName     = esc(p.name);
  const consAddr     = esc(p.address);
  const consDest     = esc(p.destination || "");
  const consState    = esc(p.rst || "");
  const consPin      = esc(p.rpin || p.pin);

  const payment      = esc(p.pt || "Pre-paid");
  const motType      = String(p.mot || "").toUpperCase() === "A" ? "Air" : "Surface";
  const codValue     = Number(p.cod) || 0;
  const isCod        = /cod/i.test(String(p.pt || ""));

  const orderId      = esc(p.oid);
  const prd          = esc(p.prd || "");

  const d = new Date();
  const dateStr = d.toLocaleString("en-GB", {
    day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
    timeZone: "Asia/Kolkata", hour12: true,
  }).replace(",", " |");

  return [
    '<!doctype html>',
    '<html lang="en">',
    '<head>',
    '<meta charset="utf-8" />',
    `<title>Shipping Label — ${awb}</title>`,
    '<style>',
    ':root { color-scheme: light; }',
    '* { box-sizing: border-box; }',
    'body { margin: 0; padding: 24px; background: #e8e6e1; font-family: Arial, Helvetica, sans-serif; color: #000; }',
    '.toolbar { max-width: 560px; margin: 0 auto 14px; display: flex; justify-content: flex-end; }',
    '.btn { background: #1a1a1a; color: #fff; padding: 10px 18px; border: 0; border-radius: 999px; font-weight: 600; cursor: pointer; }',
    '.label { width: 100mm; max-width: 100%; margin: 0 auto; background: #fff; border: 1.5px solid #000; padding: 10px 12px 8px; font-size: 11px; line-height: 1.3; }',
    '.top { display: flex; justify-content: space-between; align-items: center; padding-bottom: 4px; border-bottom: 1px solid #000; }',
    '.top .seller { font-size: 11px; }',
    '.top .brand { font-weight: 900; letter-spacing: 1px; font-size: 15px; font-style: italic; }',
    '.awb-row { padding: 6px 0 2px; font-size: 11px; }',
    '.awb-no { font-weight: 700; }',
    '.barcode-block { text-align: center; padding: 2px 0; }',
    '.barcode-block img { max-width: 100%; height: 48px; display: block; margin: 0 auto; }',
    '.barcode-block .code { font-family: "Courier New", monospace; font-size: 11px; letter-spacing: 1px; }',
    '.sort-row { display: flex; justify-content: space-between; padding: 2px 0 4px; border-bottom: 1px solid #000; font-size: 11px; }',
    '.cols { display: flex; border-bottom: 1px solid #000; }',
    '.cols .l { flex: 1.4; padding: 6px 8px 6px 0; }',
    '.cols .r { flex: 1; padding: 6px 0 6px 8px; border-left: 1px solid #000; }',
    '.section-title { font-weight: 700; }',
    '.pin-strong { font-weight: 700; }',
    '.seller-block { padding: 6px 0; border-bottom: 1px solid #000; }',
    '.order-row { display: flex; justify-content: space-between; align-items: flex-end; padding: 6px 0; border-bottom: 1px solid #000; }',
    '.order-row .order-id { font-weight: 700; letter-spacing: 0.3px; }',
    '.order-row img { height: 36px; }',
    '.product-table { width: 100%; border-collapse: collapse; margin-top: 2px; }',
    '.product-table th, .product-table td { padding: 4px 2px; text-align: left; font-weight: normal; }',
    '.product-table th { font-weight: 700; }',
    '.product-table .num { text-align: right; }',
    '.footer { display: flex; justify-content: space-between; align-items: flex-end; margin-top: 20px; padding-top: 6px; border-top: 1px solid #000; font-size: 10px; }',
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
    barcode ? `      <img src="${esc(barcode)}" alt="AWB barcode" />` : '',
    `      <div class="code">AWB# ${awb}</div>`,
    '    </div>',
    '    <div class="sort-row">',
    `      <span>${originPin}</span>`,
    `      <span>${sortCode}</span>`,
    '    </div>',
    '    <div class="cols">',
    '      <div class="l">',
    `        <div><span class="section-title">Ship to - ${consName}</span></div>`,
    `        <div>${consAddr}</div>`,
    consDest ? `        <div>${consDest}</div>` : '',
    consState ? `        <div>${consState}</div>` : '',
    `        <div class="pin-strong">PIN - ${consPin}</div>`,
    '      </div>',
    '      <div class="r">',
    `        <div class="section-title">${payment} - ${motType}</div>`,
    `        <div style="margin-top: 2px;">INR ${isCod ? codValue.toLocaleString('en-IN') : '0'}</div>`,
    '        <div style="margin-top: 8px;" class="section-title">Date</div>',
    `        <div>${dateStr}</div>`,
    '      </div>',
    '    </div>',
    '    <div class="seller-block">',
    `      <div><span class="section-title">Seller:</span> ${sellerName}</div>`,
    `      <div>${sellerAddr}</div>`,
    '    </div>',
    '    <div class="order-row">',
    '      <div></div>',
    '      <div style="text-align: right;">',
    `        <div class="order-id">${orderId}</div>`,
    orderBarcode ? `        <img src="${esc(orderBarcode)}" alt="Order barcode" />` : '',
    '      </div>',
    '    </div>',
    '    <table class="product-table">',
    '      <thead>',
    '        <tr>',
    '          <th>Product Name</th>',
    '          <th class="num">Qty.</th>',
    '          <th class="num">Price</th>',
    '          <th class="num">Total</th>',
    '        </tr>',
    '      </thead>',
    '      <tbody>',
    '        <tr>',
    `          <td>${prd}</td>`,
    '          <td class="num">0</td>',
    '          <td class="num">0</td>',
    '          <td class="num">0</td>',
    '        </tr>',
    '      </tbody>',
    '    </table>',
    '    <div class="footer">',
    '      <div class="ret">',
    `        <div><strong>Return Address:</strong> ${sellerAddr}</div>`,
    '      </div>',
    '      <div class="page">Page 1 of 1</div>',
    '    </div>',
    '  </div>',
    '</body>',
    '</html>',
  ].filter(Boolean).join("\n");
}
