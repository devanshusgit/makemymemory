export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  originalPrice?: number;
  images: string[];
  videos: string[];
  descriptionAttachments?: Array<{
    url: string;
    type: "image" | "video" | "pdf";
    name?: string;
  }>;
  category: string;
  badge?: string;
  inStock: boolean;
  customizationFields?: Array<{
    id: string;
    label: string;
    type: "text" | "date" | "time" | "number" | "textarea" | "select";
    placeholder?: string;
    required: boolean;
    options?: string[];
    order: number;
  }>;
  details?: Array<{
    label: string;
    value: string;
    order: number;
  }>;
  enabledOptions?: {
    frameType?:  string[];
    frameColor?: string[];
    foilFinish?: string[];
    paperColor?: string[];
    font?:       string[];
    layout?:     string[];
  };
}

/**
 * One customisation choice on a cart line — "Frame Colour: Black", "Frame
 * Type: Frame with Photo (+₹350)". The browser sends option ids; the server
 * re-resolves each id to its real label and price (lib/checkout/priceCart.ts),
 * so a tampered label or price in localStorage never reaches an order.
 */
export interface CartSelection {
  group: "frameType" | "frameColor" | "finish" | "paperColor" | "font" | "layout";
  groupLabel: string;
  id: string;
  label: string;
  price: number;
}

export interface CartItem {
  product: Product;
  quantity: number;
  /** What the customer picked for each option group. */
  selections?: CartSelection[];
  customization?: Record<string, string>;
  // Variant surcharges in rupees
  surcharges?: {
    frameType?: number;      // e.g., +₹300 for "with picture"
    frameColor?: number;     // e.g., +₹0 for colors
    finish?: number;         // e.g., +₹200 for silver
    paperColor?: number;     // e.g., +₹0
    font?: number;           // e.g., +₹0
    layout?: number;         // e.g., +₹0
    total?: number;          // Sum of all surcharges
  };
}

export interface Order {
  id: string;
  items: CartItem[];
  total: number;
  status: "pending_payment" | "confirmed" | "processing" | "shipped" | "out_for_delivery" | "delivered" | "cancelled";
  paymentMethod?: "whatsapp" | "razorpay" | "paypal" | "cod";
  createdAt: Date;
  shippingAddress: Address;
  paymentId?: string;
}

export interface OrderTrackingEvent {
  status: Order["status"];
  timestamp: string;        // ISO date string
  description: string;
  location?: string;
}

export interface OrderTrackingResult {
  orderId: string;
  status: Order["status"];
  estimatedDelivery?: string;   // ISO date string
  courierName?: string;
  courierTrackingId?: string;
  courierTrackingUrl?: string;
  events: OrderTrackingEvent[];
  items: Array<{ name: string; quantity: number; price: number }>;
  shippingAddress: Pick<Address, "fullName" | "city" | "state" | "pincode">;
  total: number;
  paymentMethod?: "whatsapp" | "razorpay" | "paypal" | "cod";
}

export interface Address {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
}

export interface ReviewSubmission {
  name: string;
  email: string;
  rating: number;
  title: string;
  content: string;
  product: string;
  mediaFiles?: File[];
}
