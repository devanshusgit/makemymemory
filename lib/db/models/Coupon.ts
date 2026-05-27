import mongoose, { Schema, Document, Model } from "mongoose";

export interface ICoupon extends Document {
  code: string;
  discountType: "percentage" | "fixed";
  discountValue: number; // percentage (0-100) or fixed amount
  description?: string;
  
  // Coupon rules
  applicableCategories?: string[]; // Empty = all categories
  minOrderValue?: number; // Minimum order value to apply
  maxUsagePerUser?: number; // 0 = unlimited
  maxTotalUsage?: number; // 0 = unlimited
  
  // Coupon type
  couponType: "general" | "signup" | "second_order" | "combo";
  
  // Combo specific
  minCategoriesRequired?: number; // For combo offers
  
  // Status
  isActive: boolean;
  startDate: Date;
  expiryDate?: Date;
  
  // Tracking
  usageCount: number;
  usedByUsers: string[]; // Array of user IDs who used this coupon
  
  createdAt: Date;
  updatedAt: Date;
}

const CouponSchema = new Schema<ICoupon>(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
      index: true,
    },
    discountType: {
      type: String,
      enum: ["percentage", "fixed"],
      default: "percentage",
    },
    discountValue: {
      type: Number,
      required: true,
      min: 0,
    },
    description: {
      type: String,
      trim: true,
    },
    applicableCategories: {
      type: [String],
      default: [],
    },
    minOrderValue: {
      type: Number,
      default: 0,
      min: 0,
    },
    maxUsagePerUser: {
      type: Number,
      default: 0, // 0 = unlimited
      min: 0,
    },
    maxTotalUsage: {
      type: Number,
      default: 0, // 0 = unlimited
      min: 0,
    },
    couponType: {
      type: String,
      enum: ["general", "signup", "second_order", "combo"],
      default: "general",
    },
    minCategoriesRequired: {
      type: Number,
      default: 2,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    startDate: {
      type: Date,
      default: Date.now,
      index: true,
    },
    expiryDate: {
      type: Date,
      sparse: true,
      index: true,
    },
    usageCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    usedByUsers: {
      type: [String],
      default: [],
    },
  },
  { timestamps: true, versionKey: false }
);

// Index for finding active coupons
CouponSchema.index({ isActive: 1, startDate: 1, expiryDate: 1 });
CouponSchema.index({ couponType: 1, isActive: 1 });

export const Coupon: Model<ICoupon> =
  (mongoose.models.Coupon as Model<ICoupon>) ??
  mongoose.model<ICoupon>("Coupon", CouponSchema);
