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
   Main Order schema
───────────────────────────────────────────── */
export type OrderStatus =
  | "confirmed"
  | "processing"
  | "shipped"
  | "out_for_delivery"
  | "delivered"
  | "cancelled"
  | "payment_failed";

export type PaymentMethod = "razorpay" | "paypal" | "cod";

export interface IOrder extends Document {
  orderId:            string;
  status:             OrderStatus;
  paymentMethod:      PaymentMethod;

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
  items:              mongoose.Types.DocumentArray<typeof OrderItemSchema>;
  shippingAddress:    typeof AddressSchema;

  // Tracking
  trackingEvents:     mongoose.Types.DocumentArray<typeof TrackingEventSchema>;
  courierName?:       string;
  courierTrackingId?: string;
  courierTrackingUrl?: string;
  estimatedDelivery?: Date;

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
      enum:    ["confirmed","processing","shipped","out_for_delivery","delivered","cancelled","payment_failed"],
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

    trackingEvents:     { type: [TrackingEventSchema], default: [] },
    courierName:        { type: String },
    courierTrackingId:  { type: String },
    courierTrackingUrl: { type: String },
    estimatedDelivery:  { type: Date },
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
