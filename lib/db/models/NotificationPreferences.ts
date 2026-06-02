import mongoose, { Schema, Document, Model } from "mongoose";

export interface INotificationPreferences extends Document {
  userId: string;
  email: string;
  
  // Email notifications
  emailOrderUpdates: boolean;
  emailSecurityAlerts: boolean;
  emailPromotions: boolean;
  emailNewsletter: boolean;
  
  // SMS notifications (if phone added)
  smsOrderUpdates: boolean;
  smsSecurityAlerts: boolean;
  smsPromotions: boolean;
  
  // Notification methods
  preferredMethod: "email" | "sms" | "both";
  phone?: string;
  
  // 2FA settings
  twoFactorEnabled: boolean;
  twoFactorMethod: "email" | "sms" | "authenticator";
  
  createdAt: Date;
  updatedAt: Date;
}

const NotificationPreferencesSchema = new Schema<INotificationPreferences>(
  {
    userId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    emailOrderUpdates: {
      type: Boolean,
      default: true,
    },
    emailSecurityAlerts: {
      type: Boolean,
      default: true,
    },
    emailPromotions: {
      type: Boolean,
      default: false,
    },
    emailNewsletter: {
      type: Boolean,
      default: false,
    },
    smsOrderUpdates: {
      type: Boolean,
      default: false,
    },
    smsSecurityAlerts: {
      type: Boolean,
      default: true,
    },
    smsPromotions: {
      type: Boolean,
      default: false,
    },
    preferredMethod: {
      type: String,
      enum: ["email", "sms", "both"],
      default: "email",
    },
    phone: {
      type: String,
      sparse: true,
    },
    twoFactorEnabled: {
      type: Boolean,
      default: false,
    },
    twoFactorMethod: {
      type: String,
      enum: ["email", "sms", "authenticator"],
      default: "email",
    },
  },
  { timestamps: true, versionKey: false }
);

export const NotificationPreferences: Model<INotificationPreferences> =
  (mongoose.models.NotificationPreferences as Model<INotificationPreferences>) ??
  mongoose.model<INotificationPreferences>("NotificationPreferences", NotificationPreferencesSchema);
