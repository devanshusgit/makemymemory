import mongoose, { Schema, Document, Model } from "mongoose";

export interface IOTP extends Document {
  email: string;
  phone?: string;
  code: string;
  type: "password_reset" | "login" | "account_deletion" | "email_verification";
  isUsed: boolean;
  usedAt?: Date;
  createdAt: Date;
  expiresAt: Date;
}

const OTPSchema = new Schema<IOTP>(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    phone: {
      type: String,
      sparse: true,
    },
    code: {
      type: String,
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ["password_reset", "login", "account_deletion", "email_verification"],
      required: true,
    },
    isUsed: {
      type: Boolean,
      default: false,
      index: true,
    },
    usedAt: {
      type: Date,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: true,
      expires: 0, // Auto-delete after expiry
    },
  },
  { timestamps: true, versionKey: false }
);

// Index for finding active OTPs
OTPSchema.index({ email: 1, type: 1, isUsed: 1 });
OTPSchema.index({ code: 1, type: 1 });

export const OTP: Model<IOTP> =
  (mongoose.models.OTP as Model<IOTP>) ??
  mongoose.model<IOTP>("OTP", OTPSchema);
