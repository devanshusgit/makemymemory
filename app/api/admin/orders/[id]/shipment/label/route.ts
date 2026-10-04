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
    // Delhivery returns JSON, not HTML, so the previous version just dumped
    // raw JSON into the browser. Build the printable label ourselves.
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
  const consigneeName = esc(p.name);
  const consigneeAddress = esc(p.address);
  const consigneeCity = esc(p.rcty || p.destination_city || "");
  const consigneeState = esc(p.rst || "");
  const consigneePin = esc(p.rpin || p.pin);
  const consigneeContact = esc(p.contact);

  const sellerName = esc(p.snm);
  const sellerAddress = esc(p.saddr);
  const sellerPin = esc(p.spin || "");

  const awb = esc(p.wbn);
  const barcode = typeof p.barcode === "string" ? p.barcode : "";
  const orderId = esc(p.oid);
  const productDesc = esc(p.prd || "");
  const paymentType = esc(p.pt || "Pre-paid");
  const isCod = /cod/i.test(String(p.pt || ""));
  const codAmount = Number(p.cod) || 0;
  const originCode = esc(p.origin_code || "");
  const sortCode = esc(p.sort_code || p.st || "");
  const destination = esc(p.destination || "");

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<title>Shipping Label — ${awb}</title>
<style>
  :root { color-scheme: light; }
  * { box-sizing: border-box; }
  body { margin: 0; padding: 24px; background: #f5f3ee; font-family: Arial, Helvetica, sans-serif; color: #111; }
  .toolbar { max-width: 820px; margin: 0 auto 16px; display: flex; gap: 8px; justify-content: flex-end; }
  .btn { background: #1a1a1a; color: #fff; padding: 10px 18px; border: 0; border-radius: 999px; font-weight: 600; cursor: pointer; }
  .label { width: 820px; max-width: 100%; margin: 0 auto; background: #fff; border: 2px solid #000; padding: 18px; font-size: 13px; line-height: 1.4; }
  .row { display: flex; }
  .row > div { padding: 10px; }
  .b-r { border-right: 1px solid #000; }
  .b-b { border-bottom: 1px solid #000; }
  .pill { display: inline-block; padding: 4px 10px; border: 1.5px solid #000; border-radius: 999px; font-weight: 700; font-size: 12px; }
  .big { font-size: 20px; font-weight: 800; letter-spacing: 0.5px; }
  h4 { margin: 0 0 6px; font-size: 11px; letter-spacing: 1px; text-transform: uppercase; color: #555; }
  .barcode { text-align: center; padding: 14px; border-top: 1px solid #000; border-bottom: 1px solid #000; }
  .barcode img { max-width: 100%; height: 70px; display: block; margin: 0 auto 6px; }
  .mono { font-family: "Courier New", monospace; font-weight: 700; letter-spacing: 2px; }
  @media print {
    body { background: #fff; padding: 0; }
    .toolbar { display: none; }
    .label { border-width: 1px; }
  }
</style>
</head>
<body>
  <div class="toolbar">
    <button class="btn" onclick="window.print()">Print label</button>
  </div>

  <div class="label">
    <div class="row b-b">
      <div style="flex: 1;" class="b-r">
        <h4>Shipped by</h4>
        <div style="font-weight: 700;">${sellerName}</div>
        <div>${sellerAddress}${sellerPin ? " — " + sellerPin : ""}</div>
      </div>
      <div style="width: 180px; text-align: right;">
        <h4>Payment</h4>
        <div class="pill">${paymentType}</div>
        ${isCod ? `<div class="big" style="margin-top: 6px;">₹${codAmount.toLocaleString("en-IN")}</div>` : ""}
      </div>
    </div>

    <div class="row b-b">
      <div style="flex: 1;">
        <h4>Deliver to</h4>
        <div class="big">${consigneeName}</div>
        <div>${consigneeAddress}</div>
        <div>${consigneeCity}${consigneeState ? ", " + consigneeState : ""} — <strong>${consigneePin}</strong></div>
        <div style="margin-top: 4px;">Mobile: <strong>${consigneeContact}</strong></div>
      </div>
    </div>

    <div class="barcode">
      ${barcode ? `<img src="${esc(barcode)}" alt="AWB barcode" />` : ""}
      <div class="mono big">${awb}</div>
    </div>

    <div class="row">
      <div style="flex: 1;" class="b-r">
        <h4>Order</h4>
        <div style="font-weight: 700;">${orderId}</div>
        <div style="margin-top: 4px;">${productDesc}</div>
      </div>
      <div style="width: 220px;">
        <h4>Routing</h4>
        <div>Origin: <strong>${originCode}</strong></div>
        <div>Sort code: <strong>${sortCode}</strong></div>
        ${destination ? `<div>Dest: <strong>${destination}</strong></div>` : ""}
      </div>
    </div>
  </div>
</body>
</html>`;
}
