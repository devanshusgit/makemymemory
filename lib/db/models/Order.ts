import mongoose, { Schema, Document, Model } from "mongoose";

/* ─────────────────────────────────────────────
   Sub-document schemas
───────────────────────────────────────────── */
const AddressSchema = new Schema(
  {
    fullName: { type: String, required: true, trim: true },
    email:    { type: String, required: true, trim: true, lowercase: true },
    phone:    { type: String, required: true, trim: true },
    address:  { type: String, required: true, trim: true },
    landmark: { type: String, trim: true, default: "" },
    city:     { type: String, required: true, trim: true },
    state:    { type: String, required: true, trim: true },
    pincode:  { type: String, required: true, trim: true },
  },
  { _id: false }
);

const OrderItemSchema = new Schema(
  {
    productId:   { type: String, required: true },
    name:        { type: String, required: true },
    emoji:       { type: String, default: "" },
    price:       { type: Number, required: true, min: 0 },
    quantity:    { type: Number, required: true, min: 1 },
    customization: { type: Schema.Types.Mixed, default: {} }, // Changed to Mixed to support object
  },
  { _id: false }
);

const TrackingEventSchema = new Schema(
  {
    status:      { type: String, required: true },
    description: { type: String, required: true },
    location:    { type: String, default: "" },
    timestamp:   { type: Date, default: Date.now },
  },
  { _id: false }
);

/* ─────────────────────────────────────────────
   Delivery sub-document schema (one per shipment)
   Every order has exactly two deliveries:
     deliveries[0] — Kit dispatch (raw materials sent to customer first)
     deliveries[1] — Final product dispatch (finished personalised product)
───────────────────────────────────────────── */
const DeliverySchema = new Schema(
  {
    deliveryType: {
      type: String,
      enum: ["kit", "final"],
      required: true,
    },
    /** Per-delivery status — independent of the overall order status */
    status: {
      type: String,
      enum: ["pending", "dispatching", "dispatched", "shipped", "out_for_delivery", "delivered"],
      default: "pending",
    },
    courierName:        { type: String, default: "" },
    courierTrackingId:  { type: String, default: "" },
    courierTrackingUrl: { type: String, default: "" },
    estimatedDelivery:  { type: Date },
    trackingEvents:     { type: [TrackingEventSchema], default: [] },
  },
  { _id: false }
);

const ShipmentSchema = new Schema(
  {
    awb:              { type: String, default: "" },
    trackingNumber:   { type: String, default: "" },
    labelUrl:         { type: String, default: "" },
    status:           { type: String, default: "pending" },
    dispatchDate:     { type: Date },
    deliveryTimeline: { type: String, default: "" },
    events:           { type: [TrackingEventSchema], default: [] },
  },
  { _id: false }
);

/* ─────────────────────────────────────────────
   Main Order schema
───────────────────────────────────────────── */
export type OrderStatus =
  | "pending"
  | "confirmed"
  | "kit_ready"
  | "kit_shipped"
  | "kit_delivered"
  | "waiting_submission"
  | "final_production"
  | "final_ready"
  | "final_shipped"
  | "delivered"
  | "completed"
  | "cancelled"
  | "payment_failed";

export type PaymentMethod = "razorpay" | "paypal" | "cod";

export interface IShipmentEvent {
  status: string;
  description: string;
  location: string;
  timestamp: Date;
}

export interface IShipment {
  awb: string;
  trackingNumber: string;
  labelUrl: string;
  status: string;
  dispatchDate?: Date;
  deliveryTimeline?: string;
  events: IShipmentEvent[];
}

export interface IOrder extends Document {
  orderId:            string;
  status:             OrderStatus;
  paymentMethod:      PaymentMethod;
  shipment1:          IShipment;
  shipment2:          IShipment;

  // Razorpay
  razorpayOrderId?:   string;
  razorpayPaymentId?: string;

