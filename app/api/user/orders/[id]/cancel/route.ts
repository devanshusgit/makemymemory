import { NextResponse } from "next/server";

/**
 * POST /api/user/orders/[id]/cancel
 *
 * Not a self-service action. The policy (app/returns, app/cancellation-policy)
 * lets an order be cancelled for a full refund until its imprint kit is
 * dispatched, but the cancellation goes through support: someone has to
 * check the kit has not already been packed and issue the refund. No page
 * calls this route; it answers direct requests with how to cancel, in the
 * policy's own terms.
 *
 * It used to say orders could never be cancelled once placed, which the
 * rewritten policy no longer says. The previous self-cancel implementation is
 * in git history.
 */
export async function POST() {
  return NextResponse.json(
    {
      error:
        "To cancel, email support@makemymemory.com with your order ID before your imprint kit is dispatched, " +
        "and you'll get a full refund. Within 24 hours of ordering you can also change your order yourself from My Orders. " +
        "Once the kit has been dispatched the order can no longer be cancelled.",
      policy: "/cancellation-policy",
    },
    { status: 403 }
  );
}
