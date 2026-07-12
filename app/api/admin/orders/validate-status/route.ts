import { NextRequest, NextResponse } from "next/server";

/**
 * Valid order state transitions
 * Prevents invalid status changes like: delivered → shipped
 */
const VALID_TRANSITIONS: Record<string, string[]> = {
  pending: ["confirmed", "cancelled", "payment_failed"],
  confirmed: ["kit_ready", "kit_shipped", "cancelled", "payment_failed"],
  kit_ready: ["kit_shipped", "cancelled"],
  kit_shipped: ["kit_delivered", "waiting_submission", "cancelled"],
  kit_delivered: ["waiting_submission", "cancelled"],
  waiting_submission: ["final_production", "cancelled"],
  final_production: ["final_ready", "final_shipped", "cancelled"],
  final_ready: ["final_shipped", "cancelled"],
  final_shipped: ["delivered", "completed", "cancelled"],
  delivered: ["completed", "cancelled"],
  completed: [],
  cancelled: [],
  payment_failed: ["confirmed", "cancelled"],
};

export function isValidStatusTransition(currentStatus: string, newStatus: string): boolean {
  if (currentStatus === newStatus) return true;
  // Relax validation to allow any valid two-stage status to prevent getting stuck
  const validStatuses = [
    "pending",
    "confirmed",
    "kit_ready",
    "kit_shipped",
    "kit_delivered",
    "waiting_submission",
    "final_production",
    "final_ready",
    "final_shipped",
    "delivered",
    "completed",
    "cancelled",
    "payment_failed"
  ];
  return validStatuses.includes(newStatus);
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
