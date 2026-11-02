/**
 * When a customer may still change their order. Shared by the order history
 * page (to show or hide "Edit order") and every edit API route (to enforce
 * it), so the two can never disagree. No database or server imports here —
 * this runs in the browser too.
 *
 * The rule: within 24 hours of placing the order, and only while it is still
 * "confirmed" with no kit shipment created. Once the kit is packed or shipped
 * the order is physically under way, whatever the clock says.
 */
export const EDIT_WINDOW_HOURS = 24;
const EDIT_WINDOW_MS = EDIT_WINDOW_HOURS * 60 * 60 * 1000;

export interface EditableOrderShape {
  status?: string;
  paymentMethod?: string;
  createdAt?: string | Date;
  shipment1?: { awb?: string } | null;
}

export type EditState =
  | { editable: true; deadline: Date }
  | { editable: false; reason: string };

export function editState(order: EditableOrderShape, now: number = Date.now()): EditState {
  if (order.paymentMethod !== "razorpay" && order.paymentMethod !== "cod") {
    return { editable: false, reason: "This order can't be changed online. Please contact support." };
  }
  if (order.shipment1?.awb) {
    return { editable: false, reason: "Your kit has already shipped, so this order can no longer be changed." };
  }
  if (order.status !== "confirmed") {
    return { editable: false, reason: "Your order is already being prepared, so it can no longer be changed." };
  }
  const placed = order.createdAt ? new Date(order.createdAt).getTime() : NaN;
  if (!Number.isFinite(placed)) {
    return { editable: false, reason: "This order can't be changed online. Please contact support." };
  }
  const deadline = new Date(placed + EDIT_WINDOW_MS);
  if (now >= deadline.getTime()) {
    return { editable: false, reason: `Orders can be changed within ${EDIT_WINDOW_HOURS} hours of being placed, and that time has passed.` };
  }
  return { editable: true, deadline };
}
