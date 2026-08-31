/**
 * Builds the WhatsApp deep link used to hand a placed order over to the
 * business for payment. Matches the number already used in WhatsAppWidget.tsx.
 */
export const WHATSAPP_BUSINESS_NUMBER = "918097486800";

interface WhatsAppOrderItem {
  name: string;
  quantity: number;
}

interface WhatsAppOrderAddress {
  fullName: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
}

const MAX_LISTED_ITEMS = 10;

export function buildOrderWhatsAppUrl(order: {
  orderId: string;
  items: WhatsAppOrderItem[];
  total: number;
  shippingAddress: WhatsAppOrderAddress;
}): string {
  const listedItems = order.items.slice(0, MAX_LISTED_ITEMS);
  const extraCount = order.items.length - listedItems.length;

  const itemLines = listedItems
    .map((item) => `• ${item.name} × ${item.quantity}`)
    .join("\n");
  const moreLine = extraCount > 0 ? `\n+${extraCount} more item${extraCount !== 1 ? "s" : ""}` : "";

  const { fullName, phone, address, city, state, pincode } = order.shippingAddress;

  const message = [
    `Hi! I'd like to complete payment for my order.`,
    ``,
    `Order ID: ${order.orderId}`,
    `Items:`,
    itemLines + moreLine,
    ``,
    `Total: ₹${order.total.toLocaleString("en-IN")}`,
    ``,
    `Delivery to:`,
    `${fullName}, ${phone}`,
    `${address}, ${city}, ${state} ${pincode}`,
  ].join("\n");

  return `https://wa.me/${WHATSAPP_BUSINESS_NUMBER}?text=${encodeURIComponent(message)}`;
}
