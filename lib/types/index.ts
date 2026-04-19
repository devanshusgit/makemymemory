export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  originalPrice?: number;
  image?: string;
  emoji: string;
  category: string;
  badge?: string;
  images?: string[];
  inStock: boolean;
}

export interface CartItem {
  product: Product;
  quantity: number;
  customization?: string;
}

export interface Order {
  id: string;
  items: CartItem[];
  total: number;
  status: "confirmed" | "processing" | "shipped" | "out_for_delivery" | "delivered" | "cancelled";
  paymentMethod?: "razorpay" | "paypal" | "cod";
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
  items: Array<{ name: string; emoji: string; quantity: number; price: number }>;
  shippingAddress: Pick<Address, "fullName" | "city" | "state" | "pincode">;
  total: number;
  paymentMethod?: "razorpay" | "paypal" | "cod";
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
