import { NextResponse } from "next/server";

/**
 * POST /api/user/orders/[id]/cancel
 *
 * Orders cannot be cancelled once placed — each keepsake is made to order
 * (see /cancellation-policy). Customers used to be able to cancel from their
 * account pages, which contradicted that policy and emailed them a refund
 * promise that nothing ever issued. The pages no longer offer it, and this
 * refuses direct requests too. Damaged or incorrect items go through support.
 *
 * The previous self-cancel implementation is in git history if the policy
 * ever changes.
 */
export async function POST() {
  return NextResponse.json(
    {
      error:
        "Orders can't be cancelled once placed, because each keepsake is made to order. " +
        "For a damaged or incorrect item, please contact support@makemymemory.in.",
      policy: "/cancellation-policy",
    },
    { status: 403 }
  );
}
