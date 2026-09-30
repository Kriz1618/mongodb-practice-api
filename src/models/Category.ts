import { Schema, model, Document, Types } from "mongoose";

export interface ICategory extends Document {
  _id: Types.ObjectId;
  name: string;
  slug: string;
}

const categorySchema = new Schema<ICategory>(
  {
    name: { type: String, required: true, unique: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
  },
  { timestamps: true }
);

categorySchema.index({ slug: 1 }, { unique: true });

export const Category = model<ICategory>("Category", categorySchema);
