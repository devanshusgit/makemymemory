import mongoose, { Schema, Document, Model } from "mongoose";

export interface IProduct extends Document {
  name:          string;
  slug:          string;
  description:   string;
  price:         number;
  originalPrice?: number;
  images:        string[];
  videos:        string[];
  category:      string;
  badge?:        string;
  inStock:       boolean;
  sortOrder:     number;
  createdAt:     Date;
  updatedAt:     Date;
}

const ProductSchema = new Schema<IProduct>(
  {
    name:          { type: String, required: true, trim: true },
    slug:          { type: String, required: true, unique: true, trim: true, lowercase: true },
    description:   { type: String, required: true, trim: true },
    price:         { type: Number, required: true, min: 0 },
    originalPrice: { type: Number, min: 0 },
    images:        { type: [String], default: [] },
    videos:        { type: [String], default: [] },
    category:      { type: String, required: true, trim: true },
    badge:         { type: String, trim: true },
    inStock:       { type: Boolean, default: true },
    sortOrder:     { type: Number, default: 0 },
  },
  { timestamps: true, versionKey: false }
);

ProductSchema.index({ slug: 1 }, { unique: true });
ProductSchema.index({ category: 1, sortOrder: 1 });

export const Product: Model<IProduct> =
  (mongoose.models.Product as Model<IProduct>) ??
  mongoose.model<IProduct>("Product", ProductSchema);
