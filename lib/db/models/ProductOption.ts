import mongoose, { Schema, Document, Model } from "mongoose";

export interface IProductOption extends Document {
  group:     string;  // "foil-finish" | "frame-type" | "frame-color" | "paper-color" | "font" | "layout"
  id:        string;  // slug-like id (e.g., "gold") — unique within its group
  label:     string;  // display name (e.g., "Gold")
  price:     number;  // ₹ add-on, default 0
  meta?:     string;  // extra per-group value: hex swatch (frame-color/paper-color) or CSS font-family (font)
  sortOrder: number;  // display order
  createdAt: Date;
  updatedAt: Date;
}

const ProductOptionSchema = new Schema<IProductOption>(
  {
    group:     { type: String, required: true, trim: true, lowercase: true },
    id:        { type: String, required: true, trim: true, lowercase: true },
    label:     { type: String, required: true, trim: true },
    price:     { type: Number, default: 0 },
    meta:      { type: String, trim: true },
    sortOrder: { type: Number, default: 0 },
  },
  { timestamps: true, versionKey: false }
);

ProductOptionSchema.index({ group: 1, id: 1 }, { unique: true });
ProductOptionSchema.index({ group: 1, sortOrder: 1, createdAt: 1 });

export const ProductOption: Model<IProductOption> =
  (mongoose.models.ProductOption as Model<IProductOption>) ??
  mongoose.model<IProductOption>("ProductOption", ProductOptionSchema);
