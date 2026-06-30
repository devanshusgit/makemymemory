import { NextRequest, NextResponse } from "next/server";

/**
 * Valid order state transitions
 * Prevents invalid status changes like: delivered → shipped
 */
const VALID_TRANSITIONS: Record<string, string[]> = {
  confirmed: ["processing", "cancelled"],
  processing: ["shipped", "cancelled"],
  shipped: ["out_for_delivery", "cancelled"],
  out_for_delivery: ["delivered", "cancelled"],
  delivered: [],
  cancelled: [],
  payment_failed: ["confirmed", "cancelled"],
};

export function isValidStatusTransition(currentStatus: string, newStatus: string): boolean {
  if (currentStatus === newStatus) return true;
  const allowedTransitions = VALID_TRANSITIONS[currentStatus] || [];
  return allowedTransitions.includes(newStatus);
}

/**
 * Helper export for use in order update routes
 */
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
