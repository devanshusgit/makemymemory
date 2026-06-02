import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  return NextResponse.json({
    message: "Session endpoint deprecated - use email-based authentication instead",
    status: "deprecated",
  });
}

export async function POST(req: NextRequest) {
  return NextResponse.json({
    message: "Session endpoint deprecated - use email-based authentication instead",
    status: "deprecated",
  });
}
