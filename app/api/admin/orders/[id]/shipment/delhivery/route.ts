import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connect";
import { Order } from "@/lib/db/models/Order";
import { isAdminRequest } from "@/lib/auth/admin";
import { trackDelhiveryWaybill, editDelhiveryShipment, getDelhiveryPackingSlip } from "@/lib/shipping/delhiveryClient";

export const dynamic = "force-dynamic";

/** Only AWBs that belong to this order can be looked up or edited. */
async function orderAwb(orderId: string, awb: string | null) {
  if (!awb) return null;
  await connectDB();
  const order: any = await Order.findOne({ orderId: orderId.trim().toUpperCase() }).lean();
  if (!order) return null;
  const awbs = [order.shipment1?.awb, order.shipment2?.awb].filter(Boolean);
  return awbs.includes(awb) ? order : null;
}

// GET ?awb= → current Delhivery status of this shipment.
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  if (!isAdminRequest(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const awb = new URL(req.url).searchParams.get("awb");
  const order = await orderAwb(params.id, awb);
  if (!order) return NextResponse.json({ error: "AWB not found on this order" }, { status: 404 });
  try {
    const result: any = await trackDelhiveryWaybill(awb!);
    const s = result?.ShipmentData?.[0]?.Shipment;
    // What Delhivery will print on the label right now.
    let label: any = null;
    try { label = JSON.parse(await getDelhiveryPackingSlip(awb!))?.packages?.[0] ?? null; } catch {}
    return NextResponse.json({
      awb,
      status: s?.Status?.Status ?? null,
      statusType: s?.Status?.StatusType ?? null,
      statusDateTime: s?.Status?.StatusDateTime ?? null,
      instructions: s?.Status?.Instructions ?? null,
      declaredValue: s?.InvoiceAmount ?? null,
      labelProduct: label?.prd ?? null,
      labelPrice: label?.rs ?? null,
      labelCod: label?.cod ?? null,
    });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Tracking failed" }, { status: 502 });
  }
}

// POST { awb } → set the product description on Delhivery to the order's real items.
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  if (!isAdminRequest(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  let body: any = {};
  try { body = await req.json(); } catch {}
  const awb = typeof body.awb === "string" ? body.awb : null;
  const order: any = await orderAwb(params.id, awb);
  if (!order) return NextResponse.json({ error: "AWB not found on this order" }, { status: 404 });

  const isKit = order.shipment1?.awb === awb;
  const names = (order.items || []).map((i: any) => i.name).filter(Boolean).join(", ") || "Imprint frame";
  const productDetails = `${names} - ${isKit ? "Imprint Kit" : "Final Frame"}`;

  try {
    const res = await editDelhiveryShipment(awb!, { product_details: productDetails });
    return NextResponse.json({ productDetails, ...res }, { status: res.ok ? 200 : 502 });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Edit failed" }, { status: 502 });
  }
}
