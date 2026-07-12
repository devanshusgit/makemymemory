import { NextRequest, NextResponse } from "next/server";
import { getDelhiveryPackingSlip } from "@/lib/shipping/delhiveryClient";

function isAdmin(req: NextRequest) {
  return req.cookies.get("admin_session")?.value === process.env.ADMIN_PASSWORD;
}

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  if (!isAdmin(req)) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const awb = searchParams.get("awb");

  if (!awb) {
    return new NextResponse("AWB parameter is required", { status: 400 });
  }

  try {
    const htmlContent = await getDelhiveryPackingSlip(awb);

    return new NextResponse(htmlContent, {
      status: 200,
      headers: {
        "Content-Type": "text/html",
      },
    });
  } catch (error) {
    console.error("[Label Fetch API] Error:", error);
    return new NextResponse("Failed to fetch packing slip from Delhivery.", { status: 500 });
  }
}
