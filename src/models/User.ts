import { Schema, model, Document, Types } from "mongoose";

export interface IUser extends Document {
  _id: Types.ObjectId;
  email: string;
  name: string;
  role: "customer" | "admin";
  createdAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    name: { type: String, required: true, trim: true },
    role: { type: String, enum: ["customer", "admin"], default: "customer" },
  },
  { timestamps: true }
);

// Unique index (already declared with unique: true, but explicit for clarity)
userSchema.index({ email: 1 }, { unique: true });

export const User = model<IUser>("User", userSchema);
