import mongoose from "mongoose";

const SettingsSchema = new mongoose.Schema(
  {
    // Store Information
    storeName: { type: String, default: "Make My Memory" },
    phone: { type: String, default: "" },
    address: { type: String, default: "" },

    // Homepage Stats
    happyCustomers: { type: Number, default: 2000 },
    memoriesCreated: { type: Number, default: 2500 },
    averageRating: { type: Number, default: 0, min: 0, max: 5 },
    founded: { type: Number, default: 2020 },

    // Feature Toggles
    reviewsActive: { type: Boolean, default: true },
    maintenanceMode: { type: Boolean, default: false },
    orderNotifications: { type: Boolean, default: true },
    promotionsActive: { type: Boolean, default: true },

    // Admin Authentication — a bcrypt hash set from Settings > Change password.
    // When empty, login falls back to ADMIN_PASSWORD_HASH / ADMIN_PASSWORD.
    // Never selected by default so no route can return it by accident.
    adminPasswordHash: { type: String, default: "", select: false },
    // Legacy plaintext field from the old password form; cleared on the next
    // password change and never read.
    adminPassword: { type: String, default: "", select: false },
  },
  { timestamps: true }
);

export default mongoose.models.Settings || mongoose.model("Settings", SettingsSchema);
