import mongoose, { Schema, Document, Model } from "mongoose";

export interface IProduct extends Document {
  name:          string;
  slug:          string;
  description:   string;
  price:         number;
  originalPrice?: number;
  images:        string[];
  videos:        string[];
  descriptionAttachments?: Array<{
    url: string;
    type: "image" | "video" | "pdf";
    name?: string;
  }>;
  category:      string;
  badge?:        string;
  inStock:       boolean;
  sortOrder:     number;
  viewCount:     number;
  purchaseCount: number;
  avgRating:     number;
  reviewCount:   number;
  customizationFields?: Array<{
    id: string;
    label: string;
    type: "text" | "date" | "time" | "number" | "textarea" | "select";
    placeholder?: string;
    required: boolean;
    options?: string[]; // For select type
    order: number;
  }>;
  createdAt:     Date;
  updatedAt:     Date;
}

const ProductSchema = new Schema<IProduct>(
  {
    name:          { type: String, required: true, trim: true },
    slug:          { type: String, required: true, trim: true, lowercase: true },
    description:   { type: String, required: true, trim: true },
    price:         { type: Number, required: true, min: 0 },
    originalPrice: { type: Number, min: 0 },
    images:        { type: [String], default: [] },
    videos:        { type: [String], default: [] },
    descriptionAttachments: {
      type: [{
        url:  { type: String, required: true },
        type: { type: String, enum: ["image", "video", "pdf"], required: true },
        name: { type: String },
      }],
      default: [],
    },
    category:      { type: String, required: true, trim: true },
    badge:         { type: String, trim: true },
    inStock:       { type: Boolean, default: true },
    sortOrder:     { type: Number, default: 0 },
    viewCount:     { type: Number, default: 0, min: 0 },
    purchaseCount: { type: Number, default: 0, min: 0 },
    avgRating:     { type: Number, default: 0, min: 0, max: 5 },
    reviewCount:   { type: Number, default: 0, min: 0 },
    customizationFields: {
      type: [{
        id:          { type: String, required: true },
        label:       { type: String, required: true },
        type:        { type: String, enum: ["text", "date", "time", "number", "textarea", "select"], required: true },
        placeholder: { type: String },
        required:    { type: Boolean, default: false },
        options:     { type: [String], default: [] },
        order:       { type: Number, default: 0 },
      }],
      default: [],
    },
  },
  { timestamps: true, versionKey: false }
);

ProductSchema.index({ slug: 1 }, { unique: true });
ProductSchema.index({ category: 1, sortOrder: 1 });
ProductSchema.index({ name: "text", description: "text" });
ProductSchema.index({ avgRating: -1, reviewCount: -1 });
ProductSchema.index({ viewCount: -1 });
ProductSchema.index({ purchaseCount: -1 });

export const Product: Model<IProduct> =
  (mongoose.models.Product as Model<IProduct>) ??
  mongoose.model<IProduct>("Product", ProductSchema);
