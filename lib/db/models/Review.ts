import mongoose, { Schema, Document, Model } from "mongoose";

export interface IReview extends Document {
  name:      string;
  email:     string;
  rating:    number;
  title:     string;
  content:   string;
  product:   string;
  mediaUrls: string[];          // Cloudinary / S3 URLs after upload
  verified:  boolean;           // true once purchase is confirmed
  approved:  boolean;           // admin moderation flag
  helpful:   number;            // helpful vote count
  orderId?:  string;            // link to order for verified badge
  createdAt: Date;
  updatedAt: Date;
}

const ReviewSchema = new Schema<IReview>(
  {
    name:      { type: String, required: true, trim: true, maxlength: 100 },
    email:     { type: String, required: true, trim: true, lowercase: true },
    rating:    { type: Number, required: true, min: 1, max: 5 },
    title:     { type: String, required: true, trim: true, maxlength: 200 },
    content:   { type: String, required: true, trim: true, maxlength: 2000 },
    product:   { type: String, required: true, trim: true },
    mediaUrls: { type: [String], default: [] },
    verified:  { type: Boolean, default: false },
    approved:  { type: Boolean, default: false },
    rejected:  { type: Boolean, default: false },
    helpful:   { type: Number,  default: 0, min: 0 },
    orderId:   { type: String,  sparse: true },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Indexes for common queries
ReviewSchema.index({ product: 1, approved: 1, createdAt: -1 });
ReviewSchema.index({ rating: 1, approved: 1 });
ReviewSchema.index({ email: 1 });

export const Review: Model<IReview> =
  (mongoose.models.Review as Model<IReview>) ??
  mongoose.model<IReview>("Review", ReviewSchema);
