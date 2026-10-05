import { NextRequest, NextResponse } from "next/server";
import { scheduleDelhiveryPickup } from "@/lib/shipping/delhiveryClient";
import { isAdminRequest } from "@/lib/auth/admin";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  if (!isAdminRequest(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { pickupDate, pickupTime, packageCount } = body;

    if (!pickupDate || !pickupTime) {
      return NextResponse.json({ error: "pickupDate and pickupTime are required" }, { status: 400 });
    }

    const pickupRes = await scheduleDelhiveryPickup({
      pickupDate,
      pickupTime,
      packageCount: packageCount || 1,
    });

    return NextResponse.json({
      success: true,
      message: `Pickup booked with Delhivery (pickup id ${pickupRes.pickup_id})`,
      details: pickupRes,
    });

  } catch (error: any) {
    console.error("[Pickup API] Error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to schedule pickup" },
      { status: 502 }
    );
  }
}
