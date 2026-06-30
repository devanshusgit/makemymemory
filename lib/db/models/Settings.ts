import mongoose from "mongoose";

const SettingsSchema = new mongoose.Schema(
  {
    // Store Information
    storeName: { type: String, default: "Make My Memory" },
    phone: { type: String, default: "" },
    address: { type: String, default: "" },

    // Homepage Stats
    happyCustomers: { type: Number, default: 1000 },
    memoriesCreated: { type: Number, default: 1000 },
    averageRating: { type: Number, default: 0, min: 0, max: 5 },
    founded: { type: Number, default: 2026 },

    // Feature Toggles
    reviewsActive: { type: Boolean, default: true },
    maintenanceMode: { type: Boolean, default: false },
    orderNotifications: { type: Boolean, default: true },
    promotionsActive: { type: Boolean, default: true },

    // Admin Authentication
    adminPassword: { type: String, default: "" },
  },
  { timestamps: true }
);

export default mongoose.models.Settings || mongoose.model("Settings", SettingsSchema);
