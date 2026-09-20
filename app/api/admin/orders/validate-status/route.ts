import { NextRequest, NextResponse } from "next/server";
import { isValidStatusTransition } from "@/lib/orders/statusTransitions";

export async function POST(req: NextRequest) {
  try {
    const { currentStatus, newStatus } = await req.json();

    if (!currentStatus || !newStatus) {
      return NextResponse.json({ error: "Missing status parameters" }, { status: 400 });
    }

    const isValid = isValidStatusTransition(currentStatus, newStatus);
    return NextResponse.json({ valid: isValid });
  } catch (error) {
    return NextResponse.json({ error: "Validation failed" }, { status: 500 });
  }
}
