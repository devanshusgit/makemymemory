import mongoose, { Schema, Document, Model } from "mongoose";

export interface UserAddress {
  _id?: string;
  label: string;
  fullName: string;
  phone: string;
  address: string;
  landmark?: string;
  city: string;
  state: string;
  pincode: string;
  isDefault?: boolean;
}

export interface IUser extends Document {
  name: string;
  email: string;
  passwordHash: string;
  phone?: string;
  addresses?: UserAddress[];
  savedCart?: any[];
  isDeleted?: boolean;
  deletedAt?: Date;
  resetToken?: string;
  resetTokenExpiry?: Date;
  createdAt: Date;
}

const AddressSchema = new Schema<UserAddress>(
  {
    label:      { type: String, required: true },
    fullName:   { type: String, required: true },
    phone:      { type: String, required: true },
    address:    { type: String, required: true },
    landmark:   { type: String },
    city:       { type: String, required: true },
    state:      { type: String, required: true },
    pincode:    { type: String, required: true },
    isDefault:  { type: Boolean, default: false },
  },
  { _id: true }
);

const UserSchema = new Schema<IUser>(
  {
    name:             { type: String, required: true, trim: true },
    email:            { type: String, required: true, unique: true, lowercase: true, trim: true, sparse: true },
    passwordHash:     { type: String, required: true },
    phone:            { type: String, required: true, unique: true, trim: true, sparse: true },
    addresses:        { type: [AddressSchema], default: [] },
    savedCart:        { type: Schema.Types.Mixed },
    isDeleted:        { type: Boolean, default: false, index: true },
    deletedAt:        { type: Date },
    resetToken:       { type: String },
    resetTokenExpiry: { type: Date },
  },
  { timestamps: true }
);

export const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>("User", UserSchema);
