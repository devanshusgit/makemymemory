import { Schema, model, models } from "mongoose";

export interface IPolicy {
  _id?: string;
  slug: string;
  title: string;
  content: string;
  effectiveDate: Date;
  updatedAt: Date;
}

const PolicySchema = new Schema<IPolicy>(
  {
    slug: { type: String, required: true, unique: true, trim: true },
    title: { type: String, required: true, trim: true },
    content: { type: String, required: true },
    effectiveDate: { type: Date, required: true },
  },
  { timestamps: true }
);

export const Policy = models.Policy || model<IPolicy>("Policy", PolicySchema);