  // COD
  isCOD:              boolean;
  codAdvancePaid:     number;
  codRemainingAmount: number;

  // Financials
  subtotal:           number;
  shippingCharge:     number;
  total:              number;
  currency:           string;

  // Content
  items: Array<{
    productId: string;
    name: string;
    emoji?: string;
    price: number;
    quantity: number;
    customization?: any;
  }>;
  shippingAddress:    {
    fullName: string;
    email: string;
    phone: string;
    address: string;
    landmark?: string;
    city: string;
    state: string;
    pincode: string;
  };

  // Dual-delivery system
  // deliveries[0] = Kit dispatch, deliveries[1] = Final product dispatch
  deliveries:         mongoose.Types.DocumentArray<typeof DeliverySchema>;

  // Legacy top-level tracking (kept for backwards compatibility)
  trackingEvents:     mongoose.Types.DocumentArray<typeof TrackingEventSchema>;
  courierName?:       string;
  courierTrackingId?: string;
  courierTrackingUrl?: string;
  estimatedDelivery?: Date;

  // Coupon/Discount
  appliedCouponCode?: string;
  discountAmount?:    number;

  createdAt: Date;
  updatedAt: Date;
}

const OrderSchema = new Schema<IOrder>(
  {
    orderId: {
      type:     String,
      required: true,
      unique:   true,
      index:    true,
      default:  () => `MMM-${Date.now().toString(36).toUpperCase()}`,
    },
    status: {
      type:    String,
      enum:    [
        "pending", "confirmed", "kit_ready", "kit_shipped", "kit_delivered",
        "waiting_submission", "final_production", "final_ready", "final_shipped",
        "delivered", "completed", "cancelled", "payment_failed"
      ],
      default: "confirmed",
      index:   true,
    },
    paymentMethod: {
      type:     String,
      enum:     ["razorpay","paypal","cod"],
      required: true,
    },

    razorpayOrderId:   { type: String, sparse: true, index: true },
    razorpayPaymentId: { type: String, sparse: true },

    isCOD:              { type: Boolean, default: false },
    codAdvancePaid:     { type: Number,  default: 0 },
    codRemainingAmount: { type: Number,  default: 0 },

    subtotal:       { type: Number, required: true, min: 0 },
    shippingCharge: { type: Number, required: true, min: 0, default: 0 },
    total:          { type: Number, required: true, min: 0 },
    currency:       { type: String, default: "INR" },

    items:           { type: [OrderItemSchema],    required: true },
    shippingAddress: { type: AddressSchema,        required: true },

    // Two-stage shipment fields
    shipment1: { type: ShipmentSchema, default: () => ({ status: "pending", events: [] }) },
    shipment2: { type: ShipmentSchema, default: () => ({ status: "pending", events: [] }) },

    // Dual-delivery sub-documents — auto-populated on order creation
    deliveries: { type: [DeliverySchema], default: [] },

    // Legacy top-level tracking fields (kept for older orders / backwards compat)
    trackingEvents:     { type: [TrackingEventSchema], default: [] },
    courierName:        { type: String },
    courierTrackingId:  { type: String },
    courierTrackingUrl: { type: String },
    estimatedDelivery:  { type: Date },

    // Coupon/Discount
    appliedCouponCode: { type: String, sparse: true },
    discountAmount:    { type: Number, default: 0, min: 0 },
  },
  {
    timestamps: true,   // adds createdAt + updatedAt
    versionKey: false,
  }
);

// Compound index for order tracking lookup (orderId + contact)
OrderSchema.index({ orderId: 1, "shippingAddress.phone": 1 });
OrderSchema.index({ orderId: 1, "shippingAddress.email": 1 });

/* ─────────────────────────────────────────────
   Model — prevent re-compilation in dev
───────────────────────────────────────────── */
export const Order: Model<IOrder> =
  (mongoose.models.Order as Model<IOrder>) ??
  mongoose.model<IOrder>("Order", OrderSchema);
