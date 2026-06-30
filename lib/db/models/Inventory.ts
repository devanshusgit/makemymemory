import mongoose, { Schema, Document, Model } from "mongoose";

export interface IInventory extends Document {
  productId: string;
  quantity: number;
  reserved: number;
  available: number;
  lastUpdated: Date;
}

const InventorySchema = new Schema<IInventory>(
  {
    productId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    quantity: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    reserved: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    lastUpdated: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Virtual for available quantity
InventorySchema.virtual("available").get(function (this: IInventory) {
  return Math.max(0, this.quantity - this.reserved);
});

export const Inventory: Model<IInventory> =
  (mongoose.models.Inventory as Model<IInventory>) ??
  mongoose.model<IInventory>("Inventory", InventorySchema);
