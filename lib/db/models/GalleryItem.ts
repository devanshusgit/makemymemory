import mongoose, { Schema, Document, Model } from "mongoose";

export interface IGalleryItem extends Document {
  url:       string;          // Cloudinary URL
  type:      "image" | "video";
  alt:       string;          // accessibility / caption
  category:  string;          // product category this image belongs to
  sortOrder: number;          // controls display order
  tall:      boolean;         // taller card in the collage
  createdAt: Date;
  updatedAt: Date;
}

const GalleryItemSchema = new Schema<IGalleryItem>(
  {
    url:       { type: String, required: true },
    type:      { type: String, enum: ["image", "video"], required: true },
    alt:       { type: String, default: "", trim: true },
    category:  { type: String, default: "", trim: true }, // e.g., "foil-imprints", "3d-casting", "photo-frames"
    sortOrder: { type: Number, default: 0 },
    tall:      { type: Boolean, default: false },
  },
  { timestamps: true, versionKey: false }
);

GalleryItemSchema.index({ sortOrder: 1, createdAt: -1 });

export const GalleryItem: Model<IGalleryItem> =
  (mongoose.models.GalleryItem as Model<IGalleryItem>) ??
  mongoose.model<IGalleryItem>("GalleryItem", GalleryItemSchema);
