import mongoose, { Schema, Document, Model } from "mongoose";

export interface ICategory extends Document {
  id:          string;  // slug-like id (e.g., "foil-imprints")
  title:       string;  // display name (e.g., "Foil Imprints")
  description: string;  // short description
  sortOrder:   number;  // display order
  createdAt:   Date;
  updatedAt:   Date;
}

const CategorySchema = new Schema<ICategory>(
  {
    id:          { type: String, required: true, unique: true, trim: true, lowercase: true },
    title:       { type: String, required: true, trim: true },
    description: { type: String, default: "", trim: true },
    sortOrder:   { type: Number, default: 0 },
  },
  { timestamps: true, versionKey: false }
);

CategorySchema.index({ sortOrder: 1, createdAt: 1 });

export const Category: Model<ICategory> =
  (mongoose.models.Category as Model<ICategory>) ??
  mongoose.model<ICategory>("Category", CategorySchema);
