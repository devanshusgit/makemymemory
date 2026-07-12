import { NextRequest, NextResponse } from "next/server";
import { scheduleDelhiveryPickup } from "@/lib/shipping/delhiveryClient";

function isAdmin(req: NextRequest) {
  return req.cookies.get("admin_session")?.value === process.env.ADMIN_PASSWORD;
}

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  if (!isAdmin(req)) {
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
      message: "Pickup scheduled successfully",
      details: pickupRes,
    });

  } catch (error) {
    console.error("[Pickup API] Error:", error);
    return NextResponse.json({ error: "Failed to schedule pickup" }, { status: 500 });
  }
}
