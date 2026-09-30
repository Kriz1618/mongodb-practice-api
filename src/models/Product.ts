import { Schema, model, Document, Types } from "mongoose";

export interface IReview {
  userId: Types.ObjectId;
  rating: number;
  comment: string;
  createdAt: Date;
}

export interface IProduct extends Document {
  _id: Types.ObjectId;
  name: string;
  description: string;
  price: number;
  stock: number;
  category: Types.ObjectId;
  tags: string[];
  reviews: IReview[];
  isActive: boolean;
}

const reviewSchema = new Schema<IReview>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, trim: true },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const productSchema = new Schema<IProduct>(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    stock: { type: Number, required: true, min: 0, default: 0 },
    category: { type: Schema.Types.ObjectId, ref: "Category", required: true },
    tags: [{ type: String, lowercase: true, trim: true }],
    reviews: [reviewSchema],
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// 🔹 Indexes (following best practices)

// ESR: Equality (category), Sort (price), Range (none for now)
productSchema.index({ category: 1, price: -1 });

// Text index for full-text search on name and description
productSchema.index({ name: "text", description: "text" });

// Multikey index for tags
productSchema.index({ tags: 1 });

// Partial index: only indexes active products (saves space)
productSchema.index(
  { price: 1 },
  { partialFilterExpression: { isActive: true } }
);

export const Product = model<IProduct>("Product", productSchema);
